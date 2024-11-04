import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { paused } from '../helpers/view-query';

/**
 * Azure Function that retrieves the current pause state of the system.
 *
 
 */

/**
 * Handler for the HTTP function that retrieves the current pause state
 * from the data source and returns it in the HTTP response.
 *
 * This function processes a GET request and, upon success, returns a 200 OK
 * response containing the current pause state. In case of an error,
 * it returns a 500 Internal Server Error response with an error message.
 *
 * @param {HttpRequest} request - The HTTP request object containing information about the incoming request.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if retrieving the pause state fails.
 *
 * @example
 * Example Request:
 * GET /pauseState
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "pause": false
 * }
 *
 * Error Responses:
 * Status: 500
 * Body:
 * {
 *   "error": "Detailed error message",
 *   "message": "Failed to retrieve pause state"
 * }
 */
const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);
  try {
    const pauseState = await paused();

    return {
      status: 200,
      jsonBody: {
        pause: pauseState,
      },
    };
  } catch (error) {
    context.error(`Error fetching data: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error,
        message: 'Failed to retrieve pause state',
      },
    };
  }
};

/**
 * HTTP route configuration for the Azure Function to retrieve the current pause state.
 */
app.http('getPauseState', {
  methods: ['GET'],
  route: 'pauseState',
  authLevel: 'anonymous',
  handler,
});
