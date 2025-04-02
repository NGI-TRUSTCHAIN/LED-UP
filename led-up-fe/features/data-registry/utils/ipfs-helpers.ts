/**
 * Utilities for working with IPFS in the context of the data registry
 */

import { type ResourceType } from '../types';
import { IPFSService } from '@/services';

// Create a singleton instance if one doesn't exist in the imported module
const ipfsService = new IPFSService();

/**
 * Base URL for IPFS gateway
 */
const IPFS_GATEWAY_URL = process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL || 'https://ipfs.io/ipfs/';

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
 * Gets the URL for an IPFS resource using the configured gateway
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
 * Uploads record metadata to IPFS
 * @param metadata - The record metadata to upload
 * @returns Promise resolving to the IPFS upload response
 */
export async function uploadRecordMetadata(metadata: RecordMetadataIpfs): Promise<IpfsUploadResponse> {
  try {
    console.log('Uploading record metadata to IPFS:', metadata);
    const response = await ipfsService.uploadToIPFS(metadata, 'record-metadata');
    console.log('Record metadata uploaded to IPFS:', response);
    return response;
  } catch (error) {
    console.error('Error uploading record metadata to IPFS:', error);
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
    console.log('Uploading encrypted record metadata to IPFS');
    const response = await ipfsService.encryptAndUpload(metadata, 'record-metadata');
    console.log('Encrypted record metadata uploaded to IPFS:', response);
    return response;
  } catch (error) {
    console.error('Error uploading encrypted record metadata to IPFS:', error);
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
    console.log('Fetching record metadata from IPFS:', cid);
    const cleanCid = extractCid(cid);
    if (!cleanCid) {
      throw new Error('Invalid CID format');
    }

    const data = await ipfsService.fetchFromIPFS(cleanCid);
    console.log('Record metadata fetched from IPFS');
    return data as RecordMetadataIpfs;
  } catch (error) {
    console.error('Error fetching record metadata from IPFS:', error);
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
    console.log('Fetching encrypted record metadata from IPFS:', cid);
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

    console.log('Encrypted record metadata fetched and decrypted from IPFS');
    return parsedData;
  } catch (error) {
    console.error('Error fetching encrypted record metadata from IPFS:', error);
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
    console.log('Removing record metadata from IPFS:', cid);
    const cleanCid = extractCid(cid);
    if (!cleanCid) {
      throw new Error('Invalid CID format');
    }

    await ipfsService.unpinFromIPFS([cleanCid]);

    console.log('Record metadata removed from IPFS');
  } catch (error) {
    console.error('Error removing record metadata from IPFS:', error);
    throw new Error(`Failed to remove record metadata: ${error instanceof Error ? error.message : String(error)}`);
  }
}
