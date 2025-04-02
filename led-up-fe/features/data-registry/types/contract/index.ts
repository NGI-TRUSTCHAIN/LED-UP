import { type Address } from 'viem';
import { AccessLevel, RecordStatus, ResourceType, ConsentStatus } from '..';

export interface HealthRecord {
  recordId: string;
  producer: `0x${string}`;
  resourceType: ResourceType;
  sharedCount: number;
  updatedAt: number;
  dataSize: number;
  contentHash: string;
  cid: string;
  status: RecordStatus;
}

export interface RegisterProducerInput {
  status: RecordStatus;
  consent: ConsentStatus;
}

/**
 * Response from producer metadata query
 * @dev Matches the getProducerMetadata function return type
 */
export interface ProducerMetadataResponse {
  did: string;
  consent: ConsentStatus;
  entries: number;
  isActive: boolean;
  lastUpdated: number;
  nonce: number;
  version?: number;
}

/**
 * Resource metadata from the contract
 * @dev Matches the ResourceMetadata struct in the contract
 */
export interface ResourceMetadata {
  resourceType: ResourceType;
  recordId: string;
  producer: Address;
  sharedCount: number;
  updatedAt: number;
  dataSize: number;
  contentHash: `0x${string}`;
  cid: string;
}

/**
 * Response from record info query
 * @dev Matches the getRecordInfo function return type
 */
export interface RecordInfoResponse {
  isVerified: boolean;
  producer: Address;
  metadata: ResourceMetadata;
}

export interface RecordInfoResponse {
  producer: `0x${string}`;
  did: string;
  consent: ConsentStatus;
  entries: number;
  isActive: boolean;
  lastUpdated: number;
  nonce: number;
  version: number;
}

/**
 * Response from producer records query
 * @dev Matches the getProducerRecords function return type
 */
export interface ProducerRecordsResponse {
  recordIds: string[];
  healthRecords: Array<{
    recordId: string;
    resourceType: ResourceType;
    producer: Address;
    cid: string;
    contentHash: `0x${string}`;
    dataSize: number;
    isVerified: boolean;
    updatedAt: number;
    sharedCount: number;
  }>;
  metadata: ProducerMetadataResponse;
  total: number;
}

/**
 * Response from access check query
 * @dev Matches the checkAccess function return type
 */
export interface CheckAccessResponse {
  hasAccess: boolean;
  expiration: number;
  accessLevel: AccessLevel;
  isRevoked: boolean;
}

/**
 * Parameters for registering a producer
 * @dev Matches the registerProducer function parameters
 */
export interface RegisterProducerInput {
  status: RecordStatus;
  consent: ConsentStatus;
}

/**
 * Parameters for registering a record
 * @dev Matches the registerRecord function parameters
 */
export interface RegisterRecordInput {
  producer: Address;
  recordId: string;
  cid: string;
  contentHash: `0x${string}`;
  resourceType: ResourceType;
  dataSize: number;
}

/**
 * Parameters for updating a record
 * @dev Matches the updateRecord function parameters
 */
export interface UpdateRecordInput {
  recordId: string;
  cid: string;
  contentHash: `0x${string}`;
}

/**
 * Parameters for sharing data
 * @dev Matches the shareData function parameters
 */
export interface ShareDataInput {
  recordId: string;
  consumerAddress: Address;
  accessDuration: number;
}

/**
 * Parameters for sharing data with a provider
 * @dev Matches the shareToProvider function parameters
 */
export interface ShareToProviderInput {
  recordId: string;
  provider: Address;
  accessDuration: number;
  accessLevel: AccessLevel;
}

/**
 * Parameters for revoking access
 * @dev Matches the revokeAccess function parameters
 */
export interface RevokeAccessInput {
  recordId: string;
  consumerAddress: Address;
}

/**
 * Response type for consumer access to a record
 */
export interface RecordConsumerResponse {
  consumerAddress: `0x${string}`;
  accessLevel: AccessLevel;
  expiration: number;
  isRevoked: boolean;
}

/**
 * Response type for records accessible by a consumer
 */
export interface ConsumerRecordResponse {
  recordId: string;
  producer: `0x${string}`;
  resourceType: ResourceType;
  accessLevel: AccessLevel;
  expiration: number;
  isRevoked: boolean;
}

/**
 * Response type for access history events
 */
export interface AccessHistoryEvent {
  consumer: `0x${string}`;
  timestamp: number;
  actionType: 'granted' | 'revoked' | 'triggered';
  blockNumber?: number;
  transactionHash?: `0x${string}`;
}

/**
 * Parameters for updating producer consent
 * @dev Matches the updateProducerConsent function parameters
 */
export interface UpdateProducerConsentInput {
  producer: Address;
  consentStatus: ConsentStatus;
}

/**
 * Parameters for verifying a record
 * @dev Matches the verifyRecord function parameters
 */
export interface VerifyRecordInput {
  recordId: string;
}

/**
 * Parameters for triggering access
 * @dev Matches the triggerAccess function parameters
 */
export interface TriggerAccessInput {
  recordId: string;
}

/**
 * Error response from the contract
 */
export interface ContractError {
  message: string;
  code: string;
}

/**
 * Parse error from the contract
 * @dev Matches all possible DataRegistry errors from the contract
 */
export function parseDataRegistryError(error: unknown): ContractError | null {
  if (!error || typeof error !== 'object') {
    return null;
  }

  const errorObj = error as { message?: string };
  if (!errorObj.message) {
    return null;
  }

  // Extract error code and message
  const match = errorObj.message.match(/DataRegistry__(\w+)/);
  if (!match) {
    return null;
  }

  const code = match[1];
  let message = '';

  switch (code) {
    case 'Unauthorized':
      message = 'Unauthorized access';
      break;
    case 'RecordNotFound':
      message = 'Record not found';
      break;
    case 'RecordAlreadyExists':
      message = 'Record already exists';
      break;
    case 'InvalidDID':
      message = 'Invalid DID';
      break;
    case 'AccessDenied':
      message = 'Access denied';
      break;
    case 'InvalidAccessDuration':
      message = 'Invalid access duration';
      break;
    case 'ExpiredAccess':
      message = 'Access has expired';
      break;
    case 'InvalidContentHash':
      message = 'Invalid content hash';
      break;
    case 'PaymentNotVerified':
      message = 'Payment not verified';
      break;
    case 'DidAuthNotInitialized':
      message = 'DID authentication not initialized';
      break;
    case 'InvalidDidAuthAddress':
      message = 'Invalid DID authentication address';
      break;
    case 'AlreadyRegistered':
      message = 'Producer already registered';
      break;
    case 'ConsentNotAllowed':
      message = 'Consent not allowed';
      break;
    default:
      message = 'Unknown error';
  }

  return {
    code,
    message,
  };
}

/**
 * Parameters for updating contract addresses
 */
export interface AddressUpdateInput {
  newAddress: Address;
}

export * from './did-auth';
export * from './compensation';
export * from './data-registry';
