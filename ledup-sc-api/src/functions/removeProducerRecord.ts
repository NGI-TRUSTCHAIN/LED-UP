import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { removeProducerRecord } from '../helpers/update-query';
import { stringifyBigInt } from '../helpers/bigIntStringify';

/**
 * Azure Function that removes a producer record based on the provided producer address.
 *
 
 */

/**
 * Handler for the HTTP function that removes a producer record.
 *
 * This function processes a POST request to remove a producer record from the database.
 * It retrieves the producer's address from the request body, calls the `removeProducerRecord`
 * function to execute the removal, and returns a JSON object containing the receipt
 * of the removal operation. On successful execution, it returns a 200 OK response.
 * In case of an error, it returns a 500 Internal Server Error response.
 *
 * @param {HttpRequest} request - The HTTP request object containing the producer's address to be removed.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if removing the producer record fails.
 *
 * @example
 * Example Request:
 * POST /removeProducerRecord
 * Body:
 * {
 *   "producer": "0xProducerAddress"
 * }
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "receipt": "removal_receipt_here"
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
  const data = (await request.json()) as { producer: string };

  try {
    console.log({ data });
    const receipt = await removeProducerRecord(data.producer);

    return {
      status: 200,
      jsonBody: stringifyBigInt(receipt),
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
 * HTTP route configuration for the Azure Function to remove a producer record.
 */
app.http('removeProducerRecord', {
  methods: ['POST'], // Specifies that this function responds to POST requests
  route: 'removeProducerRecord', // Defines the route for the function
  authLevel: 'anonymous', // Sets the authentication level for the function
  handler, // Sets the handler function to process requests
});
