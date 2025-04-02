import { Abi, ContractFunctionExecutionError, BaseError, decodeErrorResult } from 'viem';

/**
 * Interface for a parsed contract error
 */
export interface ParsedContractError {
  errorName: string;
  args: Record<string, any>;
  message: string;
  originalError: any;
}

/**
 * Common error types in Ethereum contracts
 */
export enum CommonErrorTypes {
  USER_REJECTED = 'user rejected',
  INSUFFICIENT_FUNDS = 'insufficient funds',
  UNPREDICTABLE_GAS = 'unpredictable gas limit',
  TRANSACTION_REVERTED = 'transaction reverted',
  INTERNAL_ERROR = 'internal json-rpc error',
  UNKNOWN = 'unknown error',
}

/**
 * Base class for contract error handlers
 * Provides common error handling functionality for Ethereum contracts
 */
export abstract class BaseErrorHandler {
  protected abi: Abi;

  constructor(abi: Abi) {
    this.abi = abi;
  }

  /**
   * Parse a contract error into a standardized format
   * @param error The error to parse
   */
  public parseError(error: any): ParsedContractError {
    try {
      // Handle ContractFunctionExecutionError specifically
      if (error instanceof ContractFunctionExecutionError) {
        // Check for internal JSON-RPC error first
        if (error.message?.toLowerCase().includes(CommonErrorTypes.INTERNAL_ERROR)) {
          return this.handleInternalError(error);
        }

        // Try to decode the error data if available
        const errorData = this.extractErrorData(error);
        if (errorData) {
          const decodedError = this.decodeError(errorData);
          if (decodedError) {
            return {
              errorName: decodedError.errorName,
              args: this.formatArgs(decodedError.args),
              message: this.formatErrorMessage(decodedError.errorName, decodedError.args),
              originalError: error,
            };
          }
        }

        // If we have a revert reason in the message
        if (error.message) {
          const revertMatch = error.message.match(/reverted with (?:the following )?reason:\s*([^"\n]+)/i);
          if (revertMatch?.[1]) {
            return this.handleRevertError(error);
          }
        }
      }

      // Handle other error types
      if (error?.message) {
        const lowerMessage = error.message.toLowerCase();
        const commonError = this.handleCommonError(lowerMessage, error);
        if (commonError) return commonError;
      }

      // If all else fails, return a generic error
      return {
        errorName: 'UnknownError',
        args: {},
        message: error?.message || 'An unknown error occurred',
        originalError: error,
      };
    } catch (e) {
      console.error('Error parsing contract error:', e);
      return {
        errorName: 'ErrorParsingError',
        args: { originalError: error?.toString() },
        message: e instanceof Error ? e.message : 'Failed to parse error',
        originalError: error,
      };
    }
  }

  /**
   * Extract error data from various error formats
   * @param error The error to extract data from
   */
  protected extractErrorData(error: any): `0x${string}` | null {
    if (error instanceof ContractFunctionExecutionError) {
      // Try to get data from cause first
      const cause = error.cause as BaseError & { data?: `0x${string}` };
      if (cause?.data) return cause.data;

      // Try to get data from error details
      const details = error as unknown as { data?: `0x${string}` };
      if (details?.data) return details.data;
    }

    if (error && typeof error === 'object') {
      if ('data' in error) {
        if (typeof error.data === 'string' && error.data.startsWith('0x')) {
          return error.data as `0x${string}`;
        }
        if (error.data && typeof error.data === 'object') {
          if ('data' in error.data) {
            const nestedData = error.data.data;
            if (typeof nestedData === 'string' && nestedData.startsWith('0x')) {
              return nestedData as `0x${string}`;
            }
          }
          // Try to get error data from error.data.error.data
          if ('error' in error.data && typeof error.data.error === 'object' && 'data' in error.data.error) {
            const errorData = error.data.error.data;
            if (typeof errorData === 'string' && errorData.startsWith('0x')) {
              return errorData as `0x${string}`;
            }
          }
        }
      }
    }

    return null;
  }

  /**
   * Decode error data using the contract ABI
   * @param data The error data to decode
   */
  protected decodeError(data: `0x${string}`): { errorName: string; args: Record<string, any> } | null {
    try {
      const decodedError = decodeErrorResult({
        abi: this.abi,
        data,
      });
      return {
        errorName: decodedError.errorName,
        args: decodedError.args as Record<string, any>,
      };
    } catch {
      return null;
    }
  }

  /**
   * Format error arguments to handle special types like BigInt
   * @param args The arguments to format
   */
  protected formatArgs(args: Record<string, any>): Record<string, any> {
    const formatted: Record<string, any> = {};

    for (const [key, value] of Object.entries(args)) {
      if (typeof value === 'bigint') {
        formatted[key] = value.toString();
      } else if (Array.isArray(value)) {
        formatted[key] = value.map((item) => (typeof item === 'bigint' ? item.toString() : item));
      } else if (value && typeof value === 'object') {
        formatted[key] = this.formatArgs(value);
      } else {
        formatted[key] = value;
      }
    }

    return formatted;
  }

  /**
   * Handle common Ethereum error types
   * @param message The lowercase error message
   * @param originalError The original error object
   */
  protected handleCommonError(message: string, originalError: any): ParsedContractError | null {
    if (message.includes(CommonErrorTypes.USER_REJECTED)) {
      return {
        errorName: 'UserRejected',
        args: {},
        message: 'Transaction was rejected by the user',
        originalError,
      };
    }

    if (message.includes(CommonErrorTypes.INSUFFICIENT_FUNDS)) {
      return {
        errorName: 'InsufficientFunds',
        args: {},
        message: 'Insufficient funds to complete the transaction',
        originalError,
      };
    }

    if (message.includes(CommonErrorTypes.UNPREDICTABLE_GAS)) {
      return {
        errorName: 'UnpredictableGas',
        args: {},
        message: 'Unable to estimate gas for this transaction',
        originalError,
      };
    }

    if (message.includes(CommonErrorTypes.TRANSACTION_REVERTED)) {
      return this.handleRevertError(originalError);
    }

    if (message.includes(CommonErrorTypes.INTERNAL_ERROR)) {
      return this.handleInternalError(originalError);
    }

    return null;
  }

  /**
   * Get a user-friendly error message
   * @param error The error to get a message for
   */
  public getUserFriendlyMessage(error: any): string {
    return this.parseError(error).message;
  }

  /**
   * Check if an error is of a specific type
   * @param error The error to check
   * @param errorName The name of the error type to check for
   */
  public isErrorType(error: any, errorName: string): boolean {
    return this.parseError(error).errorName === errorName;
  }

  /**
   * Handle internal JSON-RPC errors
   * Should be overridden by contract-specific handlers
   * @param error The error to handle
   */
  protected abstract handleInternalError(error: any): ParsedContractError;

  /**
   * Handle contract revert errors
   * Should be overridden by contract-specific handlers
   * @param error The error to handle
   */
  protected abstract handleRevertError(error: any): ParsedContractError;

  /**
   * Format an error message based on the error name and arguments
   * Must be implemented by contract-specific handlers
   * @param errorName The name of the error
   * @param args The error arguments
   */
  protected abstract formatErrorMessage(errorName: string, args: Record<string, any>): string;
}
