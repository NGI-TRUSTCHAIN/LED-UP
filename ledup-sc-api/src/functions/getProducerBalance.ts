import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getProducerBalanceByOwner } from '../helpers/view-query';
import { AddressParam } from '../types';

/**
 * Azure Function that retrieves the producer balance by owner address.
 *
 
 */

/**
 * Handler for the HTTP function that retrieves the producer balance for a given owner address.
 *
 * This function processes a GET request and returns the balance associated with the specified producer address.
 * On successful retrieval, it returns a 200 OK response containing the balance data.
 * In case of an error, it returns a 500 Internal Server Error response with an error message.
 *
 * @param {HttpRequest} request - The HTTP request object containing information about the incoming request.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if retrieving the producer balance fails.
 *
 * @example
 * Example Request:
 * GET /getProducerBalance?address=0x1234567890abcdef1234567890abcdef12345678
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "balance": "1000"
 * }
 *
 * Error Responses:
 * Status: 500
 * Body:
 * {
 *   "error": "Detailed error message",
 *   "message": "Failed to get producer balance"
 * }
 */
const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const address = (await request.query.get('address')) as string;
    const balance = await getProducerBalanceByOwner(address);
    return {
      status: 200,
      jsonBody: balance,
    };
  } catch (error) {
    context.error(`Error getting producer balance: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error,
        message: 'Failed to get producer balance',
      },
    };
  }
};

/**
 * HTTP route configuration for the Azure Function to retrieve the producer balance by owner address.
 */
app.http('getProducerBalance', {
  methods: ['GET'], // Specifies that this function responds to GET requests
  route: 'getProducerBalance', // Defines the route for the function
  authLevel: 'anonymous', // Sets the authentication level for the function
  handler, // Sets the handler function to process requests
});
