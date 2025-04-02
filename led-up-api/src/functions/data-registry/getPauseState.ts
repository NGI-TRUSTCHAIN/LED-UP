import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { DataRegistryABI } from '../../abi/data-registry.abi';
import { DATA_REGISTRY_CONTRACT_ADDRESS } from '../../constants';
import { DataRegistryService } from '../../services/contracts/DataRegistryService';

/**
 * Azure Function that retrieves the pause state of the Data Registry contract.
 */

/**
 * Handler for the HTTP function that retrieves the pause state of the Data Registry contract.
 *
 * This function processes a GET request to retrieve the current pause state of the contract.
 * On successful execution, it returns a 200 OK response with a JSON object containing
 * the pause state. In case of an error, it returns a 500 Internal Server Error response.
 *
 * @param {HttpRequest} request - The HTTP request object.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if retrieving the pause state fails.
 *
 * @example
 * Example Request:
 * GET /getPauseState
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "success": true,
 *   "data": {
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
 *   "message": "Failed to retrieve pause state"
 * }
 */
const handler = async (
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    // Initialize the DataRegistryService
    const dataRegistryService = new DataRegistryService(
      DATA_REGISTRY_CONTRACT_ADDRESS,
      DataRegistryABI
    );

    // Get the pause state
    const paused = await dataRegistryService.getPauseState();

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: {
          paused,
        },
      },
    };
  } catch (error) {
    context.error(`Error retrieving pause state: ${error}`);
    return {
      status: 500,
      jsonBody: {
        success: false,
        error: error,
        message: 'Failed to retrieve pause state',
      },
    };
  }
};

/**
 * HTTP route configuration for the Azure Function to retrieve the pause state.
 */
app.http('getPauseState', {
  methods: ['GET'], // Specifies that this function responds to GET requests
  route: 'data-registry/pause-state', // Defines the route for the function
  authLevel: 'anonymous', // Sets the authentication level for the function
  handler, // Sets the handler function to process requests
});
