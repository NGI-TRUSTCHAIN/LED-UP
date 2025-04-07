// import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

// import { DataRegistryABI } from '../../abi/data-registry.abi';
// import { DATA_REGISTRY_CONTRACT_ADDRESS } from '../../constants';
// import { stringifyBigInt } from '../../helpers/bigIntStringify';
// import { DataRegistryService } from '../../services/contracts/DataRegistryService';

// /**
//  * Azure Function that retrieves information about a producer's record.
//  */

// /**
//  * Handler for the HTTP function that retrieves information about a producer's record.
//  *
//  * This function processes a GET request to retrieve information about a producer's record.
//  * It retrieves the producer address from the query parameters and calls the contract to get the record info.
//  * On successful retrieval, it returns a 200 OK response containing the record information.
//  * In case of an error, it returns a 500 Internal Server Error response with an error message.
//  *
//  * @param {HttpRequest} request - The HTTP request object containing information about the incoming request.
//  * @param {InvocationContext} context - The context object providing information about the execution of the function.
//  * @returns {Promise<HttpResponseInit>} A promise that resolves to an HttpResponseInit object containing the response data.
//  *
//  * @throws Will throw an error if retrieving the producer record info fails.
//  *
//  * @example
//  * Example Request:
//  * GET /producer/record/info?producer=0xProducerAddress
//  *
//  * Example Response:
//  * Status: 200
//  * Body:
//  * {
//  *   "success": true,
//  *   "data": {
//  *     "ownerDid": "did:ledup:producer:123456789",
//  *     "producer": "0xProducerAddress",
//  *     "status": 1,
//  *     "consent": 1,
//  *     "nonce": 1,
//  *     "isActive": true,
//  *     "updatedAt": 1623456789
//  *   }
//  * }
//  *
//  * Error Responses:
//  * Status: 500
//  * Body:
//  * {
//  *   "success": false,
//  *   "error": "Detailed error message",
//  *   "message": "Failed to retrieve producer record info"
//  * }
//  */
// const handler = async (
//   request: HttpRequest,
//   context: InvocationContext
// ): Promise<HttpResponseInit> => {
//   context.log(`Http function processed request for url "${request.url}"`);

//   try {
//     const producer = (await request.query.get('producer')) as string;

//     // Initialize the DataRegistryService
//     const dataRegistryService = new DataRegistryService(
//       DATA_REGISTRY_CONTRACT_ADDRESS,
//       DataRegistryABI
//     );

//     // Get the producer record info
//     const recordInfo = await dataRegistryService.getProducerRecordInfo(producer);

//     return {
//       status: 200,
//       jsonBody: {
//         success: true,
//         data: stringifyBigInt(recordInfo),
//       },
//     };
//   } catch (error) {
//     context.error(`Error fetching data: ${error}`);
//     return {
//       status: 500,
//       jsonBody: {
//         success: false,
//         error: error,
//         message: 'Failed to retrieve producer record info',
//       },
//     };
//   }
// };

// /**
//  * HTTP route configuration for the Azure Function to retrieve a producer's record info.
//  */
// app.http('getProducerRecordInfo', {
//   methods: ['GET'], // Specifies that this function responds to GET requests
//   route: 'data-registry/producer/record-info', // Defines the route for the function
//   authLevel: 'anonymous', // Sets the authentication level for the function
//   handler, // Sets the handler function to process requests
// });
