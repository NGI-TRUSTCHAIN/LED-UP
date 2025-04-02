/**
 * Error type definitions for the Compensation1 contract
 */

/**
 * Base interface for Compensation errors
 */
export interface CompensationError {
  name: string;
  message: string;
}

/**
 * Error thrown when a caller is not authorized
 */
export interface UnauthorizedError extends CompensationError {
  name: 'UnauthorizedError';
  caller: string;
}

/**
 * Error thrown when a producer does not exist
 */
export interface ProducerNotFoundError extends CompensationError {
  name: 'ProducerNotFoundError';
  producer: string;
}

/**
 * Error thrown when a payment has already been processed
 */
export interface PaymentAlreadyProcessedError extends CompensationError {
  name: 'PaymentAlreadyProcessedError';
  recordId: string;
}

/**
 * Error thrown when a payment fails
 */
export interface PaymentFailedError extends CompensationError {
  name: 'PaymentFailedError';
  reason: string;
}

/**
 * Error thrown when insufficient balance for withdrawal
 */
export interface InsufficientBalanceError extends CompensationError {
  name: 'InsufficientBalanceError';
  requested: bigint;
  available: bigint;
}

/**
 * Error thrown when withdrawal amount is below minimum
 */
export interface BelowMinimumWithdrawAmountError extends CompensationError {
  name: 'BelowMinimumWithdrawAmountError';
  requested: bigint;
  minimum: bigint;
}

/**
 * Error thrown when the contract is paused
 */
export interface ContractPausedError extends CompensationError {
  name: 'ContractPausedError';
}

/**
 * Error thrown when the contract is not paused but should be
 */
export interface ContractNotPausedError extends CompensationError {
  name: 'ContractNotPausedError';
}

/**
 * Error thrown when token transfer fails
 */
export interface TokenTransferFailedError extends CompensationError {
  name: 'TokenTransferFailedError';
  token: string;
  from: string;
  to: string;
  amount: bigint;
}

/**
 * Union type of all possible Compensation error types
 */
export type CompensationErrorType =
  | UnauthorizedError
  | ProducerNotFoundError
  | PaymentAlreadyProcessedError
  | PaymentFailedError
  | InsufficientBalanceError
  | BelowMinimumWithdrawAmountError
  | ContractPausedError
  | ContractNotPausedError
  | TokenTransferFailedError;

/**
 * Parse error messages from Compensation contract errors
 * @param error - Error object to parse
 * @returns Parsed error or null if not recognized
 */
export function parseCompensationError(error: unknown): CompensationErrorType | null {
  if (!error) return null;

  const errorMessage =
    typeof error === 'object' && error !== null
      ? 'message' in error && typeof error.message === 'string'
        ? error.message
        : String(error)
      : String(error);

  // Extract error signature using regex
  const errorSignatureMatch = errorMessage.match(/(?:Error|execution reverted): ([A-Za-z0-9_]+)/);
  if (!errorSignatureMatch) return null;

  const errorSignature = errorSignatureMatch[1];

  // Parse error based on signature
  switch (errorSignature) {
    case 'Unauthorized':
      return {
        name: 'UnauthorizedError',
        message: 'You are not authorized to perform this action',
        caller: extractAddressFromError(errorMessage) || 'unknown',
      };

    case 'ProducerNotFound':
      return {
        name: 'ProducerNotFoundError',
        message: 'Producer not found in the system',
        producer: extractAddressFromError(errorMessage) || 'unknown',
      };

    case 'PaymentAlreadyProcessed':
      return {
        name: 'PaymentAlreadyProcessedError',
        message: 'Payment has already been processed for this record',
        recordId: extractStringFromError(errorMessage) || 'unknown',
      };

    case 'PaymentFailed':
      return {
        name: 'PaymentFailedError',
        message: 'Payment transaction failed',
        reason: extractStringFromError(errorMessage) || 'unknown reason',
      };

    case 'InsufficientBalance':
      return {
        name: 'InsufficientBalanceError',
        message: 'Insufficient balance for withdrawal',
        requested: extractBigIntFromError(errorMessage, 'requested') || 0n,
        available: extractBigIntFromError(errorMessage, 'available') || 0n,
      };

    case 'BelowMinimumWithdrawAmount':
      return {
        name: 'BelowMinimumWithdrawAmountError',
        message: 'Withdrawal amount is below minimum',
        requested: extractBigIntFromError(errorMessage, 'requested') || 0n,
        minimum: extractBigIntFromError(errorMessage, 'minimum') || 0n,
      };

    case 'ContractPaused':
      return {
        name: 'ContractPausedError',
        message: 'Contract is currently paused',
      };

    case 'ContractNotPaused':
      return {
        name: 'ContractNotPausedError',
        message: 'Contract is not paused',
      };

    case 'TokenTransferFailed':
      return {
        name: 'TokenTransferFailedError',
        message: 'Token transfer operation failed',
        token: extractAddressFromError(errorMessage, 'token') || 'unknown',
        from: extractAddressFromError(errorMessage, 'from') || 'unknown',
        to: extractAddressFromError(errorMessage, 'to') || 'unknown',
        amount: extractBigIntFromError(errorMessage) || 0n,
      };

    default:
      return null;
  }
}

/**
 * Extract address from error message
 */
function extractAddressFromError(errorMessage: string, paramName?: string): `0x${string}` | null {
  const regex = paramName ? new RegExp(`${paramName}:\\s*([0x][a-fA-F0-9]{40})`) : /([0x][a-fA-F0-9]{40})/;

  const match = errorMessage.match(regex);
  return match ? (match[1] as `0x${string}`) : null;
}

/**
 * Extract string from error message
 */
function extractStringFromError(errorMessage: string): string | null {
  const match = errorMessage.match(/"([^"]*)"/);
  return match ? match[1] : null;
}

/**
 * Extract BigInt from error message
 */
function extractBigIntFromError(errorMessage: string, paramName?: string): bigint | null {
  const regex = paramName ? new RegExp(`${paramName}:\\s*(\\d+)`) : /(\d+)/;

  const match = errorMessage.match(regex);
  return match ? BigInt(match[1]) : null;
}

/**
 * Get user-friendly error message based on error type
 * @param error - Parsed error object
 * @returns User-friendly error message
 */
export function getCompensationErrorMessage(error: CompensationErrorType): string {
  switch (error.name) {
    case 'UnauthorizedError':
      return `You don't have permission to perform this action. Only authorized addresses can access this function.`;

    case 'ProducerNotFoundError':
      return `Producer ${error.producer} is not registered in the system.`;

    case 'PaymentAlreadyProcessedError':
      return `Payment has already been processed for record ${error.recordId}.`;

    case 'PaymentFailedError':
      return `Payment processing failed: ${error.reason}.`;

    case 'InsufficientBalanceError':
      return `Insufficient balance for withdrawal. Requested: ${error.requested.toString()}, Available: ${error.available.toString()}.`;

    case 'BelowMinimumWithdrawAmountError':
      return `Withdrawal amount is below the minimum threshold. Requested: ${error.requested.toString()}, Minimum: ${error.minimum.toString()}.`;

    case 'ContractPausedError':
      return `This operation cannot be performed while the contract is paused.`;

    case 'ContractNotPausedError':
      return `This operation can only be performed when the contract is paused.`;

    case 'TokenTransferFailedError':
      return `Token transfer failed. Could not transfer ${error.amount.toString()} tokens from ${error.from} to ${
        error.to
      }.`;

    default:
      return `An unknown error occurred with the compensation contract.`;
  }
}
