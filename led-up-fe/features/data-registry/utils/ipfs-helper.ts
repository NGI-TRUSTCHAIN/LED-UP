/**
 * IPFS Helper Utilities
 *
 * Provides common helper functions for working with IPFS and blockchain integration
 */

import { uploadToIPFS, updateBlockchain, getIPFSData, deleteIPFSData } from '../actions/ipfs';
import { logger } from '@/lib/logger';
import { IPFSService } from '@/services';

// Create a singleton instance if one doesn't exist in the imported module
const ipfsService = new IPFSService();

/**
 * Base URL for IPFS gateway
 */
const IPFS_GATEWAY_URL = process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL || 'https://ipfs.io/ipfs/';

/**
 * Resource types available in the data registry
 */
export enum ResourceType {
  Patient = 1,
  Procedure = 2,
  Observation = 3,
  MedicationRequest = 4,
  Document = 5,
  Other = 6,
}

/**
 * Standard metadata structure for data registry records
 */
export interface RecordMetadataIpfs {
  title: string;
  description?: string;
  resourceType: number;
  provider: string;
  createdAt: number;
  updatedAt: number;
  format: string;
  dataHash: string;
  schema?: {
    url: string;
    version: string;
  };
  keywords?: string[];
  additional?: Record<string, any>;
}

/**
 * Metadata for IPFS uploads
 */
export interface IPFSUploadMetadata {
  title?: string;
  description?: string;
  resourceType: ResourceType;
  createdAt?: number;
  keywords?: string[];
  [key: string]: any;
}

/**
 * Response from IPFS after successful upload
 */
export interface IpfsUploadResponse {
  cid: string;
  url: string;
  timestamp: string;
  pinSize: number;
  isDuplicate: boolean;
}

/**
 * Response from uploading to IPFS and registering on blockchain
 */
export interface IPFSRegistrationResult {
  cid: string;
  contentHash: string;
  size: number;
  recordId: string;
}

/**
 * Creates a standard metadata object for IPFS
 */
export function createRecordMetadata(
  title: string,
  resourceType: ResourceType,
  provider: string,
  dataHash: string,
  options: {
    description?: string;
    format?: string;
    schema?: { url: string; version: string };
    keywords?: string[];
    additional?: Record<string, any>;
  } = {}
): RecordMetadataIpfs {
  const now = Math.floor(Date.now() / 1000);

  return {
    title,
    description: options.description || '',
    resourceType,
    provider,
    createdAt: now,
    updatedAt: now,
    format: options.format || 'json',
    dataHash,
    schema: options.schema,
    keywords: options.keywords || [],
    additional: options.additional || {},
  };
}

/**
 * Uploads data to IPFS and registers it on the blockchain
 *
 * @param data The data to upload
 * @param recordId The record ID to use for blockchain registration
 * @param metadata Metadata to associate with the upload
 * @param filename Optional filename
 */
