// /**
//  * Azure Function to verify a Verifiable Credential.
//  */
// import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

// import { authMiddleware } from '../../helpers/auth-middleware';
// import { DidResolver } from '../../helpers/did-resolver';
// import { VerifyCredentialRequest, VerifyCredentialResponse } from '../../types/credential-types';

// // Initialize the DID resolver
// const didResolver = new DidResolver();

// /**
//  * Handler for the HTTP function that verifies a Verifiable Credential.
//  *
//  * This function processes a POST request to verify a Verifiable Credential.
//  * It returns a 200 OK response with the verification result.
//  * In case of an error, it returns a 400 Bad Request response.
//  *
//  * @param {HttpRequest} request - The HTTP request object.
//  * @param {InvocationContext} context - The context object providing information about the execution of the function.
//  * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
//  *
//  * @example
//  * Example Request:
//  * POST /credential/verify
//  * Body:
//  * {
//  *   "credential": {
//  *     "@context": [
//  *       "https://www.w3.org/2018/credentials/v1",
//  *       "https://www.w3.org/2018/credentials/examples/v1"
//  *     ],
//  *     "id": "http://example.edu/credentials/1872",
//  *     "type": ["VerifiableCredential", "AlumniCredential"],
//  *     "issuer": "did:ethr:0x1234567890abcdef1234567890abcdef12345678",
//  *     "issuanceDate": "2010-01-01T19:23:24Z",
//  *     "credentialSubject": {
//  *       "id": "did:ethr:0x9876543210abcdef1234567890abcdef12345678",
//  *       "alumniOf": "Example University"
//  *     },
//  *     "proof": {
//  *       "type": "EcdsaSecp256k1Signature2019",
//  *       "created": "2017-06-18T21:19:10Z",
//  *       "proofPurpose": "assertionMethod",
//  *       "verificationMethod": "did:ethr:0x1234567890abcdef1234567890abcdef12345678#keys-1",
//  *       "jws": "eyJhbGciOiJFUzI1NksiLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdfQ..MEQCIB_h7G9QPPHyGHpkzz-VHUFq5xAYu-XHGLmXY9v1_4OEAiB0X-CrFhUWukvv8f-pY4F2AWALUYkObZ8Pvb0rKg3LYQ"
//  *     }
//  *   }
//  * }
//  *
//  * Example Response:
//  * Status: 200
//  * Body:
//  * {
//  *   "verified": true,
//  *   "results": [
//  *     {
//  *       "proof": {
//  *         "type": "EcdsaSecp256k1Signature2019",
//  *         "created": "2017-06-18T21:19:10Z",
//  *         "proofPurpose": "assertionMethod",
//  *         "verificationMethod": "did:ethr:0x1234567890abcdef1234567890abcdef12345678#keys-1",
//  *         "jws": "eyJhbGciOiJFUzI1NksiLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdfQ..MEQCIB_h7G9QPPHyGHpkzz-VHUFq5xAYu-XHGLmXY9v1_4OEAiB0X-CrFhUWukvv8f-pY4F2AWALUYkObZ8Pvb0rKg3LYQ"
//  *       },
//  *       "verified": true,
//  *       "purposeResult": {
//  *         "valid": true
//  *       }
//  *     }
//  *   ]
//  * }
//  *
//  * Error Responses:
//  * Status: 400
//  * Body:
//  * {
//  *   "error": "Bad Request",
//  *   "message": "Credential is required"
//  * }
//  */
// export async function handler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
//   context.log(`Http function processed request for url "${request.url}"`);

//   // Check authentication
//   const authError = authMiddleware(request);
//   if (authError) {
//     return authError;
//   }

//   try {
//     // Parse the request body
//     const body = (await request.json()) as VerifyCredentialRequest;

//     // Validate the request
//     if (!body.credential) {
//       return {
//         status: 400,
//         jsonBody: {
//           error: 'Bad Request',
//           message: 'Credential is required',
//         },
//       };
//     }

//     // Verify the credential
//     const verificationResult = await didResolver.verifyCredential(body.credential);

//     // Return the verification result
//     const response: VerifyCredentialResponse = {
//       verified: verificationResult.verified,
//       results: verificationResult.results,
//     };

//     return {
//       status: 200,
//       jsonBody: response,
//     };
//   } catch (error: any) {
//     context.error(`Error verifying credential: ${error}`);

//     return {
//       status: 400,
//       jsonBody: {
//         error: 'Bad Request',
//         message: error.message || 'Failed to verify credential',
//       },
//     };
//   }
// }

// /**
//  * HTTP route configuration for the Azure Function to verify a Verifiable Credential.
//  */
// app.http('verifyCredential', {
//   methods: ['POST'],
//   route: 'credential/verify',
//   authLevel: 'anonymous',
//   handler,
// });
