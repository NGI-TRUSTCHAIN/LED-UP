import { Abi } from 'viem';
import { BaseErrorHandler } from './BaseErrorHandler';

/**
 * Error handler for the Compensation contract
 */
export class CompensationErrorHandler extends BaseErrorHandler {
  /**
   * Creates a new instance of the CompensationErrorHandler
   * @param abi The Compensation contract ABI
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
    // Format Compensation-specific errors
    switch (errorName) {
      case 'Compensation__ProducerAlreadyExists':
        return 'Producer already exists: The producer is already registered in the system';

      case 'Compensation__InsufficientBalance':
        return 'Insufficient balance: The account does not have enough balance for this operation';

      case 'Compensation__NoBalanceToWithdraw':
        return 'No balance to withdraw: The account has no balance available for withdrawal';

      case 'Compensation__TokenTransferFailed':
        return 'Token transfer failed: The token transfer operation has failed';

      case 'Compensation__OnlyOwnerCanWithdraw':
        return 'Only owner can withdraw: Only the owner of the account can withdraw funds';

      case 'Compensation__LowDepositAmount':
        return 'Low deposit amount: The deposit amount is below the minimum required';

      case 'Compensation__MinimumWithdrawAmount':
        return 'Minimum withdraw amount: The withdrawal amount is below the minimum required';

      case 'Compensation__InvalidAddress':
        return 'Invalid address: The provided address is invalid or zero';

      case 'Compensation__InvalidInputParam':
        return 'Invalid input parameter: One or more input parameters are invalid';

      case 'Compensation__InvalidProducerDID':
        return 'Invalid producer DID: The producer DID is invalid or not registered';

      case 'Compensation__InvalidConsumerDID':
        return 'Invalid consumer DID: The consumer DID is invalid or not registered';

      case 'Compensation__InvalidRole':
        return 'Invalid role: The role is not recognized or not assigned to the DID';

      case 'Compensation__InvalidProducer':
        return 'Invalid producer: The producer address is invalid or not registered';

      case 'Compensation__InvalidConsumer':
        return 'Invalid consumer: The consumer address is invalid or not registered';

      case 'Compensation__InvalidAmount':
        return 'Invalid amount: The amount specified is invalid or zero';

      case 'Compensation__PaymentFailed':
        return 'Payment failed: The payment operation has failed';

      case 'Compensation__InvalidServiceFee':
        return 'Invalid service fee: The service fee percentage is invalid';

      case 'Compensation__InvalidUnitPrice':
        return 'Invalid unit price: The unit price is invalid or zero';

      case 'Compensation__InvalidRecordId':
        return 'Invalid record ID: The record ID is invalid or does not exist';

      case 'Compensation__PaymentAlreadyProcessed':
        return 'Payment already processed: The payment for this record has already been processed';

      case 'Compensation__BelowMinimumWithdrawAmount':
        return 'Below minimum withdraw amount: The withdrawal amount is below the minimum required';

      case 'CompensationCore__Unauthorized':
        return 'Unauthorized: Caller does not have permission to perform this action';

      case 'CompensationCore__InvalidAmount':
        return 'Invalid amount: The amount specified is invalid or zero';

      case 'CompensationCore__InvalidAddress':
        return 'Invalid address: The provided address is invalid or zero';

      case 'CompensationCore__TransferFailed':
        return 'Transfer failed: The transfer operation has failed';

      case 'CompensationCore__InsufficientBalance':
        return 'Insufficient balance: The account does not have enough balance for this operation';

      case 'CompensationCore__NotImplemented':
        return 'Not implemented: This function is not yet implemented';

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
