import { Contract } from 'ethers';

import { BaseErrorHandler } from './BaseErrorHandler';

/**
 * Error handler for the DataRegistry contract
 */
export class DataRegistryErrorHandler extends BaseErrorHandler {
  /**
   * Creates a new instance of the DataRegistryErrorHandler
   * @param contract The DataRegistry contract instance
   */
  constructor(contract: Contract) {
    super(contract);
  }

  /**
   * Directly decode a DataRegistry__RecordNotFound error
   * @param data The error data
   * @returns The decoded error arguments and a user-friendly message
   */
  public decodeRecordNotFoundError(data: string): { args: Record<string, any>; message: string } {
    try {
      const args = this.decodeKnownError('DataRegistry__RecordNotFound', data);
      return {
        args,
        message: `Record not found: No record exists with ID ${args.recordId}`,
      };
    } catch (error) {
      throw new Error(`Failed to decode DataRegistry__RecordNotFound error: ${error.message}`);
    }
  }

  /**
   * Directly decode a DataRegistry__Unauthorized error
   * @param data The error data
   * @returns The decoded error arguments and a user-friendly message
   */
  public decodeUnauthorizedError(data: string): { args: Record<string, any>; message: string } {
    try {
      const args = this.decodeKnownError('DataRegistry__Unauthorized', data);
      return {
        args,
        message: 'Unauthorized: You do not have permission to perform this action',
      };
    } catch (error) {
      throw new Error(`Failed to decode DataRegistry__Unauthorized error: ${error.message}`);
    }
  }

  /**
   * Directly decode a DataRegistry__AccessDenied error
   * @param data The error data
   * @returns The decoded error arguments and a user-friendly message
   */
  public decodeAccessDeniedError(data: string): { args: Record<string, any>; message: string } {
    try {
      const args = this.decodeKnownError('DataRegistry__AccessDenied', data);
      return {
        args,
        message: `Access denied: Consumer ${args.consumer} does not have access to record ${args.recordId}`,
      };
    } catch (error) {
      throw new Error(`Failed to decode DataRegistry__AccessDenied error: ${error.message}`);
    }
  }

  /**
   * Formats an error message based on the error name and arguments
   * @param errorName The name of the error
   * @param args The error arguments
   * @returns A formatted error message
   */
  protected formatErrorMessage(errorName: string, args: Record<string, any>): string {
    // Format DataRegistry-specific errors
    switch (errorName) {
      case 'DataRegistry__AccessDenied':
        return `Access denied: Consumer ${args.consumer} does not have access to record ${args.recordId}`;

      case 'DataRegistry__AlreadyRegistered':
        return `Producer ${args.producer} is already registered`;

      case 'DataRegistry__ConsentNotAllowed':
        return `Consent not allowed: Record ${args.recordId} from producer ${args.producer}`;

      case 'DataRegistry__DidAuthNotInitialized':
        return 'DID Auth not initialized: The DID authentication service is not initialized';

      case 'DataRegistry__ExpiredAccess':
        return `Expired access: Consumer ${args.consumer} access to record ${args.recordId} expired at ${args.expiration}`;

      case 'DataRegistry__InvalidAccessDuration':
        return `Invalid access duration: Provided ${args.provided}, must be between ${args.min} and ${args.max}`;

      case 'DataRegistry__InvalidContentHash':
        return 'Invalid content hash: The content hash is invalid or malformed';

      case 'DataRegistry__InvalidDID':
        return `Invalid DID: The DID ${args.did} is invalid or does not exist`;

      case 'DataRegistry__InvalidDidAuthAddress':
        return 'Invalid DID Auth address: The DID authentication service address is invalid';

      case 'DataRegistry__PaymentNotVerified':
        return `Payment not verified: Payment for record ${args.recordId} has not been verified`;

      case 'DataRegistry__RecordAlreadyExists':
        return `Record already exists: Record with ID ${args.recordId} already exists`;

      case 'DataRegistry__RecordNotFound':
        return `Record not found: No record exists with ID ${args.recordId}`;

      case 'DataRegistry__Unauthorized':
        return 'Unauthorized: You do not have permission to perform this action';

      // Handle OpenZeppelin errors
      case 'AccessControlBadConfirmation':
        return 'Invalid confirmation for role renouncement';

      case 'AccessControlUnauthorizedAccount':
        return `Account ${args.account} is missing role ${args.neededRole}`;

      case 'OwnableUnauthorizedAccount':
        return `Caller ${args.account} is not the owner`;

      case 'OwnableInvalidOwner':
        return `Invalid owner: ${args.owner}`;

      case 'EnforcedPause':
        return 'Operation is paused';

      case 'ExpectedPause':
        return 'Operation is not paused';

      case 'ReentrancyGuardReentrantCall':
        return 'Reentrant call detected';

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
