import { type Address } from 'viem';

/**
 * Base interface for DataRegistry contract errors
 */
export interface DataRegistryError {
  name: string;
  message: string;
}

/**
 * Error thrown when a user is not authorized
 */
export interface UnauthorizedError extends DataRegistryError {
  name: 'DataRegistry__Unauthorized';
}

/**
 * Error thrown when a record is not found
 */
export interface RecordNotFoundError extends DataRegistryError {
  name: 'DataRegistry__RecordNotFound';
  recordId: `0x${string}`;
}

/**
 * Error thrown when a record already exists
 */
export interface RecordAlreadyExistsError extends DataRegistryError {
  name: 'DataRegistry__RecordAlreadyExists';
  recordId: `0x${string}`;
}

/**
 * Error thrown when an invalid DID is provided
 */
export interface InvalidDIDError extends DataRegistryError {
  name: 'DataRegistry__InvalidDID';
  did: string;
}

/**
 * Error thrown when access is denied
 */
export interface AccessDeniedError extends DataRegistryError {
  name: 'DataRegistry__AccessDenied';
  consumer: Address;
  recordId: `0x${string}`;
}

/**
 * Error thrown when an invalid access duration is provided
 */
export interface InvalidAccessDurationError extends DataRegistryError {
  name: 'DataRegistry__InvalidAccessDuration';
  provided: number;
  min: number;
  max: number;
}

/**
 * Error thrown when access has expired
 */
export interface ExpiredAccessError extends DataRegistryError {
  name: 'DataRegistry__ExpiredAccess';
  consumer: Address;
  recordId: `0x${string}`;
  expiration: number;
}

/**
 * Error thrown when an invalid content hash is provided
 */
export interface InvalidContentHashError extends DataRegistryError {
  name: 'DataRegistry__InvalidContentHash';
}

/**
 * Error thrown when payment is not verified
 */
export interface PaymentNotVerifiedError extends DataRegistryError {
  name: 'DataRegistry__PaymentNotVerified';
  recordId: string;
}

/**
 * Error thrown when DidAuth is not initialized
 */
export interface DidAuthNotInitializedError extends DataRegistryError {
  name: 'DataRegistry__DidAuthNotInitialized';
}

/**
 * Error thrown when an invalid DidAuth address is provided
 */
export interface InvalidDidAuthAddressError extends DataRegistryError {
  name: 'DataRegistry__InvalidDidAuthAddress';
}

/**
 * Error thrown when a producer is already registered
 */
export interface AlreadyRegisteredError extends DataRegistryError {
  name: 'DataRegistry__AlreadyRegistered';
  producer: Address;
}

/**
 * Error thrown when consent is not allowed
 */
export interface ConsentNotAllowedError extends DataRegistryError {
  name: 'DataRegistry__ConsentNotAllowed';
  recordId: `0x${string}`;
  producer: Address;
}

/**
 * Union type for all DataRegistry errors
 */
export type DataRegistryErrorType =
  | UnauthorizedError
  | RecordNotFoundError
  | RecordAlreadyExistsError
  | InvalidDIDError
  | AccessDeniedError
  | InvalidAccessDurationError
  | ExpiredAccessError
  | InvalidContentHashError
  | PaymentNotVerifiedError
  | DidAuthNotInitializedError
  | InvalidDidAuthAddressError
  | AlreadyRegisteredError
  | ConsentNotAllowedError;

/**
 * Error codes for the DataRegistry contract
 */
