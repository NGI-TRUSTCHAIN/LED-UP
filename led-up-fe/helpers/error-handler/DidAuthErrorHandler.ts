import { Abi } from 'viem';
import { BaseErrorHandler } from './BaseErrorHandler';

/**
 * Error handler for the DidAuth contract
 */
export class DidAuthErrorHandler extends BaseErrorHandler {
  /**
   * Creates a new instance of the DidAuthErrorHandler
   * @param abi The DidAuth contract ABI
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
    // Format DidAuth-specific errors
    switch (errorName) {
      case 'DidAuth__Unauthorized':
        return 'Unauthorized: Caller does not have permission to perform this action';

      case 'DidAuth__InvalidDID':
        return 'Invalid DID: The DID format is invalid or malformed';

      case 'DidAuth__DeactivatedDID':
        return 'Deactivated DID: The DID has been deactivated and cannot be used';

      case 'DidAuth__InvalidCredential':
        return 'Invalid credential: The credential is invalid or has expired';

      case 'DidAuth__InvalidRole':
        return 'Invalid role: The role is not recognized or not assigned to the DID';

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
