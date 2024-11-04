import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { producerExist } from '../helpers/view-query';

/**
 * Azure Function that checks if a producer exists.
 *
 
 */

/**
 * Handler for the HTTP function that checks if a producer exists.
 *
 * This function processes a GET request to determine whether a producer exists in the system.
 * It retrieves the producer's address from the query parameters and checks its existence.
 * On successful execution, it returns a 200 OK response with a boolean indicating
 * the existence of the producer. In case of an error, it returns a 500 Internal Server Error response.
 *
 * @param {HttpRequest} request - The HTTP request object containing the producer query parameter.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if fetching the producer data fails.
 *
 * @example
 * Example Request:
 * GET /producerExist?producer=0xProducerAddress
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "isProducerExist": true // or false
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
    const producer = (await request.query.get('producer')) as string;
    const isProducerExist = await producerExist(producer);
    return {
      status: 200,
      jsonBody: isProducerExist,
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
 * HTTP route configuration for the Azure Function to check if a producer exists.
 */
app.http('CheckProducerExist', {
  methods: ['GET'], // Specifies that this function responds to GET requests
  route: 'producerExist', // Defines the route for the function
  authLevel: 'anonymous', // Sets the authentication level for the function
  handler, // Sets the handler function to process requests
});