export enum DataRegistryErrorCode {
  Unauthorized = 'Unauthorized',
  RecordNotFound = 'RecordNotFound',
  RecordAlreadyExists = 'RecordAlreadyExists',
  InvalidDID = 'InvalidDID',
  AccessDenied = 'AccessDenied',
  InvalidAccessDuration = 'InvalidAccessDuration',
  ExpiredAccess = 'ExpiredAccess',
  InvalidContentHash = 'InvalidContentHash',
  PaymentNotVerified = 'PaymentNotVerified',
  DidAuthNotInitialized = 'DidAuthNotInitialized',
  InvalidDidAuthAddress = 'InvalidDidAuthAddress',
  AlreadyRegistered = 'AlreadyRegistered',
  ConsentNotAllowed = 'ConsentNotAllowed',
  InvalidRecordId = 'InvalidRecordId',
  InvalidCID = 'InvalidCID',
  InvalidResourceType = 'InvalidResourceType',
  InvalidDataSize = 'InvalidDataSize',
  InvalidConsumer = 'InvalidConsumer',
  InvalidProvider = 'InvalidProvider',
  InvalidStatus = 'InvalidStatus',
  InvalidConsent = 'InvalidConsent',
  InvalidSignature = 'InvalidSignature',
  InvalidMetadata = 'InvalidMetadata',
  InvalidVersion = 'InvalidVersion',
  InvalidTimestamp = 'InvalidTimestamp',
  InvalidExpiration = 'InvalidExpiration',
  InvalidAccessLevel = 'InvalidAccessLevel',
  InvalidPayment = 'InvalidPayment',
  InvalidNonce = 'InvalidNonce',
  InvalidProducer = 'InvalidProducer',
  InvalidVerifier = 'InvalidVerifier',
  InvalidDeleter = 'InvalidDeleter',
  InvalidUpdater = 'InvalidUpdater',
  InvalidRevoker = 'InvalidRevoker',
  InvalidSharer = 'InvalidSharer',
  InvalidConsumerDid = 'InvalidConsumerDid',
  InvalidProducerDid = 'InvalidProducerDid',
  InvalidProviderDid = 'InvalidProviderDid',
  InvalidVerifierDid = 'InvalidVerifierDid',
  InvalidDeleterDid = 'InvalidDeleterDid',
  InvalidUpdaterDid = 'InvalidUpdaterDid',
  InvalidRevokerDid = 'InvalidRevokerDid',
  InvalidSharerDid = 'InvalidSharerDid',
  RecordNotActive = 'RecordNotActive',
  ProducerNotActive = 'ProducerNotActive',
  ConsumerNotActive = 'ConsumerNotActive',
  ProviderNotActive = 'ProviderNotActive',
  VerifierNotActive = 'VerifierNotActive',
  DeleterNotActive = 'DeleterNotActive',
  UpdaterNotActive = 'UpdaterNotActive',
  RevokerNotActive = 'RevokerNotActive',
  SharerNotActive = 'SharerNotActive',
  RecordAlreadyVerified = 'RecordAlreadyVerified',
  RecordAlreadyShared = 'RecordAlreadyShared',
  RecordAlreadyRevoked = 'RecordAlreadyRevoked',
  RecordAlreadyDeleted = 'RecordAlreadyDeleted',
  ProducerAlreadyDeleted = 'ProducerAlreadyDeleted',
  ConsumerAlreadyDeleted = 'ConsumerAlreadyDeleted',
  ProviderAlreadyDeleted = 'ProviderAlreadyDeleted',
  VerifierAlreadyDeleted = 'VerifierAlreadyDeleted',
  DeleterAlreadyDeleted = 'DeleterAlreadyDeleted',
  UpdaterAlreadyDeleted = 'UpdaterAlreadyDeleted',
  RevokerAlreadyDeleted = 'RevokerAlreadyDeleted',
  SharerAlreadyDeleted = 'SharerAlreadyDeleted',
  Unknown = 'Unknown',
}

/**
 * Error messages for the DataRegistry contract
 */
