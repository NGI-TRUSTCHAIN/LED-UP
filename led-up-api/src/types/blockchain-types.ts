/**
 * This file contains TypeScript type definitions for interacting with the blockchain
 * based on the smart contracts in the system.
 */

import { AddressLike } from 'ethers';

/**
 * Represents metadata for an entity.
 */
export interface Metadata {
  /** The URL of the metadata. */
  url: string;
  /** The hash of the metadata for integrity verification. */
  hash: string; // bytes32 in Solidity is represented as a string in TypeScript
}

/**
 * Represents the metadata of a record.
 */
export interface RecordMetadata {
  /** The content identifier of the metadata (e.g., IPFS CID). */
  cid: string;
  /** The FHIR URL of the metadata. */
  url: string;
  /** The hash of the encrypted metadata stored in the CID URL. */
  hash: string;
}

/**
 * Represents a schema that references metadata.
 */
export interface Schema {
  /** The metadata that defines the schema. */
  schemaRef: Metadata;
}

/**
 * Defines possible statuses of a record.
 */
export enum RecordStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  ERROR = 'ERROR',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Defines possible consent statuses.
 */
export enum ConsentStatus {
  ALLOWED = 'Allowed',
  DENIED = 'Denied',
  PENDING = 'Pending',
}

/**
 * Represents a record of patient data.
 */
export interface PatientRecord {
  /** The signature of the patient for verification purposes. */
  signature: string; // bytes in Solidity is represented as a string in TypeScript
  /** The type of resource represented by the record. */
  resourceType: string;
  /** Metadata associated with the record. */
  metadata: RecordMetadata;
}

/**
 * Represents information about a specific record.
 */
export interface RecordInfo {
  /** The address of the producer associated with the record. */
  producer: string; // address in Solidity is represented as a string in TypeScript
  /** The status of the record. */
  status: RecordStatus;
  /** The consent status related to the record. */
  consent: ConsentStatus;
  /** A unique identifier for the record to prevent replay attacks. */
  nonce: number;
}

/**
 * Represents a producer's records.
 */
export interface ProducerRecord {
  /** The address of the producer. */
  producer: string;
  /** The current status of the producer's records. */
  status: RecordStatus;
  /** The consent status of the producer. */
  consent: ConsentStatus;
  /** A mapping of record identifiers to their respective records. */
  records: Record<string, PatientRecord>;
  /** A unique identifier for the producer's records to prevent replay attacks. */
  nonce: number;
  /** An array of record identifiers. */
  recordIds: string[];
}

/**
 * Represents an ERC20 token interface.
 */
export type IERC20 = AddressLike;

/**
 * Represents payment details.
 */
export interface Payment {
  /** The amount associated with the payment. */
  amount: number;
  /** The payment status. */
  isPayed: boolean;
}

/**
 * Represents DID Authentication AddressParam.
 */
export type DidAuth = AddressLike;

/**
 * Represents the Compensation contract state.
 */
export interface CompensationContractState {
  /** The ERC20 token used in the contract. */
  token: IERC20;
  /** The payable address for the Levea wallet. */
  leveaWallet: string;
  /** The service fee percentage. */
  serviceFeePercent: number;
  /** The minimum withdrawable amount. */
  minimumWithdrawAmount: number;
  /** The unit price of the token. */
  unitPrice: number;
  /** The service fee balance. */
  serviceFeeBalance: number;
  /** Mapping of producer balances. */
  producerBalances: Record<string, number>;
  /** Mapping of record IDs to payment details. */
  payments: Record<string, Payment>;
  /** DID Authentication instance. */
  didAuth: DidAuth;
  /** Mapping of producer addresses to their DIDs. */
  producerDids: Record<string, string>;
  /** Mapping of consumer addresses to their DIDs. */
  consumerDids: Record<string, string>;
}

/**
 * Represents the Data Registry contract state.
 */
export interface DataRegistryContractState {
  /** The DID authentication instance. */
  didAuth: DidAuth;
  /** The ERC20 token used in the contract. */
  token: IERC20;
  /** The compensation contract instance. */
  compensation: AddressLike;
  /** The payable address for the Levea wallet. */
  leveaWallet: AddressLike;
  /** The total count of records in the registry. */
  recordCount: number;
  /** The provider metadata. */
  providerMetadata: Metadata;
  /** The record schema. */
  recordSchema: Metadata;
  /** The service fee balance. */
  serviceFeeBalance: number;
  /** Mapping of producer balances. */
  producerBalances: Record<string, number>;
  /** Mapping of record IDs to payment details. */
  payments: Record<string, Payment>;
  /** Mapping of producer addresses to their DIDs. */
  producerDids: Record<string, string>;
  /** Mapping of consumer addresses to their DIDs. */
  consumerDids: Record<string, string>;
  /** Mapping of producer addresses to their records. */
  records: Record<string, DataRecordCore>;
  /** Mapping of producer addresses to their record IDs. */
  ids: Record<string, string[]>;
  /** Mapping of producer addresses to their health records. */
  healthRecords: Record<string, Record<string, HealthRecord>>;
  /** Mapping of record IDs to authorized consumers. */
  authorizedConsumers: Record<string, Record<string, boolean>>;
  /** Mapping of DIDs to Ethereum addresses. */
  didToAddress: Record<string, string>;
}

