import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { updateProducerRecordStatus } from '../helpers/update-query';

/**
 * Azure Function to update the status of a producer's record.
 *
 * This function handles PUT and POST requests to update the status associated
 * with a specific producer and returns the updated receipt or an error
 * message if the update fails.
 *
 * @param {HttpRequest} request - The incoming HTTP request.
 * @param {InvocationContext} context - The execution context of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HTTP response.
 */
const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    // Parse the incoming JSON data
    const data = (await request.json()) as {
      producer: string;
      status: number;
    };

    // Update the producer record status and get the receipt
    const receipt = await updateProducerRecordStatus(data.producer, data.status);

    // Return a successful response with the receipt
    return {
      status: 200,
      jsonBody: {
        receipt,
      },
    };
  } catch (error: any) {
    context.error(`Error updating producer record status: ${error}`);

    // Handle error response
    return {
      status: 500,
      jsonBody: {
        error: error.message || 'An unexpected error occurred', // Use a default message if none is provided
        message: 'Failed to update producer record status',
      },
    };
  }
};

/**
 * Azure Function configuration for handling HTTP requests to update producer record status.
 */
app.http('updateProducerRecordStatus', {
  methods: ['PUT', 'POST'], // Supports both PUT and POST requests
  route: 'updateProducerRecordStatus', // The route for this function
  authLevel: 'anonymous', // No authentication required
  handler, // The function to handle the requests
});
