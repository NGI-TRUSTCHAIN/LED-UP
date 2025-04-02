import { type Abi, type Address } from 'viem';

export * from './contract';
export * from './fhir';

/**
 * Supported contract names in the system
 */
export enum ContractName {
  DataRegistry = 'DataRegistry',
  Compensation = 'Compensation',
  DidIssuer = 'DidIssuer',
  DidVerifier = 'DidVerifier',
  Token = 'Token',
  DidRegistry = 'DidRegistry',
  DidAuth = 'DidAuth',
  DidAccessControl = 'DidAccessControl',
  ConsentManagement = 'ConsentManagement',
}

/**
 * Generic contract interaction options
 */
export interface ContractInteractionOptions {
  contractName?: ContractName;
  revalidatePath?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

/**
 * Represents the data needed to prepare a contract write request
 */
export interface ContractWriteRequest {
  contractAddress: Address;
  abi: Abi;
  functionName: string;
  args: unknown[];
}

/**
 * Represents the response from a contract write preparation
 */
export interface ContractWriteResponse {
  success: boolean;
  error?: string;
  request?: ContractWriteRequest;
}

/**
 * Represents the response from a contract read operation
 */
export interface ContractReadResponse<T = any> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Represents a transaction result
 */
export interface TransactionResult {
  hash: `0x${string}`;
  events?: any[];
}

/**
 * Enum representing resource types in the system
 * @dev Matches the contract's ResourceType enum
 */
export enum ResourceType {
  Patient = 0,
  Observation = 1,
  Condition = 2,
  Procedure = 3,
  Encounter = 4,
  Medication = 5,
  MedicationStatement = 6,
  MedicationRequest = 7,
  DiagnosticReport = 8,
  Immunization = 9,
  AllergyIntolerance = 10,
  CarePlan = 11,
  CareTeam = 12,
  Basic = 13,
  Other = 14,
}

/**
 * Enum representing the status of a record
 * @dev Matches the contract's RecordStatus enum
 */
export enum RecordStatus {
  Inactive = 0,
  Active = 1,
  Suspended = 2,
  Deleted = 3,
}

/**
 * Enum representing the consent status of a record
 * @dev Matches the contract's ConsentStatus enum
 */
export enum ConsentStatus {
  NotSet = 0,
  Allowed = 1,
  Denied = 2,
}

/**
 * Enum representing the access level for data
 * @dev Matches the contract's AccessLevel enum
 */
export enum AccessLevel {
  None = 0,
  Read = 1,
  Write = 2,
}

/**
 * Interface for producer metadata
 * @dev Matches the contract's ProducerMetadata struct
 */
export interface ProducerMetadata {
  did: string;
  consent: ConsentStatus;
  entries: number;
  isActive: boolean;
  lastUpdated: number;
  nonce: number;
}

/**
 * Interface for record metadata
 */
export interface RecordMetadata {
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
 * Resource metadata as returned by the smart contract
 * @dev Matches the contract's ResourceMetadata struct
 */
export interface ResourceMetadata {
  resourceType: ResourceType;
  recordId: string;
  producer: Address; // Added to match contract
  sharedCount?: number;
  updatedAt?: number;
  dataSize: number;
  contentHash: `0x${string}`;
  cid: string;
}

/**
 * Interface for access permission
 * @dev Matches the contract's AccessPermission struct
 */
export interface AccessPermission {
  expiration: number;
  isRevoked: boolean;
  accessLevel: AccessLevel;
}

/**
 * Interface for health record
 */
export interface HealthRecord {
  recordId: string;
  resourceType: ResourceType;
  producer: Address; // Added to match contract
  cid: string;
  contentHash: `0x${string}`;
  dataSize: number;
  isVerified: boolean;
  updatedAt: number;
  sharedCount: number;

  url?: string; // URL for the IPFS content
  hash?: string; // Hash for verification
  signature?: string; // Signature for verification
  ipfsData?: any; // Any structured data from IPFS
  ipfsMetadata?: {
    // Metadata from IPFS
    created?: string;
    modified?: string;
    size?: number;
    [key: string]: any;
  };
}

/**
 * Interface for producer registration parameters
 */
export interface ProducerRegistrationParam {
  status: RecordStatus;
  consent: ConsentStatus;
}

/**
 * Interface for record registration parameters
 */
export interface RecordRegistrationParam {
  recordId: string;
  cid: string;
  contentHash: `0x${string}`;
  resourceType: ResourceType;
  dataSize: number;
  producer: Address;
}

/**
 * Interface for producer records response
 */
export interface ProducerRecordsResponse {
  recordIds: string[];
  healthRecords: HealthRecord[];
  metadata: ProducerMetadata;
}

/**
 * Record info as returned by the smart contract
 * @dev Matches the getRecordInfo function return type
 */
export type RecordInfoResult = [Address, ResourceMetadata] & {
  producer: Address;
  metadata: ResourceMetadata;
};

/**
 * Access check result from the smart contract
 * @dev Matches the checkAccess function return type
 */
export interface AccessCheckResult {
  hasAccess: boolean;
  expiration: number;
  accessLevel: AccessLevel;
  isRevoked: boolean;
}

export * from './fhir';
export * from './contract';
