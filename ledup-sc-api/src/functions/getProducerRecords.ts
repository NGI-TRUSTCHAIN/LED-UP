import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getProducerRecords } from '../helpers/view-query';
import { stringifyBigInt } from '../helpers/bigIntStringify';

/**
 * Handler for the HTTP function that retrieves a record for a specified producer.
 *
 * This function processes a GET request to retrieve the record associated with the specified producer address.
 * On successful retrieval, it returns a 200 OK response containing the record data.
 * In case of an error, it returns a 500 Internal Server Error response with an error message.
 *
 * @param {HttpRequest} request - The HTTP request object containing information about the incoming request.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if retrieving the producer record fails.
 *
 * @example
 * Example Request:
 * GET /getProducerRecord?producer=0x1234567890abcdef1234567890abcdef12345678&recordId=record123
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "record": {
 *    status: 0
 *    consent: 2
 *    records: RegRecord[]
 *    nonce: 2
 *   }
 * }
 *
 * Error Responses:
 * Status: 500
 * Body:
 * {
 *   "error": "Detailed error message",
 *   "message": "Failed to retrieve producer record"
 * }
 */
const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const producer = (await request.query.get('producer')) as string;

    context.log(`Fetching record for producer: ${producer}`);
    const records = await getProducerRecords(producer);
    console.log(records);
    return {
      status: 200,
      jsonBody: {
        records: stringifyBigInt(records),
      },
    };
  } catch (error) {
    context.error(`Error fetching data: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error,
        message: 'Failed to retrieve producer record',
      },
    };
  }
};

/**
 * HTTP route configuration for the Azure Function to retrieve a producer's record.
 */
app.http('getProducerRecords', {
  methods: ['GET'], // Specifies that this function responds to GET requests
  route: 'getProducerRecords', // Defines the route for the function
  authLevel: 'anonymous', // Sets the authentication level for the function
  handler, // Sets the handler function to process requests
});
