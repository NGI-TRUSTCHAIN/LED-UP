import { Contract } from 'ethers';

import { BaseErrorHandler } from './BaseErrorHandler';

/**
 * Error handler for the DidAccessControl contract
 */
export class DidAccessControlErrorHandler extends BaseErrorHandler {
  /**
   * Creates a new instance of the DidAccessControlErrorHandler
   * @param contract The DidAccessControl contract instance
   */
  constructor(contract: Contract) {
    super(contract);
  }

  /**
   * Directly decode a DidAccessControl__UnauthorizedDID error
   * @param data The error data
   * @returns The decoded error arguments and a user-friendly message
   */
  public decodeUnauthorizedDidError(data: string): { args: Record<string, any>; message: string } {
    try {
      const args = this.decodeKnownError('DidAccessControl__UnauthorizedDID', data);
      return {
        args,
        message: 'Unauthorized DID: The DID does not have permission to perform this action',
      };
    } catch (error) {
      throw new Error(`Failed to decode DidAccessControl__UnauthorizedDID error: ${error.message}`);
    }
  }

  /**
   * Directly decode a DidAccessControl__MissingRequirement error
   * @param data The error data
   * @returns The decoded error arguments and a user-friendly message
   */
  public decodeMissingRequirementError(data: string): {
    args: Record<string, any>;
    message: string;
  } {
    try {
      const args = this.decodeKnownError('DidAccessControl__MissingRequirement', data);
      return {
        args,
        message: 'Missing requirement: The DID does not meet the requirements for the role',
      };
    } catch (error) {
      throw new Error(
        `Failed to decode DidAccessControl__MissingRequirement error: ${error.message}`
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
    // Format DidAccessControl-specific errors
    switch (errorName) {
      case 'DidAccessControl__InvalidDID':
        return 'Invalid DID: The DID format is invalid or does not exist';

      case 'DidAccessControl__InvalidRole':
        return 'Invalid role: The specified role is invalid or does not exist';

      case 'DidAccessControl__UnauthorizedDID':
        return 'Unauthorized DID: The DID does not have permission to perform this action';

      case 'DidAccessControl__MissingRequirement':
        return 'Missing requirement: The DID does not meet the requirements for the role';

      // AccessControl errors from OpenZeppelin
      case 'AccessControlUnauthorizedAccount':
        return `Account ${args.account} is missing role ${args.neededRole}`;

      case 'AccessControlBadConfirmation':
        return 'Invalid role confirmation';

      case 'AccessControlInvalidCapability':
        return 'Invalid capability';

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
