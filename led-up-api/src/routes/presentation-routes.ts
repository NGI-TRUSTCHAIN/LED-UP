// /**
//  * Routes for presentation-related endpoints.
//  */
// import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

// import { CredentialController } from '../controllers/credential-controller';
// import { PresentationController, VerifiablePresentation } from '../controllers/presentation-controller';
// import { authMiddleware } from '../helpers/auth-middleware';
// import { UserRole } from '../types/auth-types';

// // Initialize the controllers
// const presentationController = new PresentationController();
// const credentialController = new CredentialController();

// /**
//  * Interface for create presentation request
//  */
// interface CreatePresentationRequest {
//   holderDid: string;
//   credentialIds: string[];
//   challenge?: string;
//   domain?: string;
// }

// /**
//  * Interface for verify presentation request
//  */
// interface VerifyPresentationRequest {
//   presentation: VerifiablePresentation;
//   challenge?: string;
//   domain?: string;
// }

// /**
//  * Handler for the HTTP function that creates a Verifiable Presentation.
//  *
//  * @param {HttpRequest} request - The HTTP request object.
//  * @param {InvocationContext} context - The context object providing information about the execution of the function.
//  * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
//  */
// export async function createPresentationHandler(
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
//     const body = (await request.json()) as CreatePresentationRequest;

//     // Validate the request
//     if (!body.holderDid) {
//       return {
//         status: 400,
//         jsonBody: {
//           error: 'Bad Request',
//           message: 'Holder DID is required',
//         },
//       };
//     }

//     if (!body.credentialIds || !Array.isArray(body.credentialIds) || body.credentialIds.length === 0) {
//       return {
//         status: 400,
//         jsonBody: {
//           error: 'Bad Request',
//           message: 'Credential IDs are required and must be an array',
//         },
//       };
//     }

//     // Get the credentials
//     const credentials = [];
//     for (const id of body.credentialIds) {
//       try {
//         const credential = await credentialController.getCredential(id);
//         credentials.push(credential);
//       } catch (error) {
//         return {
//           status: 404,
//           jsonBody: {
//             error: 'Not Found',
//             message: `Credential not found: ${id}`,
//           },
//         };
//       }
//     }

//     // Create the presentation
//     const presentation = await presentationController.createPresentation(
//       body.holderDid,
//       credentials,
//       body.challenge,
//       body.domain
//     );

//     return {
//       status: 201,
//       jsonBody: {
//         presentation,
//       },
//     };
//   } catch (error: any) {
//     context.error(`Error creating presentation: ${error}`);

//     return {
//       status: 400,
//       jsonBody: {
//         error: 'Bad Request',
//         message: error.message || 'Failed to create presentation',
//       },
//     };
//   }
// }

// /**
//  * Handler for the HTTP function that verifies a Verifiable Presentation.
//  *
//  * @param {HttpRequest} request - The HTTP request object.
//  * @param {InvocationContext} context - The context object providing information about the execution of the function.
//  * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
//  */
// export async function verifyPresentationHandler(
//   request: HttpRequest,
//   context: InvocationContext
// ): Promise<HttpResponseInit> {
//   context.log(`Http function processed request for url "${request.url}"`);

//   // Check authentication
//   const authError = authMiddleware(request, [UserRole.ADMIN, UserRole.VERIFIER]);
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

//     // Verify the presentation
//     const result = await presentationController.verifyPresentation(body.presentation, body.challenge, body.domain);

//     return {
//       status: 200,
//       jsonBody: result,
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

// // Register the routes
// app.http('createPresentation', {
//   methods: ['POST'],
//   route: 'presentations',
//   authLevel: 'anonymous',
//   handler: createPresentationHandler,
// });

// app.http('verifyPresentation', {
//   methods: ['POST'],
//   route: 'presentations/verify',
//   authLevel: 'anonymous',
//   handler: verifyPresentationHandler,
// });
