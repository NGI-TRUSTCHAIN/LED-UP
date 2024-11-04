import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { renounceOwnership } from '../helpers/update-query';

/**
 * Azure Function that renounces ownership of a smart contract or resource.
 *
 
 */

/**
 * Handler for the HTTP function that renounces ownership.
 *
 * This function processes a POST request to renounce ownership of a specified resource or smart contract.
 * It calls the `renounceOwnership` function to execute the ownership renunciation and returns a
 * JSON object containing the receipt of the operation. On successful execution, it returns a 200 OK response.
 * In case of an error, it returns a 500 Internal Server Error response.
 *
 * @param {HttpRequest} request - The HTTP request object.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if renouncing ownership fails.
 *
 * @example
 * Example Request:
 * POST /renounceOwnership
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "receipt": "ownership_renunciation_receipt_here"
 * }
 *
 * Error Responses:
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
    const receipt = await renounceOwnership();
    return {
      status: 200,
      jsonBody: {
        receipt,
      },
    };
  } catch (error) {
    context.error(`Error fetching data: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error,
        message: 'Failed to retrieve data from IPFS',
      },
    };
  }
};

/**
 * HTTP route configuration for the Azure Function to renounce ownership.
 */
app.http('renounceOwnership', {
  methods: ['POST'], // Specifies that this function responds to POST requests
  route: 'renounceOwnership', // Defines the route for the function
  authLevel: 'anonymous', // Sets the authentication level for the function
  handler, // Sets the handler function to process requests
});
