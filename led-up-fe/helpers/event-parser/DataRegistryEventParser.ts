import { Abi } from 'viem';
import { BaseEventParser } from './BaseEventParser';

/**
 * Event parser for the DataRegistry contract
 */
export class DataRegistryEventParser extends BaseEventParser {
  /**
   * Creates a new instance of the DataRegistryEventParser
   * @param abi The DataRegistry contract ABI
   */
  constructor(abi: Abi) {
    super(abi);
  }

  /**
   * Get a user-friendly description for an event
   * @param eventName The name of the event
   * @param args The event arguments
   * @returns A user-friendly description
   */
  protected getEventDescription(eventName: string, args: Record<string, any>): string {
    switch (eventName) {
      case 'DataRegistered':
        return `Data record ${args.recordId} registered with owner DID ${args.ownerDid}`;

      case 'DataUpdated':
        return `Data record ${args.recordId} updated by producer ${args.producer}`;

      case 'DataRemoved':
        return `Data record ${args.recordId} removed by producer ${args.producer}`;

      case 'DataDeactivated':
        return `Data record ${args.recordId} deactivated at timestamp ${args.timestamp}`;

      case 'ConsumerAuthorized':
        return `Consumer with DID ${args.consumerDid} authorized to access record ${args.recordId} by owner ${args.ownerDid}`;

      case 'ConsumerDeauthorized':
        return `Consumer with DID ${args.consumerDid} deauthorized from accessing record ${args.recordId}`;

      case 'DataVerified':
        return `Data record ${args.recordId} verified by verifier with DID ${args.verifierDid}`;

      case 'MetadataUpdated':
        return `Metadata updated with URL ${args.url}`;

      case 'ProviderSchemaUpdated':
        return `Provider schema updated with URL ${args.url}`;

      case 'ProviderMetadataUpdated':
        return `Provider metadata updated with URL ${args.url}`;

      case 'DataShared':
        return `Data record ${args.recordId} shared by producer ${args.producer} with consumer ${args.consumer}`;

      case 'TokenUpdated':
        return `Token address updated from ${args.oldAddress} to ${args.newAddress}`;

      case 'AccessNotAllowed':
        return `Access not allowed for record ${args.recordId} by consumer with DID ${args.consumerDid}`;

      case 'SharingNotAllowed':
        return `Sharing not allowed for record ${args.recordId} by producer with DID ${args.producerDid}`;

      case 'TokenAddressUpdated':
        return `Token address updated to ${args.newAddress}`;

      case 'PauseStateUpdated':
        return `Contract ${args.contractAddress} pause state updated to ${args.isPaused ? 'paused' : 'unpaused'} by ${
          args.caller
        }`;

      case 'ProducerConsentUpdated':
        return `Producer ${args.producer} consent status updated to ${args.status}`;

      case 'ProducerRecordStatusUpdated':
        return `Producer ${args.producer} record status updated to ${args.status}`;

      case 'ProducerRecordUpdated':
        return `Producer ${args.producer} record ${args.recordId} updated`;

      case 'ProducerRecordRemoved':
        return `Producer ${args.producer} records removed`;

      case 'ProducerRegistered':
        return `Producer ${args.producer} registered with DID ${args.ownerDid}`;

      default:
        return `Event: ${eventName}`;
    }
  }
}
