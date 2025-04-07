import { type Address, encodeAbiParameters, keccak256 } from 'viem';
import { ResourceType } from '../types';
import { type RegisterRecordParams, type ShareDataParams, type UpdateRecordParams } from '../types/contract/index';

/**
 * Computes the keccak256 hash of a record ID string
 * @param recordId The record ID string
 * @returns The hash as a hex string
 */
export function computeRecordIdHash(recordId: string): `0x${string}` {
  return keccak256(encodeAbiParameters([{ type: 'string' }], [recordId]));
}

/**
 * Computes the keccak256 hash of a content string
 * @param content The content string
 * @returns The hash as a hex string
 */
export function computeContentHash(content: string): `0x${string}` {
  return keccak256(encodeAbiParameters([{ type: 'string' }], [content]));
}

/**
 * Validates a record ID string
 * @param recordId The record ID string to validate
 * @returns True if the record ID is valid
 */
export function isValidRecordId(recordId: string): boolean {
  // Record ID should not be empty and should be alphanumeric
  return Boolean(recordId && recordId.trim().length > 0 && /^[a-zA-Z0-9-_.:]+$/.test(recordId));
}

/**
 * Validates content hash
 * @param contentHash The content hash to validate
 * @returns True if the content hash is valid
 */
export function isValidContentHash(contentHash: string): boolean {
  // Content hash should be a valid hex string starting with 0x and having 66 characters (0x + 64 hex chars)
  return Boolean(
    contentHash && contentHash.startsWith('0x') && contentHash.length === 66 && /^0x[0-9a-fA-F]+$/.test(contentHash)
  );
}

/**
 * Validates a CID string
 * @param cid The CID string to validate
 * @returns True if the CID is valid
 */
export function isValidCid(cid: string): boolean {
  // Simple validation for IPFS CID format
  return Boolean(cid && cid.trim().length > 0);
}

/**
 * Prepares data for registering a record
 * @param recordId The record ID string
 * @param cid The IPFS CID
 * @param content The content string (or JSON stringified content)
 * @param resourceType The resource type
 * @param dataSize The data size in bytes
 * @param producer The producer's address
 * @returns The prepared parameters for registerRecord
 */
export function prepareRegisterRecordParams(
  recordId: string,
  cid: string,
  content: string,
  resourceType: ResourceType,
  dataSize: number,
  producer: Address
): RegisterRecordParams {
  if (!isValidRecordId(recordId)) {
    throw new Error('Invalid record ID');
  }

  if (!isValidCid(cid)) {
    throw new Error('Invalid CID');
  }

  const contentHash = computeContentHash(content);

  return {
    recordId,
    cid,
    contentHash,
    resourceType,
    dataSize: Math.max(0, Math.min(16777215, Math.floor(dataSize))), // Ensure dataSize is within uint24 range
    producer,
  };
}

/**
 * Prepares data for updating a record
 * @param recordId The record ID string
 * @param cid The IPFS CID
 * @param content The content string (or JSON stringified content)
 * @returns The prepared parameters for updateRecord
 */
export function prepareUpdateRecordParams(recordId: string, cid: string, content: string): UpdateRecordParams {
  if (!isValidRecordId(recordId)) {
    throw new Error('Invalid record ID');
  }

  if (!isValidCid(cid)) {
    throw new Error('Invalid CID');
  }

  const contentHash = computeContentHash(content);

  return {
    recordId,
    cid,
    contentHash,
  };
}

/**
 * Prepares data for sharing data
 * @param recordId The record ID string
 * @param consumerAddress The consumer's address
 * @param accessDuration The access duration in seconds
 * @returns The prepared parameters for shareData
 */
export function prepareShareDataParams(
  recordId: string,
  consumerAddress: Address,
  accessDuration: number
): ShareDataParams {
  if (!isValidRecordId(recordId)) {
    throw new Error('Invalid record ID');
  }

  // Ensure accessDuration is within a reasonable range (e.g., 1 hour to 365 days)
  const minDuration = 60 * 60; // 1 hour
  const maxDuration = 60 * 60 * 24 * 365; // 365 days

  if (accessDuration < minDuration || accessDuration > maxDuration) {
    throw new Error(`Access duration must be between ${minDuration} and ${maxDuration} seconds`);
  }

  return {
    recordId,
    consumerAddress,
    accessDuration,
  };
}

/**
 * Validates the record status enum value
 * @param status The status value
 * @returns True if the status is valid
 */
export function isValidRecordStatus(status: number): boolean {
  return status >= 0 && status <= 3; // RecordStatus enum has 4 values (0-3)
}

/**
 * Validates the consent status enum value
 * @param status The status value
 * @returns True if the status is valid
 */
export function isValidConsentStatus(status: number): boolean {
  return status >= 0 && status <= 2; // ConsentStatus enum has 3 values (0-2)
}

/**
 * Validates the access level enum value
 * @param level The access level value
 * @returns True if the access level is valid
 */
export function isValidAccessLevel(level: number): boolean {
  return level >= 0 && level <= 1; // AccessLevel enum has 2 values (0-1): Read and Write
}

/**
 * Validates the resource type enum value
 * @param type The resource type value
 * @returns True if the resource type is valid
 */
export function isValidResourceType(type: number): boolean {
  return type >= 0 && type <= 14; // ResourceType enum has 15 values (0-14)
}

/**
 * Formats a timestamp in seconds to a human-readable date string
 * @param timestamp The timestamp in seconds
 * @returns A formatted date string
 */
export function formatTimestamp(timestamp: number): string {
  if (!timestamp) return 'N/A';

  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
}

/**
 * Returns whether an access has expired
 * @param expiration The expiration timestamp in seconds
 * @returns True if the access has expired
 */
export function isAccessExpired(expiration: number): boolean {
  if (!expiration) return true;

  const now = Math.floor(Date.now() / 1000);
  return expiration < now;
}

/**
 * Formats a data size in bytes to a human-readable string
 * @param bytes The size in bytes
 * @returns A formatted string with appropriate units (B, KB, MB)
 */
export function formatDataSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

/**
 * Gets the current timestamp in seconds
 * @returns The current Unix timestamp in seconds
 */
export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Helper function to get the contract-expected recordId hash from a string
 * @param recordId The string record ID
 * @returns The keccak256 hash of the record ID string
 */
export function getRecordIdHash(recordId: string): `0x${string}` {
  // Use the proper keccak256 function from viem
  return computeRecordIdHash(recordId);
}

/**
 * validate valid cid
 * @param cid The cid to validate
 * @returns True if the cid is valid
 *
 * looks like this:
 * bafkreih5aznjvttude6c3wbvqeebb6rlx5wkbzyppv7garjiubll2ceym4, bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku
 */
export function validateCid(cid: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{59}$/.test(cid);
}
