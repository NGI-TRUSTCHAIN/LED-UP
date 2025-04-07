/**
 * Azure Function to verify an authentication token.
 */
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { getContractConfig } from '../../config/contract-config';
import {
  AuthService,
  DidAuthService,
  DidRegistryService,
  DidVerifierService,
} from '../../services';
import { VerifyRequest } from '../../types/auth-types';

/**
 * Handler for the HTTP function that verifies an authentication token.
 *
 * This function processes a POST request to verify an authentication token.
 * It returns a 200 OK response with the token payload if the token is valid.
 * In case of an error, it returns a 401 Unauthorized response.
 *
 * @param {HttpRequest} request - The HTTP request object.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 */
export async function handler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('Processing verify token request');

  try {
    // Parse the request body
    const requestBody = (await request.json()) as VerifyRequest;
    const { token } = requestBody;

    // Validate required fields
    if (!token) {
      return {
        status: 400,
        jsonBody: {
          success: false,
          message: 'Token is required',
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

    // Verify the token
    const payload = authService.verifyToken(token);

    if (!payload) {
      return {
        status: 401,
        jsonBody: {
          success: false,
          message: 'Invalid or expired token',
        },
      };
    }

    // Return the token payload
    return {
      status: 200,
      jsonBody: {
        success: true,
        data: payload,
        message: 'Token is valid',
      },
    };
  } catch (error) {
    // Log the error
    context.error({
      message: 'Error verifying token',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return {
      status: 401,
      jsonBody: {
        success: false,
        message: error instanceof Error ? error.message : 'Invalid token',
      },
    };
  }
}

/**
 * HTTP route configuration for the Azure Function to verify an authentication token.
 */
app.http('verifyToken', {
  methods: ['POST'],
  route: 'auth/verify',
  authLevel: 'function',
  handler,
});
