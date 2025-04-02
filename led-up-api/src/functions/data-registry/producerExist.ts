import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { DataRegistryABI } from '../../abi/data-registry.abi';
import { DATA_REGISTRY_CONTRACT_ADDRESS } from '../../constants';
import { DataRegistryService } from '../../services/contracts/DataRegistryService';

/**
 * Azure Function that checks if a producer exists.
 *
 
 */

/**
 * Handler for the HTTP function that checks if a producer exists.
 *
 * This function processes a GET request to check if a producer exists in the registry.
 * It retrieves the producer address from the query parameters and calls the contract to check existence.
 * On successful execution, it returns a 200 OK response with a boolean indicating existence.
 * In case of an error, it returns a 500 Internal Server Error response with an error message.
 *
 * @param {HttpRequest} request - The HTTP request object containing the producer query parameter.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if checking producer existence fails.
 *
 * @example
 * Example Request:
 * GET /producer/exists?producer=0xProducerAddress
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "success": true,
 *   "data": {
 *     "exists": true
 *   }
 * }
 *
 * Error Responses:
 * Status: 500
 * Body:
 * {
 *   "success": false,
 *   "error": "Detailed error message",
 *   "message": "Failed to check producer existence"
 * }
 */
const handler = async (
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const producer = (await request.query.get('producer')) as string;

    if (!producer) {
      return {
        status: 400,
        jsonBody: {
          success: false,
          error: 'Missing required parameter',
          message: 'producer parameter is required',
        },
      };
    }

    // Initialize the DataRegistryService
    const dataRegistryService = new DataRegistryService(
      DATA_REGISTRY_CONTRACT_ADDRESS,
      DataRegistryABI
    );

    // Check if the producer exists
    const metadata = await dataRegistryService.getProducerMetadata(producer);

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: {
          exists: metadata.isActive,
        },
      },
    };
  } catch (error) {
    context.error(`Error checking producer existence: ${error}`);
    return {
      status: 500,
      jsonBody: {
        success: false,
        error: error,
        message: 'Failed to check producer existence',
      },
    };
  }
};

/**
 * HTTP route configuration for the Azure Function to check if a producer exists.
 */
app.http('producerExist', {
  methods: ['GET'], // Specifies that this function responds to GET requests
  route: 'data-registry/producer/exist', // Defines the route for the function
  authLevel: 'anonymous', // Sets the authentication level for the function
  handler, // Sets the handler function to process requests
});