/**
 * Core record data - main properties from DataRegistry contract
 */
export interface DataRecordCore {
  /** The DID of the owner. */
  ownerDid: string;
  /** The address of the producer. */
  producer: string;
  /** The status of the record. */
  status: RecordStatus;
  /** The consent status of the record. */
  consent: ConsentStatus;
  /** Whether the record is active. */
  isActive: boolean;
  /** When the record was last updated. */
  updatedAt: number;
  /** A unique identifier for the record to prevent replay attacks. */
  nonce: number;
}

/**
 * Health record data from DataRegistry contract
 */
export interface HealthRecord {
  /** The signature for verification purposes. */
  signature: string;
  /** The type of resource represented by the record. */
  resourceType: string;
  /** The content identifier of the metadata. */
  cid: string;
  /** The URL of the metadata. */
  url: string;
  /** The hash of the metadata. */
  hash: string;
  /** Whether the record has been verified. */
  isVerified: boolean;
}

/**
 * Represents the ConsentManagement contract's consent structure
 */
export interface Consent {
  /** The DID of the producer. */
  producerDid: string;
  /** The DID of the provider. */
  providerDid: string;
  /** The status of the consent. */
  status: ConsentManagementStatus;
  /** When the consent was last updated. */
  timestamp: number;
  /** When the consent expires (0 means no expiry). */
  expiryTime: number;
  /** The purpose for which consent is granted. */
  purpose: string;
}

/**
 * Enum for ConsentManagement contract's consent status
 */
export enum ConsentManagementStatus {
  NotSet = 0,
  Granted = 1,
  Revoked = 2,
}

/**
 * Parameters for granting consent
 */
export interface GrantConsentParams {
  /** The DID of the provider receiving consent. */
  providerDid: string;
  /** The purpose for which consent is granted. */
  purpose: string;
  /** Optional timestamp when consent expires (0 for no expiry). */
  expiryTime: number;
}

/**
 * Parameters for revoking consent
 */
export interface RevokeConsentParams {
  /** The DID of the provider. */
  providerDid: string;
  /** The reason for revoking consent. */
  reason: string;
}

/**
 * Parameters for querying consent
 */
export interface QueryConsentParams {
  /** The DID of the producer. */
  producerDid: string;
  /** The DID of the provider. */
  providerDid: string;
}

/**
 * Result of querying consent
 */
export interface QueryConsentResult {
  /** The status of the consent. */
  status: ConsentManagementStatus;
  /** When the consent was last updated. */
  timestamp: number;
  /** The purpose for which consent was granted. */
  purpose: string;
}

/**
 * Parameters for checking if valid consent exists
 */
export interface HasValidConsentParams {
  /** The DID of the producer. */
  producerDid: string;
  /** The DID of the provider. */
  providerDid: string;
}

/**
 * Represents the DidAccessControl contract's role definitions
 */
export interface DidRoles {
  /** The admin role. */
  ADMIN: string;
  /** The operator role. */
  OPERATOR: string;
}

/**
 * Parameters for setting role requirements
 */
export interface SetRoleRequirementParams {
  /** The role to set requirements for. */
  role: string;
  /** The required DID attribute/credential. */
  requirement: string;
}

/**
 * Parameters for granting a role to a DID
 */
export interface GrantDidRoleParams {
  /** The DID to grant the role to. */
  did: string;
  /** The role to grant. */
  role: string;
}

/**
 * Parameters for revoking a role from a DID
 */
export interface RevokeDidRoleParams {
  /** The DID to revoke the role from. */
  did: string;
  /** The role to revoke. */
  role: string;
}

/**
 * Parameters for checking if a DID has a specific role
 */
export interface HasDidRoleParams {
  /** The DID to check. */
  did: string;
  /** The role to check for. */
  role: string;
}

/**
 * Parameters for getting the requirement for a specific role
 */
export interface GetRoleRequirementParams {
  /** The role to get requirements for. */
  role: string;
}