export const DataRegistryErrorMessage: Record<DataRegistryErrorCode, string> = {
  [DataRegistryErrorCode.Unauthorized]: 'Unauthorized access',
  [DataRegistryErrorCode.RecordNotFound]: 'Record not found',
  [DataRegistryErrorCode.RecordAlreadyExists]: 'Record already exists',
  [DataRegistryErrorCode.InvalidDID]: 'Invalid DID',
  [DataRegistryErrorCode.AccessDenied]: 'Access denied',
  [DataRegistryErrorCode.InvalidAccessDuration]: 'Invalid access duration',
  [DataRegistryErrorCode.ExpiredAccess]: 'Access has expired',
  [DataRegistryErrorCode.InvalidContentHash]: 'Invalid content hash',
  [DataRegistryErrorCode.PaymentNotVerified]: 'Payment not verified',
  [DataRegistryErrorCode.DidAuthNotInitialized]: 'DID authentication not initialized',
  [DataRegistryErrorCode.InvalidDidAuthAddress]: 'Invalid DID authentication address',
  [DataRegistryErrorCode.AlreadyRegistered]: 'Producer already registered',
  [DataRegistryErrorCode.ConsentNotAllowed]: 'Consent not allowed',
  [DataRegistryErrorCode.InvalidRecordId]: 'Invalid record ID',
  [DataRegistryErrorCode.InvalidCID]: 'Invalid CID',
  [DataRegistryErrorCode.InvalidResourceType]: 'Invalid resource type',
  [DataRegistryErrorCode.InvalidDataSize]: 'Invalid data size',
  [DataRegistryErrorCode.InvalidConsumer]: 'Invalid consumer address',
  [DataRegistryErrorCode.InvalidProvider]: 'Invalid provider address',
  [DataRegistryErrorCode.InvalidStatus]: 'Invalid status',
  [DataRegistryErrorCode.InvalidConsent]: 'Invalid consent status',
  [DataRegistryErrorCode.InvalidSignature]: 'Invalid signature',
  [DataRegistryErrorCode.InvalidMetadata]: 'Invalid metadata',
  [DataRegistryErrorCode.InvalidVersion]: 'Invalid version',
  [DataRegistryErrorCode.InvalidTimestamp]: 'Invalid timestamp',
  [DataRegistryErrorCode.InvalidExpiration]: 'Invalid expiration',
  [DataRegistryErrorCode.InvalidAccessLevel]: 'Invalid access level',
  [DataRegistryErrorCode.InvalidPayment]: 'Invalid payment',
  [DataRegistryErrorCode.InvalidNonce]: 'Invalid nonce',
  [DataRegistryErrorCode.InvalidProducer]: 'Invalid producer address',
  [DataRegistryErrorCode.InvalidVerifier]: 'Invalid verifier address',
  [DataRegistryErrorCode.InvalidDeleter]: 'Invalid deleter address',
  [DataRegistryErrorCode.InvalidUpdater]: 'Invalid updater address',
  [DataRegistryErrorCode.InvalidRevoker]: 'Invalid revoker address',
  [DataRegistryErrorCode.InvalidSharer]: 'Invalid sharer address',
  [DataRegistryErrorCode.InvalidConsumerDid]: 'Invalid consumer DID',
  [DataRegistryErrorCode.InvalidProducerDid]: 'Invalid producer DID',
  [DataRegistryErrorCode.InvalidProviderDid]: 'Invalid provider DID',
  [DataRegistryErrorCode.InvalidVerifierDid]: 'Invalid verifier DID',
  [DataRegistryErrorCode.InvalidDeleterDid]: 'Invalid deleter DID',
  [DataRegistryErrorCode.InvalidUpdaterDid]: 'Invalid updater DID',
  [DataRegistryErrorCode.InvalidRevokerDid]: 'Invalid revoker DID',
  [DataRegistryErrorCode.InvalidSharerDid]: 'Invalid sharer DID',
  [DataRegistryErrorCode.RecordNotActive]: 'Record is not active',
  [DataRegistryErrorCode.ProducerNotActive]: 'Producer is not active',
  [DataRegistryErrorCode.ConsumerNotActive]: 'Consumer is not active',
  [DataRegistryErrorCode.ProviderNotActive]: 'Provider is not active',
  [DataRegistryErrorCode.VerifierNotActive]: 'Verifier is not active',
  [DataRegistryErrorCode.DeleterNotActive]: 'Deleter is not active',
  [DataRegistryErrorCode.UpdaterNotActive]: 'Updater is not active',
  [DataRegistryErrorCode.RevokerNotActive]: 'Revoker is not active',
  [DataRegistryErrorCode.SharerNotActive]: 'Sharer is not active',
  [DataRegistryErrorCode.RecordAlreadyVerified]: 'Record is already verified',
  [DataRegistryErrorCode.RecordAlreadyShared]: 'Record is already shared',
  [DataRegistryErrorCode.RecordAlreadyRevoked]: 'Record access is already revoked',
  [DataRegistryErrorCode.RecordAlreadyDeleted]: 'Record is already deleted',
  [DataRegistryErrorCode.ProducerAlreadyDeleted]: 'Producer is already deleted',
  [DataRegistryErrorCode.ConsumerAlreadyDeleted]: 'Consumer is already deleted',
  [DataRegistryErrorCode.ProviderAlreadyDeleted]: 'Provider is already deleted',
  [DataRegistryErrorCode.VerifierAlreadyDeleted]: 'Verifier is already deleted',
  [DataRegistryErrorCode.DeleterAlreadyDeleted]: 'Deleter is already deleted',
  [DataRegistryErrorCode.UpdaterAlreadyDeleted]: 'Updater is already deleted',
  [DataRegistryErrorCode.RevokerAlreadyDeleted]: 'Revoker is already deleted',
  [DataRegistryErrorCode.SharerAlreadyDeleted]: 'Sharer is already deleted',
  [DataRegistryErrorCode.Unknown]: 'Unknown error',
};

