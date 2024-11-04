import { CompensationABI } from '../utils/compensation.abi';
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { shareData } from '../helpers/update-query';
import { decodeError } from '../helpers/decodeError';
import { DataRegistryABI } from '../utils/dataRegistry.abi';
import { verifyPayment } from '../helpers/view-query';

/**
 * Azure Function that shares data between a producer and a consumer after verifying payment.
 *
 
 */

/**
 * Handler for the HTTP function that shares data.
 *
 * This function processes a POST request to share data between a producer and a consumer.
 * It first verifies the payment associated with the given record ID. If the payment is not verified,
 * it returns a 400 Bad Request response. If the payment is verified, it attempts to share the data
 * and returns a 200 OK response with the receipt. In case of an error, it returns a 500 Internal Server Error response.
 *
 * @param {HttpRequest} request - The HTTP request object.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if sharing the data fails or if payment verification fails.
 *
 * @example
 * Example Request:
 * POST /shareData
 * Body:
 * {
 *   "producer": "producer_address",
 *   "consumer": "consumer_address",
 *   "recordId": "record_id"
 * }
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "receipt": "transaction_receipt_here"
 * }
 *
 * Error Responses:
 * Status: 400
 * Body:
 * {
 *   "message": "Payment not verified"
 * }
 *
 * Status: 500
 * Body:
 * {
 *   "error": "Detailed error message",
 *   "parsed": "Parsed error message",
 *   "message": "Failed to share resource"
 * }
 */
export default async function handler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  const body = (await request.json()) as {
    producer: string;
    consumer: string;
    recordId: string;
  };

  try {
    const verified = await verifyPayment(body.recordId);
    if (!verified) {
      return {
        status: 400,
        jsonBody: {
          message: 'Payment not verified',
        },
      };
    }
    console.log('Sharing Data...', verified);
    const receipt = await shareData(body.producer, body.consumer, body.recordId);

    return {
      status: 200,
      jsonBody: receipt,
    };
  } catch (error: any) {
    context.error(`Error sharing Data: ${error}`);
    console.error(decodeError(DataRegistryABI, error));

    return {
      status: 500,
      jsonBody: {
        error,
        parsed: decodeError(DataRegistryABI, error),
        message: 'Failed to share resource',
      },
    };
  }
}

/**
 * HTTP route configuration for the Azure Function to share data.
 */
app.http('shareData', {
  methods: ['POST'], // Specifies that this function responds to POST requests
  route: 'shareData', // Defines the route for the function
  authLevel: 'anonymous', // Sets the authentication level for the function
  handler, // Sets the handler function to process requests
});
