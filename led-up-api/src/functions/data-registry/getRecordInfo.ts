import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { DataRegistryABI } from '../../abi/data-registry.abi';
import { DATA_REGISTRY_CONTRACT_ADDRESS } from '../../constants';
import { stringifyBigInt } from '../../helpers/bigIntStringify';
import { DataRegistryService } from '../../services/contracts/DataRegistryService';

/**
 * Azure Function that retrieves a specific record for a given producer.
 *
 
 */

/**
 * Handler for the HTTP function that retrieves a record for a specified producer.
 *
 * This function processes a GET request to retrieve the record associated with the specified producer and record ID.
 * On successful retrieval, it returns a 200 OK response containing the record data.
 * In case of an error, it returns a 500 Internal Server Error response with an error message.
 *
 * @param {HttpRequest} request - The HTTP request object containing information about the incoming request.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if retrieving the producer record fails.
 *
 * @example
 * Example Request:
 * GET /producer/record?producer=0x1234567890abcdef1234567890abcdef12345678&recordId=record123
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "success": true,
 *   "data": {
 *     "record": {
 *       "signature": "0x...",
 *       "resourceType": "HealthRecord",
 *       "cid": "Qm...",
 *       "url": "https://ipfs.io/ipfs/Qm...",
 *       "hash": "0x...",
 *       "isVerified": false
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
 *   "message": "Failed to retrieve producer record"
 * }
 */
const handler = async (
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const producer = (await request.query.get('producer')) as string;
    const recordId = (await request.query.get('recordId')) as string;

    context.log(`Fetching record for producer: ${producer} with recordId: ${recordId}`);

    // Initialize the DataRegistryService
    const dataRegistryService = new DataRegistryService(
      DATA_REGISTRY_CONTRACT_ADDRESS,
      DataRegistryABI
    );

    // Get the producer record
    const record = await dataRegistryService.getRecordInfo(recordId);

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: {
          record: stringifyBigInt(record),
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
        message: 'Failed to retrieve producer record',
      },
    };
  }
};

/**
 * HTTP route configuration for the Azure Function to retrieve a producer's record.
 */
app.http('getProducerRecord', {
  methods: ['GET'], // Specifies that this function responds to GET requests
  route: 'data-registry/producer/record', // Defines the route for the function
  authLevel: 'anonymous', // Sets the authentication level for the function
  handler, // Sets the handler function to process requests
});
