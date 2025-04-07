import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { DataRegistryABI } from '../../abi/data-registry.abi';
import { DATA_REGISTRY_CONTRACT_ADDRESS } from '../../constants';
import { DataRegistryService } from '../../services/contracts/DataRegistryService';

/**
 * Azure Function that retrieves the status of a producer's record.
 *
 
 */

/**
 * Handler for the HTTP function that retrieves the status of a producer's record.
 *
 * This function processes a GET request to retrieve the status of a producer's record.
 * It retrieves the producer address from the query parameters and calls the contract to get the record status.
 * On successful retrieval, it returns a 200 OK response containing the record status.
 * In case of an error, it returns a 500 Internal Server Error response with an error message.
 *
 * @param {HttpRequest} request - The HTTP request object containing information about the incoming request.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if retrieving the producer record status fails.
 *
 * @example
 * Example Request:
 * GET /producer/record/status?producer=0xProducerAddress
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "success": true,
 *   "data": {
 *     "status": 1
 *   }
 * }
 *
 * Error Responses:
 * Status: 500
 * Body:
 * {
 *   "success": false,
 *   "error": "Detailed error message",
 *   "message": "Failed to retrieve producer record status"
 * }
 */
const handler = async (
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const producer = (await request.query.get('producer')) as string;

    // Initialize the DataRegistryService
    const dataRegistryService = new DataRegistryService(
      DATA_REGISTRY_CONTRACT_ADDRESS,
      DataRegistryABI
    );

    // Get the producer record status
    const status = await dataRegistryService.getProducerRecordStatus(producer);

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: {
          status: Number(status),
        },
      },
    };
  } catch (error) {
    context.error(`Error fetching data: ${error}`);
    return {
      status: 500,
      jsonBody: {
        success: false,
        error: error,
        message: 'Failed to retrieve producer record status',
      },
    };
  }
};

/**
 * HTTP route configuration for the Azure Function to retrieve a producer's record status.
 */
app.http('getProducerRecordStatus', {
  methods: ['GET'], // Specifies that this function responds to GET requests
  route: 'data-registry/producer/record-status', // Defines the route for the function
  authLevel: 'anonymous', // Sets the authentication level for the function
  handler, // Sets the handler function to process requests
});
