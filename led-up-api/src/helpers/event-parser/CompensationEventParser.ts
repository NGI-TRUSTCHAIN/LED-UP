import { Contract } from 'ethers';

import { BaseEventParser, ParsedEvent } from './BaseEventParser';

/**
 * Event parser for the Compensation contract
 */
export class CompensationEventParser extends BaseEventParser {
  /**
   * Creates a new instance of the CompensationEventParser
   * @param contract The Compensation contract instance
   */
  constructor(contract: Contract) {
    super(contract);
  }

  /**
   * Directly decode a PaymentProcessed event
   * @param data The event data
   * @param topics The event topics
   * @returns The decoded event arguments
   */
  public decodePaymentProcessedEvent(data: string, topics: string[]): Record<string, any> {
    try {
      const args = this.decodeKnownEvent('PaymentProcessed', data, topics);
      return {
        ...args,
        description: `Payment of ${args.amount} processed from consumer ${args._consumer} to producer ${args._producer} with service fee ${args.serviceFee}`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to decode PaymentProcessed event: ${error.message}`);
    }
  }

  /**
   * Directly decode a ProducerPaid event
   * @param data The event data
   * @param topics The event topics
   * @returns The decoded event arguments
   */
  public decodeProducerPaidEvent(data: string, topics: string[]): Record<string, any> {
    try {
      const args = this.decodeKnownEvent('ProducerPaid', data, topics);
      return {
        ...args,
        description: `Producer ${args.producer} paid ${args.amount} at timestamp ${args.timestamp}`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to decode ProducerPaid event: ${error.message}`);
    }
  }

  /**
   * Process event-specific data for Compensation events
   * @param event The parsed event
   * @returns Processed event data with additional context
   */
  protected processEventData(event: ParsedEvent): Record<string, any> {
    // Process Compensation-specific events
    switch (event.name) {
      case 'ProducerRemoved':
        return this.processProducerRemovedEvent(event);

      case 'ProducerPaid':
        return this.processProducerPaidEvent(event);

      case 'ServiceFeeWithdrawn':
        return this.processServiceFeeWithdrawnEvent(event);

      case 'ServiceFeeChanged':
        return this.processServiceFeeChangedEvent(event);

      case 'PaymentProcessed':
        return this.processPaymentProcessedEvent(event);

      case 'UnitPriceChanged':
        return this.processUnitPriceChangedEvent(event);

      case 'OwnershipTransferred':
        return this.processOwnershipTransferredEvent(event);

      case 'Paused':
        return this.processPausedEvent(event);

      case 'Unpaused':
        return this.processUnpausedEvent(event);

      default:
        // For unknown events, return the original event data
        return {
          ...event.args,
          eventName: event.name,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
        };
    }
  }

  /**
   * Process ProducerRemoved event
   * @param event The parsed event
   * @returns Processed event data
   */
  private processProducerRemovedEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Producer ${event.args.producer} removed at timestamp ${event.args.timestamp}`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Process ProducerPaid event
   * @param event The parsed event
   * @returns Processed event data
   */
  private processProducerPaidEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Producer ${event.args.producer} paid ${event.args.amount} at timestamp ${event.args.timestamp}`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Process ServiceFeeWithdrawn event
   * @param event The parsed event
   * @returns Processed event data
   */
  private processServiceFeeWithdrawnEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Service fee of ${event.args.amount} withdrawn to wallet ${event.args.wallet} at timestamp ${event.args.timestamp}`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Process ServiceFeeChanged event
   * @param event The parsed event
   * @returns Processed event data
   */
  private processServiceFeeChangedEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Service fee changed from ${event.args.oldServiceFee} to ${event.args.newServiceFee} by ${event.args.initiator}`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Process PaymentProcessed event
   * @param event The parsed event
   * @returns Processed event data
   */
  private processPaymentProcessedEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Payment of ${event.args.amount} processed from consumer ${event.args._consumer} to producer ${event.args._producer} with service fee ${event.args.serviceFee}`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Process UnitPriceChanged event
   * @param event The parsed event
   * @returns Processed event data
   */
  private processUnitPriceChangedEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Unit price changed from ${event.args.oldUnitPrice} to ${event.args.newUnitPrice} by ${event.args.initiator}`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Process OwnershipTransferred event
   * @param event The parsed event
   * @returns Processed event data
   */
  private processOwnershipTransferredEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Ownership transferred from ${event.args.previousOwner} to ${event.args.newOwner}`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Process Paused event
   * @param event The parsed event
   * @returns Processed event data
   */
  private processPausedEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Contract paused by account ${event.args.account}`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Process Unpaused event
   * @param event The parsed event
   * @returns Processed event data
   */
  private processUnpausedEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Contract unpaused by account ${event.args.account}`,
      timestamp: new Date().toISOString(),
    };
  }
}
