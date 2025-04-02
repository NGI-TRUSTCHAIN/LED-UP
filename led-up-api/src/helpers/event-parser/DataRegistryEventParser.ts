import { Contract } from 'ethers';

import { BaseEventParser, ParsedEvent } from './BaseEventParser';

/**
 * Event parser for the DataRegistry contract
 */
export class DataRegistryEventParser extends BaseEventParser {
  /**
   * Creates a new instance of the DataRegistryEventParser
   * @param contract The DataRegistry contract instance
   */
  constructor(contract: Contract) {
    super(contract);
  }

  /**
   * Directly decode a RecordRegistered event
   * @param data The event data
   * @param topics The event topics
   * @returns The decoded event arguments
   */
  public decodeRecordRegisteredEvent(data: string, topics: string[]): Record<string, any> {
    try {
      const args = this.decodeKnownEvent('RecordRegistered', data, topics);
      return {
        ...args,
        description: `Record ${args.recordId} registered by provider ${args.provider} with DID ${args.did}`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to decode RecordRegistered event: ${error.message}`);
    }
  }

  /**
   * Process event-specific data for DataRegistry events
   * @param event The parsed event
   * @returns Processed event data with additional context
   */
  protected processEventData(event: ParsedEvent): Record<string, any> {
    // Process DataRegistry-specific events
    switch (event.name) {
      case 'AccessGranted':
        return this.processAccessGrantedEvent(event);

      case 'AccessRevoked':
        return this.processAccessRevokedEvent(event);

      case 'AccessTriggered':
        return this.processAccessTriggeredEvent(event);

      case 'CompensationUpdated':
        return this.processCompensationUpdatedEvent(event);

      case 'ConsentStatusChanged':
        return this.processConsentStatusChangedEvent(event);

      case 'ConsumerAuthorized':
        return this.processConsumerAuthorizedEvent(event);

      case 'DidAuthUpdated':
        return this.processDidAuthUpdatedEvent(event);

      case 'OwnershipTransferred':
        return this.processOwnershipTransferredEvent(event);

      case 'Paused':
        return this.processPausedEvent(event);

      case 'Unpaused':
        return this.processUnpausedEvent(event);

      case 'ProviderAdded':
        return this.processProviderAddedEvent(event);

      case 'ProviderAuthorized':
        return this.processProviderAuthorizedEvent(event);

      case 'ProviderRemoved':
        return this.processProviderRemovedEvent(event);

      case 'RecordRegistered':
        return this.processRecordRegisteredEvent(event);

      case 'RecordStatusChanged':
        return this.processRecordStatusChangedEvent(event);

      case 'RecordUpdated':
        return this.processRecordUpdatedEvent(event);

      case 'RecordVerified':
        return this.processRecordVerifiedEvent(event);

      case 'RoleAdminChanged':
        return this.processRoleAdminChangedEvent(event);

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

  private processAccessGrantedEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Access granted to consumer ${event.args.consumer} (DID: ${event.args.consumerDid}) for record ${event.args.recordId} with access level ${event.args.accessLevel} until ${event.args.expiration}`,
      timestamp: new Date().toISOString(),
    };
  }

  private processAccessRevokedEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Access revoked from consumer ${event.args.consumer} (DID: ${event.args.consumerDid}) for record ${event.args.recordId} by ${event.args.revoker}`,
      timestamp: new Date().toISOString(),
    };
  }

  private processAccessTriggeredEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Access triggered by consumer ${event.args.consumer} (DID: ${event.args.consumerDid}) for record ${event.args.recordId} with access level ${event.args.accessLevel}`,
      timestamp: new Date().toISOString(),
    };
  }

  private processCompensationUpdatedEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Compensation address updated from ${event.args.oldAddress} to ${event.args.newAddress}`,
      timestamp: new Date().toISOString(),
    };
  }

  private processConsentStatusChangedEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Consent status changed to ${event.args.status} for provider ${event.args.provider} by ${event.args.updater}`,
      timestamp: new Date().toISOString(),
    };
  }

  private processConsumerAuthorizedEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Consumer ${event.args.consumer} authorized for record ${event.args.recordId} with access level ${event.args.accessLevel} until ${event.args.expiration}`,
      timestamp: new Date().toISOString(),
    };
  }

  private processDidAuthUpdatedEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `DID Auth address updated from ${event.args.oldAddress} to ${event.args.newAddress}`,
      timestamp: new Date().toISOString(),
    };
  }

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

  private processPausedEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Contract paused by ${event.args.account}`,
      timestamp: new Date().toISOString(),
    };
  }

  private processUnpausedEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Contract unpaused by ${event.args.account}`,
      timestamp: new Date().toISOString(),
    };
  }

  private processProviderAddedEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Provider ${event.args.provider} added`,
      timestamp: new Date().toISOString(),
    };
  }

  private processProviderAuthorizedEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Provider ${event.args.provider} authorized for record ${event.args.recordId} with access level ${event.args.accessLevel} at timestamp ${event.args.timestamp}`,
      timestamp: new Date().toISOString(),
    };
  }

  private processProviderRemovedEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Provider ${event.args.provider} removed`,
      timestamp: new Date().toISOString(),
    };
  }

  private processRecordRegisteredEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Record ${event.args.recordId} registered by provider ${event.args.provider} with DID ${event.args.did}`,
      timestamp: new Date().toISOString(),
    };
  }

  private processRecordStatusChangedEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Record ${event.args.recordId} status changed to ${event.args.status} by ${event.args.updater}`,
      timestamp: new Date().toISOString(),
    };
  }

  private processRecordUpdatedEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Record ${event.args.recordId} updated by provider ${event.args.provider}`,
      timestamp: new Date().toISOString(),
    };
  }

  private processRecordVerifiedEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Record ${event.args.recordId} verified by verifier ${event.args.verifier}`,
      timestamp: new Date().toISOString(),
    };
  }

  private processRoleAdminChangedEvent(event: ParsedEvent): Record<string, any> {
    return {
      ...event.args,
      eventName: event.name,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      description: `Role admin changed from ${event.args.previousAdminRole} to ${event.args.newAdminRole} for role ${event.args.role}`,
      timestamp: new Date().toISOString(),
    };
  }

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
}
