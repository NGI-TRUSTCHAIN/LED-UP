import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getProducerRecordInfo } from '../helpers/view-query';
import { stringifyBigInt } from '../helpers/bigIntStringify';

/**
 * Azure Function that retrieves detailed information about a producer's record.
 *
 */

/**
 * Handler for the HTTP function that retrieves information for a specified producer's record.
 *
 * This function processes a GET request to fetch detailed information related to the specified producer.
 * On successful retrieval, it returns a 200 OK response containing the record information.
 * In case of an error, it returns a 500 Internal Server Error response with an error message.
 *
 * @param {HttpRequest} request - The HTTP request object containing information about the incoming request.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if retrieving the producer record information fails.
 *
 * @example
 * Example Request:
 * GET /getProducerRecordInfo?producer=0x1234567890abcdef1234567890abcdef12345678
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "data": {
 *     // Detailed producer record information represented in a format
 *   }
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
    const data = await getProducerRecordInfo(producer);

    return {
      status: 200,
      jsonBody: stringifyBigInt(data),
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
 * HTTP route configuration for the Azure Function to retrieve producer record information.
 */
app.http('getProducerRecordInfo', {
  methods: ['GET'], // Specifies that this function responds to GET requests
  route: 'getProducerRecordInfo', // Defines the route for the function
  authLevel: 'anonymous', // Sets the authentication level for the function
  handler, // Sets the handler function to process requests
});
