import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { DataRegistryABI } from '../../abi/data-registry.abi';
import { DATA_REGISTRY_CONTRACT_ADDRESS } from '../../constants';
import { DataRegistryService } from '../../services/contracts/DataRegistryService';

/**
 * Azure Function that updates the schema for provider records.
 */

/**
 * Handler for the HTTP function that updates the schema for provider records.
 *
 * This function processes a POST request to update the schema for provider records.
 * It retrieves the new schema reference from the request body and calls the contract to update it.
 * On successful execution, it returns a 200 OK response with a JSON object containing
 * the transaction receipt and the updated schema reference. In case of an error, it returns a
 * 500 Internal Server Error response.
 *
 * @param {HttpRequest} request - The HTTP request object containing the update data.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if updating the provider record schema fails.
 *
 * @example
 * Example Request:
 * POST /provider/schema/update
 * Body:
 * {
 *   "schemaRef": {
 *     "url": "https://ipfs.io/ipfs/Qm...",
 *     "hash": "0x..."
 *   }
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
 *     "schemaRef": {
 *       "url": "https://ipfs.io/ipfs/Qm...",
 *       "hash": "0x..."
 *     }
 *   }
 * }
 *
 * Error Responses:
 * Status: 500
 * Body:
 * {
 *   "success": false,
 *   "error": "Detailed error message",
 *   "message": "Failed to update provider record schema"
 * }
 */
const handler = async (
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const { schemaRef } = (await request.json()) as {
      schemaRef: {
        url: string;
        hash: string;
      };
    };

    // Initialize the DataRegistryService
    const dataRegistryService = new DataRegistryService(
      DATA_REGISTRY_CONTRACT_ADDRESS,
      DataRegistryABI
    );

    // Update the provider record schema
    const receipt = await dataRegistryService.updateProviderRecordSchema({ schemaRef });

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: {
          receipt,
          schemaRef,
        },
      },
    };
  } catch (error) {
    context.error(`Error updating provider record schema: ${error}`);
    return {
      status: 500,
      jsonBody: {
        success: false,
        error: error,
        message: 'Failed to update provider record schema',
      },
    };
  }
};

/**
 * HTTP route configuration for the Azure Function to update the provider's record schema.
 */
app.http('updateProviderRecordSchema', {
  methods: ['POST'], // Specifies that this function responds to POST requests
  route: 'data-registry/provider/update-schema', // Defines the route for the function
  authLevel: 'anonymous', // Sets the authentication level for the function
  handler, // Sets the handler function to process requests
});
