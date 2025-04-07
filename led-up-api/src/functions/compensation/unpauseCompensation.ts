import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { CompensationABI } from '../../abi/compensation.abi';
import { CompensationService } from '../../services/contracts/CompensationService';

/**
 * Azure Function that unpauses the compensation service.
 *
 * This function handles the service unpause workflow by:
 * 1. Initializing the CompensationService with the contract address and ABI
 * 2. Executing the unpause operation on the blockchain
 * 3. Returning a standardized response with the transaction receipt
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
  context.log(`[${requestId}] Processing unpause compensation request for url "${request.url}"`);

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

    // Initialize service with contract ABI from the abi folder
    const compensationService = new CompensationService(
      compensationContractAddress,
      CompensationABI
    );

    // Unpause the service
    context.log(`[${requestId}] Unpausing compensation service`);
    const receipt = await compensationService.unpauseService();

    context.log(`[${requestId}] Compensation service unpaused successfully`, {
      transactionHash: receipt.transactionHash,
    });

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: {
          receipt,
          status: {
            previous: 'paused',
            current: 'active',
            timestamp: new Date().toISOString(),
          },
        },
      },
    };
  } catch (error) {
    let status = 500;
    let errorMessage = 'Failed to unpause compensation service';

    // Check for specific blockchain errors
    if (error instanceof Error) {
      if (error.message.includes('not owner')) {
        status = 403;
        errorMessage = 'Not authorized to unpause the service';
      } else if (error.message.includes('not paused')) {
        status = 400;
        errorMessage = 'Service is not currently paused';
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
 * HTTP route configuration for the Azure Function to unpause the compensation service.
 */
app.http('unpauseCompensation', {
  methods: ['POST'],
  route: 'compensation/unpause',
  authLevel: 'function',
  handler,
});
