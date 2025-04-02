'use server';

import { revalidatePath } from 'next/cache';
import { API_ENDPOINTS } from '@/lib/config';
import { fetchWithErrorHandling } from '@/lib/apiHelper';
import { ApiError } from '@/lib/error';
import { logger } from '@/lib/logger';

// Types
interface IPFSUploadResponse {
  cid: string;
  size: number;
  contentHash: string;
}

interface IPFSDataResponse {
  data: any;
  metadata: {
    cid: string;
    contentHash: string;
  };
}

interface IPFSBackendResponse {
  success: boolean;
  results: Array<{
    cid: string;
    data: any;
    metadata: any;
    success: boolean;
  }>;
  summary: {
    total: number;
    success: number;
    failed: number;
    successRate: number;
  };
}

interface IPFSDataBulkResponse extends IPFSBackendResponse {
  message: string;
}

interface UpdateBlockchainParams {
  recordId: string;
  cid: string;
  contentHash: string;
  resourceType: number;
  dataSize: number;
}

/**
 * Upload data to IPFS
 * This function sends plain data to the backend where it will be encrypted and uploaded to IPFS
 *
 * @param data The data object to upload
 * @param fileName Optional filename for the data
 * @param metadata Optional metadata to associate with the upload
 */
export async function uploadToIPFS(data: Record<string, any>, producer: string): Promise<IPFSUploadResponse> {
  try {
    const { metadata, resource } = data;
    // Send the request to the backend API
    const response = await fetchWithErrorHandling<IPFSUploadResponse>(API_ENDPOINTS.IPFS.PIN, {
      method: 'POST',
      body: JSON.stringify({
        resource,
        metadata: {
          ...metadata,
          owner: producer,
        },
      }),
    });

    if (!response.success || !response.data) {
      throw new ApiError(response.message || 'Failed to upload to IPFS');
    }

    logger.info(`Data uploaded to IPFS with CID: ${response.data.cid}`);
    console.log(response.data);

    return response.data;
  } catch (error) {
    logger.error('Error uploading to IPFS:', error instanceof Error ? error.message : 'Unknown error');
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to upload to IPFS');
  }
}

/**
 * Get data from IPFS
 * @param cid The IPFS CID
 */
export async function getIPFSData(cid: string): Promise<IPFSDataResponse> {
  try {
    const response = await fetchWithErrorHandling<IPFSDataResponse>(API_ENDPOINTS.IPFS.GET_IPFS_DATA, {
      method: 'POST',
      body: JSON.stringify({ cid }),
    });

    if (!response.success || !response.data) {
      throw new ApiError(response.message || 'Failed to get IPFS data');
    }

    console.log('response.data', response.data);

    return response.data;
  } catch (error) {
    logger.error('Error getting IPFS data:', error instanceof Error ? error.message : 'Unknown error');
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to get IPFS data');
  }
}

/**
 * Get data from multiple IPFS CIDs in a single request
 * This significantly reduces network requests when fetching many records
 *
 * @param cids Array of IPFS CIDs to retrieve
 * @returns Record mapping CIDs to their IPFS data responses
 */
export async function getBulkIPFSData(cids: string[]): Promise<IPFSDataBulkResponse> {
  try {
    console.log('cids', cids);
    if (!cids.length)
      return {
        success: false,
        results: [],
        summary: { total: 0, success: 0, failed: 0, successRate: 0 },
        message: 'No CIDs provided',
      };

    logger.info(`Fetching bulk IPFS data for ${cids.length} CIDs`);

    const response = await fetchWithErrorHandling<{
      results: Array<{ cid: string; data: any; metadata: any; success: boolean }>;
    }>(API_ENDPOINTS.IPFS.GET_BULK_DATA, {
      method: 'POST',
      body: JSON.stringify({ cids }),
    });

    if (!response.success) {
      throw new ApiError(response.message || 'Failed to get bulk IPFS data');
    }

    console.log('response', response);
    console.log(JSON.stringify(response));

    return {
      ...(response as IPFSBackendResponse),
      message: 'Bulk IPFS data fetched successfully',
    };
  } catch (error) {
    logger.error('Error getting bulk IPFS data:', error instanceof Error ? error.message : 'Unknown error');
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to get bulk IPFS data');
  }
}

