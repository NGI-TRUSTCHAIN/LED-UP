import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { z } from 'zod';

import { getContractABI } from '../../helpers/contract-loader';
import { signer } from '../../helpers/get-signer';
import { CompensationService } from '../../services/contracts/CompensationService';

/**
 * Zod schema for validating service fee withdrawal request parameters
 */
const ServiceFeeWithdrawalSchema = z.object({
  value: z
    .number()
    .positive()
    .refine(val => val > 0, {
      message: 'Withdrawal amount must be greater than 0',
    }),
});

/**
 * Azure Function that withdraws service fees from the Compensation smart contract.
 *
 * This function handles the service fee withdrawal workflow by:
 * 1. Validating the input parameters
 * 2. Initializing the CompensationService with the contract address and ABI
 * 3. Checking if the caller is the service owner
 * 4. Processing the withdrawal transaction
 * 5. Returning a standardized response with the transaction receipt
 *
 * @param {HttpRequest} request - The HTTP request object containing the withdrawal amount
 * @param {InvocationContext} context - The Azure Functions invocation context
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HTTP response
 */
const handler = async (
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> => {
  const requestId = context.invocationId || `req-${Date.now()}`;
  context.log(`[${requestId}] Processing service fee withdrawal request for url "${request.url}"`);

  try {
    // Parse and validate request body
    const requestBody = await request.json();
    const validationResult = ServiceFeeWithdrawalSchema.safeParse(requestBody);

    if (!validationResult.success) {
      context.warn(`[${requestId}] Invalid service fee withdrawal parameters`, {
        errors: validationResult.error.errors,
      });

      return {
        status: 400,
        jsonBody: {
          success: false,
          error: 'Invalid withdrawal parameters',
          details: validationResult.error.errors,
        },
      };
    }

    const { value } = validationResult.data;

    // Initialize service
    const compensationContractAddress = process.env.COMPENSATION_CONTRACT_ADDRESS;

    if (!compensationContractAddress) {
      context.error(`[${requestId}] Missing compensation contract address configuration`);

      return {
        status: 500,
        jsonBody: {
          success: false,
          error: 'Service configuration error',
          message: 'Compensation contract address not properly configured',
        },
      };
    }

    // Initialize service with contract ABI
    const compensationABI = await getContractABI('Compensation');
    const compensationService = new CompensationService(
      compensationContractAddress,
      compensationABI
    );

    // Get current service fee balance
    const ownerAddress = await signer.getAddress();

    // Process withdrawal
    context.log(`[${requestId}] Processing service fee withdrawal of ${value} tokens`);
    const receipt = await compensationService.withdrawServiceFees(value);

    context.log(`[${requestId}] Service fee withdrawal processed successfully`, {
      transactionHash: receipt.transactionHash,
      amount: value,
      ownerAddress,
    });

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: {
          receipt,
          withdrawal: {
            amount: value.toString(),
            owner: ownerAddress,
            timestamp: new Date().toISOString(),
          },
        },
      },
    };
  } catch (error) {
    let status = 500;
    let errorMessage = 'Failed to withdraw service fees';

    // Check for specific blockchain errors
    if (error instanceof Error) {
      if (error.message.includes('insufficient funds')) {
        status = 400;
        errorMessage = 'Insufficient service fees for withdrawal';
      } else if (error.message.includes('not owner')) {
        status = 403;
        errorMessage = 'Not authorized to withdraw service fees';
      } else if (error.message.includes('paused')) {
        status = 400;
        errorMessage = 'Service is currently paused';
      }
    }

    context.error(`[${requestId}] ${errorMessage}`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return {
      status,
      jsonBody: {
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.message : String(error),
      },
    };
  }
};

/**
 * HTTP route configuration for the Azure Function to withdraw service fees.
 */
app.http('withdrawServiceFee', {
  methods: ['POST'],
  route: 'compensation/withdraw-service-fee',
  authLevel: 'function',
  handler,
});
