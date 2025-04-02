import { Contract } from 'ethers';

import { BaseEventParser, ParsedEvent } from './BaseEventParser';

/**
 * Event parser for the DidVerifier contract
 */
export class DidVerifierEventParser extends BaseEventParser {
  /**
   * Creates a new instance of the DidVerifierEventParser
   * @param contract The DidVerifier contract instance
   */
  constructor(contract: Contract) {
    super(contract);
  }

  /**
   * Directly decode an IssuerTrustStatusUpdated event
   * @param data The event data
   * @param topics The event topics
   * @returns The decoded event arguments
   */
  public decodeIssuerTrustStatusUpdatedEvent(data: string, topics: string[]): Record<string, any> {
    try {
      const args = this.decodeKnownEvent('IssuerTrustStatusUpdated', data, topics);
      const trustStatus = args.trusted ? 'trusted' : 'untrusted';

      return {
        ...args,
        description: `Issuer ${args.issuer} is now ${trustStatus} for credential type ${args.credentialType}`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to decode IssuerTrustStatusUpdated event: ${error.message}`);
    }
  }

  /**
   * Process event-specific data for DidVerifier events
   * @param event The parsed event
   * @returns Processed event data with additional context
   */
  protected processEventData(event: ParsedEvent): Record<string, any> {
    // Process DidVerifier-specific events
    switch (event.name) {
      case 'IssuerTrustStatusUpdated':
        return this.processIssuerTrustStatusUpdatedEvent(event);

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
   * Process IssuerTrustStatusUpdated event
   * @param event The parsed event
   * @returns Processed event data
   */
  private processIssuerTrustStatusUpdatedEvent(event: ParsedEvent): Record<string, any> {
    const trustStatus = event.args.trusted ? 'trusted' : 'untrusted';

    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Issuer ${event.args.issuer} is now ${trustStatus} for credential type ${event.args.credentialType}`,
      timestamp: new Date().toISOString(),
    };
  }
}
