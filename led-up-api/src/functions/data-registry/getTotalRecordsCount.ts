import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { DataRegistryABI } from '../../abi/data-registry.abi';
import { DATA_REGISTRY_CONTRACT_ADDRESS } from '../../constants';
import { DataRegistryService } from '../../services/contracts/DataRegistryService';

/**
 * Azure Function that retrieves the total count of records in the registry.
 */

/**
 * Handler for the HTTP function that retrieves the total count of records in the registry.
 *
 * This function processes a GET request to retrieve the total count of records in the registry.
 * It calls the contract to get the total records count. On successful retrieval, it returns a
 * 200 OK response containing the total count. In case of an error, it returns a
 * 500 Internal Server Error response with an error message.
 *
 * @param {HttpRequest} request - The HTTP request object containing information about the incoming request.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if retrieving the total records count fails.
 *
 * @example
 * Example Request:
 * GET /records/count
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "success": true,
 *   "data": {
 *     "count": 100
 *   }
 * }
 *
 * Error Responses:
 * Status: 500
 * Body:
 * {
 *   "success": false,
 *   "error": "Detailed error message",
 *   "message": "Failed to retrieve total records count"
 * }
 */
const handler = async (
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    // Initialize the DataRegistryService
    const dataRegistryService = new DataRegistryService(
      DATA_REGISTRY_CONTRACT_ADDRESS,
      DataRegistryABI
    );

    // Get the total records count
    const count = await dataRegistryService.getTotalRecords();

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: {
          count: Number(count),
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
        message: 'Failed to retrieve total records count',
      },
    };
  }
};

/**
 * HTTP route configuration for the Azure Function to retrieve the total count of records.
 */
app.http('getTotalRecordsCount', {
  methods: ['GET'], // Specifies that this function responds to GET requests
  route: 'data-registry/total-records-count', // Defines the route for the function
  authLevel: 'anonymous', // Sets the authentication level for the function
  handler, // Sets the handler function to process requests
});
