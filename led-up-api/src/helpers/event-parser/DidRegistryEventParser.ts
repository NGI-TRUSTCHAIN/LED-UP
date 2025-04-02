import { Contract } from 'ethers';

import { BaseEventParser, ParsedEvent } from './BaseEventParser';

/**
 * Event parser for the DidRegistry contract
 */
export class DidRegistryEventParser extends BaseEventParser {
  /**
   * Creates a new instance of the DidRegistryEventParser
   * @param contract The DidRegistry contract instance
   */
  constructor(contract: Contract) {
    super(contract);
  }

  /**
   * Directly decode a DidRegistered event
   * @param data The event data
   * @param topics The event topics
   * @returns The decoded event arguments
   */
  public decodeDidRegisteredEvent(data: string, topics: string[]): Record<string, any> {
    try {
      const args = this.decodeKnownEvent('DidRegistered', data, topics);
      return {
        ...args,
        description: `DID ${args.did} registered by controller ${args.controller}`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to decode DidRegistered event: ${error.message}`);
    }
  }

  /**
   * Directly decode a DidDeactivated event
   * @param data The event data
   * @param topics The event topics
   * @returns The decoded event arguments
   */
  public decodeDidDeactivatedEvent(data: string, topics: string[]): Record<string, any> {
    try {
      const args = this.decodeKnownEvent('DidDeactivated', data, topics);
      return {
        ...args,
        description: `DID ${args.did} deactivated by ${args.deactivator}`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to decode DidDeactivated event: ${error.message}`);
    }
  }

  /**
   * Directly decode a DidControllerChanged event
   * @param data The event data
   * @param topics The event topics
   * @returns The decoded event arguments
   */
  public decodeDidControllerChangedEvent(data: string, topics: string[]): Record<string, any> {
    try {
      const args = this.decodeKnownEvent('DidControllerChanged', data, topics);
      return {
        ...args,
        description: `DID ${args.did} controller changed from ${args.oldController} to ${args.newController}`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to decode DidControllerChanged event: ${error.message}`);
    }
  }

  /**
   * Process event-specific data for DidRegistry events
   * @param event The parsed event
   * @returns Processed event data with additional context
   */
  protected processEventData(event: ParsedEvent): Record<string, any> {
    // Process DidRegistry-specific events
    switch (event.name) {
      case 'DidRegistered':
        return this.processDidRegisteredEvent(event);

      case 'DidUpdated':
        return this.processDidUpdatedEvent(event);

      case 'DidDeactivated':
        return this.processDidDeactivatedEvent(event);

      case 'DidReactivated':
        return this.processDidReactivatedEvent(event);

      case 'DidControllerChanged':
        return this.processDidControllerChangedEvent(event);

      case 'DidMetadataChanged':
        return this.processDidMetadataChangedEvent(event);

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
   * Process DidRegistered event
   * @param event The parsed event
   * @returns Processed event data
   */
  private processDidRegisteredEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `DID ${event.args.did} registered by controller ${event.args.controller}`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Process DidUpdated event
   * @param event The parsed event
   * @returns Processed event data
   */
  private processDidUpdatedEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `DID ${event.args.did} updated by ${event.args.updater}`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Process DidDeactivated event
   * @param event The parsed event
   * @returns Processed event data
   */
  private processDidDeactivatedEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `DID ${event.args.did} deactivated by ${event.args.deactivator}`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Process DidReactivated event
   * @param event The parsed event
   * @returns Processed event data
   */
  private processDidReactivatedEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `DID ${event.args.did} reactivated by ${event.args.reactivator}`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Process DidControllerChanged event
   * @param event The parsed event
   * @returns Processed event data
   */
  private processDidControllerChangedEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `DID ${event.args.did} controller changed from ${event.args.oldController} to ${event.args.newController}`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Process DidMetadataChanged event
   * @param event The parsed event
   * @returns Processed event data
   */
  private processDidMetadataChangedEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `DID ${event.args.did} metadata changed by ${event.args.updater}`,
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
