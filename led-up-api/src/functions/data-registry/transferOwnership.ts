// import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
// import { Contract } from 'ethers';

// import { DataRegistryABI } from '../../abi/data-registry.abi';
// import { DATA_REGISTRY_CONTRACT_ADDRESS } from '../../constants';
// import { signer } from '../../helpers/get-signer';
// import { DataRegistryService } from '../../services/contracts/DataRegistryService';

// /**
//  * Azure Function that transfers ownership of the contract to a new owner.
//  */

// /**
//  * Handler for the HTTP function that transfers ownership of the contract to a new owner.
//  *
//  * This function processes a POST request to transfer ownership of the contract to a new owner.
//  * It retrieves the new owner address from the request body and calls the contract to transfer ownership.
//  * On successful execution, it returns a 200 OK response with a JSON object containing
//  * the transaction receipt. In case of an error, it returns a 500 Internal Server Error response.
//  *
//  * @param {HttpRequest} request - The HTTP request object containing the new owner address.
//  * @param {InvocationContext} context - The context object providing information about the execution of the function.
//  * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
//  *
//  * @throws Will throw an error if transferring ownership fails.
//  *
//  * @example
//  * Example Request:
//  * POST /contract/ownership/transfer
//  * Body:
//  * {
//  *   "newOwner": "0xNewOwnerAddress"
//  * }
//  *
//  * Example Response:
//  * Status: 200
//  * Body:
//  * {
//  *   "success": true,
//  *   "data": {
//  *     "receipt": {
//  *       "transactionHash": "0x...",
//  *       "blockNumber": 12345,
//  *       "events": [...]
//  *     },
//  *     "previousOwner": "0xCurrentOwnerAddress",
//  *     "newOwner": "0xNewOwnerAddress"
//  *   }
//  * }
//  *
//  * Error Responses:
//  * Status: 500
//  * Body:
//  * {
//  *   "success": false,
//  *   "error": "Detailed error message",
//  *   "message": "Failed to transfer ownership"
//  * }
//  */
// const handler = async (
//   request: HttpRequest,
//   context: InvocationContext
// ): Promise<HttpResponseInit> => {
//   context.log(`Http function processed request for url "${request.url}"`);

//   try {
//     const { newOwner } = (await request.json()) as {
//       newOwner: string;
//     };

//     if (!newOwner) {
//       return {
//         status: 400,
//         jsonBody: {
//           success: false,
//           error: 'Missing required parameter',
//           message: 'newOwner parameter is required',
//         },
//       };
//     }

//     // Initialize the DataRegistryService
//     const dataRegistryService = new DataRegistryService(
//       DATA_REGISTRY_CONTRACT_ADDRESS,
//       DataRegistryABI
//     );

//     // Get the current owner before transferring
//     const contract = new Contract(DATA_REGISTRY_CONTRACT_ADDRESS, DataRegistryABI, signer);
//     const previousOwner = await contract.owner();

//     // Transfer ownership
//     const receipt = await dataRegistryService.transferOwnership(newOwner);

//     return {
//       status: 200,
//       jsonBody: {
//         success: true,
//         data: {
//           receipt,
//           previousOwner,
//           newOwner,
//         },
//       },
//     };
//   } catch (error) {
//     context.error(`Error transferring ownership: ${error}`);
//     return {
//       status: 500,
//       jsonBody: {
//         success: false,
//         error: error,
//         message: 'Failed to transfer ownership',
//       },
//     };
//   }
// };

// /**
//  * HTTP route configuration for the Azure Function to transfer ownership.
//  */
// app.http('transferOwnership', {
//   methods: ['POST'], // Specifies that this function responds to POST requests
//   route: 'data-registry/transfer-ownership', // Defines the route for the function
//   authLevel: 'anonymous', // Sets the authentication level for the function
//   handler, // Sets the handler function to process requests
// });
