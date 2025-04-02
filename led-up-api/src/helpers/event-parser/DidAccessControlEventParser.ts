import { Contract } from 'ethers';

import { BaseEventParser, ParsedEvent } from './BaseEventParser';

/**
 * Event parser for the DidAccessControl contract
 */
export class DidAccessControlEventParser extends BaseEventParser {
  /**
   * Creates a new instance of the DidAccessControlEventParser
   * @param contract The DidAccessControl contract instance
   */
  constructor(contract: Contract) {
    super(contract);
  }

  /**
   * Directly decode a DidRoleGranted event
   * @param data The event data
   * @param topics The event topics
   * @returns The decoded event arguments
   */
  public decodeDidRoleGrantedEvent(data: string, topics: string[]): Record<string, any> {
    try {
      const args = this.decodeKnownEvent('DidRoleGranted', data, topics);
      return {
        ...args,
        description: `DID ${args.did} granted role ${args.role} by ${args.grantor}`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to decode DidRoleGranted event: ${error.message}`);
    }
  }

  /**
   * Directly decode a DidRoleRevoked event
   * @param data The event data
   * @param topics The event topics
   * @returns The decoded event arguments
   */
  public decodeDidRoleRevokedEvent(data: string, topics: string[]): Record<string, any> {
    try {
      const args = this.decodeKnownEvent('DidRoleRevoked', data, topics);
      return {
        ...args,
        description: `DID ${args.did} revoked role ${args.role} by ${args.revoker}`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to decode DidRoleRevoked event: ${error.message}`);
    }
  }

  /**
   * Process event-specific data for DidAccessControl events
   * @param event The parsed event
   * @returns Processed event data with additional context
   */
  protected processEventData(event: ParsedEvent): Record<string, any> {
    // Process DidAccessControl-specific events
    switch (event.name) {
      case 'RoleRequirementSet':
        return this.processRoleRequirementSetEvent(event);

      case 'DidRoleGranted':
        return this.processDidRoleGrantedEvent(event);

      case 'DidRoleRevoked':
        return this.processDidRoleRevokedEvent(event);

      case 'RoleGranted':
        return this.processRoleGrantedEvent(event);

      case 'RoleRevoked':
        return this.processRoleRevokedEvent(event);

      case 'RoleAdminChanged':
        return this.processRoleAdminChangedEvent(event);

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
   * Process RoleRequirementSet event
   * @param event The parsed event
   * @returns Processed event data
   */
  private processRoleRequirementSetEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Role requirement set for role ${event.args.role} with requirement "${event.args.requirement}"`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Process DidRoleGranted event
   * @param event The parsed event
   * @returns Processed event data
   */
  private processDidRoleGrantedEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `DID ${event.args.did} granted role ${event.args.role} by ${event.args.grantor}`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Process DidRoleRevoked event
   * @param event The parsed event
   * @returns Processed event data
   */
  private processDidRoleRevokedEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `DID ${event.args.did} revoked role ${event.args.role} by ${event.args.revoker}`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Process RoleGranted event (from AccessControl)
   * @param event The parsed event
   * @returns Processed event data
   */
  private processRoleGrantedEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Role ${event.args.role} granted to account ${event.args.account} by ${event.args.sender}`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Process RoleRevoked event (from AccessControl)
   * @param event The parsed event
   * @returns Processed event data
   */
  private processRoleRevokedEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Role ${event.args.role} revoked from account ${event.args.account} by ${event.args.sender}`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Process RoleAdminChanged event (from AccessControl)
   * @param event The parsed event
   * @returns Processed event data
   */
  private processRoleAdminChangedEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Role ${event.args.role} admin changed from ${event.args.previousAdminRole} to ${event.args.newAdminRole}`,
      timestamp: new Date().toISOString(),
    };
  }
}
