import { Contract } from 'ethers';

import { BaseEventParser, ParsedEvent } from './BaseEventParser';

/**
 * Event parser for the DidIssuer contract
 */
export class DidIssuerEventParser extends BaseEventParser {
  /**
   * Creates a new instance of the DidIssuerEventParser
   * @param contract The DidIssuer contract instance
   */
  constructor(contract: Contract) {
    super(contract);
  }

  /**
   * Directly decode a CredentialIssued event
   * @param data The event data
   * @param topics The event topics
   * @returns The decoded event arguments
   */
  public decodeCredentialIssuedEvent(data: string, topics: string[]): Record<string, any> {
    try {
      const args = this.decodeKnownEvent('CredentialIssued', data, topics);
      return {
        ...args,
        description: `Credential of type ${args.credentialType} issued to subject ${args.subject} with ID ${args.credentialId} at timestamp ${args.timestamp}`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to decode CredentialIssued event: ${error.message}`);
    }
  }

  /**
   * Process event-specific data for DidIssuer events
   * @param event The parsed event
   * @returns Processed event data with additional context
   */
  protected processEventData(event: ParsedEvent): Record<string, any> {
    // Process DidIssuer-specific events
    switch (event.name) {
      case 'CredentialIssued':
        return this.processCredentialIssuedEvent(event);

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
   * Process CredentialIssued event
   * @param event The parsed event
   * @returns Processed event data
   */
  private processCredentialIssuedEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Credential of type ${event.args.credentialType} issued to subject ${event.args.subject} with ID ${event.args.credentialId} at timestamp ${event.args.timestamp}`,
      timestamp: new Date().toISOString(),
    };
  }
}
