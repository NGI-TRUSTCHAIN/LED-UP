import { Contract } from 'ethers';

/**
 * Interface for a parsed contract error
 */
export interface ParsedContractError {
  name: string;
  args: Record<string, any>;
  message: string;
  originalError: any;
}

/**
 * Common error types in Ethereum contracts
 */
export enum CommonErrorTypes {
  REVERT = 'revert',
  OUT_OF_GAS = 'out of gas',
  INVALID_OPCODE = 'invalid opcode',
  TRANSACTION_REVERTED = 'transaction reverted',
  EXECUTION_REVERTED = 'execution reverted',
  CALL_EXCEPTION = 'call exception',
  INSUFFICIENT_FUNDS = 'insufficient funds',
  NONCE_TOO_LOW = 'nonce too low',
  REPLACEMENT_UNDERPRICED = 'replacement transaction underpriced',
  UNPREDICTABLE_GAS_LIMIT = 'unpredictable gas limit',
  NETWORK_ERROR = 'network error',
  TIMEOUT = 'timeout',
  USER_REJECTED = 'user rejected',
  UNKNOWN = 'unknown error',
}

/**
 * Maps common error messages to error types
 */
const ERROR_PATTERNS: Record<string, CommonErrorTypes> = {
  revert: CommonErrorTypes.REVERT,
  'out of gas': CommonErrorTypes.OUT_OF_GAS,
  'invalid opcode': CommonErrorTypes.INVALID_OPCODE,
  'transaction reverted': CommonErrorTypes.TRANSACTION_REVERTED,
  'execution reverted': CommonErrorTypes.EXECUTION_REVERTED,
  'call exception': CommonErrorTypes.CALL_EXCEPTION,
  'insufficient funds': CommonErrorTypes.INSUFFICIENT_FUNDS,
  'nonce too low': CommonErrorTypes.NONCE_TOO_LOW,
  'replacement transaction underpriced': CommonErrorTypes.REPLACEMENT_UNDERPRICED,
  'unpredictable gas limit': CommonErrorTypes.UNPREDICTABLE_GAS_LIMIT,
  'network error': CommonErrorTypes.NETWORK_ERROR,
  timeout: CommonErrorTypes.TIMEOUT,
  'user rejected': CommonErrorTypes.USER_REJECTED,
};

/**
 * Base class for contract error handlers
 */
export abstract class BaseErrorHandler {
  protected contract: Contract;

  /**
   * Creates a new instance of the BaseErrorHandler
   * @param contract The contract instance
   */
  constructor(contract: Contract) {
    this.contract = contract;
  }

  /**
   * Parses an error from a contract interaction
   * @param error The error object from a failed transaction
   * @returns A parsed error object
   */
  public parseError(error: any): ParsedContractError {
    try {
      // Check if the error has transaction data and we have a contract
      if (error.data && this.contract) {
        try {
          // Try to parse the error using the contract interface
          const errorDescription = this.contract.interface.parseError(error.data);

          if (errorDescription) {
            // Format the error arguments
            const formattedArgs: Record<string, any> = {};

            // Convert named arguments
            if (errorDescription.args) {
              for (const [key, value] of Object.entries(errorDescription.args)) {
                // Skip numeric indices
                if (!isNaN(Number(key))) continue;

                formattedArgs[key] = this.formatErrorValue(value);
              }
            }

            return {
              name: errorDescription.name,
              args: formattedArgs,
              message: this.formatErrorMessage(errorDescription.name, formattedArgs),
              originalError: error,
            };
          }
        } catch (parseError) {
          // If parsing with the contract interface fails, continue to generic parsing
        }
      }

      // Extract error message and reason
      const errorMessage = error.message || '';
      const errorReason = error.reason || '';

      // Try to identify the error type
      const errorType = this.identifyErrorType(errorMessage);

      // Try to extract custom error data
      const customErrorMatch = errorMessage.match(/reverted with custom error '([^']+)'/);
      const customError = customErrorMatch ? customErrorMatch[1] : '';

      // Try to extract revert reason
      const revertMatch = errorMessage.match(/reverted with reason string '([^']+)'/);
      const revertReason = revertMatch ? revertMatch[1] : errorReason;

