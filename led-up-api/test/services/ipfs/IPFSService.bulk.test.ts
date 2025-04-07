// import pLimit from 'p-limit';

// import { IPFSService } from '../../../src/services/ipfs/IPFSService';

// // Define interface for our extended IPFSService to fix type errors
// interface ExtendedIPFSService extends IPFSService {
//   getBulkIPFSData(cids: string[], context: any, concurrency?: number): Promise<Record<string, any>>;
//   fetchAndDecryptBulk(cids: string[], context: any): Promise<Record<string, any>>;
// }

// // Mock the external dependencies
// jest.mock('p-limit');
// jest.mock('@pinata/sdk', () => {
//   return jest.fn().mockImplementation(() => {
//     return {
//       pinJSONToIPFS: jest.fn(),
//       unpin: jest.fn(),
//       pinList: jest.fn(),
//       getFileMetadata: jest.fn(),
//       pinByHash: jest.fn(),
//     };
//   });
// });

// describe('IPFSService - Bulk Data Operations', () => {
//   let ipfsService: ExtendedIPFSService;
//   let mockContext: any;
//   const mockPinata: any = {
//     pinJSONToIPFS: jest.fn(),
//     unpin: jest.fn(),
//     pinList: jest.fn(),
//     getFileMetadata: jest.fn(),
//     pinByHash: jest.fn(),
//   };

//   beforeEach(() => {
//     // Reset all mocks
//     jest.clearAllMocks();

//     // Setup mock context
//     mockContext = {
//       log: {
//         info: jest.fn(),
//         error: jest.fn(),
//         warn: jest.fn(),
//       },
//     };

//     // Mock the p-limit functionality
//     (pLimit as jest.Mock).mockReturnValue((fn: any) => fn());

//     // Create service instance
//     ipfsService = new IPFSService() as ExtendedIPFSService;
//     // @ts-expect-error - inject mock Pinata instance
//     ipfsService.pinata = mockPinata;
//   });

//   describe('getBulkIPFSData', () => {
//     it('should process multiple CIDs in parallel and return aggregated results', async () => {
//       // Arrange
//       const cids = ['cid1', 'cid2', 'cid3'];
//       const mockDecryptedData: Record<string, any> = {
//         cid1: { name: 'John Doe', age: 30 },
//         cid2: { name: 'Jane Smith', age: 25 },
//         cid3: { name: 'Bob Johnson', age: 40 },
//       };

//       // Mock successful data retrieval for all CIDs
//       jest.spyOn(ipfsService as any, 'getIPFSData').mockImplementation((cid: string) => {
//         return Promise.resolve({
//           data: mockDecryptedData[cid],
//           metadata: { cid, contentHash: `hash_${cid}` },
//         });
//       });

//       // Act
//       const result = await ipfsService.getBulkIPFSData(cids, mockContext);

//       // Assert
//       expect(result).toEqual({
//         cid1: {
//           data: mockDecryptedData.cid1,
//           metadata: { cid: 'cid1', contentHash: 'hash_cid1' },
//           success: true,
//         },
//         cid2: {
//           data: mockDecryptedData.cid2,
//           metadata: { cid: 'cid2', contentHash: 'hash_cid2' },
//           success: true,
//         },
//         cid3: {
//           data: mockDecryptedData.cid3,
//           metadata: { cid: 'cid3', contentHash: 'hash_cid3' },
//           success: true,
//         },
//       });

//       // Verify parallel execution with concurrency limiting
//       expect(pLimit).toHaveBeenCalledWith(5); // Default concurrency limit
//       expect(mockContext.log.info).toHaveBeenCalledWith(
//         `Processing ${cids.length} CIDs with concurrency limit of 5`
//       );
//     });

//     it('should handle partial failures and continue processing other CIDs', async () => {
//       // Arrange
//       const cids = ['cid1', 'cid2', 'cid3'];

//       // Mock mixed success/failure responses
//       jest.spyOn(ipfsService as any, 'getIPFSData').mockImplementation((cid: string) => {
//         if (cid === 'cid2') {
//           return Promise.reject(new Error('Not found'));
//         }
//         return Promise.resolve({
//           data: { name: `Test for ${cid}` },
//           metadata: { cid, contentHash: `hash_${cid}` },
//         });
//       });

//       // Act
//       const result = await ipfsService.getBulkIPFSData(cids, mockContext);

//       // Assert
//       expect(result).toEqual({
//         cid1: {
//           data: { name: 'Test for cid1' },
//           metadata: { cid: 'cid1', contentHash: 'hash_cid1' },
//           success: true,
//         },
//         cid2: {
//           error: 'Not found',
//           success: false,
//         },
//         cid3: {
//           data: { name: 'Test for cid3' },
//           metadata: { cid: 'cid3', contentHash: 'hash_cid3' },
//           success: true,
//         },
//       });

//       // Verify error logging
//       expect(mockContext.log.error).toHaveBeenCalledWith(
//         expect.stringContaining('Error fetching data for CID cid2')
//       );
//     });

