import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getProducerRecordCount } from '../helpers/view-query';
import { stringifyBigInt } from '../helpers/bigIntStringify';

/**
 * Azure Function that retrieves the count of records for a specified producer.
 *
 
 */

/**
 * Handler for the HTTP function that retrieves the count of records for a given producer.
 *
 * This function processes a GET request to fetch the total number of records associated with the specified producer.
 * On successful retrieval, it returns a 200 OK response containing the record count.
 * In case of an error, it returns a 500 Internal Server Error response with an error message.
 *
 * @param {HttpRequest} request - The HTTP request object containing information about the incoming request.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if retrieving the producer record count fails.
 *
 * @example
 * Example Request:
 * GET /getProducerRecordCount?producer=0x1234567890abcdef1234567890abcdef12345678
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "count": "12345" // count represented as a string
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
    const count = await getProducerRecordCount(producer);
    return {
      status: 200,
      jsonBody: {
        count: stringifyBigInt(count),
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
 * HTTP route configuration for the Azure Function to retrieve the count of producer records.
 */
app.http('getProducerRecordCount', {
  methods: ['GET'], // Specifies that this function responds to GET requests
  route: 'getProducerRecordCount', // Defines the route for the function
  authLevel: 'anonymous', // Sets the authentication level for the function
  handler, // Sets the handler function to process requests
});
