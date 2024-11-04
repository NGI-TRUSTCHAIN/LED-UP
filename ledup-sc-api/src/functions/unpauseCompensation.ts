import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { unpauseService } from '../helpers/update-query';

/**
 * Azure Function that unpauses a specified service.
 *
 * This function processes a POST request to unpause a service. It performs the necessary operations
 * to change the state of the service from paused to active. If successful, it returns a receipt
 * indicating the operation was completed. In case of an error, a 500 status code is returned
 * with relevant error details.
 *
 * @param {HttpRequest} request - The HTTP request object.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if unpausing the service fails.
 *
 * @example
 * Example Request:
 * POST /unpauseCompensation
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
    const receipt = await unpauseService();
    return {
      status: 200,
      jsonBody: {
        receipt,
      },
    };
  } catch (error) {
    context.error(`Error unpausing service: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error instanceof Error ? error.message : error, // Ensuring the error is a string
        message: 'Failed to retrieve data from IPFS',
      },
    };
  }
};

/**
 * HTTP route configuration for the Azure Function to unpause compensation.
 */
app.http('unpauseCompensation', {
  methods: ['POST'], // Specifies that this function responds to POST requests
  route: 'unpauseCompensation', // Defines the route for the function
  authLevel: 'anonymous', // Sets the authentication level for the function
  handler, // Sets the handler function to process requests
});
