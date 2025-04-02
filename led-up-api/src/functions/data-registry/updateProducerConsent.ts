import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { DataRegistryABI } from '../../abi/data-registry.abi';
import { DATA_REGISTRY_CONTRACT_ADDRESS } from '../../constants';
import { DataRegistryService } from '../../services/contracts/DataRegistryService';

/**
 * Azure Function that updates the consent status of a producer.
 */

/**
 * Handler for the HTTP function that updates the consent status of a producer.
 *
 * This function processes a POST request to update the consent status of a producer.
 * It retrieves the producer address and new consent status from the request body
 * and calls the contract to update the consent status. On successful execution, it returns a
 * 200 OK response with a JSON object containing the transaction receipt and the
 * updated consent status. In case of an error, it returns a 500 Internal Server Error response.
 *
 * @param {HttpRequest} request - The HTTP request object containing the update data.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if updating the producer consent status fails.
 *
 * @example
 * Example Request:
 * POST /producer/consent/update
 * Body:
 * {
 *   "producer": "0xProducerAddress",
 *   "status": 1
 * }
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "success": true,
 *   "data": {
 *     "receipt": {
 *       "transactionHash": "0x...",
 *       "blockNumber": 12345,
 *       "events": [...]
 *     },
 *     "producer": "0xProducerAddress",
 *     "consent": 1
 *   }
 * }
 *
 * Error Responses:
 * Status: 500
 * Body:
 * {
 *   "success": false,
 *   "error": "Detailed error message",
 *   "message": "Failed to update producer consent"
 * }
 */
const handler = async (
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const { producer, status } = (await request.json()) as {
      producer: string;
      status: number;
    };

    // Initialize the DataRegistryService
    const dataRegistryService = new DataRegistryService(
      DATA_REGISTRY_CONTRACT_ADDRESS,
      DataRegistryABI
    );

    // Update the producer consent
    const receipt = await dataRegistryService.updateProducerConsent(producer, status);

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: {
          receipt,
          producer,
          consent: status,
        },
      },
    };
  } catch (error) {
    context.error(`Error updating producer consent: ${error}`);
    return {
      status: 500,
      jsonBody: {
        success: false,
        error: error,
        message: 'Failed to update producer consent',
      },
    };
  }
};

/**
 * HTTP route configuration for the Azure Function to update a producer's consent status.
 */
app.http('updateProducerConsent', {
  methods: ['POST'], // Specifies that this function responds to POST requests
  route: 'data-registry/producer/update-consent', // Defines the route for the function
  authLevel: 'anonymous', // Sets the authentication level for the function
  handler, // Sets the handler function to process requests
});
