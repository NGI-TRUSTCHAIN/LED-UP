/**
 * Azure Function to log out a user.
 */
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { getContractConfig } from '../../config/contract-config';
import {
  AuthService,
  DidAuthService,
  DidRegistryService,
  DidVerifierService,
} from '../../services';

interface LogoutRequest {
  address: string;
}

/**
 * Handler for the HTTP function that logs out a user.
 *
 * This function processes a POST request to log out a user by invalidating their session.
 * It adds the token to a blacklist to prevent reuse.
 * It returns a success message if the logout is successful.
 *
 * @param {HttpRequest} request - The HTTP request object.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @example
 * Example Request:
 * POST /auth/logout
 * Headers:
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * Body:
 * {
 *   "address": "0x1234567890abcdef1234567890abcdef12345678"
 * }
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "success": true,
 *   "message": "Logout successful"
 * }
 */
export async function handler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('Processing logout request');

  try {
    // Parse the request body
    const requestBody = (await request.json()) as LogoutRequest;
    const { address } = requestBody;

    // Validate required fields
    if (!address) {
      return {
        status: 400,
        jsonBody: {
          success: false,
          message: 'Address is required',
        },
      };
    }

    // Normalize the address
    const normalizedAddress = address.toLowerCase();

    // Get the authorization token from the request headers
    const authHeader = request.headers.get('authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;

    if (!token) {
      return {
        status: 401,
        jsonBody: {
          success: false,
          message: 'Authorization token is required',
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

    // Log out the user
    await authService.logout(normalizedAddress, token);

    // Return the logout response
    return {
      status: 200,
      jsonBody: {
        success: true,
        message: 'Logout successful',
      },
    };
  } catch (error) {
    // Determine the appropriate error message
    let errorMessage = 'Logout failed';
    let statusCode = 400;

    if (error instanceof Error) {
      errorMessage = error.message;
      if (error.message.includes('Invalid token')) {
        statusCode = 401;
      } else if (error.message.includes('Unauthorized')) {
        statusCode = 403;
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
 * HTTP route configuration for the Azure Function to log out a user.
 */
app.http('logout', {
  methods: ['POST'],
  route: 'auth/logout',
  authLevel: 'function',
  handler,
});
