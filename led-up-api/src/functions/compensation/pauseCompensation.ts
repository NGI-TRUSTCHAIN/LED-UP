import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { CompensationABI } from '../../abi/compensation.abi';
import { CompensationService } from '../../services/contracts/CompensationService';

/**
 * Azure Function that pauses the compensation service.
 *
 * This function handles the service pause workflow by:
 * 1. Initializing the CompensationService with the contract address and ABI
 * 2. Executing the pause operation on the blockchain
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
  context.log(`[${requestId}] Processing pause compensation request for url "${request.url}"`);

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

    // Pause the service
    context.log(`[${requestId}] Pausing compensation service`);

    const receipt = await compensationService.pauseService();

    context.log(`[${requestId}] Compensation service paused successfully`, {
      transactionHash: receipt.transactionHash,
    });

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: {
          receipt,
          status: {
            previous: 'active',
            current: 'paused',
            timestamp: new Date().toISOString(),
          },
        },
      },
    };
  } catch (error) {
    let status = 500;
    let errorMessage = 'Failed to pause compensation service';

    // Check for specific blockchain errors
    if (error instanceof Error) {
      if (error.message.includes('not owner')) {
        status = 403;
        errorMessage = 'Not authorized to pause the service';
      } else if (error.message.includes('already paused')) {
        status = 400;
        errorMessage = 'Service is already paused';
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
 * HTTP route configuration for the Azure Function to pause the compensation service.
 */
app.http('pauseCompensation', {
  methods: ['POST'],
  route: 'compensation/pause',
  authLevel: 'function',
  handler,
});
