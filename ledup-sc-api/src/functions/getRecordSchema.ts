import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getRecordSchema } from '../helpers/view-query';

/**
 * Azure Function that retrieves the record schema.
 *
 
 */

/**
 * Handler for the HTTP function that retrieves the record schema.
 *
 * This function processes a GET request to fetch the schema associated with records.
 * On successful retrieval, it returns a 200 OK response containing the record schema.
 * In case of an error, it returns a 500 Internal Server Error response with an error message.
 *
 * @param {HttpRequest} request - The HTTP request object containing information about the incoming request.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if retrieving the record schema fails.
 *
 * @example
 * Example Request:
 * GET /getRecordSchema
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "schema": {
 *     // Schema details here
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
    const schema = await getRecordSchema();
    return {
      status: 200,
      jsonBody: {
        schema,
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
 * HTTP route configuration for the Azure Function to retrieve the record schema.
 */
app.http('getRecordSchema', {
  methods: ['GET'], // Specifies that this function responds to GET requests
  route: 'getRecordSchema', // Defines the route for the function
  authLevel: 'anonymous', // Sets the authentication level for the function
  handler, // Sets the handler function to process requests
});
