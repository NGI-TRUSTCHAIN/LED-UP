import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getPaymentTokenAddress } from '../helpers/view-query';

/**
 * Azure Function that retrieves the payment token address.
 *
 
 */

/**
 * Handler for the HTTP function that retrieves the payment token address
 * from the data source and returns it in the HTTP response.
 *
 * This function processes a GET request and, upon success, returns a 200 OK
 * response containing the payment token address. In case of an error,
 * it returns a 500 Internal Server Error response with an error message.
 *
 * @param {HttpRequest} request - The HTTP request object containing information about the incoming request.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if retrieving the payment token address fails.
 *
 * @example
 * Example Request:
 * GET /getPaymentTokenAddress
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "paymentTokenAddress": "0x1234567890abcdef1234567890abcdef12345678"
 * }
 *
 * Error Responses:
 * Status: 500
 * Body:
 * {
 *   "error": "Detailed error message",
 *   "message": "Failed to retrieve payment token address"
 * }
 */
const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const paymentToken = await getPaymentTokenAddress();
    return {
      status: 200,
      jsonBody: paymentToken,
    };
  } catch (error) {
    context.error(`Error fetching payment token address: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error,
        message: 'Failed to retrieve payment token address',
      },
    };
  }
};

/**
 * HTTP route configuration for the Azure Function to retrieve the payment token address.
 */
app.http('GetPaymentTokenAddress', {
  methods: ['GET'], // Specifies that this function responds to GET requests
  route: 'getPaymentTokenAddress', // Defines the route for the function
  authLevel: 'anonymous', // Sets the authentication level for the function
  handler, // Sets the handler function to process requests
});
