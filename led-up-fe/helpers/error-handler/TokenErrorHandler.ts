import { Abi } from 'viem';
import { BaseErrorHandler } from './BaseErrorHandler';

/**
 * Error handler for the Token contract
 */
export class TokenErrorHandler extends BaseErrorHandler {
  /**
   * Creates a new instance of the TokenErrorHandler
   * @param abi The Token contract ABI
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
    // Format Token-specific errors
    switch (errorName) {
      // ERC20 standard errors
      case 'ERC20InsufficientBalance':
        return `Insufficient balance: Account ${args.sender} has ${args.balance} but needs ${args.needed}`;

      case 'ERC20InvalidSender':
        return `Invalid sender: ${args.sender}`;

      case 'ERC20InvalidReceiver':
        return `Invalid receiver: ${args.receiver}`;

      case 'ERC20InsufficientAllowance':
        return `Insufficient allowance: Spender ${args.spender} has allowance ${args.allowance} but needs ${args.needed}`;

      case 'ERC20InvalidApprover':
        return `Invalid approver: ${args.approver}`;

      case 'ERC20InvalidSpender':
        return `Invalid spender: ${args.spender}`;

      // Access control errors
      case 'AccessControlUnauthorizedAccount':
        return `Account ${args.account} is missing role ${args.neededRole}`;

      case 'OwnableUnauthorizedAccount':
        return `Caller ${args.account} is not the owner`;

      case 'OwnableInvalidOwner':
        return `Invalid owner: ${args.owner}`;

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
