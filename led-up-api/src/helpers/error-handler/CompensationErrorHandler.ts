import { Contract } from 'ethers';

import { BaseErrorHandler } from './BaseErrorHandler';

/**
 * Error handler for the Compensation contract
 */
export class CompensationErrorHandler extends BaseErrorHandler {
  /**
   * Creates a new instance of the CompensationErrorHandler
   * @param contract The Compensation contract instance
   */
  constructor(contract: Contract) {
    super(contract);
  }

  /**
   * Directly decode a Compensation__InsufficientBalance error
   * @param data The error data
   * @returns The decoded error arguments and a user-friendly message
   */
  public decodeInsufficientBalanceError(data: string): {
    args: Record<string, any>;
    message: string;
  } {
    try {
      const args = this.decodeKnownError('Compensation__InsufficientBalance', data);
      return {
        args,
        message:
          'Insufficient balance: The account does not have enough balance to complete this operation',
      };
    } catch (error) {
      throw new Error(`Failed to decode Compensation__InsufficientBalance error: ${error.message}`);
    }
  }

  /**
   * Directly decode a Compensation__TokenTransferFailed error
   * @param data The error data
   * @returns The decoded error arguments and a user-friendly message
   */
  public decodeTokenTransferFailedError(data: string): {
    args: Record<string, any>;
    message: string;
  } {
    try {
      const args = this.decodeKnownError('Compensation__TokenTransferFailed', data);
      return {
        args,
        message: 'Token transfer failed: The token transfer operation failed',
      };
    } catch (error) {
      throw new Error(`Failed to decode Compensation__TokenTransferFailed error: ${error.message}`);
    }
  }

  /**
   * Formats an error message based on the error name and arguments
   * @param errorName The name of the error
   * @param args The error arguments
   * @returns A formatted error message
   */
  protected formatErrorMessage(errorName: string, args: Record<string, any>): string {
    // Format Compensation-specific errors
    switch (errorName) {
      case 'Compensation__ProducerAlreadyExists':
        return 'Producer already exists: Cannot register a producer that is already registered';

      case 'Compensation__InsufficientBalance':
        return 'Insufficient balance: The account does not have enough balance to complete this operation';

      case 'Compensation__NoBalanceToWithdraw':
        return 'No balance to withdraw: The account does not have any balance to withdraw';

      case 'Compensation__TokenTransferFailed':
        return 'Token transfer failed: The token transfer operation failed';

      case 'Compensation__OnlyOwnerCanWithdraw':
        return 'Only owner can withdraw: Only the contract owner can withdraw funds';

      case 'Compensation__LowDepositAmount':
        return 'Low deposit amount: The deposit amount is too low';

      case 'Compensation__MinimumWithdrawAmount':
        return 'Minimum withdraw amount: The withdrawal amount is below the minimum allowed';

      case 'Compensation__InvalidAddress':
        return 'Invalid address: The provided address is invalid';

      case 'Compensation__InvalidInputParam':
        return 'Invalid input parameter: One or more input parameters are invalid';

      case 'Compensation__InvalidProducerDID':
        return 'Invalid producer DID: The producer DID is invalid or not registered';

      case 'Compensation__InvalidConsumerDID':
        return 'Invalid consumer DID: The consumer DID is invalid or not registered';

      case 'Compensation__InvalidRole':
        return 'Invalid role: The account does not have the required role';

      case 'Compensation__InvalidProducer':
        return 'Invalid producer: The producer is invalid or not registered';

      case 'Compensation__InvalidConsumer':
        return 'Invalid consumer: The consumer is invalid or not registered';

      // Handle OpenZeppelin errors
      case 'AccessControlUnauthorizedAccount':
        return `Account ${args.account} is missing role ${args.neededRole}`;

      case 'OwnableUnauthorizedAccount':
        return `Caller ${args.account} is not the owner`;

      case 'OwnableInvalidOwner':
        return `Invalid owner: ${args.owner}`;

      case 'ERC20InsufficientBalance':
        return `Insufficient balance: address ${args.sender} has ${args.balance} but needs ${args.needed}`;

      case 'ERC20InsufficientAllowance':
        return `Insufficient allowance: spender ${args.spender} has allowance ${args.allowance} but needs ${args.needed}`;

      case 'ReentrancyGuardReentrantCall':
        return 'Reentrant call detected';

      // Handle Pausable errors
      case 'EnforcedPause':
        return 'Operation is paused';

      case 'ExpectedPause':
        return 'Operation is not paused';

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
