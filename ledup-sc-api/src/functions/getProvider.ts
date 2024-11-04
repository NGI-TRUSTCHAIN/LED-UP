import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getProvider } from '../helpers/view-query';

/**
 * Azure Function that retrieves provider information.
 *
 
 */

/**
 * Handler for the HTTP function that retrieves provider information.
 *
 * This function processes a GET request to fetch details about the provider.
 * On successful retrieval, it returns a 200 OK response containing the provider data.
 * In case of an error, it returns a 500 Internal Server Error response with an error message.
 *
 * @param {HttpRequest} request - The HTTP request object containing information about the incoming request.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if retrieving the provider information fails.
 *
 * @example
 * Example Request:
 * GET /provider
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "provider": {
 *     "name": "Provider Name",
 *     "id": "Provider ID",
 *     // Additional provider details
 *   }
 * }
 *
 * Error Responses:
 * Status: 500
 * Body:
 * {
 *   "error": "Detailed error message",
 *   "message": "Failed to retrieve provider"
 * }
 */
const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const provider = await getProvider();
    return {
      status: 200,
      jsonBody: {
        provider,
      },
    };
  } catch (error) {
    context.error(`Error fetching data: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error,
        message: 'Failed to retrieve provider',
      },
    };
  }
};

/**
 * HTTP route configuration for the Azure Function to retrieve provider information.
 */
app.http('GetProvider', {
  methods: ['GET'], // Specifies that this function responds to GET requests
  route: 'provider', // Defines the route for the function
  authLevel: 'anonymous', // Sets the authentication level for the function
  handler, // Sets the handler function to process requests
});
