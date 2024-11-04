import { CompensationABI } from '../utils/compensation.abi';
import { ValueParam } from '../types';
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { withdrawProducerBalance } from '../helpers/update-query';
import { decodeError } from '../helpers/decodeError';

/**
 * Azure Function to withdraw a producer's balance.
 *
 * This function handles POST requests to withdraw a specified amount
 * from a producer's balance and returns the transaction receipt or an
 * error message if the withdrawal fails.
 *
 * @param {HttpRequest} request - The incoming HTTP request.
 * @param {InvocationContext} context - The execution context of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HTTP response.
 */
const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    // Parse the incoming JSON data as ValueParam
    const { value } = (await request.json()) as ValueParam;

    // Withdraw the producer's balance and get the receipt
    const receipt = await withdrawProducerBalance(value);

    // Return a successful response with the receipt
    return {
      status: 200,
      jsonBody: {
        receipt,
      },
    };
  } catch (error) {
    context.error(`Error withdrawing payment: ${error}`);

    // Handle error response
    return {
      status: 500,
      jsonBody: {
        error: decodeError(CompensationABI, error), // Decode the error message
        message: 'Failed to withdraw an amount',
      },
    };
  }
};

/**
 * Azure Function configuration for handling HTTP requests to withdraw a producer's balance.
 */
app.http('withdrawProducerBalance', {
  methods: ['POST'], // Only supports POST requests
  route: 'withdrawProducerBalance', // The route for this function
  authLevel: 'anonymous', // No authentication required
  handler, // The function to handle the requests
});
