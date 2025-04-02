import { Abi } from 'viem';
import { BaseErrorHandler } from './BaseErrorHandler';

/**
 * Error handler for the Consent contract
 */
export class ConsentErrorHandler extends BaseErrorHandler {
  /**
   * Creates a new instance of the ConsentErrorHandler
   * @param abi The Consent contract ABI
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
    // Format Consent-specific errors
    switch (errorName) {
      case 'ConsentManagement__InvalidDID':
        return 'Invalid DID: The DID format is invalid or does not exist';

      case 'ConsentManagement__NotFound':
        return 'Consent not found: The specified consent record does not exist';

      case 'ConsentManagement__AlreadyGranted':
        return 'Consent already granted: The consent has already been granted for this purpose';

      case 'ConsentManagement__Unauthorized':
        return 'Unauthorized: Caller does not have permission to perform this action';

      case 'ConsentManagementCore__Unauthorized':
        return 'Unauthorized: Caller does not have permission to perform this action';

      case 'ConsentManagementCore__InvalidDID':
        return 'Invalid DID: The DID format is invalid or does not exist';

      case 'ConsentManagementCore__InvalidConsent':
        return 'Invalid consent: The consent data is invalid or malformed';

      case 'ConsentManagementCore__ConsentNotFound':
        return 'Consent not found: The specified consent record does not exist';

      case 'ConsentManagementCore__ConsentExpired':
        return 'Consent expired: The consent has expired and is no longer valid';

      case 'ConsentManagementCore__InvalidPurpose':
        return 'Invalid purpose: The purpose is not recognized or not properly configured';

      case 'ConsentManagementCore__InvalidTimestamp':
        return 'Invalid timestamp: The timestamp is invalid or in the future';

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
