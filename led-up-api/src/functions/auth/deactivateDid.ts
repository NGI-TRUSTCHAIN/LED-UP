/**
 * Azure Function to deactivate a DID.
 */
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { authMiddleware } from '../../helpers/auth-middleware';
import { getContractAbi, getContractAddress } from '../../helpers/contract-config';
import { DidRegistryService, DidResolverService } from '../../services';
import { UserRole } from '../../types/auth-types';
import { DeactivateDidRequest, DeactivateDidResponse } from '../../types/did-types';

/**
 * Handler for the HTTP function that deactivates a DID.
 *
 * This function processes a POST request to deactivate a DID.
 * It returns a 200 OK response with the deactivated DID document.
 * In case of an error, it returns a 400 Bad Request response.
 *
 * @param {HttpRequest} request - The HTTP request object.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @example
 * Example Request:
 * POST /did/deactivate
 * Body:
 * {
 *   "did": "did:ethr:0x1234567890abcdef1234567890abcdef12345678"
 * }
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "deactivated": true,
 *   "didDocument": {
 *     "@context": [
 *       "https://www.w3.org/ns/did/v1",
 *       "https://w3id.org/security/suites/secp256k1-2019/v1"
 *     ],
 *     "id": "did:ethr:0x1234567890abcdef1234567890abcdef12345678",
 *     "controller": [
 *       "did:ethr:0x1234567890abcdef1234567890abcdef12345678"
 *     ],
 *     "verificationMethod": [
 *       {
 *         "id": "did:ethr:0x1234567890abcdef1234567890abcdef12345678#keys-1",
 *         "type": "EcdsaSecp256k1VerificationKey2019",
 *         "controller": "did:ethr:0x1234567890abcdef1234567890abcdef12345678",
 *         "publicKeyHex": "0x..."
 *       }
 *     ],
 *     "authentication": [
 *       "did:ethr:0x1234567890abcdef1234567890abcdef12345678#keys-1"
 *     ]
 *   }
 * }
 *
 * Error Responses:
 * Status: 400
 * Body:
 * {
 *   "error": "Bad Request",
 *   "message": "DID is required"
 * }
 */
export async function handler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  // Check authentication
  const authError = authMiddleware(request, [UserRole.ADMIN]);
  if (authError) {
    return authError;
  }

  try {
    // Parse the request body
    const body = (await request.json()) as DeactivateDidRequest;

    // Validate the request
    if (!body.did) {
      return {
        status: 400,
        jsonBody: {
          error: 'Bad Request',
          message: 'DID is required',
        },
      };
    }

    // Initialize the DidRegistryService
    const didRegistryService = new DidRegistryService(
      getContractAddress('DID_REGISTRY'),
      getContractAbi('DID_REGISTRY')
    );

    // Initialize the DidResolverService
    const didResolverService = new DidResolverService(didRegistryService, undefined, context);

    // Check if the DID is active
    const isActive = await didRegistryService.isDidActive(body.did);
    if (!isActive) {
      return {
        status: 400,
        jsonBody: {
          error: 'Bad Request',
          message: 'DID is already deactivated',
        },
      };
    }

    // Deactivate the DID
    const result = await didResolverService.deactivateDid(body.did);

    // Check if there was an error deactivating the DID
    if (result.didResolutionMetadata.error) {
      return {
        status: 500,
        jsonBody: {
          error: 'Internal Server Error',
          message: `Failed to deactivate DID: ${result.didResolutionMetadata.error}`,
        },
      };
    }

    // Return the deactivated DID document
    const response: DeactivateDidResponse = {
      deactivated: true,
      didDocument: result.didDocument,
    };

    return {
      status: 200,
      jsonBody: response,
    };
  } catch (error: any) {
    context.error(`Error deactivating DID: ${error}`);

    return {
      status: 400,
      jsonBody: {
        error: 'Bad Request',
        message: error.message || 'Failed to deactivate DID',
      },
    };
  }
}

/**
 * HTTP route configuration for the Azure Function to deactivate a DID.
 */
app.http('deactivateDid', {
  methods: ['POST'],
  route: 'did/deactivate',
  authLevel: 'anonymous',
  handler,
});
