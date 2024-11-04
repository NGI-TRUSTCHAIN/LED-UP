import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getLeveaWallet } from '../helpers/view-query';

/**
 * Azure Function that retrieves the provider wallet.
 *
 
 */

/**
 * Handler for the HTTP function that retrieves the provider wallet.
 *
 * This function processes a GET request to fetch the wallet associated with the provider.
 * On successful retrieval, it returns a 200 OK response containing the wallet data.
 * In case of an error, it returns a 500 Internal Server Error response with an error message.
 *
 * @param {HttpRequest} request - The HTTP request object containing information about the incoming request.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if retrieving the provider wallet fails.
 *
 * @example
 * Example Request:
 * GET /getProviderWallet
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "wallet": {
 *     "address": "0x1234567890abcdef",
 *     "balance": "1000",
 *     // Additional wallet details
 *   }
 * }
 *
 * Error Responses:
 * Status: 500
 * Body:
 * {
 *   "error": "Detailed error message",
 *   "message": "Failed to get provider wallet"
 * }
 */
const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const wallet = await getLeveaWallet();
    return {
      status: 200,
      jsonBody: wallet,
    };
  } catch (error) {
    context.error(`Error getting provider wallet: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error,
        message: 'Failed to get provider wallet',
      },
    };
  }
};

/**
 * HTTP route configuration for the Azure Function to retrieve the provider wallet.
 */
app.http('GetProviderWallet', {
  methods: ['GET'], // Specifies that this function responds to GET requests
  route: 'getProviderWallet', // Defines the route for the function
  authLevel: 'anonymous', // Sets the authentication level for the function
  handler, // Sets the handler function to process requests
});