/**
 * Parse error from the contract
 */
export function parseDataRegistryError(error: unknown): {
  code: DataRegistryErrorCode;
  message: string;
} {
  if (!error || typeof error !== 'object') {
    return {
      code: DataRegistryErrorCode.Unknown,
      message: DataRegistryErrorMessage[DataRegistryErrorCode.Unknown],
    };
  }

  const errorObj = error as { message?: string };
  if (!errorObj.message) {
    return {
      code: DataRegistryErrorCode.Unknown,
      message: DataRegistryErrorMessage[DataRegistryErrorCode.Unknown],
    };
  }

  // Extract error code from message
  const match = errorObj.message.match(/DataRegistry__(\w+)/);
  if (!match) {
    return {
      code: DataRegistryErrorCode.Unknown,
      message: DataRegistryErrorMessage[DataRegistryErrorCode.Unknown],
    };
  }

  const code = match[1] as DataRegistryErrorCode;
  return {
    code,
    message: DataRegistryErrorMessage[code] || DataRegistryErrorMessage[DataRegistryErrorCode.Unknown],
  };
}

/**
 * Helper function to get a user-friendly error message for DataRegistry errors
 */
export function getDataRegistryErrorMessage(error: DataRegistryErrorType): string {
  switch (error.name) {
    case 'DataRegistry__Unauthorized':
      return 'You are not authorized to perform this action.';
    case 'DataRegistry__RecordNotFound':
      return `Record not found. Please verify the record ID.`;
    case 'DataRegistry__RecordAlreadyExists':
      return `A record with this ID already exists. Please use a different ID.`;
    case 'DataRegistry__InvalidDID':
      return `The provided DID (${error.did}) is invalid.`;
    case 'DataRegistry__AccessDenied':
      return `Access denied to the requested record.`;
    case 'DataRegistry__InvalidAccessDuration':
      return `Invalid access duration. Please provide a value between ${error.min} and ${error.max}.`;
    case 'DataRegistry__ExpiredAccess':
      return `Your access to this record has expired.`;
    case 'DataRegistry__InvalidContentHash':
      return `The provided content hash is invalid.`;
    case 'DataRegistry__PaymentNotVerified':
      return `Payment verification failed for the requested record.`;
    case 'DataRegistry__DidAuthNotInitialized':
      return `DID authentication is not properly initialized. Please contact support.`;
    case 'DataRegistry__InvalidDidAuthAddress':
      return `Invalid DID authentication address. Please contact support.`;
    case 'DataRegistry__AlreadyRegistered':
      return `This producer is already registered in the system.`;
    case 'DataRegistry__ConsentNotAllowed':
      return `Consent is not allowed for this record. Please check consent settings.`;
    default:
      return 'An unknown error occurred while interacting with the Data Registry.';
  }
}
