import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { DataRegistryABI } from '../../abi/data-registry.abi';
import { DATA_REGISTRY_CONTRACT_ADDRESS } from '../../constants';
import { stringifyBigInt } from '../../helpers/bigIntStringify';
import { DataRegistryService } from '../../services/contracts/DataRegistryService';
import { producerExist } from './../../helpers/view-query';

/**
 * Azure Function that retrieves all records for a given producer.
 */

/**
 * Handler for the HTTP function that retrieves all records for a specified producer.
 *
 * This function processes a GET request to retrieve all records associated with the specified producer address.
 * On successful retrieval, it returns a 200 OK response containing the records data.
 * In case of an error, it returns a 500 Internal Server Error response with an error message.
 *
 * @param {HttpRequest} request - The HTTP request object containing information about the incoming request.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if retrieving the producer records fails.
 *
 * @example
 * Example Request:
 * GET /producer/records?producer=0x1234567890abcdef1234567890abcdef12345678
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "success": true,
 *   "data": {
 *     "status": 1,
 *     "consent": 1,
 *     "records": [
 *       {
 *         "signature": "0x...",
 *         "resourceType": "HealthRecord",
 *         "cid": "Qm...",
 *         "url": "https://ipfs.io/ipfs/Qm...",
 *         "hash": "0x...",
 *         "isVerified": false
 *       }
 *     ],
 *     "recordIds": ["record-123"],
 *     "nonce": 1
 *   }
 * }
 *
 * Error Responses:
 * Status: 500
 * Body:
 * {
 *   "success": false,
 *   "error": "Detailed error message",
 *   "message": "Failed to retrieve producer records"
 * }
 */
const handler = async (
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    let producer = (await request.query.get('producer')) as string;
    if (!producer) {
      producer = await request.params.producerExist;
    }

    // Initialize the DataRegistryService
    const dataRegistryService = new DataRegistryService(
      DATA_REGISTRY_CONTRACT_ADDRESS,
      DataRegistryABI
    );

    // Get the producer records
    const records = await dataRegistryService.getProducerRecords(producer);

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: stringifyBigInt(records),
      },
    };
  } catch (error) {
    context.error(`Error fetching data: ${error}`);
    return {
      status: 500,
      jsonBody: {
        success: false,
        error: error,
        message: 'Failed to retrieve producer records',
      },
    };
  }
};

/**
 * HTTP route configuration for the Azure Function to retrieve a producer's records.
 */
app.http('getProducerRecords', {
  methods: ['GET'], // Specifies that this function responds to GET requests
  route: 'data-registry/producer/records', // Defines the route for the function
  authLevel: 'anonymous', // Sets the authentication level for the function
  handler, // Sets the handler function to process requests
});
