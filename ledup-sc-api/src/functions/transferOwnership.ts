import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { transferOwnership } from '../helpers/update-query';

/**
 * Azure Function that transfers ownership to a new provider.
 *
 * This function processes a POST request to transfer ownership of a resource
 * to a specified new provider. It expects a JSON body containing the new provider's address.
 * If the operation is successful, it returns a receipt of the transfer.
 * In case of an error, a 500 status code is returned with error details.
 *
 * @param {HttpRequest} request - The HTTP request object.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if transferring ownership fails.
 *
 * @example
 * Example Request:
 * POST /transferOwnership
 * Body:
 * {
 *   "newProvider": "new_provider_address"
 * }
 *
 * Example Response (Success):
 * Status: 200
 * Body:
 * {
 *   "receipt": "transaction_receipt_here"
 * }
 *
 * Example Response (Error):
 * Status: 500
 * Body:
 * {
 *   "error": "Detailed error message",
 *   "message": "Failed to retrieve data from IPFS"
 * }
 */
const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const { newProvider } = (await request.json()) as { newProvider: string };
    const receipt = await transferOwnership(newProvider);
    return {
      status: 200,
      jsonBody: {
        receipt,
      },
    };
  } catch (error) {
    context.error(`Error transferring ownership: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error,
        message: 'Failed to retrieve data from IPFS',
      },
    };
  }
};

/**
 * HTTP route configuration for the Azure Function to transfer ownership.
 */
app.http('transferOwnership', {
  methods: ['POST'], // Specifies that this function responds to POST requests
  route: 'transferOwnership', // Defines the route for the function
  authLevel: 'anonymous', // Sets the authentication level for the function
  handler, // Sets the handler function to process requests
});
