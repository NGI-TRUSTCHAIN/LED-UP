import { Contract } from 'ethers';

import { BaseErrorHandler } from './BaseErrorHandler';

/**
 * Error handler for the DidRegistry contract
 */
export class DidRegistryErrorHandler extends BaseErrorHandler {
  /**
   * Creates a new instance of the DidRegistryErrorHandler
   * @param contract The DidRegistry contract instance
   */
  constructor(contract: Contract) {
    super(contract);
  }

  /**
   * Directly decode a DidRegistry__DidNotFound error
   * @param data The error data
   * @returns The decoded error arguments and a user-friendly message
   */
  public decodeDidNotFoundError(data: string): { args: Record<string, any>; message: string } {
    try {
      const args = this.decodeKnownError('DidRegistry__DidNotFound', data);
      return {
        args,
        message: 'DID not found: The specified DID does not exist in the registry',
      };
    } catch (error) {
      throw new Error(`Failed to decode DidRegistry__DidNotFound error: ${error.message}`);
    }
  }

  /**
   * Directly decode a DidRegistry__Unauthorized error
   * @param data The error data
   * @returns The decoded error arguments and a user-friendly message
   */
  public decodeUnauthorizedError(data: string): { args: Record<string, any>; message: string } {
    try {
      const args = this.decodeKnownError('DidRegistry__Unauthorized', data);
      return {
        args,
        message: 'Unauthorized: Caller does not have permission to perform this action',
      };
    } catch (error) {
      throw new Error(`Failed to decode DidRegistry__Unauthorized error: ${error.message}`);
    }
  }

  /**
   * Directly decode a DidRegistry__DidDeactivated error
   * @param data The error data
   * @returns The decoded error arguments and a user-friendly message
   */
  public decodeDidDeactivatedError(data: string): { args: Record<string, any>; message: string } {
    try {
      const args = this.decodeKnownError('DidRegistry__DidDeactivated', data);
      return {
        args,
        message: 'DID deactivated: The DID has been deactivated and cannot be used',
      };
    } catch (error) {
      throw new Error(`Failed to decode DidRegistry__DidDeactivated error: ${error.message}`);
    }
  }

  /**
   * Formats an error message based on the error name and arguments
   * @param errorName The name of the error
   * @param args The error arguments
   * @returns A formatted error message
   */
  protected formatErrorMessage(errorName: string, args: Record<string, any>): string {
    // Format DidRegistry-specific errors
    switch (errorName) {
      case 'DidRegistry__InvalidDid':
        return 'Invalid DID: The DID format is invalid or malformed';

      case 'DidRegistry__DidAlreadyExists':
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

      case 'DidRegistry__DidDeactivated':
        return 'DID deactivated: The DID has been deactivated and cannot be used';

      case 'DidRegistry__DidSuspended':
        return 'DID suspended: The DID has been suspended and cannot be used';

      // Access control errors
      case 'AccessControlUnauthorizedAccount':
        return `Account ${args.account} is missing role ${args.neededRole}`;

      case 'OwnableUnauthorizedAccount':
        return `Caller ${args.account} is not the owner`;

      case 'OwnableInvalidOwner':
        return `Invalid owner: ${args.owner}`;

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
