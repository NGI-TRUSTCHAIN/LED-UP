import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getMinimumWithdrawAmount } from '../helpers/view-query';

/**
 * Azure Function that retrieves the minimum withdraw amount.
 *
 
 */

/**
 * Handler for the HTTP function that retrieves the minimum withdraw amount
 * from the data source and returns it in the HTTP response.
 *
 * This function processes a GET request and, upon success, returns a 200 OK
 * response containing the minimum withdraw amount. In case of an error,
 * it returns a 500 Internal Server Error response with an error message.
 *
 * @param {HttpRequest} request - The HTTP request object containing information about the incoming request.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if retrieving the minimum withdraw amount fails.
 *
 * @example
 * Example Request:
 * GET /getMinimumWithdrawAmount
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "minimumWithdrawAmount": 100
 * }
 *
 * Error Responses:
 * Status: 500
 * Body:
 * {
 *   "error": "Detailed error message",
 *   "message": "Failed to get minimum withdraw amount"
 * }
 */
const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const minimumWithdrawAmount = await getMinimumWithdrawAmount();
    return {
      status: 200,
      jsonBody: minimumWithdrawAmount,
    };
  } catch (error) {
    context.error(`Error getting minimum withdraw amount: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error,
        message: 'Failed to get minimum withdraw amount',
      },
    };
  }
};

/**
 * HTTP route configuration for the Azure Function to retrieve the minimum withdraw amount.
 */
app.http('getMinimumWithdrawAmount', {
  methods: ['GET'],
  route: 'getMinimumWithdrawAmount',
  authLevel: 'anonymous',
  handler,
});
