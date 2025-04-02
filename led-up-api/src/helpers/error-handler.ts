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
 * Parses an error from a contract interaction
 * @param error The error object from a failed transaction
 * @param contract The contract instance to parse the error with
 * @returns A parsed error object
 */
export function parseContractError(error: any, contract?: Contract): ParsedContractError {
  try {
    // Check if the error has transaction data and we have a contract
    if (error.data && contract) {
      try {
        // Try to parse the error using the contract interface
        const errorInfo = contract.interface.parseError(error.data);

        if (errorInfo) {
          // Format the error arguments
          const formattedArgs: Record<string, any> = {};

          // Convert named arguments
          if (errorInfo.args) {
            for (const [key, value] of Object.entries(errorInfo.args)) {
              // Skip numeric indices
              if (!isNaN(Number(key))) continue;

              formattedArgs[key] = formatErrorValue(value);
            }
          }

          return {
            name: errorInfo.name,
            args: formattedArgs,
            message: formatErrorMessage(errorInfo.name, formattedArgs),
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
    const errorType = identifyErrorType(errorMessage);

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
 * Identifies the type of error based on the error message
 * @param errorMessage The error message
 * @returns The identified error type
 */
function identifyErrorType(errorMessage: string): CommonErrorTypes {
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
function formatErrorValue(value: any): any {
  // Handle BigInt values
  if (typeof value === 'bigint') {
    return value.toString();
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return value.map(formatErrorValue);
  }

  // Handle objects
  if (value && typeof value === 'object') {
    const formatted: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
      formatted[key] = formatErrorValue(val);
    }
    return formatted;
  }

  // Return other values as is
  return value;
}

/**
 * Formats an error message based on the error name and arguments
 * @param errorName The name of the error
 * @param args The error arguments
 * @returns A formatted error message
 */
function formatErrorMessage(errorName: string, args: Record<string, any>): string {
  // Format common error types
  switch (errorName) {
    case 'AccessControlUnauthorizedAccount':
      return `Account ${args.account} is missing role ${args.neededRole}`;

    case 'ERC20InsufficientBalance':
      return `Insufficient balance: address ${args.sender} has ${args.balance} but needs ${args.needed}`;

    case 'ERC20InsufficientAllowance':
      return `Insufficient allowance: spender ${args.spender} has allowance ${args.allowance} but needs ${args.needed}`;

    case 'ReentrancyGuardReentrantCall':
      return 'Reentrant call detected';

    case 'OwnableUnauthorizedAccount':
      return `Caller ${args.account} is not the owner`;

    case 'OwnableInvalidOwner':
      return `Invalid owner: ${args.owner}`;

    // Add custom error messages for your specific contract errors
    case 'ConsentManagement__InvalidDID':
      return 'Invalid DID: The DID does not exist or is not active';

    case 'ConsentManagement__NotFound':
      return 'Consent not found: No consent record exists for this relationship';

    case 'ConsentManagement__AlreadyGranted':
      return 'Consent already granted: Cannot grant consent that is already active';

    case 'ConsentManagement__Unauthorized':
      return 'Unauthorized: Caller does not have permission to perform this action';

    default: {
      // For custom errors, create a message from the arguments
      const argString = Object.entries(args)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');

      return `${errorName}${argString ? ` (${argString})` : ''}`;
    }
  }
}

/**
 * Creates a user-friendly error message from a contract error
 * @param error The error object
 * @param contract The contract instance
 * @returns A user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: any, contract?: Contract): string {
  const parsedError = parseContractError(error, contract);

  // Return the parsed message or a fallback
  return parsedError.message || 'An error occurred while processing your transaction';
}

/**
 * Handles a contract error by logging it and returning a user-friendly message
 * @param error The error object
 * @param contract The contract instance
 * @param logger Optional logger function
 * @returns A user-friendly error message
 */
export function handleContractError(
  error: any,
  contract?: Contract,
  logger?: (error: any) => void
): string {
  const parsedError = parseContractError(error, contract);

  // Log the error if a logger is provided
  if (logger) {
    logger({
      type: 'CONTRACT_ERROR',
      name: parsedError.name,
      message: parsedError.message,
      args: parsedError.args,
      originalError: error,
    });
  } else {
    // Otherwise log to console
    console.error('Contract Error:', {
      name: parsedError.name,
      message: parsedError.message,
      args: parsedError.args,
    });
  }

  return getUserFriendlyErrorMessage(error, contract);
}

/**
 * Checks if an error is a specific type of contract error
 * @param error The error object
 * @param errorName The name of the error to check for
 * @param contract The contract instance
 * @returns True if the error matches the specified name
 */
export function isContractErrorType(error: any, errorName: string, contract?: Contract): boolean {
  const parsedError = parseContractError(error, contract);
  return parsedError.name === errorName;
}
