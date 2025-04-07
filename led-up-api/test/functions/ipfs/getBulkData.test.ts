// interface Context {
//   log: {
//     error: (message: string, ...args: any[]) => void;
//     warn: (message: string, ...args: any[]) => void;
//     info: (message: string, ...args: any[]) => void;
//     verbose: (message: string, ...args: any[]) => void;
//   };
//   res?: any;
// }

// // Mock StatusCodes
// const StatusCodes = {
//   OK: 200,
//   BAD_REQUEST: 400,
//   INTERNAL_SERVER_ERROR: 500,
// };

// // Create a minimal mock for ts-mockito functionality
// const mock = <T>(type: any): T => ({}) as T;
// const instance = <T>(mock: T): T => mock;
// const when = (methodCall: any) => ({
//   thenResolve: (value: any) => {},
//   thenReject: (error: any) => {},
// });
// const verify = (methodCall: any, options?: any) => ({
//   once: () => {},
//   never: () => {},
// });
// const anything = () => ({});
// const reset = (mock: any) => {};

// // Mock utility for HttpResponses
// const createJsonResponse = (statusCode: number, body: any) => ({
//   status: statusCode,
//   headers: { 'Content-Type': 'application/json' },
//   body,
// });

// import { getBulkData } from '../../../src/functions/ipfs/getBulkData';
// import { IPFSService } from '../../../src/services/ipfs/IPFSService';

// describe('getBulkData Function', () => {
//   // Setup mocks
//   const mockContext = mock<Context>();
//   const mockIPFSService = mock(IPFSService);
//   let context: Context;

//   beforeEach(() => {
//     reset(mockContext);
//     reset(mockIPFSService);
//     context = instance(mockContext);
//     context.log = {
//       error: jest.fn(),
//       warn: jest.fn(),
//       info: jest.fn(),
//       verbose: jest.fn(),
//     } as any;
//   });

//   it('should return successful response with data for valid CIDs', async () => {
//     // Arrange
//     const req = {
//       body: {
//         cids: ['cid1', 'cid2', 'cid3'],
//       },
//     };

//     const mockResults = {
//       cid1: { data: { name: 'John' }, metadata: { cid: 'cid1' }, success: true },
//       cid2: { data: { name: 'Jane' }, metadata: { cid: 'cid2' }, success: true },
//       cid3: { data: { name: 'Bob' }, metadata: { cid: 'cid3' }, success: true },
//     };

//     // Mock the dependency using a simpler approach with Jest
//     jest.spyOn(IPFSService.prototype, 'getBulkIPFSData').mockResolvedValue(mockResults);

//     // Act
//     await getBulkData(context, req);

//     // Assert
//     expect(context.res).toEqual(
//       createJsonResponse(StatusCodes.OK, {
//         success: true,
//         results: [
//           { cid: 'cid1', data: { name: 'John' }, metadata: { cid: 'cid1' }, success: true },
//           { cid: 'cid2', data: { name: 'Jane' }, metadata: { cid: 'cid2' }, success: true },
//           { cid: 'cid3', data: { name: 'Bob' }, metadata: { cid: 'cid3' }, success: true },
//         ],
//       })
//     );
//   });

//   it('should handle partial failures gracefully', async () => {
//     // Arrange
//     const req = {
//       body: {
//         cids: ['cid1', 'cid2', 'cid3'],
//       },
//     };

//     const mockResults = {
//       cid1: { data: { name: 'John' }, metadata: { cid: 'cid1' }, success: true },
//       cid2: { error: 'Not found', success: false },
//       cid3: { data: { name: 'Bob' }, metadata: { cid: 'cid3' }, success: true },
//     };

//     jest.spyOn(IPFSService.prototype, 'getBulkIPFSData').mockResolvedValue(mockResults);

//     // Act
//     await getBulkData(context, req);

//     // Assert
//     expect(context.res).toEqual(
//       createJsonResponse(StatusCodes.OK, {
//         success: true,
//         results: [
//           { cid: 'cid1', data: { name: 'John' }, metadata: { cid: 'cid1' }, success: true },
//           { cid: 'cid2', error: 'Not found', success: false },
//           { cid: 'cid3', data: { name: 'Bob' }, metadata: { cid: 'cid3' }, success: true },
//         ],
//       })
//     );
//   });

//   it('should return error response when no CIDs are provided', async () => {
//     // Arrange
//     const req = {
//       body: {
//         cids: [],
//       },
//     };

//     // Act
//     await getBulkData(context, req);

//     // Assert
//     expect(context.res).toEqual(
//       createJsonResponse(StatusCodes.BAD_REQUEST, {
//         success: false,
//         message: 'No CIDs provided',
//       })
//     );
//   });

//   it('should return error response when cids parameter is missing', async () => {
//     // Arrange
//     const req = {
//       body: {},
//     };

//     // Act
//     await getBulkData(context, req);

//     // Assert
//     expect(context.res).toEqual(
//       createJsonResponse(StatusCodes.BAD_REQUEST, {
//         success: false,
//         message: 'Missing required parameter: cids',
//       })
//     );
//   });

//   it('should return error response when cids is not an array', async () => {
//     // Arrange
//     const req = {
//       body: {
//         cids: 'cid1',
//       },
//     };

//     // Act
//     await getBulkData(context, req);

//     // Assert
//     expect(context.res).toEqual(
//       createJsonResponse(StatusCodes.BAD_REQUEST, {
//         success: false,
//         message: 'cids must be an array',
//       })
//     );
//   });

//   it('should handle service errors gracefully', async () => {
//     // Arrange
//     const req = {
//       body: {
//         cids: ['cid1', 'cid2'],
//       },
//     };

//     jest
//       .spyOn(IPFSService.prototype, 'getBulkIPFSData')
//       .mockRejectedValue(new Error('Service error'));

//     // Act
//     await getBulkData(context, req);

//     // Assert
//     expect(context.res).toEqual(
//       createJsonResponse(StatusCodes.INTERNAL_SERVER_ERROR, {
//         success: false,
//         message: 'Error retrieving bulk IPFS data: Service error',
//       })
//     );
//   });
// });
