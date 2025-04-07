// import { HttpRequest, InvocationContext } from '@azure/functions';

// import { IPFSService } from '../../../src/services/ipfs/IPFSService';
// import * as encrypt from '../../../src/utils/encrypt';

// // Define EncryptOutput interface to match what encrypt expects
// interface EncryptOutput {
//   encrypted: string; // Changed from boolean to string to match implementation
//   data: string;
//   iv: string;
//   tag: string;
// }

// // Helper to create a mock HTTP request
// function createMockRequest(options = {}): HttpRequest {
//   const defaultOptions = {
//     method: 'GET',
//     url: 'http://localhost/api/ipfs',
//     headers: new Map([['content-type', 'application/json']]),
//     query: new Map(),
//     params: {},
//     bodyUsed: false,
//     json: jest.fn().mockResolvedValue({}),
//     formData: jest.fn().mockResolvedValue(new Map()),
//     text: jest.fn().mockResolvedValue(''),
//   };

//   return {
//     ...defaultOptions,
//     ...options,
//   } as unknown as HttpRequest;
// }

// // Helper to create a mock context
// function createMockContext(): InvocationContext {
//   return {
//     functionName: 'ipfs',
//     invocationId: 'test-invocation-id',
//     log: jest.fn(),
//     error: jest.fn(),
//     executionContext: {
//       functionName: 'ipfs',
//       invocationId: 'test-invocation-id',
//       functionDirectory: '/functions/ipfs',
//       retryContext: null,
//     },
//     traceContext: {
//       traceparent: '',
//       tracestate: '',
//       attributes: {},
//     },
//   } as unknown as InvocationContext;
// }

// // Mock environment variables
// const originalEnv = process.env;

// describe('IPFSService', () => {
//   let ipfsService: IPFSService;

//   beforeEach(() => {
//     // Reset environment variables for each test
//     process.env = {
//       ...originalEnv,
//       PINATA_JWT: 'test-jwt',
//       ENCRYPTION_KEY: 'test-encryption-key',
//       IPFS_GATEWAY_URL: 'https://test-gateway.com/ipfs',
//       PINATA_API_URL: 'https://test-api.com',
//     };

//     // Reset all mocks
//     jest.clearAllMocks();

//     // Create a new instance of IPFSService
//     ipfsService = new IPFSService();
//   });

//   afterAll(() => {
//     // Restore original environment variables
//     process.env = originalEnv;
//   });

//   describe('fetchFromIPFS', () => {
//     it('should fetch data from IPFS successfully', async () => {
//       // Mock the fetch implementation
//       const mockData = { key: 'value' };
//       jest.spyOn(global, 'fetch').mockImplementation(() =>
//         Promise.resolve({
//           ok: true,
//           json: () => Promise.resolve(mockData),
//         } as Response)
//       );

//       const result = await ipfsService.fetchFromIPFS('test-cid');

//       expect(global.fetch).toHaveBeenCalledWith(
//         'https://test-gateway.com/ipfs/test-cid',
//         expect.any(Object)
//       );
//       expect(result).toEqual(mockData);
//     });

//     it('should throw an error if CID is not provided', async () => {
//       await expect(ipfsService.fetchFromIPFS('')).rejects.toThrow('CID is required');
//     });

//     it('should handle fetch errors with response', async () => {
//       jest.spyOn(global, 'fetch').mockImplementation(() =>
//         Promise.resolve({
//           ok: false,
//           status: 404,
//           statusText: 'Not Found',
//         } as Response)
//       );

//       await expect(ipfsService.fetchFromIPFS('test-cid')).rejects.toThrow(
//         'IPFS fetch error: 404 - Not Found'
//       );
//     });

//     it('should handle fetch errors with no response', async () => {
//       jest
//         .spyOn(global, 'fetch')
//         .mockImplementation(() => Promise.reject(new Error('Network error')));

//       await expect(ipfsService.fetchFromIPFS('test-cid')).rejects.toThrow(
//         'IPFS gateway did not respond'
//       );
//     });