export async function uploadAndRegister(
  data: any,
  recordId: string,
  metadata: IPFSUploadMetadata,
  filename?: string
): Promise<IPFSRegistrationResult> {
  try {
    // Set default metadata values
    const metadataWithDefaults: IPFSUploadMetadata = {
      ...metadata,
      createdAt: metadata.createdAt || Date.now(),
    };

    // Generate filename if not provided
    const generatedFilename = filename || `${recordId}-${Date.now()}.json`;

    // Upload to IPFS
    logger.info(`Uploading data for record ${recordId} to IPFS`);
    const ipfsResult = await uploadToIPFS(data, generatedFilename, metadataWithDefaults);

    // Register on blockchain
    logger.info(`Registering IPFS data (CID: ${ipfsResult.cid}) on blockchain for record ${recordId}`);
    await updateBlockchain({
      recordId,
      cid: ipfsResult.cid,
      contentHash: ipfsResult.contentHash,
      resourceType: metadataWithDefaults.resourceType,
      dataSize: ipfsResult.size,
    });

    // Return combined result
    return {
      ...ipfsResult,
      recordId,
    };
  } catch (error) {
    logger.error('Error in uploadAndRegister:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

/**
 * Retrieves data from IPFS and verifies its integrity
 *
 * @param cid The IPFS CID
 * @param expectedHash Optional expected content hash for verification
 */
export async function retrieveAndVerify(cid: string, expectedHash?: string): Promise<any> {
  try {
    // Get data from IPFS
    logger.info(`Retrieving data from IPFS with CID: ${cid}`);
    const result = await getIPFSData(cid);

    // Verify hash if expected hash is provided
    if (expectedHash && result.metadata.contentHash !== expectedHash) {
      logger.error(`Hash verification failed for CID ${cid}`);
      throw new Error('Content hash verification failed. Data may have been tampered with.');
    }

    return result.data;
  } catch (error) {
    logger.error('Error in retrieveAndVerify:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

/**
 * Gets the URL for an IPFS resource using the configured gateway
 *
 * @param cid The IPFS CID
 * @returns The gateway URL
 */
export function getIpfsUrl(cid: string): string {
  if (!cid) return '';

  // Handle CIDs that might already have a prefix
  if (cid.startsWith('ipfs://')) {
    return `${IPFS_GATEWAY_URL}${cid.replace('ipfs://', '')}`;
  }

  if (cid.startsWith('http://') || cid.startsWith('https://')) {
    return cid;
  }

  return `${IPFS_GATEWAY_URL}${cid}`;
}

/**
 * Creates a gateway URL for an IPFS CID (alias for getIpfsUrl for backwards compatibility)
 *
 * @param cid The IPFS CID
 * @returns The gateway URL
 */
export function getIPFSGatewayUrl(cid: string): string {
  return getIpfsUrl(cid);
}

/**
 * Formats a CID for display (truncated with ellipsis)
 */
export function formatCid(cid: string, maxLength = 16): string {
  if (!cid) return 'N/A';

  // Remove any prefix
  const cleanCid = cid.replace('ipfs://', '');

  if (cleanCid.length <= maxLength) {
    return cleanCid;
  }

  const halfLength = Math.floor((maxLength - 3) / 2);
  return `${cleanCid.slice(0, halfLength)}...${cleanCid.slice(-halfLength)}`;
}

/**
 * Validates a CID format
 */
export function isValidCidFormat(cid: string): boolean {
  if (!cid) return false;

  // Remove common prefixes for validation
  const cleanCid = cid
    .replace('ipfs://', '')
    .replace(/^https?:\/\/ipfs\.io\/ipfs\//, '')
    .replace(/^https?:\/\/[^/]+\/ipfs\//, '');

  // This is a simplified validation - for production you'd want
  // a more robust check based on the specific CID version
  return /^[a-zA-Z0-9]{46,59}$/.test(cleanCid);
}

/**
 * Extracts a CID from various formats
 */
export function extractCid(cidOrUrl: string): string {
  if (!cidOrUrl) return '';

  // If it's already a clean CID, return it
  if (/^[a-zA-Z0-9]{46,59}$/.test(cidOrUrl)) {
    return cidOrUrl;
  }

  // Extract from ipfs:// format
  if (cidOrUrl.startsWith('ipfs://')) {
    return cidOrUrl.replace('ipfs://', '');
  }

  // Extract from gateway URL
  const gatewayMatch = cidOrUrl.match(/\/ipfs\/([a-zA-Z0-9]{46,59})/);
  if (gatewayMatch && gatewayMatch[1]) {
    return gatewayMatch[1];
  }

  return '';
}

/**
 * Creates a standardized IPFS URL from a CID
 */
export function createIpfsUrl(cid: string): string {
  if (!cid) return '';

  const cleanCid = extractCid(cid);
  if (!cleanCid) return '';

  return `ipfs://${cleanCid}`;
}

/**
 * Removes data from IPFS and updates blockchain record if needed
 *
 * @param cid The IPFS CID to delete
 * @param recordId Optional record ID to update on blockchain
 */
export async function removeIPFSData(cid: string, recordId?: string): Promise<void> {
  try {
    // Delete from IPFS
    logger.info(`Deleting data from IPFS with CID: ${cid}`);
    await deleteIPFSData(cid);

    // If recordId is provided, update blockchain record
    // This would require implementation of an additional function to update record status
    if (recordId) {
      logger.info(`Updating record ${recordId} to reflect IPFS data removal`);
      // Implementation would depend on your blockchain contract functionality
      // For example: await updateRecordStatus(recordId, RecordStatus.Removed);
    }
  } catch (error) {
    logger.error('Error in removeIPFSData:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

/**
 * Uploads record metadata to IPFS
 * @param metadata - The record metadata to upload
 * @returns Promise resolving to the IPFS upload response
 */
export async function uploadRecordMetadata(metadata: RecordMetadataIpfs): Promise<IpfsUploadResponse> {
  try {
    logger.info('Uploading record metadata to IPFS:', metadata);
    const response = await ipfsService.uploadToIPFS(metadata, 'record-metadata');
    logger.info('Record metadata uploaded to IPFS:', response);
    return response;
  } catch (error) {
    logger.error('Error uploading record metadata to IPFS:', error);
    throw new Error(`Failed to upload record metadata: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Uploads encrypted record metadata to IPFS
 * @param metadata - The record metadata to encrypt and upload
 * @returns Promise resolving to the IPFS upload response
 */
export async function uploadEncryptedRecordMetadata(metadata: RecordMetadataIpfs): Promise<IpfsUploadResponse> {
  try {
    logger.info('Uploading encrypted record metadata to IPFS');
    const response = await ipfsService.encryptAndUpload(metadata, 'record-metadata');
    logger.info('Encrypted record metadata uploaded to IPFS:', response);
    return response;
  } catch (error) {
    logger.error('Error uploading encrypted record metadata to IPFS:', error);
    throw new Error(
      `Failed to upload encrypted record metadata: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Fetches record metadata from IPFS
 * @param cid - The Content Identifier for the record metadata
 * @returns Promise resolving to the record metadata
 */
export async function fetchRecordMetadata(cid: string): Promise<RecordMetadataIpfs> {
  try {
    logger.info('Fetching record metadata from IPFS:', cid);
    const cleanCid = extractCid(cid);
    if (!cleanCid) {
      throw new Error('Invalid CID format');
    }

    const data = await ipfsService.fetchFromIPFS(cleanCid);
    logger.info('Record metadata fetched from IPFS');
    return data as RecordMetadataIpfs;
  } catch (error) {
    logger.error('Error fetching record metadata from IPFS:', error);
    throw new Error(`Failed to fetch record metadata: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Fetches and decrypts record metadata from IPFS
 * @param cid - The Content Identifier for the encrypted record metadata
 * @returns Promise resolving to the decrypted record metadata
 */
export async function fetchEncryptedRecordMetadata(cid: string): Promise<RecordMetadataIpfs> {
  try {
    logger.info('Fetching encrypted record metadata from IPFS:', cid);
    const cleanCid = extractCid(cid);
    if (!cleanCid) {
      throw new Error('Invalid CID format');
    }

    const { data } = await ipfsService.fetchAndDecrypt(cleanCid);

    // Parse the JSON data if it's a string
    let parsedData: RecordMetadataIpfs;
    if (typeof data === 'string') {
      parsedData = JSON.parse(data);
    } else {
      parsedData = data as RecordMetadataIpfs;
    }

    logger.info('Encrypted record metadata fetched and decrypted from IPFS');
    return parsedData;
  } catch (error) {
    logger.error('Error fetching encrypted record metadata from IPFS:', error);
    throw new Error(
      `Failed to fetch encrypted record metadata: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Removes record metadata from IPFS
 * @param cid - The Content Identifier for the record metadata to remove
 * @returns Promise resolving when the record is unpinned
 */
export async function removeRecordMetadata(cid: string): Promise<void> {
  try {
    logger.info('Removing record metadata from IPFS:', cid);
    const cleanCid = extractCid(cid);
    if (!cleanCid) {
      throw new Error('Invalid CID format');
    }

    await ipfsService.unpinFromIPFS([cleanCid]);

    logger.info('Record metadata removed from IPFS');
  } catch (error) {
    logger.error('Error removing record metadata from IPFS:', error);
    throw new Error(`Failed to remove record metadata: ${error instanceof Error ? error.message : String(error)}`);
  }
}
