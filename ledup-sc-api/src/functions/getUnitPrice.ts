import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getUnitPrice } from '../helpers/view-query';

/**
 * Azure Function that retrieves the unit price.
 *
 
 */

/**
 * Handler for the HTTP function that retrieves the unit price.
 *
 * This function processes a GET request to fetch the current unit price from the system.
 * On successful retrieval, it returns a 200 OK response containing the unit price.
 * In case of an error, it returns a 500 Internal Server Error response with an error message.
 *
 * @param {HttpRequest} request - The HTTP request object containing information about the incoming request.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if retrieving the unit price fails.
 *
 * @example
 * Example Request:
 * GET /getUnitPrice
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "unitPrice": 9.99 // The current unit price
 * }
 *
 * Error Responses:
 * Status: 500
 * Body:
 * {
 *   "error": "Detailed error message",
 *   "message": "Failed to retrieve unit price"
 * }
 */
const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const unitPrice = await getUnitPrice();
    return {
      status: 200,
      jsonBody: unitPrice,
    };
  } catch (error) {
    context.error(`Error fetching unit price: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error,
        message: 'Failed to retrieve unit price',
      },
    };
  }
};

/**
 * HTTP route configuration for the Azure Function to retrieve the unit price.
 */
app.http('GetUnitPrice', {
  methods: ['GET'], // Specifies that this function responds to GET requests
  route: 'getUnitPrice', // Defines the route for the function
  authLevel: 'anonymous', // Sets the authentication level for the function
  handler, // Sets the handler function to process requests
});