//     it('should clean ipfs:// prefixes from CIDs', async () => {
//       jest.spyOn(global, 'fetch').mockImplementation(() =>
//         Promise.resolve({
//           ok: true,
//           json: () => Promise.resolve({}),
//         } as Response)
//       );

//       await ipfsService.fetchFromIPFS('ipfs://test-cid');

//       expect(global.fetch).toHaveBeenCalledWith(
//         'https://test-gateway.com/ipfs/test-cid',
//         expect.any(Object)
//       );
//     });
//   });

//   describe('uploadToIPFS', () => {
//     beforeEach(() => {
//       // Mock successful upload response
//       jest.spyOn(global, 'fetch').mockImplementation(() =>
//         Promise.resolve({
//           ok: true,
//           json: () =>
//             Promise.resolve({
//               IpfsHash: 'test-hash',
//               PinSize: 100,
//               Timestamp: '2023-01-01T00:00:00.000Z',
//             }),
//         } as Response)
//       );
//     });

//     it('should upload JSON data to IPFS', async () => {
//       const data = { test: 'data' };

//       const result = await ipfsService.uploadToIPFS(data);

//       expect(global.fetch).toHaveBeenCalled();
//       expect(result).toEqual({
//         cid: 'test-hash',
//         size: 100,
//         timestamp: '2023-01-01T00:00:00.000Z',
//         contentHash: expect.any(String),
//       });
//     });

//     it('should upload FormData to IPFS', async () => {
//       // Create a FormData object
//       const formData = new FormData();
//       formData.append('file', new Blob(['test data']), 'test.txt');

//       const result = await ipfsService.uploadToIPFS(formData);

//       expect(global.fetch).toHaveBeenCalled();
//       expect(result).toEqual({
//         cid: 'test-hash',
//         size: 100,
//         timestamp: '2023-01-01T00:00:00.000Z',
//         contentHash: expect.any(String),
//       });
//     });

//     it('should handle Pinata-specific format', async () => {
//       const data = {
//         pinataContent: { test: 'data' },
//         pinataMetadata: { name: 'test-name' },
//         pinataOptions: { cidVersion: 1 },
//       };

//       const result = await ipfsService.uploadToIPFS(data);

//       expect(global.fetch).toHaveBeenCalled();
//       expect(result).toEqual({
//         cid: 'test-hash',
//         size: 100,
//         timestamp: '2023-01-01T00:00:00.000Z',
//         contentHash: expect.any(String),
//       });
//     });

//     it('should throw an error if PINATA_JWT is not set', async () => {
//       process.env.PINATA_JWT = '';

//       await expect(ipfsService.uploadToIPFS({ test: 'data' })).rejects.toThrow(
//         'PINATA_JWT environment variable is not set'
//       );
//     });
//   });

//   describe('unpinFromIPFS', () => {
//     it('should unpin a single CID from IPFS', async () => {
//       jest.spyOn(global, 'fetch').mockImplementation(() =>
//         Promise.resolve({
//           ok: true,
//           json: () => Promise.resolve({ success: true }),
//         } as Response)
//       );

//       const result = await ipfsService.unpinFromIPFS(['test-cid']);

//       expect(global.fetch).toHaveBeenCalledWith(
//         'https://test-api.com/pinning/unpin/test-cid',
//         expect.objectContaining({
//           method: 'DELETE',
//           headers: expect.objectContaining({
//             Authorization: 'Bearer test-jwt',
//           }),
//         })
//       );
//       expect(result).toEqual({ success: true });
//     });

//     it('should unpin multiple CIDs from IPFS', async () => {
//       const mockFetch = jest.spyOn(global, 'fetch');
//       mockFetch
//         .mockImplementationOnce(() =>
//           Promise.resolve({
//             ok: true,
//             json: () => Promise.resolve({ success: true, cid: 'cid1' }),
//           } as Response)
//         )
//         .mockImplementationOnce(() =>
//           Promise.resolve({
//             ok: true,
//             json: () => Promise.resolve({ success: true, cid: 'cid2' }),
//           } as Response)
//         );

