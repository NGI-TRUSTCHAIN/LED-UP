import { Address } from 'viem';

export enum ResourceType {
  Patient,
  Observation,
  Condition,
  Procedure,
  Encounter,
  Medication,
  MedicationStatement,
  MedicationRequest,
  DiagnosticReport,
  Immunization,
  AllergyIntolerance,
  CarePlan,
  CareTeam,
  Basic,
  Other,
}

export enum RecordStatus {
  Inactive,
  Active,
  Suspended,
  Deleted,
}

export enum ConsentStatus {
  NotSet,
  Allowed,
  Denied,
}

export enum AccessLevel {
  None,
  Read,
  Write,
}

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

export interface ProducerMetadata {
  did: string;
  consent: ConsentStatus;
  entries: number;
  isActive: boolean;
  lastUpdated: number;
  nonce: number;
  version: number;
}

export interface AccessPermission {
  expiration: number;
  isRevoked: boolean;
  accessLevel: AccessLevel;
}

export interface DataRegistryContract {
  // View Functions
  getProducerMetadata(producer: Address): Promise<ProducerMetadata>;
  getProducerRecords(producer: Address): Promise<string[]>;
  getRecordInfo(recordId: string): Promise<[Address, ResourceMetadata]>;
  getTotalRecords(): Promise<bigint>;
  isRecordVerified(recordId: string): Promise<boolean>;
  isAuthorizedProvider(provider: Address, recordId: string): Promise<boolean>;
  getCompensationAddress(): Promise<Address>;

  // Write Functions
  registerProducer(status: RecordStatus, consent: ConsentStatus): Promise<void>;
  registerRecord(
    recordId: string,
    cid: string,
    contentHash: `0x${string}`,
    resourceType: ResourceType,
    dataSize: number
  ): Promise<void>;
  updateRecord(recordId: string, cid: string, contentHash: `0x${string}`): Promise<void>;
  shareData(recordId: string, consumerAddress: Address, accessDuration: number): Promise<void>;
  shareToProvider(recordId: string, provider: Address, accessDuration: number, accessLevel: AccessLevel): Promise<void>;
  revokeAccess(recordId: string, consumerAddress: Address): Promise<void>;
  verifyRecord(recordId: string): Promise<void>;
  updateProducerConsent(producer: Address, consentStatus: ConsentStatus): Promise<void>;
}

// Contract Events
export type RecordRegisteredEvent = {
  recordId: string;
  did: string;
  cid: string;
  contentHash: `0x${string}`;
  provider: Address;
};

export type RecordUpdatedEvent = {
  recordId: string;
  cid: string;
  contentHash: `0x${string}`;
  provider: Address;
};

export type AccessGrantedEvent = {
  recordId: string;
  consumer: Address;
  consumerDid: string;
  expiration: number;
  accessLevel: AccessLevel;
};

export type AccessRevokedEvent = {
  recordId: string;
  consumer: Address;
  consumerDid: string;
  revoker: Address;
};
