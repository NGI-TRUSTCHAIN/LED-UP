import { Abi } from 'viem';
import { BaseErrorHandler } from './BaseErrorHandler';

/**
 * Error handler for the DidIssuer contract
 */
export class DidIssuerErrorHandler extends BaseErrorHandler {
  /**
   * Creates a new instance of the DidIssuerErrorHandler
   * @param abi The DidIssuer contract ABI
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
    // Format DidIssuer-specific errors
    switch (errorName) {
      case 'DidIssuer__InvalidSubject':
        return 'Invalid subject: The subject DID is invalid or not active';

      case 'DidIssuer__CredentialAlreadyIssued':
        return 'Credential already issued: A credential with this ID has already been issued';

      case 'DidIssuer__InvalidCredentialType':
        return 'Invalid credential type: The credential type is not supported';

      case 'DidIssuer__Unauthorized':
        return 'Unauthorized: Caller does not have permission to perform this action';

      case 'DidIssuer__InvalidDID':
        return 'Invalid DID: The DID format is invalid or malformed';

      case 'DidIssuer__InvalidCredential':
        return 'Invalid credential: The credential data is invalid or malformed';

      case 'DidIssuer__CredentialAlreadyExists':
        return 'Credential already exists: A credential with this ID already exists';

      case 'DidIssuer__CredentialRevoked':
        return 'Credential revoked: The credential has been revoked and cannot be used';

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