//       const result = await ipfsService.unpinFromIPFS(['cid1', 'cid2']);

//       expect(global.fetch).toHaveBeenCalledTimes(2);
//       expect(result).toEqual([
//         { success: true, cid: 'cid1' },
//         { success: true, cid: 'cid2' },
//       ]);
//     });

//     it('should throw an error if no CIDs are provided', async () => {
//       await expect(ipfsService.unpinFromIPFS([])).rejects.toThrow('At least one CID is required');
//     });
//   });

//   describe('encryptAndUpload', () => {
//     it('should encrypt and upload data to IPFS', async () => {
//       // Mock encrypt function with the correct return type
//       const mockEncryptedData: EncryptOutput = {
//         encrypted: 'true', // Changed from boolean to string
//         data: 'encrypted-data',
//         iv: 'test-iv',
//         tag: 'test-tag',
//       };
//       const encryptSpy = jest.spyOn(encrypt, 'encrypt').mockReturnValue(mockEncryptedData);

//       // Mock successful upload
//       const uploadSpy = jest.spyOn(ipfsService, 'uploadToIPFS').mockResolvedValue({
//         cid: 'test-hash',
//         size: 100,
//         timestamp: '2023-01-01T00:00:00.000Z',
//         contentHash: 'test-hash',
//       });

//       const data = { test: 'data' };
//       const result = await ipfsService.encryptAndUpload(data, 'test-name');

//       expect(encryptSpy).toHaveBeenCalled();
//       expect(uploadSpy).toHaveBeenCalled();
//       expect(result).toEqual({
//         cid: 'test-hash',
//         size: 100,
//         timestamp: '2023-01-01T00:00:00.000Z',
//         contentHash: 'test-hash',
//       });

//       // Restore original implementation
//       encryptSpy.mockRestore();
//       uploadSpy.mockRestore();
//     });

//     it('should use a default name if none is provided', async () => {
//       // Mock encrypt function with the correct return type
//       const mockEncryptedData: EncryptOutput = {
//         encrypted: 'true', // Changed from boolean to string
//         data: 'encrypted-data',
//         iv: 'test-iv',
//         tag: 'test-tag',
//       };
//       const encryptSpy = jest.spyOn(encrypt, 'encrypt').mockReturnValue(mockEncryptedData);

//       // Mock successful upload
//       const uploadSpy = jest.spyOn(ipfsService, 'uploadToIPFS').mockResolvedValue({
//         cid: 'test-hash',
//         size: 100,
//         timestamp: '2023-01-01T00:00:00.000Z',
//         contentHash: 'test-hash',
//       });

//       const data = { test: 'data' };
//       await ipfsService.encryptAndUpload(data, '');

//       // Check that a default name was used
//       const uploadCall = uploadSpy.mock.calls[0][0];
//       expect(uploadCall).toBeDefined();

//       // Restore original implementation
//       encryptSpy.mockRestore();
//       uploadSpy.mockRestore();
//     });
//   });

//   describe('fetchAndDecrypt', () => {
//     it('should fetch and decrypt data from IPFS', async () => {
//       // Mock fetchFromIPFS
//       const fetchSpy = jest.spyOn(ipfsService, 'fetchFromIPFS').mockResolvedValue({
//         encrypted: 'true', // Changed from boolean to string
//         data: 'encrypted-data',
//         iv: 'test-iv',
//         tag: 'test-tag',
//       });

//       // Mock decrypt function
//       const decryptSpy = jest.spyOn(encrypt, 'decrypt').mockReturnValue('{"test":"data"}');

//       const result = await ipfsService.fetchAndDecrypt('test-cid');

