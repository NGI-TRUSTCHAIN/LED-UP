import { Contract } from 'ethers';

import { BaseErrorHandler } from './BaseErrorHandler';

/**
 * Error handler for the DidAuth contract
 */
export class DidAuthErrorHandler extends BaseErrorHandler {
  /**
   * Creates a new instance of the DidAuthErrorHandler
   * @param contract The DidAuth contract instance
   */
  constructor(contract: Contract) {
    super(contract);
  }

  /**
   * Directly decode a DidAuth__Unauthorized error
   * @param data The error data
   * @returns The decoded error arguments and a user-friendly message
   */
  public decodeUnauthorizedError(data: string): { args: Record<string, any>; message: string } {
    try {
      const args = this.decodeKnownError('DidAuth__Unauthorized', data);
      return {
        args,
        message: 'Unauthorized: You do not have permission to perform this action',
      };
    } catch (error) {
      throw new Error(`Failed to decode DidAuth__Unauthorized error: ${error.message}`);
    }
  }

  /**
   * Directly decode a DidAuth__InvalidCredential error
   * @param data The error data
   * @returns The decoded error arguments and a user-friendly message
   */
  public decodeInvalidCredentialError(data: string): {
    args: Record<string, any>;
    message: string;
  } {
    try {
      const args = this.decodeKnownError('DidAuth__InvalidCredential', data);
      return {
        args,
        message: 'Invalid credential: The credential is invalid or has expired',
      };
    } catch (error) {
      throw new Error(`Failed to decode DidAuth__InvalidCredential error: ${error.message}`);
    }
  }

  /**
   * Directly decode a DidAuth__CredentialVerificationFailed error
   * @param data The error data
   * @returns The decoded error arguments and a user-friendly message
   */
  public decodeCredentialVerificationFailedError(data: string): {
    args: Record<string, any>;
    message: string;
  } {
    try {
      const args = this.decodeKnownError('DidAuth__CredentialVerificationFailed', data);
      return {
        args,
        message: 'Credential verification failed: The credential could not be verified',
      };
    } catch (error) {
      throw new Error(
        `Failed to decode DidAuth__CredentialVerificationFailed error: ${error.message}`
      );
    }
  }

  /**
   * Formats an error message based on the error name and arguments
   * @param errorName The name of the error
   * @param args The error arguments
   * @returns A formatted error message
   */
  protected formatErrorMessage(errorName: string, args: Record<string, any>): string {
    // Format DidAuth-specific errors
    switch (errorName) {
      case 'DidAuth__Unauthorized':
        return 'Unauthorized: You do not have permission to perform this action';

      case 'DidAuth__InvalidDID':
        return 'Invalid DID: The DID format is invalid or does not exist';

      case 'DidAuth__DeactivatedDID':
        return 'Deactivated DID: The DID has been deactivated and cannot be used';

      case 'DidAuth__InvalidCredential':
        return 'Invalid credential: The credential is invalid or has expired';

      case 'DidAuth__InvalidRole':
        return 'Invalid role: The specified role is invalid or does not exist';

      case 'DidAuth__CredentialVerificationFailed':
        return 'Credential verification failed: The credential could not be verified';

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
