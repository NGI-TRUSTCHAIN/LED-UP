/**
 * Azure Function to check if a DID is active.
 */
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { authMiddleware } from '../../helpers/auth-middleware';
import { getContractAbi, getContractAddress } from '../../helpers/contract-config';
import { AuthService } from '../../services/auth/AuthService';
import { DidAuthService, DidRegistryService, DidVerifierService } from '../../services/contracts';
import { CheckDidActiveRequest, CheckDidActiveResponse } from '../../types/auth-types';

/**
 * Handler for the HTTP function that checks if a DID is active.
 *
 * This function processes a POST request to check if a DID is active.
 * It returns a 200 OK response with the active status.
 * In case of an error, it returns a 400 Bad Request response.
 *
 * @param {HttpRequest} request - The HTTP request object.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @example
 * Example Request:
 * POST /auth/did/active
 * Body:
 * {
 *   "did": "did:ethr:0x1234567890abcdef1234567890abcdef12345678"
 * }
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "active": true
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
    const body = (await request.json()) as CheckDidActiveRequest;

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

    // Initialize services
    const didRegistryService = new DidRegistryService(
      getContractAddress('DID_REGISTRY'),
      getContractAbi('DID_REGISTRY')
    );

    const didAuthService = new DidAuthService(
      getContractAddress('DID_AUTH'),
      getContractAbi('DID_AUTH')
    );

    const didVerifierService = new DidVerifierService(
      getContractAddress('DID_VERIFIER'),
      getContractAbi('DID_VERIFIER')
    );

    const authService = new AuthService(
      didAuthService,
      didRegistryService,
      didVerifierService,
      context
    );

    // Check if the DID is active
    const active = await authService.isDidActive(body.did);

    // Return the active status
    const response: CheckDidActiveResponse = {
      active,
    };

    return {
      status: 200,
      jsonBody: response,
    };
  } catch (error: any) {
    context.error(`Error checking if DID is active: ${error}`);

    return {
      status: 500,
      jsonBody: {
        error: 'Internal Server Error',
        message: error.message || 'Failed to check if DID is active',
      },
    };
  }
}

/**
 * HTTP route configuration for the Azure Function to check if a DID is active.
 */
app.http('checkDidActive', {
  methods: ['POST'],
  route: 'auth/did-status',
  authLevel: 'anonymous',
  handler,
});
