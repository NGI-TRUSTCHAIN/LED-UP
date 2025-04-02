import { Abi } from 'viem';
import { BaseErrorHandler } from './BaseErrorHandler';

/**
 * Error handler for the DidVerifier contract
 */
export class DidVerifierErrorHandler extends BaseErrorHandler {
  /**
   * Creates a new instance of the DidVerifierErrorHandler
   * @param abi The DidVerifier contract ABI
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
    // Format DidVerifier-specific errors
    switch (errorName) {
      case 'DidVerifier__InvalidIssuer':
        return 'Invalid issuer: The issuer address is invalid';

      case 'DidVerifier__UntrustedIssuer':
        return 'Untrusted issuer: The issuer is not trusted for this credential type';

      case 'DidVerifier__InvalidCredential':
        return 'Invalid credential: The credential is invalid or the subject is not active';

      case 'DidVerifier__InvalidDID':
        return 'Invalid DID: The DID format is invalid or malformed';

      case 'DidVerifier__CredentialRevoked':
        return 'Credential revoked: The credential has been revoked and is no longer valid';

      case 'DidVerifier__CredentialExpired':
        return 'Credential expired: The credential has expired and is no longer valid';

      case 'DidVerifier__InvalidSignature':
        return 'Invalid signature: The signature is invalid or does not match the issuer';

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
