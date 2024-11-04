import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { updateProviderRecordSchema } from '../helpers/update-query';
import { RecordSchema } from '../types';

/**
 * Azure Function to update the provider record schema.
 *
 * This function handles PUT and POST requests to update
 * the schema for a specific provider record and returns the
 * updated receipt or an error message if the update fails.
 *
 * @param {HttpRequest} request - The incoming HTTP request.
 * @param {InvocationContext} context - The execution context of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HTTP response.
 */
const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    // Parse the incoming JSON data as RecordSchema
    const schema = (await request.json()) as RecordSchema;

    // Update the provider record schema and get the receipt
    const receipt = await updateProviderRecordSchema(schema);

    // Return a successful response with the receipt
    return {
      status: 200,
      jsonBody: {
        receipt,
      },
    };
  } catch (error: any) {
    context.error(`Error Updating Provider Record Schema: ${error}`);

    // Handle error response
    return {
      status: 500,
      jsonBody: {
        error: error.message || 'An unexpected error occurred', // Use a default message if none is provided
        message: 'Failed to update the provider record schema',
      },
    };
  }
};

/**
 * Azure Function configuration for handling HTTP requests to update the provider record schema.
 */
app.http('updateProviderRecordSchema', {
  methods: ['PUT', 'POST'], // Supports both PUT and POST requests
  route: 'updateProviderRecordSchema', // The route for this function
  authLevel: 'anonymous', // No authentication required
  handler, // The function to handle the requests
});
