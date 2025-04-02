import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { z } from 'zod';

import { CompensationABI } from '../../abi';
import { CompensationService } from '../../services/contracts/CompensationService';

/**
 * Zod schema for validating service fee change request parameters
 */
const ServiceFeeSchema = z.object({
  value: z
    .number()
    .int()
    .min(0)
    .max(10000) // Maximum 100% (10000 basis points)
    .refine(val => val <= 5000, {
      message: 'Service fee cannot exceed 50% (5000 basis points)',
    }),
});

/**
 * Azure Function that changes the service fee in the Compensation smart contract.
 *
 * This function handles the service fee update workflow by:
 * 1. Validating the input parameters
 * 2. Initializing the CompensationService with the contract address and ABI
 * 3. Updating the service fee on the blockchain
 * 4. Returning a standardized response with the transaction receipt
 *
 * @param {HttpRequest} request - The HTTP request object containing the new service fee
 * @param {InvocationContext} context - The Azure Functions invocation context
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HTTP response
 */
const handler = async (
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> => {
  const requestId = context.invocationId || `req-${Date.now()}`;
  context.log(`[${requestId}] Processing change service fee request for url "${request.url}"`);

  try {
    // Parse and validate request body
    const requestBody = await request.json();
    const validationResult = ServiceFeeSchema.safeParse(requestBody);

    if (!validationResult.success) {
      context.warn(`[${requestId}] Invalid service fee parameters`, {
        errors: validationResult.error.errors,
      });

      return {
        status: 400,
        jsonBody: {
          success: false,
          error: 'Invalid service fee parameters',
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
    const compensationService = new CompensationService(
      compensationContractAddress,
      CompensationABI
    );

    // Get current service fee for comparison
    const currentServiceFee = await compensationService.getServiceFee();

    // Change service fee
    context.log(`[${requestId}] Changing service fee from ${currentServiceFee} to ${value}`);
    const receipt = await compensationService.changeServiceFee(value);

    context.log(`[${requestId}] Service fee changed successfully`, {
      transactionHash: receipt.transactionHash,
      oldValue: currentServiceFee.toString(),
      newValue: value.toString(),
    });

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: {
          receipt,
          serviceFee: {
            previous: currentServiceFee.toString(),
            current: value.toString(),
            unit: 'basis points (1/100 of a percent)',
          },
        },
      },
    };
  } catch (error) {
    const errorMessage = 'Failed to change service fee';

    context.error(`[${requestId}] ${errorMessage}`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return {
      status: 500,
      jsonBody: {
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.message : String(error),
      },
    };
  }
};

/**
 * HTTP route configuration for the Azure Function to change the service fee.
 */
app.http('changeServiceFee', {
  methods: ['POST'],
  route: 'compensation/update-unit-price',
  authLevel: 'function',
  handler,
});
