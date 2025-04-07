/**
 * Azure Function to issue a Verifiable Credential.
 */
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { v4 as uuidv4 } from 'uuid';

import { authMiddleware } from '../../helpers/auth-middleware';
import { DidResolver } from '../../helpers/did-resolver';
import { UserRole } from '../../types/auth-types';
import { IssueCredentialRequest, IssueCredentialResponse, VerifiableCredential } from '../../types/credential-types';


// Initialize the DID resolver
const didResolver = new DidResolver();

/**
 * Handler for the HTTP function that issues a Verifiable Credential.
 *
 * This function processes a POST request to issue a Verifiable Credential.
 * It returns a 201 Created response with the newly issued Verifiable Credential.
 * In case of an error, it returns a 400 Bad Request response.
 *
 * @param {HttpRequest} request - The HTTP request object.
 * @param {InvocationContext} context - The context object providing information about the execution of the function.
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
 *
 * @example
 * Example Request:
 * POST /credential/issue
 * Body:
 * {
 *   "issuer": "did:ethr:0x1234567890abcdef1234567890abcdef12345678",
 *   "subject": "did:ethr:0x9876543210abcdef1234567890abcdef12345678",
 *   "type": ["VerifiableCredential", "AlumniCredential"],
 *   "claims": {
 *     "alumniOf": "Example University"
 *   },
 *   "expirationDate": "2025-01-01T19:23:24Z"
 * }
 *
 * Example Response:
 * Status: 201
 * Body:
 * {
 *   "credential": {
 *     "@context": [
 *       "https://www.w3.org/2018/credentials/v1",
 *       "https://www.w3.org/2018/credentials/examples/v1"
 *     ],
 *     "id": "urn:uuid:3978344f-8596-4c3a-a978-8fcaba3903c5",
 *     "type": ["VerifiableCredential", "AlumniCredential"],
 *     "issuer": "did:ethr:0x1234567890abcdef1234567890abcdef12345678",
 *     "issuanceDate": "2023-01-01T12:00:00Z",
 *     "expirationDate": "2025-01-01T19:23:24Z",
 *     "credentialSubject": {
 *       "id": "did:ethr:0x9876543210abcdef1234567890abcdef12345678",
 *       "alumniOf": "Example University"
 *     },
 *     "proof": {
 *       "type": "EcdsaSecp256k1Signature2019",
 *       "created": "2023-01-01T12:00:00Z",
 *       "proofPurpose": "assertionMethod",
 *       "verificationMethod": "did:ethr:0x1234567890abcdef1234567890abcdef12345678#keys-1",
 *       "jws": "eyJhbGciOiJFUzI1NksiLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdfQ..MEQCIB_h7G9QPPHyGHpkzz-VHUFq5xAYu-XHGLmXY9v1_4OEAiB0X-CrFhUWukvv8f-pY4F2AWALUYkObZ8Pvb0rKg3LYQ"
 *     }
 *   }
 * }
 *
 * Error Responses:
 * Status: 400
 * Body:
 * {
 *   "error": "Bad Request",
 *   "message": "Issuer is required"
 * }
 */
export async function handler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  // Check authentication
  const authError = authMiddleware(request, [UserRole.ADMIN, UserRole.VERIFIER]);
  if (authError) {
    return authError;
  }

  try {
    // Parse the request body
    const body = (await request.json()) as IssueCredentialRequest;

    // Validate the request
    if (!body.issuer) {
      return {
        status: 400,
        jsonBody: {
          error: 'Bad Request',
          message: 'Issuer is required',
        },
      };
    }

    if (!body.subject) {
      return {
        status: 400,
        jsonBody: {
          error: 'Bad Request',
          message: 'Subject is required',
        },
      };
    }

    if (!body.type || !Array.isArray(body.type) || body.type.length === 0) {
      return {
        status: 400,
        jsonBody: {
          error: 'Bad Request',
          message: 'Type is required and must be an array',
        },
      };
    }

    if (!body.claims || Object.keys(body.claims).length === 0) {
      return {
        status: 400,
        jsonBody: {
          error: 'Bad Request',
          message: 'Claims are required',
        },
      };
    }

    // Create a new Verifiable Credential
    const issuanceDate = new Date().toISOString();
    const id = `urn:uuid:${uuidv4()}`;

    // Resolve the issuer DID to get the verification method
    const issuerDidResolution = await didResolver.resolve(body.issuer);
    if (issuerDidResolution.didResolutionMetadata.error) {
      return {
        status: 400,
        jsonBody: {
          error: 'Bad Request',
          message: `Failed to resolve issuer DID: ${issuerDidResolution.didResolutionMetadata.error}`,
        },
      };
    }

    // Get the first verification method from the issuer's DID document
    const verificationMethod = issuerDidResolution.didDocument.verificationMethod?.[0];
    if (!verificationMethod) {
      return {
        status: 400,
        jsonBody: {
          error: 'Bad Request',
          message: 'Issuer DID does not have any verification methods',
        },
      };
    }

    // Create the credential
    const credential: VerifiableCredential = {
      '@context': ['https://www.w3.org/2018/credentials/v1', 'https://www.w3.org/2018/credentials/examples/v1'],
      id,
      type: ['VerifiableCredential', ...body.type],
      issuer: body.issuer,
      issuanceDate,
      credentialSubject: {
        id: body.subject,
        ...body.claims,
      },
      proof: {
        type: 'EcdsaSecp256k1Signature2019',
        created: issuanceDate,
        proofPurpose: 'assertionMethod',
        verificationMethod: verificationMethod.id,
        jws: 'eyJhbGciOiJFUzI1NksiLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdfQ..MEQCIB_h7G9QPPHyGHpkzz-VHUFq5xAYu-XHGLmXY9v1_4OEAiB0X-CrFhUWukvv8f-pY4F2AWALUYkObZ8Pvb0rKg3LYQ', // Simulated signature
      },
    };

    // Add expiration date if provided
    if (body.expirationDate) {
      credential.expirationDate = body.expirationDate;
    }

    // Return the credential
    const response: IssueCredentialResponse = {
      credential,
    };

    return {
      status: 201,
      jsonBody: response,
    };
  } catch (error: any) {
    context.error(`Error issuing credential: ${error}`);

    return {
      status: 400,
      jsonBody: {
        error: 'Bad Request',
        message: error.message || 'Failed to issue credential',
      },
    };
  }
}

/**
 * HTTP route configuration for the Azure Function to issue a Verifiable Credential.
 */
app.http('issueCredential', {
  methods: ['POST'],
  route: 'credential/issue',
  authLevel: 'anonymous',
  handler,
});
