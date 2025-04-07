/**
 * Azure Function to resolve a DID.
 */
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { authMiddleware } from '../../helpers/auth-middleware';
import { getContractAbi, getContractAddress } from '../../helpers/contract-config';
import { DidRegistryService, DidResolverService } from '../../services';
import { ResolveDidRequest } from '../../types/did-types';

/**
 * Handler for the HTTP function that resolves a DID.
 *
 * This function processes a POST request to resolve a DID to a DID document.
 * It returns a 200 OK response with the DID resolution result.
 * In case of an error, it returns a 400 Bad Request response.
 *
 * @param {HttpRequest} request - The HTTP request object.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @example
 * Example Request:
 * POST /did/resolve
 * Body:
 * {
 *   "did": "did:ethr:0x1234567890abcdef1234567890abcdef12345678"
 * }
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "@context": "https://w3id.org/did-resolution/v1",
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
 *   },
 *   "didResolutionMetadata": {
 *     "contentType": "application/did+ld+json"
 *   },
 *   "didDocumentMetadata": {
 *     "created": "2023-01-01T00:00:00Z"
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
  const authError = authMiddleware(request);
  if (authError) {
    return authError;
  }

  try {
    // Parse the request body
    const body = (await request.json()) as ResolveDidRequest;

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

    // Resolve the DID
    const result = await didResolverService.resolve(body.did);

    // Check if there was an error resolving the DID
    if (result.didResolutionMetadata.error) {
      return {
        status: 404,
        jsonBody: {
          error: 'Not Found',
          message: `Failed to resolve DID: ${result.didResolutionMetadata.error}`,
        },
      };
    }

    // Return the DID resolution result
    return {
      status: 200,
      jsonBody: result,
    };
  } catch (error: any) {
    context.error(`Error resolving DID: ${error}`);

    return {
      status: 400,
      jsonBody: {
        error: 'Bad Request',
        message: error.message || 'Failed to resolve DID',
      },
    };
  }
}

/**
 * HTTP route configuration for the Azure Function to resolve a DID.
 */
app.http('resolveDid', {
  methods: ['POST', 'GET'],
  route: 'did/resolve',
  authLevel: 'anonymous',
  handler,
});
