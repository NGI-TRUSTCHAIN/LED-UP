import { Abi } from 'viem';
import { BaseErrorHandler } from './BaseErrorHandler';

/**
 * Error handler for the DidRegistry contract
 */
export class DidRegistryErrorHandler extends BaseErrorHandler {
  /**
   * Creates a new instance of the DidRegistryErrorHandler
   * @param abi The DidRegistry contract ABI
   */
  constructor(abi: Abi) {
    super(abi);
  }

  /**
   * Get a user-friendly error message based on the error name and arguments
   * @param errorName The name of the error
   * @param args The error arguments
   * @returns A user-friendly error message
   */
  protected formatErrorMessage(errorName: string, args: Record<string, any>): string {
    // Format DidRegistry-specific errors
    switch (errorName) {
      case 'DidRegistry__InvalidDID':
        return 'Invalid DID: The DID format is invalid or malformed';

      case 'DidRegistry__DIDAlreadyRegistered':
        return 'DID already exists: Cannot register a DID that is already registered';

      case 'DidRegistry__DidNotFound':
        return 'DID not found: The specified DID does not exist in the registry';

      case 'DidRegistry__Unauthorized':
        return 'Unauthorized: Caller does not have permission to perform this action';

      case 'DidRegistry__InvalidStatus':
        return 'Invalid status: The DID status is invalid';

      case 'DidRegistry__InvalidController':
        return 'Invalid controller: The controller address is invalid';

      case 'DidRegistry__InvalidMetadata':
        return 'Invalid metadata: The metadata format is invalid or malformed';

      case 'DidRegistry__InvalidSignature':
        return 'Invalid signature: The provided signature is invalid or does not match';

      case 'DidRegistry__DeactivatedDID':
        return 'DID deactivated: The DID has been deactivated and cannot be used';

      case 'DidRegistry__DidSuspended':
        return 'DID suspended: The DID has been suspended and cannot be used';

      case 'DidRegistry__InvalidMethod':
        return 'Invalid method: The DID method is invalid or not supported';

      case 'DidRegistry__InvalidFormat':
        return 'Invalid format: The DID format is invalid or malformed';

      // Access control errors
      case 'AccessControlUnauthorizedAccount':
        return `Account ${args.account} is missing role ${args.neededRole}`;

      case 'OwnableUnauthorizedAccount':
        return `Caller ${args.account} is not the owner`;

      case 'OwnableInvalidOwner':
        return `Invalid owner: ${args.owner}`;

      case 'UserRejected':
        return 'Transaction was rejected by the user';

      // Default case for unknown errors
      default: {
        // For custom errors, create a message from the arguments
        const argString = Object.entries(args)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');

        return `${errorName}${argString ? ` (${argString})` : ''}`;
      }
    }
  }
}