//     it('should handle empty CID array gracefully', async () => {
//       // Arrange
//       const cids: string[] = [];

//       // Act
//       const result = await ipfsService.getBulkIPFSData(cids, mockContext);

//       // Assert
//       expect(result).toEqual({});
//       expect(mockContext.log.info).toHaveBeenCalledWith('No CIDs to process');
//     });

//     it('should use custom concurrency if provided', async () => {
//       // Arrange
//       const cids = ['cid1', 'cid2'];
//       const concurrency = 2;

//       jest.spyOn(ipfsService as any, 'getIPFSData').mockImplementation((cid: string) => {
//         return Promise.resolve({
//           data: { test: cid },
//           metadata: { cid, contentHash: `hash_${cid}` },
//         });
//       });

//       // Reset the pLimit mock to verify it's called with custom concurrency
//       (pLimit as jest.Mock).mockClear();
//       (pLimit as jest.Mock).mockReturnValue((fn: any) => fn());

//       // Act
//       await ipfsService.getBulkIPFSData(cids, mockContext, concurrency);

//       // Assert
//       expect(pLimit).toHaveBeenCalledWith(concurrency);
//       expect(mockContext.log.info).toHaveBeenCalledWith(
//         `Processing ${cids.length} CIDs with concurrency limit of ${concurrency}`
//       );
//     });

//     it('should filter out duplicate CIDs', async () => {
//       // Arrange
//       const cids = ['cid1', 'cid1', 'cid2']; // Duplicate cid1

//       jest.spyOn(ipfsService as any, 'getIPFSData').mockImplementation((cid: string) => {
//         return Promise.resolve({
//           data: { name: `Test for ${cid}` },
//           metadata: { cid, contentHash: `hash_${cid}` },
//         });
//       });

//       // Act
//       const result = await ipfsService.getBulkIPFSData(cids, mockContext);

//       // Assert - should only have processed unique CIDs
//       expect(Object.keys(result)).toHaveLength(2); // Only 2 unique CIDs
//       expect((ipfsService as any).getIPFSData).toHaveBeenCalledTimes(2);
//       expect(mockContext.log.info).toHaveBeenCalledWith(
//         expect.stringContaining('Processing 2 unique CIDs')
//       );
//     });
//   });

//   describe('fetchAndDecryptBulk', () => {
//     it('should process each CID and accumulate results', async () => {
//       // Arrange
//       const cids = ['cid1', 'cid2'];

//       // Mock successful fetch and decrypt for each CID
//       jest.spyOn(ipfsService as any, 'fetchAndDecrypt').mockImplementation((cid: string) => {
//         return Promise.resolve({
//           data: { content: `Content for ${cid}` },
//           metadata: { cid, contentHash: `hash_${cid}` },
//         });
//       });

//       // Act
//       const result = await ipfsService.fetchAndDecryptBulk(cids, mockContext);

//       // Assert
//       expect(result).toEqual({
//         cid1: {
//           data: { content: 'Content for cid1' },
//           metadata: { cid: 'cid1', contentHash: 'hash_cid1' },
//           success: true,
//         },
//         cid2: {
//           data: { content: 'Content for cid2' },
//           metadata: { cid: 'cid2', contentHash: 'hash_cid2' },
//           success: true,
//         },
//       });

//       // Verify calling the fetchAndDecrypt method for each CID
//       expect((ipfsService as any).fetchAndDecrypt).toHaveBeenCalledTimes(2);
//       expect((ipfsService as any).fetchAndDecrypt).toHaveBeenCalledWith('cid1', mockContext);
//       expect((ipfsService as any).fetchAndDecrypt).toHaveBeenCalledWith('cid2', mockContext);
//     });

//     it('should handle errors during fetch and decrypt', async () => {
//       // Arrange
//       const cids = ['cid1', 'cid2'];

//       // Mock mixed success/failure responses
//       jest.spyOn(ipfsService as any, 'fetchAndDecrypt').mockImplementation((cid: string) => {
//         if (cid === 'cid1') {
//           return Promise.resolve({
//             data: { content: 'Content for cid1' },
//             metadata: { cid: 'cid1', contentHash: 'hash_cid1' },
//           });
//         } else {
//           return Promise.reject(new Error('Decryption failed'));
//         }
//       });

//       // Act
//       const result = await ipfsService.fetchAndDecryptBulk(cids, mockContext);

//       // Assert
//       expect(result).toEqual({
//         cid1: {
//           data: { content: 'Content for cid1' },
//           metadata: { cid: 'cid1', contentHash: 'hash_cid1' },
//           success: true,
//         },
//         cid2: {
//           error: 'Decryption failed',
//           success: false,
//         },
//       });

//       // Verify error logging
//       expect(mockContext.log.error).toHaveBeenCalledWith(
//         expect.stringContaining('Error processing CID cid2')
//       );
//     });
//   });
// });
