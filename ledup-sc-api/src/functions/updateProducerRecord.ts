import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { updateProducerRecord } from '../helpers/update-query';
import { ProducerRegistrationParam } from '../types';

/**
 * Azure Function to update a producer's record.
 *
 * This function handles PUT and POST requests to update the producer's data
 * and returns the updated receipt or an error message if the update fails.
 *
 * @param {HttpRequest} request - The incoming HTTP request.
 * @param {InvocationContext} context - The execution context of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HTTP response.
 */
const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    // Parse the incoming JSON data as ProducerRegistrationParam
    const data = (await request.json()) as ProducerRegistrationParam;

    // Update the producer record and get the receipt
    const receipt = await updateProducerRecord(data);

    // Return a successful response with the receipt
    return {
      status: 200,
      jsonBody: {
        receipt,
      },
    };
  } catch (error: any) {
    context.error(`Error updating producer record: ${error}`);

    // Handle error response
    return {
      status: 500,
      jsonBody: {
        error: error.message || 'An unexpected error occurred', // Use a default message if none is provided
        message: 'Failed to update producer record',
      },
    };
  }
};

/**
 * Azure Function configuration for handling HTTP requests to update a producer record.
 */
app.http('updateProducerRecord', {
  methods: ['PUT', 'POST'], // Supports both PUT and POST requests
  route: 'updateProducerRecord', // The route for this function
  authLevel: 'anonymous', // No authentication required
  handler, // The function to handle the requests
});
