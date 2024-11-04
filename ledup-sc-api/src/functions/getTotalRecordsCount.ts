import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getTotalRecordsCount } from '../helpers/view-query';

/**
 * Azure Function that retrieves the total count of records.
 *
 
 */

/**
 * Handler for the HTTP function that retrieves the total records count.
 *
 * This function processes a GET request to fetch the total count of records stored in the system.
 * On successful retrieval, it returns a 200 OK response containing the total count of records.
 * In case of an error, it returns a 500 Internal Server Error response with an error message.
 *
 * @param {HttpRequest} request - The HTTP request object containing information about the incoming request.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if retrieving the total records count fails.
 *
 * @example
 * Example Request:
 * GET /getTotalRecordsCount
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "totalCount": 1234 // The total number of records
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
    const totalCount = await getTotalRecordsCount();
    return {
      status: 200,
      jsonBody: {
        totalCount,
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
 * HTTP route configuration for the Azure Function to retrieve the total records count.
 */
app.http('getTotalRecordsCount', {
  methods: ['GET'], // Specifies that this function responds to GET requests
  route: 'getTotalRecordsCount', // Defines the route for the function
  authLevel: 'anonymous', // Sets the authentication level for the function
  handler, // Sets the handler function to process requests
});
