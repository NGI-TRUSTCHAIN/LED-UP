import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { getContractABI } from '../../helpers/contract-loader';
import { CompensationService } from '../../services/contracts/CompensationService';

/**
 * Azure Function that retrieves the current service fee from the Compensation smart contract.
 *
 * This function handles the service fee retrieval workflow by:
 * 1. Initializing the CompensationService with the contract address and ABI
 * 2. Retrieving the current service fee from the blockchain
 * 3. Returning a standardized response with the fee information
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
  context.log(`[${requestId}] Processing service fee request for url "${request.url}"`);

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

    // Get current service fee from the contract
    const serviceFee = await compensationService.getServiceFee();

    context.log(`[${requestId}] Retrieved service fee: ${serviceFee}`);

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: {
          serviceFee: serviceFee.toString(),
          // Include additional metadata for better client understanding
          metadata: {
            description: 'The percentage fee charged by the service for each transaction',
            unit: 'basis points (1/100 of a percent)',
            example: 'A value of 250 represents a 2.5% fee',
          },
        },
      },
    };
  } catch (error) {
    const errorMessage = 'Failed to retrieve service fee';

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
 * HTTP route configuration for the Azure Function to retrieve the service fee.
 */
app.http('getServiceFee', {
  methods: ['GET'],
  route: 'compensation/service-fee',
  authLevel: 'anonymous',
  handler,
});