/**
 * Represents the DidAuth contract's role definitions
 */
export interface DidAuthRoles {
  /** The producer role. */
  PRODUCER_ROLE: string;
  /** The consumer role. */
  CONSUMER_ROLE: string;
  /** The service provider role. */
  SERVICE_PROVIDER_ROLE: string;
}

/**
 * Represents the DidAuth contract's credential type definitions
 */
export interface DidAuthCredentials {
  /** The producer credential. */
  PRODUCER_CREDENTIAL: string;
  /** The consumer credential. */
  CONSUMER_CREDENTIAL: string;
  /** The service provider credential. */
  SERVICE_PROVIDER_CREDENTIAL: string;
}

/**
 * Parameters for authenticating a DID
 */
export interface AuthenticateParams {
  /** The DID to authenticate. */
  did: string;
  /** The role to verify. */
  role: string;
}

/**
 * Parameters for getting the DID for an address
 */
export interface GetDidParams {
  /** The address to get the DID for. */
  address: string;
}

/**
 * Parameters for getting the required credential for a role
 */
export interface GetRequiredCredentialForRoleParams {
  /** The role to get credential for. */
  role: string;
}

/**
 * Parameters for verifying credentials for a specific action
 */
export interface VerifyCredentialForActionParams {
  /** The DID to verify. */
  did: string;
  /** The type of credential required. */
  credentialType: string;
  /** The unique identifier of the credential. */
  credentialId: string;
}

/**
 * Parameters for checking if a DID has multiple required roles and credentials
 */
export interface HasRequiredRolesAndCredentialsParams {
  /** The DID to check. */
  did: string;
  /** The roles to check for. */
  roles: string[];
  /** The credential IDs to check. */
  credentialIds: string[];
}

/**
 * Parameters for issuing a credential
 */
export interface IssueCredentialParams {
  /** The type of credential being issued. */
  credentialType: string;
  /** The DID of the subject. */
  subject: string;
  /** Unique identifier for the credential. */
  credentialId: string;
}

/**
 * Parameters for checking if a credential is valid
 */
export interface IsCredentialValidParams {
  /** The unique identifier of the credential. */
  credentialId: string;
}

/**
 * Parameters for setting issuer trust status
 */
export interface SetIssuerTrustStatusParams {
  /** The type of credential. */
  credentialType: string;
  /** The DID or address of the issuer. */
  issuer: string;
  /** Boolean indicating if the issuer should be trusted. */
  trusted: boolean;
}

/**
 * Parameters for checking if an issuer is trusted
 */
export interface IsIssuerTrustedParams {
  /** The type of credential. */
  credentialType: string;
  /** The address of the issuer. */
  issuer: string;
}

/**
 * Parameters for verifying a credential
 */
export interface VerifyCredentialParams {
  /** The type of credential. */
  credentialType: string;
  /** The address of the issuer. */
  issuer: string;
  /** The DID of the subject. */
  subject: string;
}

/**
 * Parameters for processing payment in the Compensation contract
 */
export interface ProcessPaymentParams {
  /** The address of the producer. */
  producer: string;
  /** The record ID. */
  recordId: string;
  /** The size of the data. */
  dataSize: number;
  /** The DID of the consumer. */
  consumerDid: string;
}

/**
 * Parameters for verifying payment
 */
export interface VerifyPaymentParams {
  /** The record ID. */
  recordId: string;
}

/**
 * Parameters for withdrawing producer balance
 */
export interface WithdrawProducerBalanceParams {
  /** The amount to withdraw. */
  amount: number;
}

/**
 * Parameters for withdrawing service fee
 */
export interface WithdrawServiceFeeParams {
  /** The amount to withdraw. */
  amount: number;
}

/**
 * Parameters for removing a producer
 */
export interface RemoveProducerParams {
  /** The address of the producer. */
  producer: string;
}

/**
 * Parameters for changing service fee
 */
export interface ChangeServiceFeeParams {
  /** The new service fee percentage. */
  newServiceFee: number;
}

/**
 * Parameters for changing unit price
 */
export interface ChangeUnitPriceParams {
  /** The new unit price. */
  newUnitPrice: number;
}

/**
 * Parameters for setting minimum withdraw amount
 */
export interface SetMinimumWithdrawAmountParams {
  /** The new minimum withdraw amount. */
  amount: number;
}

/**
 * Parameters for changing token address
 */
export interface ChangeTokenAddressParams {
  /** The new token address. */
  tokenAddress: string;
}

/**
 * Parameters for registering a producer
 */
export interface RegisterProducerParams {
  /** The address of the producer. */
  producer: string;
  /** The DID of the producer. */
  did: string;
}

