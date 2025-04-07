/**
 * This file contains TypeScript type definitions for events emitted by the smart contracts.
 */

/**
 * Compensation contract events
 */

/**
 * Event emitted when a producer is removed
 */
export interface ProducerRemovedEvent {
  /** The address of the producer who was removed. */
  producer: string;
  /** The timestamp when the producer was removed. */
  timestamp: number;
}

/**
 * Event emitted when a producer is paid
 */
export interface ProducerPaidEvent {
  /** The address of the producer who was paid. */
  producer: string;
  /** The amount paid to the producer. */
  amount: number;
  /** The timestamp when the producer was paid. */
  timestamp: number;
}

/**
 * Event emitted when service fee is withdrawn
 */
export interface ServiceFeeWithdrawnEvent {
  /** The address of the wallet that received the service fee. */
  wallet: string;
  /** The amount of service fee withdrawn. */
  amount: number;
  /** The timestamp when the service fee was withdrawn. */
  timestamp: number;
}

/**
 * Event emitted when service fee is changed
 */
export interface ServiceFeeChangedEvent {
  /** The address of the initiator who changed the service fee. */
  initiator: string;
  /** The old service fee percentage. */
  oldServiceFee: number;
  /** The new service fee percentage. */
  newServiceFee: number;
}

/**
 * Event emitted when payment is processed
 */
export interface PaymentProcessedEvent {
  /** The address of the producer who received the payment. */
  producer: string;
  /** The address of the consumer who made the payment. */
  consumer: string;
  /** The amount of the payment. */
  amount: number;
  /** The service fee deducted from the payment. */
  serviceFee: number;
}

/**
 * Event emitted when unit price is changed
 */
export interface UnitPriceChangedEvent {
  /** The address of the initiator who changed the unit price. */
  initiator: string;
  /** The old unit price. */
  oldUnitPrice: number;
  /** The new unit price. */
  newUnitPrice: number;
}

/**
 * ConsentManagement contract events
 */

/**
 * Event emitted when consent is granted
 */
export interface ConsentGrantedEvent {
  /** The DID of the producer who granted consent. */
  producerDid: string;
  /** The DID of the provider who received consent. */
  providerDid: string;
  /** The purpose for which consent was granted. */
  purpose: string;
  /** The expiry time of the consent. */
  expiryTime: number;
}

/**
 * Event emitted when consent is revoked
 */
export interface ConsentRevokedEvent {
  /** The DID of the producer who revoked consent. */
  producerDid: string;
  /** The DID of the provider whose consent was revoked. */
  providerDid: string;
  /** The reason for revoking consent. */
  reason: string;
}

/**
 * DidAccessControl contract events
 */

/**
 * Event emitted when a role requirement is set
 */
export interface RoleRequirementSetEvent {
  /** The role for which the requirement was set. */
  role: string;
  /** The requirement that was set for the role. */
  requirement: string;
}

/**
 * Event emitted when a role is granted to a DID
 */
export interface DidRoleGrantedEvent {
  /** The DID that was granted the role. */
  did: string;
  /** The role that was granted. */
  role: string;
  /** The address of the grantor who granted the role. */
  grantor: string;
}

/**
 * Event emitted when a role is revoked from a DID
 */
export interface DidRoleRevokedEvent {
  /** The DID from which the role was revoked. */
  did: string;
  /** The role that was revoked. */
  role: string;
  /** The address of the revoker who revoked the role. */
  revoker: string;
}

/**
 * DidAuth contract events
 */

/**
 * Event emitted when authentication is successful
 */
export interface AuthenticationSuccessfulEvent {
  /** The DID that was authenticated. */
  did: string;
  /** The role that was verified. */
  role: string;
  /** The timestamp when authentication was successful. */
  timestamp: number;
}

/**
 * Event emitted when authentication fails
 */
export interface AuthenticationFailedEvent {
  /** The DID that failed authentication. */
  did: string;
  /** The role that was being verified. */
  role: string;
  /** The timestamp when authentication failed. */
  timestamp: number;
}

/**
 * Event emitted when a credential is verified
 */
export interface CredentialVerifiedEvent {
  /** The DID whose credential was verified. */
  did: string;
  /** The type of credential that was verified. */
  credentialType: string;
  /** The timestamp when the credential was verified. */
  timestamp: number;
}

/**
 * DidIssuer contract events
 */

/**
 * Event emitted when a credential is issued
 */
export interface CredentialIssuedEvent {
  /** The type of credential that was issued. */
  credentialType: string;
  /** The DID of the subject who received the credential. */
  subject: string;
  /** The unique identifier of the credential. */
  credentialId: string;
  /** The timestamp when the credential was issued. */
  timestamp: number;
}

/**
 * DidVerifier contract events
 */

/**
 * Event emitted when issuer trust status is updated
 */
export interface IssuerTrustStatusUpdatedEvent {
  /** The type of credential for which trust status was updated. */
  credentialType: string;
  /** The address of the issuer whose trust status was updated. */
  issuer: string;
  /** Whether the issuer is now trusted. */
  trusted: boolean;
}

