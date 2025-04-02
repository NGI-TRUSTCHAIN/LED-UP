// /**
//  * Azure Function to verify a Verifiable Presentation.
//  */
// import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

// import { authMiddleware } from '../../helpers/auth-middleware';
// import { DidResolver } from '../../helpers/did-resolver';
// import { VerifiableCredential, VerificationResults } from '../../types/credential-types';

// // Initialize the DID resolver
// const didResolver = new DidResolver();

// /**
//  * Interface for a Verifiable Presentation
//  */
// interface VerifiablePresentation {
//   '@context': string[];
//   type: string[];
//   id?: string;
//   holder: string;
//   verifiableCredential: VerifiableCredential[];
//   proof: {
//     type: string;
//     created: string;
//     verificationMethod: string;
//     proofPurpose: string;
//     challenge?: string;
//     domain?: string;
//     jws: string;
//   };
// }

// /**
//  * Request to verify a Verifiable Presentation
//  */
// interface VerifyPresentationRequest {
//   presentation: VerifiablePresentation;
//   challenge?: string;
//   domain?: string;
// }

// /**
//  * Response from verifying a Verifiable Presentation
//  */
// interface VerifyPresentationResponse {
//   verified: boolean;
//   presentationResult: {
//     verified: boolean;
//     error?: string;
//   };
//   credentialResults: VerificationResults[];
// }

// /**
//  * Handler for the HTTP function that verifies a Verifiable Presentation.
//  *
//  * This function processes a POST request to verify a Verifiable Presentation.
//  * It returns a 200 OK response with the verification result.
//  * In case of an error, it returns a 400 Bad Request response.
//  *
//  * @param {HttpRequest} request - The HTTP request object.
//  * @param {InvocationContext} context - The context object providing information about the execution of the function.
//  * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
//  *
//  * @example
//  * Example Request:
//  * POST /presentation/verify
//  * Body:
//  * {
//  *   "presentation": {
//  *     "@context": [
//  *       "https://www.w3.org/2018/credentials/v1"
//  *     ],
//  *     "type": ["VerifiablePresentation"],
//  *     "holder": "did:ethr:0x9876543210abcdef1234567890abcdef12345678",
//  *     "verifiableCredential": [
//  *       {
//  *         "@context": [
//  *           "https://www.w3.org/2018/credentials/v1",
//  *           "https://www.w3.org/2018/credentials/examples/v1"
//  *         ],
//  *         "id": "http://example.edu/credentials/1872",
//  *         "type": ["VerifiableCredential", "AlumniCredential"],
//  *         "issuer": "did:ethr:0x1234567890abcdef1234567890abcdef12345678",
//  *         "issuanceDate": "2010-01-01T19:23:24Z",
//  *         "credentialSubject": {
//  *           "id": "did:ethr:0x9876543210abcdef1234567890abcdef12345678",
//  *           "alumniOf": "Example University"
//  *         },
//  *         "proof": {
//  *           "type": "EcdsaSecp256k1Signature2019",
//  *           "created": "2017-06-18T21:19:10Z",
//  *           "proofPurpose": "assertionMethod",
//  *           "verificationMethod": "did:ethr:0x1234567890abcdef1234567890abcdef12345678#keys-1",
//  *           "jws": "eyJhbGciOiJFUzI1NksiLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdfQ..MEQCIB_h7G9QPPHyGHpkzz-VHUFq5xAYu-XHGLmXY9v1_4OEAiB0X-CrFhUWukvv8f-pY4F2AWALUYkObZ8Pvb0rKg3LYQ"
//  *         }
//  *       }
//  *     ],
//  *     "proof": {
//  *       "type": "EcdsaSecp256k1Signature2019",
//  *       "created": "2018-09-14T21:19:10Z",
//  *       "verificationMethod": "did:ethr:0x9876543210abcdef1234567890abcdef12345678#keys-1",
//  *       "proofPurpose": "authentication",
//  *       "challenge": "1f44d55f-f161-4938-a659-f8026467f126",
//  *       "domain": "example.com",
//  *       "jws": "eyJhbGciOiJFUzI1NksiLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdfQ..MEYCIQD8wQeB8KcXMzSqnQGdM7VXN5RAtrTiEO9g5yUUQl1ZvwIhALlK7jXVS2entVXd1KsZOZ5tUAPuF0jGCuRSQRiJJvT0"
//  *     }
//  *   },
//  *   "challenge": "1f44d55f-f161-4938-a659-f8026467f126",
//  *   "domain": "example.com"
//  * }
//  *
//  * Example Response:
//  * Status: 200
//  * Body:
//  * {
//  *   "verified": true,
//  *   "presentationResult": {
//  *     "verified": true
//  *   },
//  *   "credentialResults": [
//  *     {
//  *       "verified": true,
//  *       "results": [
//  *         {
//  *           "proof": {
//  *             "type": "EcdsaSecp256k1Signature2019",
//  *             "created": "2017-06-18T21:19:10Z",
//  *             "proofPurpose": "assertionMethod",
//  *             "verificationMethod": "did:ethr:0x1234567890abcdef1234567890abcdef12345678#keys-1",
//  *             "jws": "eyJhbGciOiJFUzI1NksiLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdfQ..MEQCIB_h7G9QPPHyGHpkzz-VHUFq5xAYu-XHGLmXY9v1_4OEAiB0X-CrFhUWukvv8f-pY4F2AWALUYkObZ8Pvb0rKg3LYQ"
//  *           },
//  *           "verified": true,
//  *           "purposeResult": {
//  *             "valid": true
//  *           }
//  *         }
//  *       ]
//  *     }
//  *   ]
//  * }
//  *
//  * Error Responses:
//  * Status: 400
//  * Body:
//  * {
//  *   "error": "Bad Request",
//  *   "message": "Presentation is required"
//  * }
//  */
// export async function handler(
//   request: HttpRequest,
//   context: InvocationContext
// ): Promise<HttpResponseInit> {
//   context.log(`Http function processed request for url "${request.url}"`);