/**
 * Parameters for registering a consumer
 */
export interface RegisterConsumerParams {
  /** The address of the consumer. */
  consumer: string;
  /** The DID of the consumer. */
  did: string;
}

/**
 * Parameters for updating DidAuth address
 */
export interface UpdateDidAuthAddressParams {
  /** The new DidAuth contract address. */
  didAuthAddress: string;
}

/**
 * Parameters for registering a producer record
 */
export interface RegisterProducerRecordParams {
  /** The DID of the owner. */
  ownerDid: string;
  /** The record ID. */
  recordId: string;
  /** The address of the producer. */
  producer: string;
  /** The signature of the producer. */
  signature: string;
  /** The resource type. */
  resourceType: string;
  /** The consent status. */
  consent: ConsentStatus;
  /** The metadata of the record. */
  metadata: RecordMetadata;
}

/**
 * Parameters for updating a producer record
 */
export interface UpdateProducerRecordParams {
  /** The record ID. */
  recordId: string;
  /** The address of the producer. */
  producer: string;
  /** The signature of the producer. */
  signature: string;
  /** The resource type. */
  resourceType: string;
  /** The status of the record. */
  status: RecordStatus;
  /** The consent status. */
  consent: ConsentStatus;
  /** The metadata of the record. */
  recordMetadata: RecordMetadata;
  /** The DID of the updater. */
  updaterDid: string;
}

/**
 * Parameters for sharing data
 */
export interface ShareDataParams {
  /** The record ID. */
  recordId: string;
  /** The DID of the consumer. */
  consumerDid: string;
  /** The DID of the owner. */
  ownerDid: string;
}

/**
 * Parameters for verifying data
 */
export interface VerifyDataParams {
  /** The record ID. */
  recordId: string;
  /** The DID of the verifier. */
  verifierDid: string;
}

/**
 * Parameters for updating producer record metadata
 */
export interface UpdateProducerRecordMetadataParams {
  /** The address of the producer. */
  producer: string;
  /** The record ID. */
  recordId: string;
  /** The metadata of the record. */
  metadata: RecordMetadata;
}

/**
 * Parameters for updating producer record status
 */
export interface UpdateProducerRecordStatusParams {
  /** The address of the producer. */
  producer: string;
  /** The new status. */
  status: RecordStatus;
}

/**
 * Parameters for updating producer consent
 */
export interface UpdateProducerConsentParams {
  /** The address of the producer. */
  producer: string;
  /** The new consent status. */
  status: ConsentStatus;
}

/**
 * Parameters for updating provider metadata
 */
export interface UpdateProviderMetadataParams {
  /** The new metadata. */
  metadata: Metadata;
}

/**
 * Parameters for updating provider record schema
 */
export interface UpdateProviderRecordSchemaParams {
  /** The new schema reference. */
  schemaRef: Schema;
}

/**
 * Parameters for changing pause state
 */
export interface ChangePauseStateParams {
  /** The new pause state. */
  pause: boolean;
}

/**
 * Parameters for getting producer record info
 */
export interface GetProducerRecordInfoParams {
  /** The address of the producer. */
  producer: string;
}

/**
 * Parameters for getting record CID
 */
export interface GetRecordCidParams {
  /** The record ID. */
  recordId: string;
  /** The DID of the requester. */
  requesterDid: string;
}

/**
 * Parameters for getting producer record
 */
export interface GetProducerRecordParams {
  /** The address of the producer. */
  producer: string;
  /** The record ID. */
  recordId: string;
}

/**
 * Parameters for getting producer records
 */
export interface GetProducerRecordsParams {
  /** The address of the producer. */
  producer: string;
}

/**
 * Result of getting producer records
 */
export interface GetProducerRecordsResult {
  /** The status of the records. */
  status: RecordStatus;
  /** The consent status of the records. */
  consentStatus: ConsentStatus;
  /** The records. */
  records: HealthRecord[];
  /** The record IDs. */
  recordIds: string[];
  /** The nonce. */
  nonce: number;
}

/**
 * Parameters for getting producer consent
 */
export interface GetProducerConsentParams {
  /** The address of the producer. */
  address: string;
}

/**
 * Parameters for getting producer record count
 */
export interface GetProducerRecordCountParams {
  /** The address of the producer. */
  producer: string;
}

/**
 * Parameters for getting producer record status
 */
export interface GetProducerRecordStatusParams {
  /** The address of the producer. */
  producer: string;
}

/**
 * Parameters for checking if producer exists
 */
export interface ProducerExistsParams {
  /** The address of the producer. */
  producer: string;
}
