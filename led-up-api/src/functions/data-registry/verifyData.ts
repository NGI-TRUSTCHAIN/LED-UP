import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { DataRegistryABI } from '../../abi/data-registry.abi';
import { DATA_REGISTRY_CONTRACT_ADDRESS } from '../../constants';
import { DataRegistryService } from '../../services/contracts/DataRegistryService';

/**
 * Azure Function that verifies data for a specific record.
 */

/**
 * Handler for the HTTP function that verifies data for a specific record.
 *
 * This function processes a POST request to verify data for a specified record.
 * It retrieves the record ID and verifier DID from the request body and calls the contract to verify the data.
 * On successful execution, it returns a 200 OK response with a JSON object containing
 * the transaction receipt. In case of an error, it returns a 500 Internal Server Error response.
 *
 * @param {HttpRequest} request - The HTTP request object containing the verification data.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if verifying the data fails.
 *
 * @example
 * Example Request:
 * POST /data/verify
 * Body:
 * {
 *   "recordId": "record-123",
 *   "verifierDid": "did:ledup:verifier:123456789"
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
 *     "recordId": "record-123",
 *     "verifierDid": "did:ledup:verifier:123456789"
 *   }
 * }
 *
 * Error Responses:
 * Status: 500
 * Body:
 * {
 *   "success": false,
 *   "error": "Detailed error message",
 *   "message": "Failed to verify data"
 * }
 */
const handler = async (
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const { recordId } = (await request.json()) as {
      recordId: string;
    };

    // Initialize the DataRegistryService
    const dataRegistryService = new DataRegistryService(
      DATA_REGISTRY_CONTRACT_ADDRESS,
      DataRegistryABI
    );

    // Verify the data
    const receipt = await dataRegistryService.verifyRecord(recordId);

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: {
          receipt,
          recordId,
        },
      },
    };
  } catch (error) {
    context.error(`Error verifying data: ${error}`);
    return {
      status: 500,
      jsonBody: {
        success: false,
        error: error,
        message: 'Failed to verify data',
      },
    };
  }
};

/**
 * HTTP route configuration for the Azure Function to verify data.
 */
app.http('verifyData', {
  methods: ['POST'], // Specifies that this function responds to POST requests
  route: 'data-registry/verify', // Defines the route for the function
  authLevel: 'anonymous', // Sets the authentication level for the function
  handler, // Sets the handler function to process requests
});
