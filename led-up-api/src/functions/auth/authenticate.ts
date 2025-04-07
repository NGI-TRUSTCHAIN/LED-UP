/**
 * Azure Function to authenticate a user.
 */
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { getContractConfig } from '../../config/contract-config';
import {
  DidAuthService,
  DidRegistryService,
  DidVerifierService,
  AuthService,
} from '../../services';
import { AuthRequest, AuthResponse } from '../../types/auth-types';

/**
 * Handler for the HTTP function that authenticates a user.
 *
 * This function processes a POST request to authenticate a user using their Ethereum address and signature.
 * It verifies the signature against the challenge and returns a JWT token if successful.
 * In case of an error, it returns a 401 Unauthorized response.
 *
 * @param {HttpRequest} request - The HTTP request object.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @example
 * Example Request:
 * POST /auth/authenticate
 * Body:
 * {
 *   "address": "0x1234567890abcdef1234567890abcdef12345678",
 *   "signature": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1b"
 * }
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   "expiresIn": 3600,
 *   "user": {
 *     "address": "0x1234567890abcdef1234567890abcdef12345678",
 *     "role": "consumer",
 *     "did": "did:ethr:0x1234567890abcdef1234567890abcdef12345678"
 *   }
 * }
 *
 * Error Responses:
 * Status: 401
 * Body:
 * {
 *   "error": "Unauthorized",
 *   "message": "Invalid signature"
 * }
 */
export async function handler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('Processing authenticate request');

  try {
    // Parse the request body
    const requestBody = (await request.json()) as AuthRequest;
    const { address, signature } = requestBody;

    // Validate required fields
    if (!address || !signature) {
      return {
        status: 400,
        jsonBody: {
          success: false,
          message: 'Address and signature are required',
        },
      };
    }

    // Normalize the address
    const normalizedAddress = address.toLowerCase();

    // Initialize services
    const contractConfig = getContractConfig();

    const didAuthService = new DidAuthService(
      contractConfig.didAuth.address,
      contractConfig.didAuth.abi
    );

    const didRegistryService = new DidRegistryService(
      contractConfig.didRegistry.address,
      contractConfig.didRegistry.abi
    );

    const didVerifierService = new DidVerifierService(
      contractConfig.didVerifier.address,
      contractConfig.didVerifier.abi
    );

    const authService = new AuthService(
      didAuthService,
      didRegistryService,
      didVerifierService,
      context
    );

    // Authenticate the user
    const authResponse: AuthResponse = await authService.authenticate(normalizedAddress, signature);

    context.info(authResponse);

    // Return the authentication response
    return {
      status: 200,
      jsonBody: {
        success: true,
        data: authResponse,
        message: 'Authentication successful',
      },
    };
  } catch (error) {
    // Determine the appropriate error message
    let errorMessage = 'Authentication failed';
    let statusCode = 401;

    if (error instanceof Error) {
      if (error.message.includes('Invalid challenge')) {
        errorMessage = 'Invalid or expired challenge';
      } else if (error.message.includes('Invalid signature')) {
        errorMessage = 'Invalid signature';
      } else if (error.message.includes('Deactivated')) {
        errorMessage = 'User account is deactivated';
        statusCode = 403;
      } else {
        errorMessage = error.message;
      }
    }

    // Log the error
    context.error({
      message: errorMessage,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return {
      status: statusCode,
      jsonBody: {
        success: false,
        message: errorMessage,
      },
    };
  }
}

/**
 * HTTP route configuration for the Azure Function to authenticate a user.
 */
app.http('authenticate', {
  methods: ['POST'],
  route: 'auth/authenticate',
  authLevel: 'function',
  handler,
});
