import { Contract } from 'ethers';

import { BaseErrorHandler } from './BaseErrorHandler';

/**
 * Error handler for the Token contract
 */
export class TokenErrorHandler extends BaseErrorHandler {
  /**
   * Creates a new instance of the TokenErrorHandler
   * @param contract The Token contract instance
   */
  constructor(contract: Contract) {
    super(contract);
  }

  /**
   * Directly decode an ERC20InsufficientBalance error
   * @param data The error data
   * @returns The decoded error arguments and a user-friendly message
   */
  public decodeInsufficientBalanceError(data: string): {
    args: Record<string, any>;
    message: string;
  } {
    try {
      const args = this.decodeKnownError('ERC20InsufficientBalance', data);
      return {
        args,
        message: `Insufficient balance: address ${args.sender} has ${args.balance} but needs ${args.needed}`,
      };
    } catch (error) {
      throw new Error(`Failed to decode ERC20InsufficientBalance error: ${error.message}`);
    }
  }

  /**
   * Directly decode an ERC20InsufficientAllowance error
   * @param data The error data
   * @returns The decoded error arguments and a user-friendly message
   */
  public decodeInsufficientAllowanceError(data: string): {
    args: Record<string, any>;
    message: string;
  } {
    try {
      const args = this.decodeKnownError('ERC20InsufficientAllowance', data);
      return {
        args,
        message: `Insufficient allowance: spender ${args.spender} has allowance ${args.allowance} but needs ${args.needed}`,
      };
    } catch (error) {
      throw new Error(`Failed to decode ERC20InsufficientAllowance error: ${error.message}`);
    }
  }

  /**
   * Formats an error message based on the error name and arguments
   * @param errorName The name of the error
   * @param args The error arguments
   * @returns A formatted error message
   */
  protected formatErrorMessage(errorName: string, args: Record<string, any>): string {
    // Format Token-specific errors
    switch (errorName) {
      // ERC20 standard errors
      case 'ERC20InsufficientBalance':
        return `Insufficient balance: address ${args.sender} has ${args.balance} but needs ${args.needed}`;

      case 'ERC20InsufficientAllowance':
        return `Insufficient allowance: spender ${args.spender} has allowance ${args.allowance} but needs ${args.needed}`;

      case 'ERC20InvalidSender':
        return `Invalid sender: ${args.sender}`;

      case 'ERC20InvalidReceiver':
        return `Invalid receiver: ${args.receiver}`;

      case 'ERC20Paused':
        return 'Token transfers are paused';

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
