import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { z } from 'zod';

import { getContractABI } from '../../helpers/contract-loader';
import { CompensationService } from '../../services/contracts/CompensationService';

/**
 * Zod schema for validating unit price change request parameters
 */
const UnitPriceSchema = z.object({
  value: z
    .number()
    .positive()
    .refine(val => val <= 1000000, {
      message: 'Unit price cannot exceed 1,000,000 tokens per unit',
    }),
});

/**
 * Azure Function that changes the unit price in the Compensation smart contract.
 *
 * This function handles the unit price update workflow by:
 * 1. Validating the input parameters
 * 2. Initializing the CompensationService with the contract address and ABI
 * 3. Updating the unit price on the blockchain
 * 4. Returning a standardized response with the transaction receipt
 *
 * @param {HttpRequest} request - The HTTP request object containing the new unit price
 * @param {InvocationContext} context - The Azure Functions invocation context
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HTTP response
 */
const handler = async (
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> => {
  const requestId = context.invocationId || `req-${Date.now()}`;
  context.log(`[${requestId}] Processing change unit price request for url "${request.url}"`);

  try {
    // Parse and validate request body
    const requestBody = await request.json();
    const validationResult = UnitPriceSchema.safeParse(requestBody);

    if (!validationResult.success) {
      context.warn(`[${requestId}] Invalid unit price parameters`, {
        errors: validationResult.error.errors,
      });

      return {
        status: 400,
        jsonBody: {
          success: false,
          error: 'Invalid unit price parameters',
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

    // Get current unit price for comparison
    const currentUnitPrice = await compensationService.getUnitPrice();

    // Change unit price
    context.log(`[${requestId}] Changing unit price from ${currentUnitPrice} to ${value}`);
    const receipt = await compensationService.changeUnitPrice(value);

    context.log(`[${requestId}] Unit price changed successfully`, {
      transactionHash: receipt.transactionHash,
      oldValue: currentUnitPrice.toString(),
      newValue: value.toString(),
    });

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: {
          receipt,
          unitPrice: {
            previous: currentUnitPrice.toString(),
            current: value.toString(),
            unit: 'tokens per data unit',
            percentChange:
              (((value - Number(currentUnitPrice)) / Number(currentUnitPrice)) * 100).toFixed(2) +
              '%',
          },
        },
      },
    };
  } catch (error) {
    const errorMessage = 'Failed to change unit price';

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
 * HTTP route configuration for the Azure Function to change the unit price.
 */
app.http('changeUnitPrice', {
  methods: ['POST'],
  route: 'compensation/change-unit-price',
  authLevel: 'function',
  handler,
});