/**
 * DataRegistry contract events
 */

/**
 * Event emitted when data is registered
 */
export interface DataRegisteredEvent {
  /** The unique identifier of the record. */
  recordId: string;
  /** The DID of the owner of the record. */
  ownerDid: string;
  /** The CID of the record. */
  cid: string;
  /** The hash of the record. */
  hash: string;
}

/**
 * Event emitted when data is updated
 */
export interface DataUpdatedEvent {
  /** The address of the producer who updated the data. */
  producer: string;
  /** The unique identifier of the record. */
  recordId: string;
  /** The CID of the updated record. */
  cid: string;
  /** The hash of the updated record. */
  hash: string;
}

/**
 * Event emitted when data is removed
 */
export interface DataRemovedEvent {
  /** The address of the producer whose data was removed. */
  producer: string;
  /** The unique identifier of the record that was removed. */
  recordId: string;
}

/**
 * Event emitted when data is deactivated
 */
export interface DataDeactivatedEvent {
  /** The unique identifier of the record that was deactivated. */
  recordId: string;
  /** The timestamp when the record was deactivated. */
  timestamp: number;
}

/**
 * Event emitted when a consumer is authorized
 */
export interface ConsumerAuthorizedEvent {
  /** The unique identifier of the record for which the consumer was authorized. */
  recordId: string;
  /** The DID of the owner of the record. */
  ownerDid: string;
  /** The DID of the consumer who was authorized. */
  consumerDid: string;
}

/**
 * Event emitted when a consumer is deauthorized
 */
export interface ConsumerDeauthorizedEvent {
  /** The unique identifier of the record for which the consumer was deauthorized. */
  recordId: string;
  /** The DID of the consumer who was deauthorized. */
  consumerDid: string;
}

/**
 * Event emitted when data is verified
 */
export interface DataVerifiedEvent {
  /** The unique identifier of the record that was verified. */
  recordId: string;
  /** The DID of the verifier who verified the data. */
  verifierDid: string;
}

/**
 * Event emitted when metadata is updated
 */
export interface MetadataUpdatedEvent {
  /** The URL of the updated metadata. */
  url: string;
  /** The hash of the updated metadata. */
  hash: string;
}

/**
 * Event emitted when provider schema is updated
 */
export interface ProviderSchemaUpdatedEvent {
  /** The URL of the updated schema. */
  url: string;
  /** The hash of the updated schema. */
  hash: string;
}

/**
 * Event emitted when provider metadata is updated
 */
export interface ProviderMetadataUpdatedEvent {
  /** The URL of the updated metadata. */
  url: string;
  /** The hash of the updated metadata. */
  hash: string;
}

/**
 * Event emitted when data is shared
 */
export interface DataSharedEvent {
  /** The address of the producer who shared the data. */
  producer: string;
  /** The address of the consumer who received the data. */
  consumer: string;
  /** The unique identifier of the record that was shared. */
  recordId: string;
  /** The CID of the shared record. */
  cid: string;
}

/**
 * Event emitted when token is updated
 */
export interface TokenUpdatedEvent {
  /** The old address of the token. */
  oldAddress: string;
  /** The new address of the token. */
  newAddress: string;
}

/**
 * Event emitted when access is not allowed
 */
export interface AccessNotAllowedEvent {
  /** The unique identifier of the record for which access was denied. */
  recordId: string;
  /** The DID of the consumer who was denied access. */
  consumerDid: string;
}

/**
 * Event emitted when sharing is not allowed
 */
export interface SharingNotAllowedEvent {
  /** The unique identifier of the record for which sharing was denied. */
  recordId: string;
  /** The DID of the producer who was denied sharing. */
  producerDid: string;
}

/**
 * Event emitted when token address is updated
 */
export interface TokenAddressUpdatedEvent {
  /** The new address of the token. */
  newAddress: string;
}

/**
 * Event emitted when pause state is updated
 */
export interface PauseStateUpdatedEvent {
  /** The address of the contract whose pause state was updated. */
  contractAddress: string;
  /** The address of the caller who updated the pause state. */
  caller: string;
  /** Whether the contract is now paused. */
  isPaused: boolean;
}

/**
 * Event emitted when producer consent is updated
 */
export interface ProducerConsentUpdatedEvent {
  /** The address of the producer whose consent was updated. */
  producer: string;
  /** The new consent status. */
  status: string;
}

/**
 * Event emitted when producer record status is updated
 */
export interface ProducerRecordStatusUpdatedEvent {
  /** The address of the producer whose record status was updated. */
  producer: string;
  /** The new record status. */
  status: string;
}

/**
 * Event emitted when producer record is updated
 */
export interface ProducerRecordUpdatedEvent {
  /** The address of the producer whose record was updated. */
  producer: string;
  /** The unique identifier of the record that was updated. */
  recordId: string;
  /** The CID of the updated record. */
  cid: string;
  /** The hash of the updated record. */
  hash: string;
}

/**
 * Event emitted when producer record is removed
 */
export interface ProducerRecordRemovedEvent {
  /** The address of the producer whose record was removed. */
  producer: string;
}
