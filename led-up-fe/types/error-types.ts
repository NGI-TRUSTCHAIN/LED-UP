/**
 * This file contains TypeScript type definitions for errors that can be thrown by the smart contracts.
 */

/**
 * Compensation contract errors
 */
export enum CompensationError {
  PRODUCER_ALREADY_EXISTS = 'Compensation__ProducerAlreadyExists',
  INSUFFICIENT_BALANCE = 'Compensation__InsufficientBalance',
  NO_BALANCE_TO_WITHDRAW = 'Compensation__NoBalanceToWithdraw',
  TOKEN_TRANSFER_FAILED = 'Compensation__TokenTransferFailed',
  ONLY_OWNER_CAN_WITHDRAW = 'Compensation__OnlyOwnerCanWithdraw',
  LOW_DEPOSIT_AMOUNT = 'Compensation__LowDepositAmount',
  MINIMUM_WITHDRAW_AMOUNT = 'Compensation__MinimumWithdrawAmount',
  INVALID_ADDRESS = 'Compensation__InvalidAddress',
  INVALID_INPUT_PARAM = 'Compensation__InvalidInputParam',
  INVALID_PRODUCER_DID = 'Compensation__InvalidProducerDID',
  INVALID_CONSUMER_DID = 'Compensation__InvalidConsumerDID',
  INVALID_ROLE = 'Compensation__InvalidRole',
  INVALID_PRODUCER = 'Compensation__InvalidProducer',
  INVALID_CONSUMER = 'Compensation__InvalidConsumer',
}

/**
 * ConsentManagement contract errors
 */
export enum ConsentManagementError {
  INVALID_DID = 'ConsentManagement__InvalidDID',
  NOT_FOUND = 'ConsentManagement__NotFound',
  ALREADY_GRANTED = 'ConsentManagement__AlreadyGranted',
  UNAUTHORIZED = 'ConsentManagement__Unauthorized',
}

/**
 * DidAccessControl contract errors
 */
export enum DidAccessControlError {
  INVALID_DID = 'InvalidDID',
  INVALID_ROLE = 'InvalidRole',
  UNAUTHORIZED_DID = 'UnauthorizedDID',
  MISSING_REQUIREMENT = 'MissingRequirement',
}

/**
 * DidAuth contract errors
 */
export enum DidAuthError {
  UNAUTHORIZED = 'DidAuth__Unauthorized',
  INVALID_DID = 'DidAuth__InvalidDID',
  DEACTIVATED_DID = 'DidAuth__DeactivatedDID',
  INVALID_CREDENTIAL = 'DidAuth__InvalidCredential',
  INVALID_ROLE = 'DidAuth__InvalidRole',
}

/**
 * DidIssuer contract errors
 */
export enum DidIssuerError {
  INVALID_SUBJECT = 'DidIssuer__InvalidSubject',
  CREDENTIAL_ALREADY_ISSUED = 'DidIssuer__CredentialAlreadyIssued',
}

/**
 * DidVerifier contract errors
 */
export enum DidVerifierError {
  INVALID_ISSUER = 'DidVerifier__InvalidIssuer',
  UNTRUSTED_ISSUER = 'DidVerifier__UntrustedIssuer',
  INVALID_CREDENTIAL = 'DidVerifier__InvalidCredential',
}

/**
 * DataRegistry contract errors
 */
export enum DataRegistryError {
  UNAUTHORIZED = 'DataRegistry__Unauthorized',
  INVALID_RECORD = 'DataRegistry__InvalidRecord',
  RECORD_NOT_FOUND = 'DataRegistry__RecordNotFound',
  PRODUCER_NOT_FOUND = 'DataRegistry__ProducerNotFound',
  RECORD_ALREADY_EXISTS = 'DataRegistry__RecordAlreadyExists',
  RECORD_NOT_ACTIVE = 'DataRegistry__RecordNotActive',
  INVALID_DID = 'DataRegistry__InvalidDID',
  INVALID_INPUT_PARAM = 'DataRegistry__InvalidInputParam',
  SERVICE_PAUSED = 'DataRegistry__ServicePaused',
  PAYMENT_NOT_VERIFIED = 'DataRegistry__PaymentNotVerified',
  CONSENT_ALREADY_GRANTED = 'DataRegistry__ConsentAlreadyGranted',
  CONSENT_ALREADY_REVOKED = 'DataRegistry__ConsentAlreadyRevoked',
  CONSENT_NOT_ALLOWED = 'DataRegistry__ConsentNotAllowed',
  UNAUTHORIZED_CONSUMER = 'DataRegistry__UnauthorizedConsumer',
  UNAUTHORIZED_PRODUCER = 'DataRegistry__UnauthorizedProducer',
  UNAUTHORIZED_SERVICE_PROVIDER = 'DataRegistry__UnauthorizedServiceProvider',
  UNAUTHORIZED_VERIFIER = 'DataRegistry__UnauthorizedVerifier',
}

/**
 * Generic blockchain error type
 */
export interface BlockchainError {
  code: string;
  message: string;
  data?: any;
}

/**
 * Helper function to check if an error is a specific Compensation error
 */
export function isCompensationError(error: any, errorType: CompensationError): boolean {
  return error && error.code && error.code.includes(errorType);
}

/**
 * Helper function to check if an error is a specific ConsentManagement error
 */
export function isConsentManagementError(error: any, errorType: ConsentManagementError): boolean {
  return error && error.code && error.code.includes(errorType);
}

/**
 * Helper function to check if an error is a specific DidAccessControl error
 */
export function isDidAccessControlError(error: any, errorType: DidAccessControlError): boolean {
  return error && error.code && error.code.includes(errorType);
}

/**
 * Helper function to check if an error is a specific DidAuth error
 */
export function isDidAuthError(error: any, errorType: DidAuthError): boolean {
  return error && error.code && error.code.includes(errorType);
}

/**
 * Helper function to check if an error is a specific DidIssuer error
 */
export function isDidIssuerError(error: any, errorType: DidIssuerError): boolean {
  return error && error.code && error.code.includes(errorType);
}

/**
 * Helper function to check if an error is a specific DidVerifier error
 */
export function isDidVerifierError(error: any, errorType: DidVerifierError): boolean {
  return error && error.code && error.code.includes(errorType);
}

/**
 * Helper function to check if an error is a specific DataRegistry error
 */
export function isDataRegistryError(error: any, errorType: DataRegistryError): boolean {
  return error && error.code && error.code.includes(errorType);
}
