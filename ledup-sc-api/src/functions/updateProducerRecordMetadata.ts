import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { updateProducerRecordMetadata } from '../helpers/update-query';

/**
 * Azure Function to update the metadata of a producer's record.
 *
 * This function handles PUT and POST requests to update metadata associated
 * with a specific producer record and returns the updated receipt or an error
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
      recordId: string;
      metadata: {
        cid: string;
        url: string;
        hash: string;
      };
    };

    // Update the producer record metadata and get the receipt
    const receipt = await updateProducerRecordMetadata(data.producer, data.recordId, data.metadata);

    // Return a successful response with the receipt
    return {
      status: 200,
      jsonBody: {
        receipt,
      },
    };
  } catch (error: any) {
    context.error(`Error updating producer record metadata: ${error}`);

    // Handle error response
    return {
      status: 500,
      jsonBody: {
        error: error.message || 'An unexpected error occurred', // Use a default message if none is provided
        message: 'Failed to update producer record metadata',
      },
    };
  }
};

/**
 * Azure Function configuration for handling HTTP requests to update producer record metadata.
 */
app.http('updateProducerRecordMetadata', {
  methods: ['PUT', 'POST'], // Supports both PUT and POST requests
  route: 'updateProducerRecordMetadata', // The route for this function
  authLevel: 'anonymous', // No authentication required
  handler, // The function to handle the requests
});
