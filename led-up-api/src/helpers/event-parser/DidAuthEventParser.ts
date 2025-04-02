import { Contract } from 'ethers';

import { BaseEventParser, ParsedEvent } from './BaseEventParser';

/**
 * Event parser for the DidAuth contract
 */
export class DidAuthEventParser extends BaseEventParser {
  /**
   * Creates a new instance of the DidAuthEventParser
   * @param contract The DidAuth contract instance
   */
  constructor(contract: Contract) {
    super(contract);
  }

  /**
   * Directly decode an AuthenticationSuccessful event
   * @param data The event data
   * @param topics The event topics
   * @returns The decoded event arguments
   */
  public decodeAuthenticationSuccessfulEvent(data: string, topics: string[]): Record<string, any> {
    try {
      const args = this.decodeKnownEvent('AuthenticationSuccessful', data, topics);
      return {
        ...args,
        description: `Authentication successful for DID ${args.did} with role ${args.role} at timestamp ${args.timestamp}`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to decode AuthenticationSuccessful event: ${error.message}`);
    }
  }

  /**
   * Directly decode an AuthenticationFailed event
   * @param data The event data
   * @param topics The event topics
   * @returns The decoded event arguments
   */
  public decodeAuthenticationFailedEvent(data: string, topics: string[]): Record<string, any> {
    try {
      const args = this.decodeKnownEvent('AuthenticationFailed', data, topics);
      return {
        ...args,
        description: `Authentication failed for DID ${args.did} with role ${args.role} at timestamp ${args.timestamp}`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to decode AuthenticationFailed event: ${error.message}`);
    }
  }

  /**
   * Process event-specific data for DidAuth events
   * @param event The parsed event
   * @returns Processed event data with additional context
   */
  protected processEventData(event: ParsedEvent): Record<string, any> {
    // Process DidAuth-specific events
    switch (event.name) {
      case 'AuthenticationSuccessful':
        return this.processAuthenticationSuccessfulEvent(event);

      case 'AuthenticationFailed':
        return this.processAuthenticationFailedEvent(event);

      case 'CredentialVerified':
        return this.processCredentialVerifiedEvent(event);

      case 'CredentialVerificationFailed':
        return this.processCredentialVerificationFailedEvent(event);

      case 'RoleGranted':
        return this.processRoleGrantedEvent(event);

      case 'RoleRevoked':
        return this.processRoleRevokedEvent(event);

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
   * Process AuthenticationSuccessful event
   * @param event The parsed event
   * @returns Processed event data
   */
  private processAuthenticationSuccessfulEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Authentication successful for DID ${event.args.did} with role ${event.args.role} at timestamp ${event.args.timestamp}`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Process AuthenticationFailed event
   * @param event The parsed event
   * @returns Processed event data
   */
  private processAuthenticationFailedEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Authentication failed for DID ${event.args.did} with role ${event.args.role} at timestamp ${event.args.timestamp}`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Process CredentialVerified event
   * @param event The parsed event
   * @returns Processed event data
   */
  private processCredentialVerifiedEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Credential verified for DID ${event.args.did} of type ${event.args.credentialType} with ID ${event.args.credentialId} at timestamp ${event.args.timestamp}`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Process CredentialVerificationFailed event
   * @param event The parsed event
   * @returns Processed event data
   */
  private processCredentialVerificationFailedEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Credential verification failed for DID ${event.args.did} of type ${event.args.credentialType} with ID ${event.args.credentialId} at timestamp ${event.args.timestamp}`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Process RoleGranted event
   * @param event The parsed event
   * @returns Processed event data
   */
  private processRoleGrantedEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Role ${event.args.role} granted to DID ${event.args.did} at timestamp ${event.args.timestamp}`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Process RoleRevoked event
   * @param event The parsed event
   * @returns Processed event data
   */
  private processRoleRevokedEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Role ${event.args.role} revoked from DID ${event.args.did} at timestamp ${event.args.timestamp}`,
      timestamp: new Date().toISOString(),
    };
  }
}
