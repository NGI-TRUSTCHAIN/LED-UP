import { Contract } from 'ethers';

import { BaseErrorHandler } from './BaseErrorHandler';

/**
 * Error handler for the DidVerifier contract
 */
export class DidVerifierErrorHandler extends BaseErrorHandler {
  /**
   * Creates a new instance of the DidVerifierErrorHandler
   * @param contract The DidVerifier contract instance
   */
  constructor(contract: Contract) {
    super(contract);
  }

  /**
   * Directly decode a DidVerifier__UntrustedIssuer error
   * @param data The error data
   * @returns The decoded error arguments and a user-friendly message
   */
  public decodeUntrustedIssuerError(data: string): { args: Record<string, any>; message: string } {
    try {
      const args = this.decodeKnownError('DidVerifier__UntrustedIssuer', data);
      return {
        args,
        message: 'Untrusted issuer: The issuer is not trusted for this credential type',
      };
    } catch (error) {
      throw new Error(`Failed to decode DidVerifier__UntrustedIssuer error: ${error.message}`);
    }
  }

  /**
   * Formats an error message based on the error name and arguments
   * @param errorName The name of the error
   * @param args The error arguments
   * @returns A formatted error message
   */
  protected formatErrorMessage(errorName: string, args: Record<string, any>): string {
    // Format DidVerifier-specific errors
    switch (errorName) {
      case 'DidVerifier__InvalidIssuer':
        return 'Invalid issuer: The issuer address is invalid';

      case 'DidVerifier__UntrustedIssuer':
        return 'Untrusted issuer: The issuer is not trusted for this credential type';

      case 'DidVerifier__InvalidCredential':
        return 'Invalid credential: The credential is invalid or the subject is not active';

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
