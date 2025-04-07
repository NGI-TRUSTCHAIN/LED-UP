import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { DataRegistryABI } from '../../abi/data-registry.abi';
import { DidAuthABI } from '../../abi/did-auth.abi';
import { DATA_REGISTRY_CONTRACT_ADDRESS, DID_AUTH_CONTRACT_ADDRESS } from '../../constants';
import { DidAuthService, DataRegistryService } from '../../services';
import { ConsentStatus, RecordStatus } from '../../services/contracts';

/**
 * Azure Function that registers a producer in the DataRegistry contract.
 *
 * This function first verifies the user's DID authentication status before
 * registering them as a producer in the DataRegistry contract.
 */

/**
 * Handler for the HTTP function that registers a producer.
 *
 * This function processes a POST request to register a producer in the DataRegistry contract.
 * It retrieves the producer's DID, address, status and consent from the request body,
 * verifies the DID authentication, and then calls the registerProducer method on the
 * DataRegistryService. On successful execution, it returns a 200 OK response with a
 * JSON object containing the transaction receipt. In case of an error, it returns a
 * 500 Internal Server Error response.
 *
 * @param {HttpRequest} request - The HTTP request object containing the registration data.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @throws Will throw an error if processing the request fails.
 *
 * @example
 * Example Request:
 * POST /data-registry/producer/register
 * Body:
 * {
 *   "ownerDid": "did:ledup:producer:123456789",
 *   "producer": "0x123...",
 *   "status": 1,
 *   "consent": 1
 * }
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "success": true,
 *   "data": {
 *     "transactionHash": "0x...",
 *     "blockNumber": 12345,
 *     "events": [...]
 *   }
 * }
 *
 * Error Responses:
 * Status: 400
 * Body:
 * {
 *   "success": false,
 *   "error": "Missing required fields",
 *   "message": "ownerDid and producer address are required"
 * }
 *
 * Status: 401
 * Body:
 * {
 *   "success": false,
 *   "error": "Authentication failed",
 *   "message": "DID is not authenticated or does not have the required role"
 * }
 *
 * Status: 500
 * Body:
 * {
 *   "success": false,
 *   "error": "Detailed error message",
 *   "message": "Failed to register producer"
 * }
 */
const handler = async (
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const registrationData = (await request.json()) as {
      ownerDid: string;
      producer: string;
      status?: number;
      consent?: number;
    };

    const {
      ownerDid,
      producer,
      status = RecordStatus.ACTIVE,
      consent = ConsentStatus.NOT_SET,
    } = registrationData;

    // Validate required fields
    if (!ownerDid || !producer) {
      context.log(`Missing required fields in registration request`);
      return {
        status: 400,
        jsonBody: {
          success: false,
          error: 'Missing required fields',
          message: 'ownerDid and producer address are required',
        },
      };
    }

    // Initialize the DidAuthService to verify authentication
    const didAuthService = new DidAuthService(DID_AUTH_CONTRACT_ADDRESS, DidAuthABI);

    // Verify that the DID is authenticated and has the producer role
    const producerRole = didAuthService.PRODUCER_ROLE;
    const isAuthenticated = await didAuthService.authenticate(ownerDid, producerRole);

    if (!isAuthenticated) {
      context.log(`DID ${ownerDid} failed authentication or does not have producer role`);
      return {
        status: 401,
        jsonBody: {
          success: false,
          error: 'Authentication failed',
          message: 'DID is not authenticated or does not have the required role',
        },
      };
    }

    // Initialize the DataRegistryService
    const dataRegistryService = new DataRegistryService(
      DATA_REGISTRY_CONTRACT_ADDRESS,
      DataRegistryABI
    );

    // Register the producer
    context.log(`Registering producer with DID ${ownerDid} and address ${producer}`);
    const receipt = await dataRegistryService.registerProducer(
      status as RecordStatus,
      consent as ConsentStatus
    );

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: receipt,
      },
    };
  } catch (error) {
    context.log(`Error registering producer: ${error}`);
    return {
      status: 500,
      jsonBody: {
        success: false,
        error: error,
        message: 'Failed to register producer',
      },
    };
  }
};

/**
 * HTTP route configuration for the Azure Function to register a producer.
 */
app.http('registerProducer', {
  methods: ['POST'], // Specifies that this function responds to POST requests
  route: 'data-registry/producer/register', // Defines the route for the function
  authLevel: 'anonymous', // Sets the authentication level for the function
  handler, // Sets the handler function to process requests
});
