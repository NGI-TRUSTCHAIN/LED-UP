// /**
//  * Routes for credential-related endpoints.
//  */
// import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

// import { CredentialController } from '../controllers/credential-controller';
// import { authMiddleware } from '../helpers/auth-middleware';
// import { UserRole } from '../types/auth-types';

// // Initialize the credential controller
// const credentialController = new CredentialController();

// /**
//  * Handler for the HTTP function that gets all credentials.
//  *
//  * @param {HttpRequest} request - The HTTP request object.
//  * @param {InvocationContext} context - The context object providing information about the execution of the function.
//  * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
//  */
// export async function getCredentialsHandler(
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
//     // Get query parameters
//     const query: Record<string, any> = {};
//     for (const [key, value] of request.query.entries()) {
//       query[key] = value;
//     }

//     // Get credentials
//     const credentials = credentialController.filterCredentials(query);

//     return {
//       status: 200,
//       jsonBody: {
//         credentials,
//       },
//     };
//   } catch (error: any) {
//     context.error(`Error getting credentials: ${error}`);

//     return {
//       status: 400,
//       jsonBody: {
//         error: 'Bad Request',
//         message: error.message || 'Failed to get credentials',
//       },
//     };
//   }
// }

// /**
//  * Handler for the HTTP function that gets a credential by ID.
//  *
//  * @param {HttpRequest} request - The HTTP request object.
//  * @param {InvocationContext} context - The context object providing information about the execution of the function.
//  * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
//  */
// export async function getCredentialHandler(
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
//     // Get credential ID from path parameter
//     const id = request.params.id;
//     if (!id) {
//       return {
//         status: 400,
//         jsonBody: {
//           error: 'Bad Request',
//           message: 'Credential ID is required',
//         },
//       };
//     }

//     // Get credential
//     const credential = await credentialController.getCredential(id);

//     return {
//       status: 200,
//       jsonBody: {
//         credential,
//       },
//     };
//   } catch (error: any) {
//     context.error(`Error getting credential: ${error}`);

//     return {
//       status: 404,
//       jsonBody: {
//         error: 'Not Found',
//         message: error.message || 'Credential not found',
//       },
//     };
//   }
// }

// /**
//  * Handler for the HTTP function that revokes a credential.
//  *
//  * @param {HttpRequest} request - The HTTP request object.
//  * @param {InvocationContext} context - The context object providing information about the execution of the function.
//  * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
//  */
// export async function revokeCredentialHandler(
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
//     // Get credential ID from path parameter
//     const id = request.params.id;
//     if (!id) {
//       return {
//         status: 400,
//         jsonBody: {
//           error: 'Bad Request',
//           message: 'Credential ID is required',
//         },
//       };
//     }

//     // Revoke credential
//     const revoked = await credentialController.revokeCredential(id);

//     return {
//       status: 200,
//       jsonBody: {
//         revoked,
//       },
//     };
//   } catch (error: any) {
//     context.error(`Error revoking credential: ${error}`);

//     return {
//       status: 404,
//       jsonBody: {
//         error: 'Not Found',
//         message: error.message || 'Credential not found',
//       },
//     };
//   }
// }

// // Register the routes
// app.http('getCredentials', {
//   methods: ['GET'],
//   route: 'credentials',
//   authLevel: 'anonymous',
//   handler: getCredentialsHandler,
// });

// app.http('getCredential', {
//   methods: ['GET'],
//   route: 'credentials/{id}',
//   authLevel: 'anonymous',
//   handler: getCredentialHandler,
// });

// app.http('revokeCredential', {
//   methods: ['DELETE'],
//   route: 'credentials/{id}',
//   authLevel: 'anonymous',
//   handler: revokeCredentialHandler,
// });
