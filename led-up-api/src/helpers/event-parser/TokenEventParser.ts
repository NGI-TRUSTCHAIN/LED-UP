import { Contract } from 'ethers';

import { BaseEventParser, ParsedEvent } from './BaseEventParser';

/**
 * Event parser for the Token contract
 */
export class TokenEventParser extends BaseEventParser {
  /**
   * Creates a new instance of the TokenEventParser
   * @param contract The Token contract instance
   */
  constructor(contract: Contract) {
    super(contract);
  }

  /**
   * Directly decode a Transfer event
   * @param data The event data
   * @param topics The event topics
   * @returns The decoded event arguments
   */
  public decodeTransferEvent(data: string, topics: string[]): Record<string, any> {
    try {
      const args = this.decodeKnownEvent('Transfer', data, topics);
      return {
        ...args,
        description: `Transfer of ${args.value} tokens from ${args.from} to ${args.to}`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to decode Transfer event: ${error.message}`);
    }
  }

  /**
   * Directly decode an Approval event
   * @param data The event data
   * @param topics The event topics
   * @returns The decoded event arguments
   */
  public decodeApprovalEvent(data: string, topics: string[]): Record<string, any> {
    try {
      const args = this.decodeKnownEvent('Approval', data, topics);
      return {
        ...args,
        description: `Approval of ${args.value} tokens from ${args.owner} to ${args.spender}`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to decode Approval event: ${error.message}`);
    }
  }

  /**
   * Process event-specific data for Token events
   * @param event The parsed event
   * @returns Processed event data with additional context
   */
  protected processEventData(event: ParsedEvent): Record<string, any> {
    // Process Token-specific events
    switch (event.name) {
      case 'Transfer':
        return this.processTransferEvent(event);

      case 'Approval':
        return this.processApprovalEvent(event);

      case 'OwnershipTransferred':
        return this.processOwnershipTransferredEvent(event);

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
   * Process Transfer event
   * @param event The parsed event
   * @returns Processed event data
   */
  private processTransferEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Transfer of ${event.args.value} tokens from ${event.args.from} to ${event.args.to}`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Process Approval event
   * @param event The parsed event
   * @returns Processed event data
   */
  private processApprovalEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Approval of ${event.args.value} tokens from ${event.args.owner} to ${event.args.spender}`,
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
}
