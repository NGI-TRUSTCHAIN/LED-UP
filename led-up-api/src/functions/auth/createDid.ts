/**
 * Azure Function to create a DID.
 */
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

// Remove the unused import
// import { authMiddleware } from '../../helpers/auth-middleware';
import { getContractAbi, getContractAddress } from '../../helpers/contract-config';
import { DidResolverService } from '../../services/auth';
import { DidRegistryService } from '../../services/contracts';
import { CreateDidRequest, CreateDidResponse } from '../../types/did-types';

/**
 * Handler for the HTTP function that creates a DID.
 *
 * This function processes a POST request to create a DID for an Ethereum address.
 * It returns a 201 Created response with the DID and DID document.
 * In case of an error, it returns a 400 Bad Request response.
 *
 * @param {HttpRequest} request - The HTTP request object.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @example
 * Example Request:
 * POST /did/create
 * Body:
 * {
 *   "address": "0x1234567890abcdef1234567890abcdef12345678"
 * }
 *
 * Example Response:
 * Status: 201
 * Body:
 * {
 *   "did": "did:ethr:0x1234567890abcdef1234567890abcdef12345678",
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
 *   "message": "Address is required"
 * }
 */
export async function handler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    // Parse the request body
    const body = (await request.json()) as CreateDidRequest;

    // Validate the request
    if (!body.address) {
      return {
        status: 400,
        jsonBody: {
          success: false,
          message: 'Address is required',
        },
      };
    }

    // Normalize the address
    const normalizedAddress = body.address.toLowerCase();

    // Initialize the DidRegistryService
    const didRegistryService = new DidRegistryService(
      getContractAddress('DID_REGISTRY'),
      getContractAbi('DID_REGISTRY')
    );

    // const didAccessControlService = new DidAccessControlService(
    //   getContractAddress('DID_ACCESS_CONTROL'),
    //   getContractAbi('DID_ACCESS_CONTROL')
    // );

    // Initialize the DidResolverService
    const didResolverService = new DidResolverService(didRegistryService, undefined, context);

    // Check if a DID already exists for this address
    try {
      const existingDid = await didRegistryService.getDidForAddress(normalizedAddress);

      if (existingDid) {
        return {
          status: 200,
          jsonBody: {
            success: true,
            data: {
              did: existingDid.did,
              didDocument: existingDid,
            },
            message: 'DID already exists for this address',
          },
        };
      }
    } catch (error) {
      // If there's an error checking for an existing DID, continue with creation
      context.log(`Error checking for existing DID: ${error}`);
    }

    // Create a DID
    const did = didResolverService.createDid(normalizedAddress);

    // Create a DID document
    const didDocument = didResolverService.createDidDocument(did, normalizedAddress);

    // Convert the DID document to a string for blockchain storage
    const documentString = JSON.stringify(didDocument);

    // Extract the public key from the DID document
    const publicKey = await didResolverService.getKeyPair();

    // Register role for the DID

    try {
      // Register the DID on the blockchain
      const registrationResult = await didRegistryService.registerDid(
        did,
        documentString,
        publicKey
      );

      // const roleResult = await didAccessControlService.grantRole(
      //   normalizedAddress,
      //   body.role || 'PRODUCER'
      // );

      // if (!roleResult || !roleResult.success) {
      //   return {
      //     status: 500,
      //     jsonBody: {
      //       success: false,
      //       message: 'Failed to register role on the blockchain',
      //     },
      //   };
      // }

      if (!registrationResult || !registrationResult.success) {
        return {
          status: 500,
          jsonBody: {
            success: false,
            message: 'Failed to register DID on the blockchain',
          },
        };
      }

      // Return the DID and DID document
      const response: CreateDidResponse = {
        did,
        didDocument,
        role: body.role || 'producer',
      };

      return {
        status: 201,
        jsonBody: {
          success: true,
          data: response,
          message: 'DID created successfully',
        },
      };
    } catch (registrationError: any) {
      context.error(`Error registering DID: ${registrationError}`);

      return {
        status: 500,
        jsonBody: {
          success: false,
          message: registrationError.message || 'Failed to register DID on the blockchain',
        },
      };
    }
  } catch (error: any) {
    context.error(`Error creating DID: ${error}`);

    return {
      status: 400,
      jsonBody: {
        success: false,
        message: error.message || 'Failed to create DID',
      },
    };
  }
}

/**
 * HTTP route configuration for the Azure Function to create a DID.
 */
app.http('createDid', {
  methods: ['POST'],
  route: 'did/create',
  authLevel: 'anonymous',
  handler,
});
