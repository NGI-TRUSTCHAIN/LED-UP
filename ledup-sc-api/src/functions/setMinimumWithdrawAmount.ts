import { ProcessPaymentParams, ValueParam } from '../types';
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { setMinimumWithdrawAmount } from '../helpers/update-query';

/**
 * Azure Function that sets the minimum withdraw amount for a payment system.
 *
 
 */

/**
 * Handler for the HTTP function that sets the minimum withdraw amount.
 *
 * This function processes a POST request to set the minimum amount that can be withdrawn from a payment system.
 * It calls the `setMinimumWithdrawAmount` function to execute the update and returns a JSON object containing
 * the receipt of the operation. On successful execution, it returns a 200 OK response.
 * In case of an error, it returns a 500 Internal Server Error response.
 *
 * @param {HttpRequest} request - The HTTP request object.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if setting the minimum withdraw amount fails.
 *
 * @example
 * Example Request:
 * POST /setMinimumWithdrawAmount
 * Body:
 * {
 *   "value": 100
 * }
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "receipt": "transaction_receipt_here"
 * }
 *
 * Error Responses:
 * Status: 500
 * Body:
 * {
 *   "error": "Detailed error message",
 *   "message": "Failed to set minimum withdraw amount"
 * }
 */
const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const { value } = (await request.json()) as ValueParam;
    const receipt = await setMinimumWithdrawAmount(value);
    return {
      status: 200,
      jsonBody: {
        receipt,
      },
    };
  } catch (error) {
    context.error(`Error setting minimum withdraw amount: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error,
        message: 'Failed to set minimum withdraw amount',
      },
    };
  }
};

/**
 * HTTP route configuration for the Azure Function to set the minimum withdraw amount.
 */
app.http('setMinimumWithdrawAmount', {
  methods: ['POST'], // Specifies that this function responds to POST requests
  route: 'setMinimumWithdrawAmount', // Defines the route for the function
  authLevel: 'anonymous', // Sets the authentication level for the function
  handler, // Sets the handler function to process requests
});
