import { Contract } from 'ethers';

import { BaseErrorHandler } from './BaseErrorHandler';

/**
 * Error handler for the DidIssuer contract
 */
export class DidIssuerErrorHandler extends BaseErrorHandler {
  /**
   * Creates a new instance of the DidIssuerErrorHandler
   * @param contract The DidIssuer contract instance
   */
  constructor(contract: Contract) {
    super(contract);
  }

  /**
   * Directly decode a DidIssuer__CredentialAlreadyIssued error
   * @param data The error data
   * @returns The decoded error arguments and a user-friendly message
   */
  public decodeCredentialAlreadyIssuedError(data: string): {
    args: Record<string, any>;
    message: string;
  } {
    try {
      const args = this.decodeKnownError('DidIssuer__CredentialAlreadyIssued', data);
      return {
        args,
        message: 'Credential already issued: A credential with this ID has already been issued',
      };
    } catch (error) {
      throw new Error(
        `Failed to decode DidIssuer__CredentialAlreadyIssued error: ${error.message}`
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
    // Format DidIssuer-specific errors
    switch (errorName) {
      case 'DidIssuer__InvalidSubject':
        return 'Invalid subject: The subject DID is invalid or not active';

      case 'DidIssuer__CredentialAlreadyIssued':
        return 'Credential already issued: A credential with this ID has already been issued';

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
