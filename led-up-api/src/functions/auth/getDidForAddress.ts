/**
 * Azure Function to get the DID for an Ethereum address.
 */
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { getContractAbi, getContractAddress } from '../../helpers/contract-config';
import { AuthService } from '../../services/auth/AuthService';
import { DidAuthService } from '../../services/contracts';
import { DidRegistryService } from '../../services/contracts';
import { DidVerifierService } from '../../services/contracts/DidVerifierService';
import { GetDidRequest, GetDidResponse } from '../../types/auth-types';

/**
 * Handler for the HTTP function that gets the DID for an Ethereum address.
 *
 * This function processes a POST request to get the DID for an Ethereum address.
 * It returns a 200 OK response with the DID and its active status.
 * In case of an error, it returns a 400 Bad Request response.
 *
 * @param {HttpRequest} request - The HTTP request object.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @example
 * Example Request:
 * POST /auth/did
 * Body:
 * {
 *   "address": "0x1234567890abcdef1234567890abcdef12345678"
 * }
 *
 * Example Response:
 * Status: 200
 * Body:
 * {
 *   "did": "did:ethr:0x1234567890abcdef1234567890abcdef12345678",
 *   "active": true
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
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    // Parse the request body or query parameters
    let address: string = '';

    // Check if the request is GET or POST
    if (request.method === 'GET') {
      // Get address from query parameters
      address = request.query.get('address') || '';
    } else {
      // Parse the request body for POST
      const body = (await request.json()) as GetDidRequest;
      address = body.address || '';
    }

    // Validate the request
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

    // Get the DID for the address from the blockchain
    const didResult = await authService.getDidForAddress(normalizedAddress);

    if (!didResult || !didResult.did) {
      return {
        status: 404,
        jsonBody: {
          success: false,
          message: 'No DID found for this address',
        },
      };
    }

    // Check if the DID is active on the blockchain
    const active = await authService.isDidActive(didResult.did);

    // Return the DID and its active status
    const response: GetDidResponse = {
      did: didResult.did,
      active,
    };

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: response,
        message: 'DID found for address',
      },
    };
  } catch (error: any) {
    context.error(`Error getting DID for address: ${error}`);

    return {
      status: 500,
      jsonBody: {
        success: false,
        message: error.message || 'Failed to get DID for address',
      },
    };
  }
}

/**
 * HTTP route configuration for the Azure Function to get the DID for an Ethereum address.
 */
app.http('getDidForAddress', {
  methods: ['POST', 'GET'],
  route: 'auth/did',
  authLevel: 'anonymous',
  handler,
});
