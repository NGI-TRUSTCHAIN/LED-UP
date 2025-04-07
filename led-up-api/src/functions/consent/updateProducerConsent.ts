import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { stringifyBigInt } from '../../helpers/bigIntStringify';
import { updateProducerConsent } from '../../helpers/update-query';

/**
 * Azure Function to update the consent status of a producer.
 *
 * This function handles PUT and POST requests, processes the incoming data,
 * and returns the updated receipt or an error message if the update fails.
 *
 * @param {HttpRequest} request - The incoming HTTP request.
 * @param {InvocationContext} context - The execution context of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HTTP response.
 */
const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    // Define the expected structure of the request body
    const data = (await request.json()) as {
      producer: string; // The producer's identifier
      status: number; // The consent status (0 or 1)
    };

    // Update producer consent and get the receipt
    const receipt = await updateProducerConsent(data.producer, data.status);

    // Return a successful response with the receipt
    return {
      status: 200,
      jsonBody: stringifyBigInt(receipt),
    };
  } catch (error: any) {
    context.error(`Error updating producer consent: ${error}`);

    // Handle error response
    return {
      status: 500,
      jsonBody: {
        error: error.message || 'An unexpected error occurred', // Use a default message if none is provided
        message: 'Failed to update producer consent',
      },
    };
  }
};

/**
 * Azure Function configuration for handling HTTP requests to update producer consent.
 */
app.http('updateProducerConsent', {
  methods: ['PUT', 'POST'], // Supports both PUT and POST requests
  route: 'updateProducerConsent', // The route for this function
  authLevel: 'anonymous', // No authentication required
  handler, // The function to handle the requests
});
