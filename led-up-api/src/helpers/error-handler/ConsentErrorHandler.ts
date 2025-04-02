import { Contract } from 'ethers';

import { BaseErrorHandler } from './BaseErrorHandler';

/**
 * Error handler for the Consent contract
 */
export class ConsentErrorHandler extends BaseErrorHandler {
  /**
   * Creates a new instance of the ConsentErrorHandler
   * @param contract The Consent contract instance
   */
  constructor(contract: Contract) {
    super(contract);
  }

  /**
   * Directly decode a ConsentManagement__AlreadyGranted error
   * @param data The error data
   * @returns The decoded error arguments and a user-friendly message
   */
  public decodeAlreadyGrantedError(data: string): { args: Record<string, any>; message: string } {
    try {
      const args = this.decodeKnownError('ConsentManagement__AlreadyGranted', data);
      return {
        args,
        message: 'Consent already granted: Cannot grant consent that is already active',
      };
    } catch (error) {
      throw new Error(`Failed to decode ConsentManagement__AlreadyGranted error: ${error.message}`);
    }
  }

  /**
   * Directly decode a ConsentManagement__AlreadyRevoked error
   * @param data The error data
   * @returns The decoded error arguments and a user-friendly message
   */
  public decodeAlreadyRevokedError(data: string): { args: Record<string, any>; message: string } {
    try {
      const args = this.decodeKnownError('ConsentManagement__AlreadyRevoked', data);
      return {
        args,
        message: 'Consent already revoked: Cannot revoke consent that is already revoked',
      };
    } catch (error) {
      throw new Error(`Failed to decode ConsentManagement__AlreadyRevoked error: ${error.message}`);
    }
  }

  /**
   * Formats an error message based on the error name and arguments
   * @param errorName The name of the error
   * @param args The error arguments
   * @returns A formatted error message
   */
  protected formatErrorMessage(errorName: string, args: Record<string, any>): string {
    // Format Consent-specific errors
    switch (errorName) {
      case 'ConsentManagement__InvalidDID':
        return 'Invalid DID: The DID does not exist or is not active';

      case 'ConsentManagement__NotFound':
        return 'Consent not found: No consent record exists for this relationship';

      case 'ConsentManagement__AlreadyGranted':
        return 'Consent already granted: Cannot grant consent that is already active';

      case 'ConsentManagement__AlreadyRevoked':
        return 'Consent already revoked: Cannot revoke consent that is already revoked';

      case 'ConsentManagement__Unauthorized':
        return 'Unauthorized: Caller does not have permission to perform this action';

      case 'ConsentManagement__InvalidStatus':
        return 'Invalid status: The consent status is invalid';

      case 'ConsentManagement__InvalidPurpose':
        return 'Invalid purpose: The consent purpose is invalid or not allowed';

      case 'ConsentManagement__InvalidExpiration':
        return 'Invalid expiration: The consent expiration date is invalid';

      case 'ConsentManagement__Expired':
        return 'Consent expired: The consent has expired and is no longer valid';

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