//   // Check authentication
//   const authError = authMiddleware(request);
//   if (authError) {
//     return authError;
//   }

//   try {
//     // Parse the request body
//     const body = (await request.json()) as VerifyPresentationRequest;

//     // Validate the request
//     if (!body.presentation) {
//       return {
//         status: 400,
//         jsonBody: {
//           error: 'Bad Request',
//           message: 'Presentation is required',
//         },
//       };
//     }

//     // Validate the presentation structure
//     const presentation = body.presentation;
//     if (
//       !presentation['@context'] ||
//       !presentation.type ||
//       !presentation.holder ||
//       !presentation.verifiableCredential ||
//       !presentation.proof
//     ) {
//       return {
//         status: 400,
//         jsonBody: {
//           error: 'Bad Request',
//           message: 'Invalid presentation format',
//         },
//       };
//     }

//     // Verify the presentation signature
//     // In a real implementation, we would verify the JWS signature here
//     // For this example, we'll simulate a successful verification
//     const presentationVerified = true;

//     // Check challenge and domain if provided
//     if (body.challenge && body.challenge !== presentation.proof.challenge) {
//       return {
//         status: 400,
//         jsonBody: {
//           error: 'Bad Request',
//           message: 'Challenge mismatch',
//         },
//       };
//     }

//     if (body.domain && body.domain !== presentation.proof.domain) {
//       return {
//         status: 400,
//         jsonBody: {
//           error: 'Bad Request',
//           message: 'Domain mismatch',
//         },
//       };
//     }

//     // Verify each credential in the presentation
//     const credentialResults: VerificationResults[] = [];
//     for (const credential of presentation.verifiableCredential) {
//       const verificationResult = await didResolver.verifyCredential(credential);
//       credentialResults.push(verificationResult);
//     }

//     // Check if all credentials are verified
//     const allCredentialsVerified = credentialResults.every(result => result.verified);

//     // Return the verification result
//     const response: VerifyPresentationResponse = {
//       verified: presentationVerified && allCredentialsVerified,
//       presentationResult: {
//         verified: presentationVerified,
//       },
//       credentialResults,
//     };

//     return {
//       status: 200,
//       jsonBody: response,
//     };
//   } catch (error: any) {
//     context.error(`Error verifying presentation: ${error}`);

//     return {
//       status: 400,
//       jsonBody: {
//         error: 'Bad Request',
//         message: error.message || 'Failed to verify presentation',
//       },
//     };
//   }
// }

// /**
//  * HTTP route configuration for the Azure Function to verify a Verifiable Presentation.
//  */
// app.http('verifyPresentation', {
//   methods: ['POST'],
//   route: 'presentation/verify',
//   authLevel: 'anonymous',
//   handler,
// });