//       expect(fetchSpy).toHaveBeenCalledWith('test-cid');
//       expect(decryptSpy).toHaveBeenCalled();
//       expect(result).toEqual({
//         data: { test: 'data' },
//         raw: {
//           encrypted: 'true', // Changed from boolean to string
//           data: 'encrypted-data',
//           iv: 'test-iv',
//           tag: 'test-tag',
//         },
//       });

//       // Restore original implementation
//       fetchSpy.mockRestore();
//       decryptSpy.mockRestore();
//     });

//     it('should handle non-JSON decrypted data', async () => {
//       // Mock fetchFromIPFS
//       const fetchSpy = jest.spyOn(ipfsService, 'fetchFromIPFS').mockResolvedValue({
//         encrypted: 'true', // Changed from boolean to string
//         data: 'encrypted-data',
//         iv: 'test-iv',
//         tag: 'test-tag',
//       });

//       // Mock decrypt function to return non-JSON string
//       const decryptSpy = jest.spyOn(encrypt, 'decrypt').mockReturnValue('plain text data');

//       const result = await ipfsService.fetchAndDecrypt('test-cid');

//       expect(fetchSpy).toHaveBeenCalledWith('test-cid');
//       expect(decryptSpy).toHaveBeenCalled();
//       expect(result).toEqual({
//         data: 'plain text data',
//         raw: {
//           encrypted: 'true', // Changed from boolean to string
//           data: 'encrypted-data',
//           iv: 'test-iv',
//           tag: 'test-tag',
//         },
//       });

//       // Restore original implementation
//       fetchSpy.mockRestore();
//       decryptSpy.mockRestore();
//     });

//     it('should handle string data from IPFS', async () => {
//       // Mock fetchFromIPFS to return a string
//       const fetchSpy = jest.spyOn(ipfsService, 'fetchFromIPFS').mockResolvedValue('string-data');

//       // Mock decrypt function
//       const decryptSpy = jest.spyOn(encrypt, 'decrypt').mockReturnValue('{"test":"data"}');

//       const result = await ipfsService.fetchAndDecrypt('test-cid');

//       expect(fetchSpy).toHaveBeenCalledWith('test-cid');
//       expect(decryptSpy).toHaveBeenCalled();
//       expect(result).toEqual({
//         data: { test: 'data' },
//         raw: 'string-data',
//       });

//       // Restore original implementation
//       fetchSpy.mockRestore();
//       decryptSpy.mockRestore();
//     });
//   });

//   // Azure Functions handler tests
//   describe('HTTP request handlers', () => {
//     describe('handleGetIPFSData', () => {
//       it('should handle GET requests with query parameters', async () => {
//         const mockRequest = createMockRequest({
//           query: new Map([['cid', 'test-cid']]),
//         });
//         const mockContext = createMockContext();

//         // Mock fetchAndDecrypt
//         const fetchAndDecryptSpy = jest.spyOn(ipfsService, 'fetchAndDecrypt').mockResolvedValue({
//           data: { test: 'data' },
//           raw: { contentHash: 'test-hash' },
//         });

//         const response = await ipfsService.handleGetIPFSData(mockRequest, mockContext);

//         expect(fetchAndDecryptSpy).toHaveBeenCalledWith('test-cid');
//         expect(response.status).toBe(200);
//         expect(response.jsonBody).toEqual({
//           data: { test: 'data' },
//           metadata: {
//             cid: 'test-cid',
//             contentHash: 'test-hash',
//           },
//         });

//         // Restore original implementation
//         fetchAndDecryptSpy.mockRestore();
//       });

//       it('should handle POST requests with JSON body', async () => {
//         const mockRequest = createMockRequest({
//           method: 'POST',
//           json: jest.fn().mockResolvedValue({ cid: 'test-cid' }),
//         });
//         const mockContext = createMockContext();

//         // Mock fetchAndDecrypt
//         const fetchAndDecryptSpy = jest.spyOn(ipfsService, 'fetchAndDecrypt').mockResolvedValue({
//           data: { test: 'data' },
//           raw: { contentHash: 'test-hash' },
//         });

