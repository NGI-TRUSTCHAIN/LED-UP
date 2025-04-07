import { Abi } from 'viem';
import { BaseEventParser, ParsedContractEvent } from './BaseEventParser';

/**
 * Event parser for the Compensation contract
 */
export class CompensationEventParser extends BaseEventParser {
  /**
   * Creates a new instance of the CompensationEventParser
   * @param abi The Compensation contract ABI
   */
  constructor(abi: Abi) {
    super(abi);
  }

  /**
   * Get a user-friendly description for an event
   * @param eventName The name of the event
   * @param args The event arguments
   * @returns A user-friendly description
   */
  protected getEventDescription(eventName: string, args: Record<string, any>): string {
    switch (eventName) {
      case 'ProducerRemoved':
        return `Producer ${args.producer} removed at timestamp ${args.timestamp}`;

      case 'ProducerPaid':
        return `Producer ${args.producer} paid ${args.amount} at timestamp ${args.timestamp}`;

      case 'ServiceFeeWithdrawn':
        return `Service fee of ${args.amount} withdrawn to wallet ${args.wallet} at timestamp ${args.timestamp}`;

      case 'ServiceFeeChanged':
        return `Service fee changed from ${args.oldServiceFee} to ${args.newServiceFee} by ${args.initiator}`;

      case 'PaymentProcessed':
        return `Payment of ${args.amount} processed from consumer ${args.consumer} to producer ${args.producer} with service fee ${args.serviceFee}`;

      case 'UnitPriceChanged':
        return `Unit price changed from ${args.oldUnitPrice} to ${args.newUnitPrice} by ${args.initiator}`;

      case 'OwnershipTransferred':
        return `Ownership transferred from ${args.previousOwner} to ${args.newOwner}`;

      case 'MinimumWithdrawAmountUpdated':
        return `Minimum withdrawal amount updated to ${args.amount}`;

      case 'TokenAddressUpdated':
        return `Token address updated to ${args.tokenAddress}`;

      default:
        return `Event: ${eventName}`;
    }
  }
}
