import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getCompensationContractAddress } from '../helpers/view-query';

/**
 * Azure Function that handles HTTP requests to retrieve the compensation contract address.
 *
 
 */

/**
 * Retrieves the compensation contract address from the database or a service.
 *
 * This function processes a GET request and calls the helper function
 * `getCompensationContractAddress` to obtain the compensation contract address.
 * If successful, it returns a 200 OK response with the address.
 * In case of an error during the retrieval process, a 500 Internal Server Error response is returned
 * with a message indicating the failure.
 *
 * @param {HttpRequest} request - The HTTP request object containing information about the incoming request.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if fetching the compensation contract address fails.
 *
 * @example
 * Example Request:
 * GET /getCompensationContractAddress
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "compensationContractAddress": "0x1234567890abcdef1234567890abcdef12345678"
 * }
 *
 * Error Responses:
 * Status: 500
 * Body:
 * {
 *   "error": "Detailed error message",
 *   "message": "Failed to get compensation contract address"
 * }
 */
const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const compensationContractAddress = await getCompensationContractAddress();
    return {
      status: 200,
      jsonBody: {
        compensationContractAddress,
      },
    };
  } catch (error) {
    context.error(`Error getting compensation contract address: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error,
        message: 'Failed to get compensation contract address',
      },
    };
  }
};

/**
 * HTTP route configuration for the Azure Function to retrieve the compensation contract address.
 */
app.http('getCompensationContractAddress', {
  methods: ['GET'],
  route: 'getCompensationContractAddress',
  authLevel: 'anonymous',
  handler,
});
