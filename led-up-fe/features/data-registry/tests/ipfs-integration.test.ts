/**
 * IPFS Integration Tests
 *
 * These tests validate the integration between the frontend and backend for IPFS operations
 * with backend encryption.
 */

import { uploadToIPFS, getIPFSData, deleteIPFSData, updateBlockchain } from '../actions/ipfs';
import { fetchWithErrorHandling } from '@/lib/apiHelper';
import { revalidatePath } from 'next/cache';

// Mock the API helper and next/cache
jest.mock('@/lib/apiHelper', () => ({
  fetchWithErrorHandling: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// Type the mocked function to fix TypeScript errors
const mockedFetch = fetchWithErrorHandling as jest.MockedFunction<typeof fetchWithErrorHandling>;
const mockedRevalidatePath = revalidatePath as jest.MockedFunction<typeof revalidatePath>;

describe('IPFS Actions', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadToIPFS', () => {
    it('should successfully upload data to IPFS', async () => {
      // Mock response from the API
      const mockResponse = {
        success: true,
        data: {
          cid: 'Qm123456789abcdef',
          size: 1024,
          contentHash: '0x123456789abcdef',
        },
      };

      // Setup the mock to return the response
      mockedFetch.mockResolvedValue(mockResponse);

      // Test data
      const testData = {
        title: 'Test Document',
        content: 'This is test content',
      };

      // Call the function
      const result = await uploadToIPFS(testData, 'test-document.json');

      // Assert FormData was created correctly
      expect(mockedFetch).toHaveBeenCalledTimes(1);
      expect(mockedFetch.mock.calls[0][0]).toContain('/pin');

      // Verify FormData contains the correct data
      const formDataArg = mockedFetch.mock.calls[0][1]?.body;
      expect(formDataArg).toBeInstanceOf(FormData);

      // Check if revalidatePath was called
      expect(mockedRevalidatePath).toHaveBeenCalledWith('/data');

      // Check the result matches the mock response
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle errors during upload', async () => {
      // Mock API error
      mockedFetch.mockResolvedValue({
        success: false,
        message: 'Upload failed',
      });

      // Test data
      const testData = {
        title: 'Test Document',
        content: 'This is test content',
      };

      // Expect the function to throw an error
      await expect(uploadToIPFS(testData)).rejects.toThrow('Upload failed');
    });
  });

  describe('getIPFSData', () => {
    it('should retrieve data from IPFS', async () => {
      // Mock response
      const mockResponse = {
        success: true,
        data: {
          data: { title: 'Test', content: 'Content' },
          metadata: {
            cid: 'Qm123456789abcdef',
            contentHash: '0x123456789abcdef',
          },
        },
      };

      mockedFetch.mockResolvedValue(mockResponse);

      // Call function
      const result = await getIPFSData('Qm123456789abcdef');

      // Assertions
      expect(mockedFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ cid: 'Qm123456789abcdef' }),
        })
      );

      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateBlockchain', () => {
    it('should update the blockchain with IPFS references', async () => {
      // Mock response
      mockedFetch.mockResolvedValue({
        success: true,
      });

      // Test parameters
      const updateParams = {
        recordId: 'record-123',
        cid: 'Qm123456789abcdef',
        contentHash: '0x123456789abcdef',
        resourceType: 1,
        dataSize: 1024,
      };

      // Call function
      await updateBlockchain(updateParams);

      // Assertions
      expect(mockedFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(updateParams),
        })
      );

      expect(mockedRevalidatePath).toHaveBeenCalledWith('/data');
    });

    it('should handle errors when updating blockchain', async () => {
      // Mock API error
      mockedFetch.mockResolvedValue({
        success: false,
        message: 'Blockchain update failed',
      });

      // Test parameters
      const updateParams = {
        recordId: 'record-123',
        cid: 'Qm123456789abcdef',
        contentHash: '0x123456789abcdef',
        resourceType: 1,
        dataSize: 1024,
      };

      // Expect the function to throw an error
      await expect(updateBlockchain(updateParams)).rejects.toThrow();
    });
  });
});
