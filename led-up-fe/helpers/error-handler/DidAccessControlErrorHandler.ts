import { Abi } from 'viem';
import { BaseErrorHandler } from './BaseErrorHandler';

/**
 * Error handler for the DidAccessControl contract
 */
export class DidAccessControlErrorHandler extends BaseErrorHandler {
  /**
   * Creates a new instance of the DidAccessControlErrorHandler
   * @param abi The DidAccessControl contract ABI
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
    // Format DidAccessControl-specific errors
    switch (errorName) {
      case 'DidAccessControl__InvalidDID':
        return 'Invalid DID: The DID format is invalid or does not exist';

      case 'DidAccessControl__InvalidRole':
        return 'Invalid role: The role is not recognized or not properly configured';

      case 'DidAccessControl__UnauthorizedDID':
        return 'Unauthorized DID: The DID does not have the required role or permission';

      case 'DidAccessControl__MissingRequirement':
        return 'Missing requirement: The DID does not meet the requirements for the requested action';

      case 'DidAccessControl__Unauthorized':
        return 'Unauthorized: Caller does not have permission to perform this action';

      case 'DidAccessControl__RoleAlreadyExists':
        return 'Role already exists: A role with this name already exists';

      case 'DidAccessControl__RoleNotFound':
        return 'Role not found: The specified role does not exist';

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
