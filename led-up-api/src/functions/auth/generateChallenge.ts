/**
 * Azure Function to generate a challenge for authentication.
 */
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { getContractConfig } from '../../config/contract-config';
import {
  AuthService,
  DidAuthService,
  DidRegistryService,
  DidVerifierService,
} from '../../services';
import { ChallengeRequest } from '../../types/auth-types';

/**
 * Handler for the HTTP function that generates a challenge for authentication.
 *
 * This function processes a POST request to generate a challenge for authentication.
 * It returns a 200 OK response with the challenge and its expiration timestamp.
 * In case of an error, it returns a 400 Bad Request response.
 *
 * @param {HttpRequest} request - The HTTP request object.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @example
 * Example Request:
 * POST /auth/challenge
 * Body:
 * {
 *   "address": "0x1234567890abcdef1234567890abcdef12345678"
 * }
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "challenge": "Sign this message to authenticate with LED-UP: 1234567890abcdef1234567890abcdef",
 *   "expiresAt": 1612345678000
 * }
 *
 * Error Responses:
 * Status: 400
 * Body:
 * {
 *   "error": "Bad Request",
 *   "message": "Address is required"
 * }
 */
export async function handler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('Processing generate challenge request');

  try {
    // Parse the request body
    const { address } = (await request.json()) as ChallengeRequest;

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

    // Generate a challenge for the address
    const challenge = authService.generateAuthChallenge(normalizedAddress);

    // Return the challenge
    return {
      status: 200,
      jsonBody: {
        success: true,
        data: challenge,
        message: 'Challenge generated successfully',
      },
    };
  } catch (error) {
    // Log the error
    context.error({
      message: 'Error generating challenge',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return {
      status: 500,
      jsonBody: {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate challenge',
      },
    };
  }
}

/**
 * HTTP route configuration for the Azure Function to generate a challenge.
 */
app.http('generateChallenge', {
  methods: ['POST'],
  route: 'auth/challenge',
  authLevel: 'function',
  handler,
});
