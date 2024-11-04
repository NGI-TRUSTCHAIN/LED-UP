import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { pauseService } from '../helpers/update-query';

/**
 * Azure Function that pauses a service.
 *
 
 */

/**
 * Handler for the HTTP function that pauses a service.
 *
 * This function processes a POST request to pause the specified service.
 * On successful execution, it returns a 200 OK response containing the receipt of the service pause action.
 * In case of an error, it returns a 500 Internal Server Error response with an error message.
 *
 * @param {HttpRequest} request - The HTTP request object containing information about the incoming request.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if pausing the service fails.
 *
 * @example
 * Example Request:
 * POST /pauseCompensation
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "receipt": { // Information about the service pause action
 *     "transactionId": "abc123",
 *     "status": "paused"
 *   }
 * }
 *
 * Error Responses:
 * Status: 500
 * Body:
 * {
 *   "error": "Detailed error message",
 *   "message": "Failed to retrieve data from IPFS"
 * }
 */
const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const receipt = await pauseService();
    return {
      status: 200,
      jsonBody: {
        receipt,
      },
    };
  } catch (error) {
    context.error(`Error fetching data: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error,
        message: 'Failed to retrieve data from IPFS',
      },
    };
  }
};

/**
 * HTTP route configuration for the Azure Function to pause a service.
 */
app.http('pauseCompensation', {
  methods: ['POST'], // Specifies that this function responds to POST requests
  route: 'pauseCompensation', // Defines the route for the function
  authLevel: 'anonymous', // Sets the authentication level for the function
  handler, // Sets the handler function to process requests
});