//         const response = await ipfsService.handleGetIPFSData(mockRequest, mockContext);

//         expect(mockRequest.json).toHaveBeenCalled();
//         expect(fetchAndDecryptSpy).toHaveBeenCalledWith('test-cid');
//         expect(response.status).toBe(200);

//         // Restore original implementation
//         fetchAndDecryptSpy.mockRestore();
//       });

//       it('should return an error for unsupported methods', async () => {
//         const mockRequest = createMockRequest({
//           method: 'PUT',
//         });
//         const mockContext = createMockContext();

//         const response = await ipfsService.handleGetIPFSData(mockRequest, mockContext);

//         expect(response.status).toBe(400);
//         expect(response.jsonBody).toEqual({
//           error: 'Method not supported',
//           message: 'Only GET and POST methods are supported',
//         });
//       });

//       it('should return an error if CID is missing', async () => {
//         const mockRequest = createMockRequest();
//         const mockContext = createMockContext();

//         const response = await ipfsService.handleGetIPFSData(mockRequest, mockContext);

//         expect(response.status).toBe(400);
//         expect(response.jsonBody).toEqual({
//           error: 'Missing CID',
//           message:
//             'Please provide a CID via query parameter, path parameter, or in the request body',
//         });
//       });
//     });

//     describe('handleDeleteIPFS', () => {
//       it('should delete data from IPFS', async () => {
//         const mockRequest = createMockRequest({
//           params: { cid: 'test-cid' },
//         });
//         const mockContext = createMockContext();

//         // Mock unpinFromIPFS
//         const unpinSpy = jest.spyOn(ipfsService, 'unpinFromIPFS').mockResolvedValue({
//           success: true,
//         });

//         const response = await ipfsService.handleDeleteIPFS(mockRequest, mockContext);

//         expect(unpinSpy).toHaveBeenCalledWith(['test-cid']);
//         expect(response.status).toBe(200);
//         expect(response.jsonBody).toEqual({
//           success: true,
//           message: 'Successfully unpinned data with CID: test-cid',
//         });

//         // Restore original implementation
//         unpinSpy.mockRestore();
//       });

//       it('should return an error if CID is missing', async () => {
//         const mockRequest = createMockRequest();
//         const mockContext = createMockContext();

//         const response = await ipfsService.handleDeleteIPFS(mockRequest, mockContext);

//         expect(response.status).toBe(400);
//         expect(response.jsonBody).toEqual({
//           error: 'Missing CID',
//           message: 'Please provide a CID as a path parameter',
//         });
//       });
//     });

//     describe('handleUpdateBlockchain', () => {
//       it('should handle JSON requests', async () => {
//         const mockRequest = createMockRequest({
//           method: 'POST',
//           json: jest.fn().mockResolvedValue({
//             data: { test: 'data' },
//             name: 'test-document',
//           }),
//         });
//         const mockContext = createMockContext();

//         // Mock encryptAndUpload
//         const encryptSpy = jest.spyOn(ipfsService, 'encryptAndUpload').mockResolvedValue({
//           cid: 'test-hash',
//           size: 100,
//           timestamp: '2023-01-01T00:00:00.000Z',
//           contentHash: 'test-hash',
//         });

//         const response = await ipfsService.handleUpdateBlockchain(mockRequest, mockContext);

//         expect(mockRequest.json).toHaveBeenCalled();
//         expect(encryptSpy).toHaveBeenCalledWith({ test: 'data' }, 'test-document');
//         expect(response.status).toBe(200);
//         expect(response.jsonBody).toEqual({
//           cid: 'test-hash',
//           size: 100,
//           timestamp: '2023-01-01T00:00:00.000Z',
//           contentHash: 'test-hash',
//         });

//         // Restore original implementation
//         encryptSpy.mockRestore();
//       });

//       it('should handle FormData requests', async () => {
//         const file = {
//           text: jest.fn().mockResolvedValue('{"test":"data"}'),
//         };

