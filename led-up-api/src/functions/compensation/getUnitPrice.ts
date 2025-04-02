import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { getContractABI } from '../../helpers/contract-loader';
import { CompensationService } from '../../services/contracts/CompensationService';

/**
 * Azure Function that retrieves the current unit price from the Compensation smart contract.
 *
 * This function handles the unit price retrieval workflow by:
 * 1. Initializing the CompensationService with the contract address and ABI
 * 2. Retrieving the current unit price from the blockchain
 * 3. Returning a standardized response with the price information
 *
 * @param {HttpRequest} request - The HTTP request object
 * @param {InvocationContext} context - The Azure Functions invocation context
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HTTP response
 */
const handler = async (
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> => {
  const requestId = context.invocationId || `req-${Date.now()}`;
  context.log(`[${requestId}] Processing unit price request for url "${request.url}"`);

  try {
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

    // Get current unit price from the contract
    const unitPrice = await compensationService.getUnitPrice();

    context.log(`[${requestId}] Retrieved unit price: ${unitPrice}`);

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: {
          unitPrice: unitPrice.toString(),
          metadata: {
            description: 'The price per unit of data consumed',
            unit: 'tokens per data unit',
            timestamp: new Date().toISOString(),
          },
        },
      },
    };
  } catch (error) {
    const errorMessage = 'Failed to retrieve unit price';

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
 * HTTP route configuration for the Azure Function to retrieve the unit price.
 */
app.http('getUnitPrice', {
  methods: ['GET'],
  route: 'compensation/unit-price',
  authLevel: 'anonymous',
  handler,
});