/**
 * Delete data from IPFS
 * @param cid The IPFS CID
 */
export async function deleteIPFSData(cid: string): Promise<void> {
  try {
    const url = API_ENDPOINTS.IPFS.DELETE.replace(':cid', cid);
    const response = await fetchWithErrorHandling<void>(url, {
      method: 'DELETE',
    });

    if (!response.success) {
      throw new ApiError(response.message || 'Failed to delete IPFS data');
    }

    // Revalidate the data path
    revalidatePath('/data');
  } catch (error) {
    logger.error('Error deleting IPFS data:', error instanceof Error ? error.message : 'Unknown error');
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to delete IPFS data');
  }
}

/**
 * Get raw data from IPFS
 * @param cid The IPFS CID
 */
export async function getRawIPFSData(cid: string): Promise<any> {
  try {
    const response = await fetchWithErrorHandling<any>(API_ENDPOINTS.IPFS.GET_DATA, {
      method: 'POST',
      body: JSON.stringify({ cid }),
    });

    if (!response.success || !response.data) {
      throw new ApiError(response.message || 'Failed to get raw IPFS data');
    }

    return response.data;
  } catch (error) {
    logger.error('Error getting raw IPFS data:', error instanceof Error ? error.message : 'Unknown error');
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to get raw IPFS data');
  }
}

/**
 * Update blockchain with IPFS data
 * @param params The update parameters
 */
export async function updateBlockchain(params: UpdateBlockchainParams): Promise<void> {
  try {
    const { recordId, cid, contentHash, resourceType, dataSize } = params;

    logger.info(`Updating blockchain with IPFS data for record ${recordId}`);

    const response = await fetchWithErrorHandling<void>(API_ENDPOINTS.IPFS.UPDATE_BLOCKCHAIN, {
      method: 'POST',
      body: JSON.stringify({ recordId, cid, contentHash, resourceType, dataSize }),
    });

    if (!response.success) {
      throw new ApiError(response.message || 'Failed to update blockchain');
    }

    logger.info(`Successfully updated blockchain for record ${recordId}`);

    // Revalidate the data path
    revalidatePath('/data');
  } catch (error) {
    logger.error('Error updating blockchain:', error instanceof Error ? error.message : 'Unknown error');
    throw new Error('Failed to update blockchain');
  }
}

/**
 * Get access to encrypted data
 * This function is a server action that calls the backend API to fetch access-controlled data
 *
 * @param cid The IPFS CID
 * @param did The DID of the producer
 * @param consumerAddress The address of the consumer
 * @param recordId Optional record ID for direct access
 * @returns The accessed data if permitted
 */
export async function getAccessForData(
  cid: string,
  did: string,
  consumerAddress: string,
  recordId?: string
): Promise<any> {
  console.log('SERVER ACTION: getAccessForData called with:', { cid, did, consumerAddress, recordId });

  if (!cid) throw new Error('CID is required');
  if (!did) throw new Error('DID is required');
  if (!consumerAddress) {
    throw new Error('Valid consumer address is required');
  }
  if (!recordId) {
    throw new Error('Record ID is required');
  }

  try {
    const response = await fetchWithErrorHandling<any>(API_ENDPOINTS.IPFS.ACCESS_DATA, {
      method: 'POST',
      body: JSON.stringify({ cid, did, consumerAddress, recordId }),
    });

    if (!response.success) {
      throw new ApiError(response.message || 'Failed to get access to data');
    }

    const data = response.data;

    // Check for API-level success flag
    if (!response.success) {
      throw new Error(response.message || 'You do not have permission to view this health record');
    }

    return data;
  } catch (error) {
    logger.error('Error accessing health record data:', error instanceof Error ? error.message : 'Unknown error');
    throw new Error('Failed to access health record data. Please ensure you have permission.');
  }
}