//         // Fix: use a type that allows mixed values
//         type FormDataValue = string | { text: jest.Mock };
//         const formData = new Map<string, FormDataValue>([
//           ['file', file],
//           ['metadata', JSON.stringify({ name: 'test-file' })],
//         ]);

//         const mockRequest = createMockRequest({
//           method: 'POST',
//           headers: new Map([['content-type', 'multipart/form-data']]),
//           formData: jest.fn().mockResolvedValue(formData),
//         });
//         const mockContext = createMockContext();

//         // Mock encryptAndUpload
//         const encryptSpy = jest.spyOn(ipfsService, 'encryptAndUpload').mockResolvedValue({
//           cid: 'test-hash',
//           size: 100,
//           timestamp: '2023-01-01T00:00:00.000Z',
//           contentHash: 'test-hash',
//         });

//         const response = await ipfsService.handleUpdateBlockchain(mockRequest, mockContext);

//         expect(mockRequest.formData).toHaveBeenCalled();
//         expect(file.text).toHaveBeenCalled();
//         expect(encryptSpy).toHaveBeenCalledWith({ test: 'data' }, 'test-file');
//         expect(response.status).toBe(200);

//         // Restore original implementation
//         encryptSpy.mockRestore();
//       });

//       it('should return an error if data is missing in JSON request', async () => {
//         const mockRequest = createMockRequest({
//           method: 'POST',
//           json: jest.fn().mockResolvedValue({
//             name: 'test-document',
//             // No data property
//           }),
//         });
//         const mockContext = createMockContext();

//         const response = await ipfsService.handleUpdateBlockchain(mockRequest, mockContext);

//         expect(response.status).toBe(400);
//         expect(response.jsonBody).toEqual({
//           error: 'Missing data',
//           message: 'Please provide data in the request body',
//         });
//       });

//       it('should return an error if file is missing in FormData request', async () => {
//         const formData = new Map<string, string>();

//         const mockRequest = createMockRequest({
//           method: 'POST',
//           headers: new Map([['content-type', 'multipart/form-data']]),
//           formData: jest.fn().mockResolvedValue(formData),
//         });
//         const mockContext = createMockContext();

//         const response = await ipfsService.handleUpdateBlockchain(mockRequest, mockContext);

//         expect(response.status).toBe(400);
//         expect(response.jsonBody).toEqual({
//           error: 'Missing file',
//           message: 'Please provide a file in the FormData',
//         });
//       });
//     });

//     describe('handleGetData', () => {
//       it('should return raw data when CID is provided', async () => {
//         const mockRequest = createMockRequest({
//           query: new Map([['cid', 'test-cid']]),
//         });
//         const mockContext = createMockContext();

//         // Mock fetchFromIPFS
//         const fetchSpy = jest.spyOn(ipfsService, 'fetchFromIPFS').mockResolvedValue({
//           test: 'raw-data',
//         });

//         const response = await ipfsService.handleGetData(mockRequest, mockContext);

//         expect(fetchSpy).toHaveBeenCalledWith('test-cid');
//         expect(response.status).toBe(200);
//         expect(response.jsonBody).toEqual({
//           data: {
//             test: 'raw-data',
//           },
//         });

//         // Restore original implementation
//         fetchSpy.mockRestore();
//       });

//       it('should return service info when no CID is provided', async () => {
//         const mockRequest = createMockRequest();
//         const mockContext = createMockContext();

//         const response = await ipfsService.handleGetData(mockRequest, mockContext);

//         expect(response.status).toBe(200);
//         expect(response.jsonBody).toEqual({
//           service: 'IPFS Integration',
//           gatewayUrl: 'https://test-gateway.com/ipfs',
//           endpoints: {
//             upload: '/pin',
//             get: '/ipfs',
//             getIPFSData: '/getData',
//             delete: '/ipfs/:cid',
//           },
//           encryptionEnabled: true,
//         });
//       });
//     });
//   });
// });
