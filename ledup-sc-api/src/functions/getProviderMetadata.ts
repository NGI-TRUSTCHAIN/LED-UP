import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getProviderMetadata } from '../helpers/view-query';

/**
 * Azure Function that retrieves provider metadata.
 *
 
 */

/**
 * Handler for the HTTP function that retrieves provider metadata.
 *
 * This function processes a GET request to fetch metadata about the provider.
 * On successful retrieval, it returns a 200 OK response containing the metadata.
 * In case of an error, it returns a 500 Internal Server Error response with an error message.
 *
 * @param {HttpRequest} request - The HTTP request object containing information about the incoming request.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if retrieving the provider metadata fails.
 *
 * @example
 * Example Request:
 * GET /getProviderMetadata
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "metadata": {
 *     "name": "Provider Name",
 *     "version": "1.0",
 *     // Additional metadata details
 *   }
 * }
 *
 * Error Responses:
 * Status: 500
 * Body:
 * {
 *   "error": "Detailed error message",
 *   "message": "Failed to retrieve provider metadata"
 * }
 */
const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const metadata = await getProviderMetadata();
    return {
      status: 200,
      jsonBody: {
        metadata,
      },
    };
  } catch (error) {
    context.error(`Error fetching data: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error,
        message: 'Failed to retrieve provider metadata',
      },
    };
  }
};

/**
 * HTTP route configuration for the Azure Function to retrieve provider metadata.
 */
app.http('getProviderMetadata', {
  methods: ['GET'], // Specifies that this function responds to GET requests
  route: 'getProviderMetadata', // Defines the route for the function
  authLevel: 'anonymous', // Sets the authentication level for the function
  handler, // Sets the handler function to process requests
});
