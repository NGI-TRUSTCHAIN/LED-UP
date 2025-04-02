import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { updateProviderMetadata } from '../../helpers/update-query';
import { Metadata } from '../../types';

/**
 * Azure Function to update provider metadata.
 *
 * This function handles PUT and POST requests to update
 * the metadata for a specific provider and returns the
 * updated receipt or an error message if the update fails.
 *
 * @param {HttpRequest} request - The incoming HTTP request.
 * @param {InvocationContext} context - The execution context of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HTTP response.
 */
const handler = async (
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    // Parse the incoming JSON data as Metadata
    const data = (await request.json()) as Metadata;

    // Update the provider metadata and get the receipt
    const receipt = await updateProviderMetadata(data);

    // Return a successful response with the receipt
    return {
      status: 200,
      jsonBody: {
        receipt,
      },
    };
  } catch (error: any) {
    context.error(`Error updating provider metadata: ${error}`);

    // Handle error response
    return {
      status: 500,
      jsonBody: {
        error: error.message || 'An unexpected error occurred', // Use a default message if none is provided
        message: 'Failed to update provider metadata',
      },
    };
  }
};

/**
 * Azure Function configuration for handling HTTP requests to update provider metadata.
 */
app.http('updateProviderMetadata', {
  methods: ['PUT', 'POST'], // Supports both PUT and POST requests
  route: 'updateProviderMetadata', // The route for this function
  authLevel: 'anonymous', // No authentication required
  handler, // The function to handle the requests
});
