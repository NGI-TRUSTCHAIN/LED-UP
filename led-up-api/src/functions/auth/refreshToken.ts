/**
 * Azure Function to refresh an authentication token.
 */
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { getContractConfig } from '../../config/contract-config';
import {
  AuthService,
  DidAuthService,
  DidRegistryService,
  DidVerifierService,
} from '../../services';
import { RefreshTokenRequest } from '../../types/auth-types';

/**
 * Handler for the HTTP function that refreshes an authentication token.
 *
 * This function processes a POST request to refresh an authentication token.
 * It verifies the refresh token and returns a new access token if successful.
 * In case of an error, it returns a 401 Unauthorized response.
 *
 * @param {HttpRequest} request - The HTTP request object.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @example
 * Example Request:
 * POST /auth/refresh
 * Body:
 * {
 *   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
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
 *   "message": "Invalid refresh token"
 * }
 */
export async function handler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('Processing refresh token request');

  try {
    // Parse the request body
    const requestBody = (await request.json()) as RefreshTokenRequest;
    const { refreshToken } = requestBody;

    // Validate required fields
    if (!refreshToken) {
      return {
        status: 400,
        jsonBody: {
          success: false,
          message: 'Refresh token is required',
        },
      };
    }

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

    // Refresh the token
    const refreshResponse = await authService.refreshToken(refreshToken);

    // Return the refresh response
    return {
      status: 200,
      jsonBody: {
        success: true,
        data: refreshResponse,
        message: 'Token refreshed successfully',
      },
    };
  } catch (error) {
    // Determine the appropriate error message
    let errorMessage = 'Token refresh failed';
    let statusCode = 401;

    if (error instanceof Error) {
      if (error.message.includes('Invalid refresh token')) {
        errorMessage = 'Invalid or expired refresh token';
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
 * HTTP route configuration for the Azure Function to refresh an authentication token.
 */
app.http('refreshToken', {
  methods: ['POST'],
  route: 'auth/refresh',
  authLevel: 'function',
  handler,
});