      return {
        name: customError || errorType,
        args: revertReason ? { reason: revertReason } : {},
        message: revertReason || errorMessage,
        originalError: error,
      };
    } catch (parseError) {
      // If all parsing fails, return a generic error
      return {
        name: CommonErrorTypes.UNKNOWN,
        args: {},
        message: error.message || 'Unknown error',
        originalError: error,
      };
    }
  }

  /**
   * Decodes a known error directly using the error fragment
   * @param errorName The name of the error to decode
   * @param data The error data
   * @returns The decoded error arguments
   */
  public decodeKnownError(errorName: string, data: string): Record<string, any> {
    try {
      const errorFragment = this.contract.interface.getError(errorName);
      const result = this.contract.interface.decodeErrorResult(errorFragment, data);

      // Format the result
      const formattedArgs: Record<string, any> = {};

      for (const [key, value] of Object.entries(result)) {
        // Skip numeric indices
        if (!isNaN(Number(key))) continue;

        formattedArgs[key] = this.formatErrorValue(value);
      }

      return formattedArgs;
    } catch (error) {
      throw new Error(`Failed to decode error ${errorName}: ${error.message}`);
    }
  }

  /**
   * Identifies the type of error based on the error message
   * @param errorMessage The error message
   * @returns The identified error type
   */
  protected identifyErrorType(errorMessage: string): CommonErrorTypes {
    const lowerCaseMessage = errorMessage.toLowerCase();

    for (const [pattern, errorType] of Object.entries(ERROR_PATTERNS)) {
      if (lowerCaseMessage.includes(pattern.toLowerCase())) {
        return errorType;
      }
    }

    return CommonErrorTypes.UNKNOWN;
  }

  /**
   * Formats a value from an error to a readable format
   * @param value The value to format
   * @returns The formatted value
   */
  protected formatErrorValue(value: any): any {
    // Handle BigInt values
    if (typeof value === 'bigint') {
      return value.toString();
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return value.map(v => this.formatErrorValue(v));
    }

    // Handle objects
    if (value && typeof value === 'object') {
      const formatted: Record<string, any> = {};
      for (const [key, val] of Object.entries(value)) {
        formatted[key] = this.formatErrorValue(val);
      }
      return formatted;
    }

    // Return other values as is
    return value;
  }

  /**
   * Formats an error message based on the error name and arguments
   * This method should be implemented by derived classes to provide
   * contract-specific error messages
   * @param errorName The name of the error
   * @param args The error arguments
   * @returns A formatted error message
   */
  protected abstract formatErrorMessage(errorName: string, args: Record<string, any>): string;

  /**
   * Creates a user-friendly error message from a contract error
   * @param error The error object
   * @returns A user-friendly error message
   */
  public getUserFriendlyMessage(error: any): string {
    const parsedError = this.parseError(error);
    return parsedError.message || 'An error occurred while processing your transaction';
  }

  /**
   * Handles a contract error by logging it and returning a user-friendly message
   * @param error The error object
   * @param logger Optional logger function
   * @returns A user-friendly error message
   */
  public handleError(error: any, logger?: (error: any) => void): string {
    const parsedError = this.parseError(error);

    // Log the error if a logger is provided
    if (logger) {
      logger({
        type: 'contract_error',
        name: parsedError.name,
        message: parsedError.message,
        args: parsedError.args,
      });
    }

    return this.getUserFriendlyMessage(error);
  }

  /**
   * Checks if an error is a specific type of contract error
   * @param error The error object
   * @param errorName The name of the error to check for
   * @returns True if the error matches the specified name
   */
  public isErrorType(error: any, errorName: string): boolean {
    const parsedError = this.parseError(error);
    return parsedError.name === errorName;
  }
}
