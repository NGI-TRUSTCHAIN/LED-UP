import { Contract } from 'ethers';

import { BaseEventParser, ParsedEvent } from './BaseEventParser';

/**
 * Event parser for the Consent contract
 */
export class ConsentEventParser extends BaseEventParser {
  /**
   * Creates a new instance of the ConsentEventParser
   * @param contract The Consent contract instance
   */
  constructor(contract: Contract) {
    super(contract);
  }

  /**
   * Directly decode a ConsentGranted event
   * @param data The event data
   * @param topics The event topics
   * @returns The decoded event arguments
   */
  public decodeConsentGrantedEvent(data: string, topics: string[]): Record<string, any> {
    try {
      const args = this.decodeKnownEvent('ConsentGranted', data, topics);
      return {
        ...args,
        description: `Consent granted by ${args.grantor} to ${args.grantee} for purpose ${args.purpose}`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to decode ConsentGranted event: ${error.message}`);
    }
  }

  /**
   * Directly decode a ConsentRevoked event
   * @param data The event data
   * @param topics The event topics
   * @returns The decoded event arguments
   */
  public decodeConsentRevokedEvent(data: string, topics: string[]): Record<string, any> {
    try {
      const args = this.decodeKnownEvent('ConsentRevoked', data, topics);
      return {
        ...args,
        description: `Consent revoked by ${args.revoker} from ${args.revokee} for purpose ${args.purpose}`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to decode ConsentRevoked event: ${error.message}`);
    }
  }

  /**
   * Process event-specific data for Consent events
   * @param event The parsed event
   * @returns Processed event data with additional context
   */
  protected processEventData(event: ParsedEvent): Record<string, any> {
    // Process Consent-specific events
    switch (event.name) {
      case 'ConsentGranted':
        return this.processConsentGrantedEvent(event);

      case 'ConsentRevoked':
        return this.processConsentRevokedEvent(event);

      case 'ConsentUpdated':
        return this.processConsentUpdatedEvent(event);

      case 'ConsentExpired':
        return this.processConsentExpiredEvent(event);

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
   * Process ConsentGranted event
   * @param event The parsed event
   * @returns Processed event data
   */
  private processConsentGrantedEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Consent granted by ${event.args.grantor} to ${event.args.grantee} for purpose ${event.args.purpose}`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Process ConsentRevoked event
   * @param event The parsed event
   * @returns Processed event data
   */
  private processConsentRevokedEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Consent revoked by ${event.args.revoker} from ${event.args.revokee} for purpose ${event.args.purpose}`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Process ConsentUpdated event
   * @param event The parsed event
   * @returns Processed event data
   */
  private processConsentUpdatedEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Consent updated by ${event.args.updater} for purpose ${event.args.purpose} with status ${event.args.status}`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Process ConsentExpired event
   * @param event The parsed event
   * @returns Processed event data
   */
  private processConsentExpiredEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Consent expired for grantor ${event.args.grantor} and grantee ${event.args.grantee}`,
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
