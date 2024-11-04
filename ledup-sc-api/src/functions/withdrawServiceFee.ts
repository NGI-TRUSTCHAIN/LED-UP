import { CompensationABI } from '../utils/compensation.abi';
import { ValueParam } from '../types';
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { withdrawServiceFee } from '../helpers/update-query';
import { decodeError } from '../helpers/decodeError';

/**
 * Azure Function to withdraw a service fee.
 *
 * This function handles POST requests to withdraw a specified service fee
 * and returns the transaction receipt or an error message if the withdrawal fails.
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

    // Withdraw the service fee and get the receipt
    const receipt = await withdrawServiceFee(value);

    // Return a successful response with the receipt
    return {
      status: 200,
      jsonBody: {
        receipt,
      },
    };
  } catch (error) {
    context.error(`Error withdrawing service fee: ${error}`);

    // Handle error response
    return {
      status: 500,
      jsonBody: {
        error: decodeError(CompensationABI, error), // Decode the error message
        message: 'Failed to withdraw the service fee',
      },
    };
  }
};

/**
 * Azure Function configuration for handling HTTP requests to withdraw a service fee.
 */
app.http('withdrawServiceFee', {
  methods: ['POST'], // Only supports POST requests
  route: 'withdrawServiceFee', // The route for this function
  authLevel: 'anonymous', // No authentication required
  handler, // The function to handle the requests
});
