import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getLeveaWalletBalance } from '../helpers/view-query';

/**
 * Azure Function that retrieves the provider wallet balance.
 *
 
 */

/**
 * Handler for the HTTP function that retrieves the provider wallet balance.
 *
 * This function processes a GET request to fetch the balance associated with the provider's wallet.
 * On successful retrieval, it returns a 200 OK response containing the wallet balance.
 * In case of an error, it returns a 500 Internal Server Error response with an error message.
 *
 * @param {HttpRequest} request - The HTTP request object containing information about the incoming request.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if retrieving the provider wallet balance fails.
 *
 * @example
 * Example Request:
 * GET /getProviderBalance
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "balance": "1000" // Balance of the provider's wallet
 * }
 *
 * Error Responses:
 * Status: 500
 * Body:
 * {
 *   "error": "Detailed error message",
 *   "message": "Failed to get provider balance"
 * }
 */
const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const balance = await getLeveaWalletBalance();
    return {
      status: 200,
      jsonBody: balance,
    };
  } catch (error) {
    context.error(`Error getting provider balance: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error,
        message: 'Failed to get provider balance',
      },
    };
  }
};

/**
 * HTTP route configuration for the Azure Function to retrieve the provider wallet balance.
 */
app.http('GetProviderBalance', {
  methods: ['GET'], // Specifies that this function responds to GET requests
  route: 'getProviderBalance', // Defines the route for the function
  authLevel: 'anonymous', // Sets the authentication level for the function
  handler, // Sets the handler function to process requests
});
