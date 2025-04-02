import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { stringifyBigInt } from '../../helpers/bigIntStringify';
import { getProducerConsent } from '../../helpers/view-query';

/**
 * Azure Function that retrieves the consent status for a specified producer.
 *
 
 */

/**
 * Handler for the HTTP function that retrieves the consent for a given producer.
 *
 * This function processes a GET request and returns the consent status associated with the specified producer.
 * On successful retrieval, it returns a 200 OK response containing the consent data.
 * In case of an error, it returns a 500 Internal Server Error response with an error message.
 *
 * @param {HttpRequest} request - The HTTP request object containing information about the incoming request.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if retrieving the producer consent fails.
 *
 * @example
 * Example Request:
 * GET /getProducerConsent?producer=0x1234567890abcdef1234567890abcdef12345678
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "consent": "100"
 * }
 *
 * Error Responses:
 * Status: 500
 * Body:
 * {
 *   "error": "Detailed error message",
 *   "message": "Failed to retrieve producer consent"
 * }
 */
const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const producer = (await request.query.get('producer')) as string;
    const consent = await getProducerConsent(producer);
    return {
      status: 200,
      jsonBody: {
        consent: stringifyBigInt(consent),
      },
    };
  } catch (error) {
    context.error(`Error fetching data: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error,
        message: 'Failed to retrieve producer consent',
      },
    };
  }
};

/**
 * HTTP route configuration for the Azure Function to retrieve the producer consent.
 */
app.http('getProducerConsent', {
  methods: ['GET'], // Specifies that this function responds to GET requests
  route: 'getProducerConsent', // Defines the route for the function
  authLevel: 'anonymous', // Sets the authentication level for the function
  handler, // Sets the handler function to process requests
});
