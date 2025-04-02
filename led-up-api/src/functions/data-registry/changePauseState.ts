import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { DataRegistryABI } from '../../abi/data-registry.abi';
import { DATA_REGISTRY_CONTRACT_ADDRESS } from '../../constants';
import { DataRegistryService } from '../../services/contracts/DataRegistryService';

/**
 * Azure Function that changes the pause state of the Data Registry contract.
 */

/**
 * Handler for the HTTP function that changes the pause state of the Data Registry contract.
 *
 * This function processes a POST request to change the pause state of the contract.
 * It retrieves the pause state from the request body and calls the contract to update it.
 * On successful execution, it returns a 200 OK response with a JSON object containing
 * the transaction receipt. In case of an error, it returns a 500 Internal Server Error response.
 *
 * @param {HttpRequest} request - The HTTP request object containing the pause state.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if changing the pause state fails.
 *
 * @example
 * Example Request:
 * POST /changePauseState
 * Body:
 * {
 *   "pause": true
 * }
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "success": true,
 *   "data": {
 *     "receipt": {
 *       "transactionHash": "0x...",
 *       "blockNumber": 12345,
 *       "events": [...]
 *     },
 *     "paused": true
 *   }
 * }
 *
 * Error Responses:
 * Status: 500
 * Body:
 * {
 *   "success": false,
 *   "error": "Detailed error message",
 *   "message": "Failed to change pause state"
 * }
 */
const handler = async (
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const { pause } = (await request.json()) as { pause: boolean };

    // Initialize the DataRegistryService
    const dataRegistryService = new DataRegistryService(
      DATA_REGISTRY_CONTRACT_ADDRESS,
      DataRegistryABI
    );

    // Change the pause state
    const receipt = await dataRegistryService.changePauseState(pause);

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: {
          receipt,
          paused: pause,
        },
      },
    };
  } catch (error) {
    context.error(`Error changing pause state: ${error}`);
    return {
      status: 500,
      jsonBody: {
        success: false,
        error: error,
        message: 'Failed to change pause state',
      },
    };
  }
};

/**
 * HTTP route configuration for the Azure Function to change the pause state.
 */
app.http('changePauseState', {
  methods: ['POST'], // Specifies that this function responds to POST requests
  route: 'data-registry/pause', // Defines the route for the function
  authLevel: 'anonymous', // Sets the authentication level for the function
  handler, // Sets the handler function to process requests
});
