import { Abi } from 'viem';
import { BaseErrorHandler } from './BaseErrorHandler';

/**
 * Error handler for ZKP-related contracts
 */
export class ZKPErrorHandler extends BaseErrorHandler {
  /**
   * Creates a new instance of the ZKPErrorHandler
   * @param abi The ZKP contract ABI
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
    // Format ZKP-specific errors
    switch (errorName) {
      // ZKPRegistry errors
      case 'ZKPRegistry__InvalidVerifierAddress':
        return 'Invalid verifier address: The verifier address is invalid or zero';

      case 'ZKPRegistry__InvalidVerifierType':
        return 'Invalid verifier type: The verifier type is not recognized';

      case 'ZKPRegistry__VerifierNotRegistered':
        return 'Verifier not registered: The verifier is not registered in the system';

      case 'ZKPRegistry__VerifierAlreadyRegistered':
        return 'Verifier already registered: A verifier with this address is already registered';

      case 'ZKPRegistry__CallerNotAdmin':
        return 'Caller not admin: Only admins can perform this action';

      case 'ZKPRegistry__InvalidAdminAddress':
        return 'Invalid admin address: The admin address is invalid or zero';

      case 'ZKPRegistry__AdminAlreadyExists':
        return 'Admin already exists: This address is already an admin';

      case 'ZKPRegistry__CallerNotOwner':
        return 'Caller not owner: Only the owner can perform this action';

      // ZKPVerifierFactory errors
      case 'ZKPVerifierFactory__InvalidRegistryAddress':
        return 'Invalid registry address: The registry address is invalid or zero';

      case 'ZKPVerifierFactory__CallerNotOwner':
        return 'Caller not owner: Only the owner can perform this action';

      case 'ZKPVerifierFactory__InvalidVerifierAddress':
        return 'Invalid verifier address: The verifier address is invalid or zero';

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
