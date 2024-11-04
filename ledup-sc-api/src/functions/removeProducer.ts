import { AddressParam } from '../types';
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { removeProducer } from '../helpers/update-query';

/**
 * Azure Function that removes a producer based on the provided address.
 *
 
 */

/**
 * Handler for the HTTP function that removes a producer.
 *
 * This function processes a POST request to remove a producer from the database.
 * It retrieves the producer's address from the request body, calls the `removeProducer`
 * function to execute the removal, and returns a JSON object containing the receipt
 * of the removal operation. On successful execution, it returns a 200 OK response.
 * In case of an error, it returns a 500 Internal Server Error response.
 *
 * @param {HttpRequest} request - The HTTP request object containing the address of the producer to be removed.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if removing the producer fails.
 *
 * @example
 * Example Request:
 * POST /removeProducer
 * Body:
 * {
 *   "address": "0xProducerAddress"
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
 *   "message": "Failed to remove producer/patient"
 * }
 */
const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const { address } = (await request.json()) as AddressParam;
    const receipt = await removeProducer(address);
    return {
      status: 200,
      jsonBody: {
        receipt,
      },
    };
  } catch (error) {
    context.error(`Error removing producer/patient: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error,
        message: 'Failed to remove producer/patient',
      },
    };
  }
};

/**
 * HTTP route configuration for the Azure Function to remove a producer.
 */
app.http('removeProducer', {
  methods: ['POST'], // Specifies that this function responds to POST requests
  route: 'removeProducer', // Defines the route for the function
  authLevel: 'anonymous', // Sets the authentication level for the function
  handler, // Sets the handler function to process requests
});
