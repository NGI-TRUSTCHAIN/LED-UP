import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { DataRegistryABI } from '../../abi/data-registry.abi';
import { DATA_REGISTRY_CONTRACT_ADDRESS } from '../../constants';
import { DataRegistryService } from '../../services/contracts/DataRegistryService';

/**
 * Azure Function that updates the metadata of the provider.
 */

/**
 * Handler for the HTTP function that updates the metadata of the provider.
 *
 * This function processes a POST request to update the metadata of the provider.
 * It retrieves the new metadata from the request body and calls the contract to update it.
 * On successful execution, it returns a 200 OK response with a JSON object containing
 * the transaction receipt and the updated metadata. In case of an error, it returns a
 * 500 Internal Server Error response.
 *
 * @param {HttpRequest} request - The HTTP request object containing the update data.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if updating the provider metadata fails.
 *
 * @example
 * Example Request:
 * POST /provider/metadata/update
 * Body:
 * {
 *   "metadata": {
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
 *     "metadata": {
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
 *   "message": "Failed to update provider metadata"
 * }
 */
const handler = async (
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const { metadata } = (await request.json()) as {
      metadata: {
        url: string;
        hash: string;
      };
    };

    // Initialize the DataRegistryService
    const dataRegistryService = new DataRegistryService(
      DATA_REGISTRY_CONTRACT_ADDRESS,
      DataRegistryABI
    );

    // Update the provider metadata
    const receipt = await dataRegistryService.updateProviderMetadata(metadata);

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: {
          receipt,
          metadata,
        },
      },
    };
  } catch (error) {
    context.error(`Error updating provider metadata: ${error}`);
    return {
      status: 500,
      jsonBody: {
        success: false,
        error: error,
        message: 'Failed to update provider metadata',
      },
    };
  }
};

/**
 * HTTP route configuration for the Azure Function to update the provider's metadata.
 */
app.http('updateProviderMetadata', {
  methods: ['POST'], // Specifies that this function responds to POST requests
  route: 'data-registry/provider/update-metadata', // Defines the route for the function
  authLevel: 'anonymous', // Sets the authentication level for the function
  handler, // Sets the handler function to process requests
});
