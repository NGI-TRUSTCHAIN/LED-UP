import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { z } from 'zod';

import { getContractABI } from '../../helpers/contract-loader';
import { signer } from '../../helpers/get-signer';
import { CompensationService } from '../../services/contracts/CompensationService';

/**
 * Zod schema for validating withdrawal request parameters
 */
const WithdrawalSchema = z.object({
  value: z
    .number()
    .positive()
    .refine(val => val > 0, {
      message: 'Withdrawal amount must be greater than 0',
    }),
});

/**
 * Azure Function that withdraws a producer's balance from the Compensation smart contract.
 *
 * This function handles the withdrawal workflow by:
 * 1. Validating the input parameters
 * 2. Initializing the CompensationService with the contract address and ABI
 * 3. Checking the producer's current balance
 * 4. Checking the minimum withdrawal amount
 * 5. Processing the withdrawal transaction
 * 6. Returning a standardized response with the transaction receipt
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
  context.log(
    `[${requestId}] Processing producer balance withdrawal request for url "${request.url}"`
  );

  try {
    // Parse and validate request body
    const requestBody = await request.json();
    const validationResult = WithdrawalSchema.safeParse(requestBody);

    if (!validationResult.success) {
      context.warn(`[${requestId}] Invalid withdrawal parameters`, {
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

    // Get current producer balance using the signer's address
    const producerAddress = await signer.getAddress();
    const currentBalance = await compensationService.getProducerBalance(producerAddress);

    // Get minimum withdrawal amount
    const minimumWithdrawAmount = await compensationService.getMinimumWithdrawAmount();

    // Validate withdrawal amount against balance and minimum
    if (value > Number(currentBalance)) {
      context.warn(`[${requestId}] Insufficient balance for withdrawal`, {
        requested: value,
        available: currentBalance.toString(),
      });

      return {
        status: 400,
        jsonBody: {
          success: false,
          error: 'Insufficient balance',
          details: `Requested amount (${value}) exceeds available balance (${currentBalance})`,
        },
      };
    }

    if (value < Number(minimumWithdrawAmount)) {
      context.warn(`[${requestId}] Withdrawal amount below minimum`, {
        requested: value,
        minimum: minimumWithdrawAmount.toString(),
      });

      return {
        status: 400,
        jsonBody: {
          success: false,
          error: 'Amount below minimum',
          details: `Requested amount (${value}) is below the minimum withdrawal amount (${minimumWithdrawAmount})`,
        },
      };
    }

    // Process withdrawal
    context.log(`[${requestId}] Processing withdrawal of ${value} tokens`);
    const receipt = await compensationService.withdrawProducerBalance(value);

    context.log(`[${requestId}] Withdrawal processed successfully`, {
      transactionHash: receipt.transactionHash,
      amount: value,
      producerAddress,
    });

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: {
          receipt,
          withdrawal: {
            amount: value.toString(),
            previousBalance: currentBalance.toString(),
            newBalance: (Number(currentBalance) - value).toString(),
            producer: producerAddress,
          },
        },
      },
    };
  } catch (error) {
    let status = 500;
    let errorMessage = 'Failed to withdraw producer balance';

    // Check for specific blockchain errors
    if (error instanceof Error) {
      if (error.message.includes('insufficient funds')) {
        status = 400;
        errorMessage = 'Insufficient funds for withdrawal';
      } else if (error.message.includes('minimum withdraw amount')) {
        status = 400;
        errorMessage = 'Amount below minimum withdrawal threshold';
      } else if (error.message.includes('not authorized')) {
        status = 403;
        errorMessage = 'Not authorized to withdraw funds';
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
 * HTTP route configuration for the Azure Function to withdraw a producer's balance.
 */
app.http('withdrawProducerBalance', {
  methods: ['POST'],
  route: 'compensation/producer/withdraw',
  authLevel: 'function',
  handler,
});
