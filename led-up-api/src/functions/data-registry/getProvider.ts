import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { Contract } from 'ethers';

import { DataRegistryABI } from '../../abi/data-registry.abi';
import { DATA_REGISTRY_CONTRACT_ADDRESS } from '../../constants';
import { signer } from '../../helpers/get-signer';

/**
 * Azure Function that retrieves the provider address.
 */

/**
 * Handler for the HTTP function that retrieves the provider address.
 *
 * This function processes a GET request to retrieve the address of the provider.
 * It calls the contract to get the provider address. On successful retrieval,
 * it returns a 200 OK response containing the address. In case of an error, it returns a
 * 500 Internal Server Error response with an error message.
 *
 * @param {HttpRequest} request - The HTTP request object containing information about the incoming request.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if retrieving the provider address fails.
 *
 * @example
 * Example Request:
 * GET /provider
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "success": true,
 *   "data": {
 *     "provider": "0xProviderAddress"
 *   }
 * }
 *
 * Error Responses:
 * Status: 500
 * Body:
 * {
 *   "success": false,
 *   "error": "Detailed error message",
 *   "message": "Failed to retrieve provider address"
 * }
 */
const handler = async (
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    // Since DataRegistryService doesn't have a getOwner method and the contract property is private,
    // we'll create a direct contract instance
    const contract = new Contract(DATA_REGISTRY_CONTRACT_ADDRESS, DataRegistryABI, signer);

    const provider = await contract.owner();

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: {
          provider,
        },
      },
    };
  } catch (error) {
    context.error(`Error retrieving provider address: ${error}`);
    return {
      status: 500,
      jsonBody: {
        success: false,
        error: error,
        message: 'Failed to retrieve provider address',
      },
    };
  }
};

/**
 * HTTP route configuration for the Azure Function to retrieve the provider address.
 */
app.http('getProvider', {
  methods: ['GET'], // Specifies that this function responds to GET requests
  route: 'data-registry/provider', // Defines the route for the function
  authLevel: 'anonymous', // Sets the authentication level for the function
  handler, // Sets the handler function to process requests
});
