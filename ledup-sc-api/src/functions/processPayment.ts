import { ProcessPaymentParams } from '../types';
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { processPayment } from '../helpers/update-query';
import erc20 from '../helpers/erc20';
import { parseEther } from 'ethers';
import { getUnitPrice } from '../helpers/view-query';

/**
 * Azure Function that processes a payment for data usage.
 *
 
 */

/**
 * Handler for the HTTP function that processes a payment.
 *
 * This function processes a POST request to execute a payment for the specified data usage.
 * It retrieves the necessary parameters, checks the unit price, approves the payment transaction,
 * and invokes the payment processing function. On successful execution, it returns a 200 OK response
 * containing the receipt of the payment. In case of an error, it returns a 500 Internal Server Error response.
 *
 * @param {HttpRequest} request - The HTTP request object containing the payment parameters.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if processing the payment fails.
 *
 * @example
 * Example Request:
 * POST /processPayment
 * Body:
 * {
 *   "producer": "0xProducerAddress",
 *   "recordId": "12345",
 *   "dataSize": 10
 * }
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "receipt": { // Receipt of the payment
 *     "transactionId": "abc123",
 *     "status": "success"
 *   }
 * }
 *
 * Error Responses:
 * Status: 500
 * Body:
 * {
 *   "error": "Detailed error message",
 *   "message": "Failed to process payment"
 * }
 */
const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const compensationSmartContractAddress = process.env.COMPENSATION_CONTRACT_ADDRESS as string;
    const ConsumerAddress = process.env.OWNER_ADDRESS as string;

    const { producer, recordId, dataSize } = (await request.json()) as ProcessPaymentParams;
    const { unitPrice } = await getUnitPrice();

    await erc20.approve(compensationSmartContractAddress, parseEther(`${dataSize * unitPrice}`));

    console.log({
      producer,
      recordId,
      dataSize,
      amount: parseEther(`${dataSize * unitPrice}`),
    });

    const receipt = await processPayment({ producer, recordId, dataSize });

    return {
      status: 200,
      jsonBody: {
        receipt,
      },
    };
  } catch (error) {
    context.error(`Error processing payment: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error,
        message: 'Failed to process payment',
      },
    };
  }
};

/**
 * HTTP route configuration for the Azure Function to process a payment.
 */
app.http('processPayment', {
  methods: ['POST'], // Specifies that this function responds to POST requests
  route: 'processPayment', // Defines the route for the function
  authLevel: 'anonymous', // Sets the authentication level for the function
  handler, // Sets the handler function to process requests
});
