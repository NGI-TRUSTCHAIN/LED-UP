import { Contract } from 'ethers';

import { BaseEventParser, ParsedEvent } from './BaseEventParser';

/**
 * Event parser for the ZKP contract
 */
export class ZKPEventParser extends BaseEventParser {
  /**
   * Creates a new instance of the ZKPEventParser
   * @param contract The ZKP contract instance
   */
  constructor(contract: Contract) {
    super(contract);
  }

  /**
   * Directly decode a ProofVerified event
   * @param data The event data
   * @param topics The event topics
   * @returns The decoded event arguments
   */
  public decodeProofVerifiedEvent(data: string, topics: string[]): Record<string, any> {
    try {
      const args = this.decodeKnownEvent('ProofVerified', data, topics);
      return {
        ...args,
        description: 'Zero-knowledge proof verified successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to decode ProofVerified event: ${error.message}`);
    }
  }

  /**
   * Directly decode a ProofRejected event
   * @param data The event data
   * @param topics The event topics
   * @returns The decoded event arguments
   */
  public decodeProofRejectedEvent(data: string, topics: string[]): Record<string, any> {
    try {
      const args = this.decodeKnownEvent('ProofRejected', data, topics);
      return {
        ...args,
        description: `Zero-knowledge proof rejected: ${args.reason || 'Invalid proof'}`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to decode ProofRejected event: ${error.message}`);
    }
  }

  /**
   * Process event-specific data for ZKP events
   * @param event The parsed event
   * @returns Processed event data with additional context
   */
  protected processEventData(event: ParsedEvent): Record<string, any> {
    // Process ZKP-specific events
    switch (event.name) {
      case 'ProofVerified':
        return this.processProofVerifiedEvent(event);

      case 'ProofRejected':
        return this.processProofRejectedEvent(event);

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
   * Process ProofVerified event
   * @param event The parsed event
   * @returns Processed event data
   */
  private processProofVerifiedEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Zero-knowledge proof verified successfully`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Process ProofRejected event
   * @param event The parsed event
   * @returns Processed event data
   */
  private processProofRejectedEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Zero-knowledge proof rejected: ${event.args.reason || 'Invalid proof'}`,
      timestamp: new Date().toISOString(),
    };
  }
}
