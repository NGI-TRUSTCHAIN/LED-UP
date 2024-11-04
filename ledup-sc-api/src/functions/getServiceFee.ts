import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getServiceFee } from '../helpers/view-query';

/**
 * Azure Function that retrieves the service fee.
 *
 
 */

/**
 * Handler for the HTTP function that retrieves the service fee.
 *
 * This function processes a GET request to fetch the service fee associated with a provider.
 * On successful retrieval, it returns a 200 OK response containing the service fee.
 * In case of an error, it returns a 500 Internal Server Error response with an error message.
 *
 * @param {HttpRequest} request - The HTTP request object containing information about the incoming request.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if retrieving the service fee fails.
 *
 * @example
 * Example Request:
 * GET /getServiceFee
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "serviceFee": {
 *     // Service fee details here
 *   }
 * }
 *
 * Error Responses:
 * Status: 500
 * Body:
 * {
 *   "error": "Detailed error message",
 *   "message": "Failed to retrieve service fee"
 * }
 */
const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const serviceFee = await getServiceFee();
    return {
      status: 200,
      jsonBody: serviceFee,
    };
  } catch (error) {
    context.error(`Error fetching service fee: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error,
        message: 'Failed to retrieve service fee',
      },
    };
  }
};

/**
 * HTTP route configuration for the Azure Function to retrieve the service fee.
 */
app.http('getServiceFee', {
  methods: ['GET'], // Specifies that this function responds to GET requests
  route: 'getServiceFee', // Defines the route for the function
  authLevel: 'anonymous', // Sets the authentication level for the function
  handler, // Sets the handler function to process requests
});
