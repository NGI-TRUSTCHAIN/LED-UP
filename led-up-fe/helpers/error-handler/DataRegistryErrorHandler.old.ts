import { Abi } from 'viem';
import { BaseErrorHandler, ParsedContractError } from './BaseErrorHandler';

/**
 * Error handler for the DataRegistry contract
 * Implements contract-specific error handling and formatting
 */
export class DataRegistryErrorHandler extends BaseErrorHandler {
  /**
   * Creates a new instance of the DataRegistryErrorHandler
   * @param abi The contract ABI
   */
  constructor(abi: Abi) {
    super(abi);
  }

  /**
   * Handle internal JSON-RPC errors specific to DataRegistry
   * @param error The error to handle
   */
  protected handleInternalError(error: any): ParsedContractError {
    // For DataRegistry, internal errors are typically unauthorized producer errors
    return {
      errorName: 'DataRegistry__UnauthorizedProducer',
      args: {},
      message:
        'Unauthorized producer: The producer is not authorized to perform this action. Please ensure your DID has the PRODUCER_ROLE.',
      originalError: error,
    };
  }

  /**
   * Handle contract revert errors specific to DataRegistry
   * @param error The error to handle
   */
  protected handleRevertError(error: any): ParsedContractError {
    // Try to extract custom error name first
    const customErrorMatch = error.message?.match(/reverted with custom error '([^']+)'/i);
    if (customErrorMatch?.[1]) {
      const errorName = customErrorMatch[1];
      return {
        errorName,
        args: {},
        message: this.formatErrorMessage(errorName, {}),
        originalError: error,
      };
    }

    // Try to extract revert reason
    const revertMatch = error.message?.match(/reverted with (?:the following )?reason:\s*([^"\n]+)/i);
    if (revertMatch?.[1]) {
      return {
        errorName: 'ContractRevertError',
        args: { reason: revertMatch[1].trim() },
        message: revertMatch[1].trim(),
        originalError: error,
      };
    }

    // Default revert error
    return {
      errorName: 'TransactionReverted',
      args: {},
      message: 'Transaction was reverted by the contract. Check your input parameters and try again.',
      originalError: error,
    };
  }

  /**
   * Format error messages specific to DataRegistry
   * @param errorName The name of the error
   * @param args The error arguments
   */
  protected formatErrorMessage(errorName: string, args: Record<string, any>): string {
    switch (errorName) {
      // DataRegistry-specific errors
      case 'DataRegistry__Unauthorized':
        return 'Unauthorized: You do not have permission to perform this action';

      case 'DataRegistry__InvalidRecord':
        return 'Invalid record: The record data is invalid or malformed';

      case 'DataRegistry__RecordNotFound':
        return `Record not found: No record exists with ID ${args.recordId}`;

      case 'DataRegistry__ProducerNotFound':
        return `Producer not found: No producer exists at address ${args.producer}`;

      case 'DataRegistry__RecordAlreadyExists':
        return 'Record already exists: Cannot create a duplicate record';

      case 'DataRegistry__RecordNotActive':
        return 'Record not active: The record is deactivated or suspended';

      case 'DataRegistry__InvalidDID':
        return 'Invalid DID: The DID does not exist or is not active';

      case 'DataRegistry__InvalidInputParam':
        return 'Invalid input parameter: One or more input parameters are invalid';

      case 'DataRegistry__ServicePaused':
        return 'Service paused: The service is currently paused';

      case 'DataRegistry__PaymentNotVerified':
        return 'Payment not verified: The payment for this operation has not been verified';

      case 'DataRegistry__ConsentAlreadyGranted':
        return 'Consent already granted: Cannot grant consent that is already active';

      case 'DataRegistry__ConsentAlreadyRevoked':
        return 'Consent already revoked: Cannot revoke consent that is already revoked';

      case 'DataRegistry__ConsentNotAllowed':
        return `Consent not allowed: Consent is not allowed for record ${args.recordId} from producer ${args.producer}`;

      case 'DataRegistry__UnauthorizedConsumer':
        return 'Unauthorized consumer: The consumer is not authorized to access this data';

      case 'DataRegistry__UnauthorizedProducer':
        return 'Unauthorized producer: The producer is not authorized to perform this action. Please ensure your DID has the PRODUCER_ROLE.';

      case 'DataRegistry__UnauthorizedServiceProvider':
        return 'Unauthorized service provider: The service provider is not authorized to perform this action';

      case 'DataRegistry__UnauthorizedVerifier':
        return 'Unauthorized verifier: The verifier is not authorized to perform this action';

      case 'DataRegistry__DidAuthNotInitialized':
        return 'DID Auth not initialized: The DID authentication service is not initialized';

      case 'DataRegistry__InvalidDidAuthAddress':
        return 'Invalid DID Auth address: The DID authentication service address is invalid';

      // OpenZeppelin standard errors
      case 'AccessControlUnauthorizedAccount':
        return `Account ${args.account} is missing role ${args.neededRole}`;

      case 'OwnableUnauthorizedAccount':
        return `Caller ${args.account} is not the owner`;

      case 'OwnableInvalidOwner':
        return `Invalid owner: ${args.owner}`;

      case 'ERC20InsufficientBalance':
        return `Insufficient balance: address ${args.sender} has ${args.balance} but needs ${args.needed}`;

      case 'ERC20InsufficientAllowance':
        return `Insufficient allowance: spender ${args.spender} has allowance ${args.allowance} but needs ${args.needed}`;

      case 'ReentrancyGuardReentrantCall':
        return 'Reentrant call detected';

      // Common transaction errors
      case 'UserRejected':
        return 'Transaction was rejected by the user';

      case 'InsufficientFunds':
        return 'Insufficient funds to complete the transaction';

      case 'UnpredictableGas':
        return 'Unable to estimate gas for this transaction';

      case 'InternalJSONRPCError':
        console.error('Internal JSON-RPC Error details:', args.fullError);
        return 'The transaction failed. This might be due to incorrect parameters or insufficient permissions. Please check your DID authentication and try again.';

      case 'UnknownError':
        console.error('Unknown error details:', args);
        return 'An unknown error occurred. Please try again or contact support if the issue persists.';

      // Default case for unknown errors
      default: {
        console.warn('Unhandled error type:', errorName, args);
        const argString = Object.entries(args)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
        return `${errorName}${argString ? ` (${argString})` : ''}`;
      }
    }
  }
}
