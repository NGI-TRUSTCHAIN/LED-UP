import { Abi } from 'viem';
import { BaseEventParser, ParsedContractEvent } from './BaseEventParser';

/**
 * Event parser for the DidRegistry contract
 */
export class DidRegistryEventParser extends BaseEventParser {
  /**
   * Creates a new instance of the DidRegistryEventParser
   * @param abi The DidRegistry contract ABI
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
      case 'DIDRegistered':
        return `DID ${args.did} registered by controller ${args.controller}`;

      case 'DIDUpdated':
        return `DID ${args.did} updated at timestamp ${args.timestamp}`;

      case 'DIDDeactivated':
        return `DID ${args.did} deactivated at timestamp ${args.timestamp}`;

      case 'DidReactivated':
        return `DID ${args.did} reactivated by ${args.reactivator}`;

      case 'DidControllerChanged':
        return `DID ${args.did} controller changed from ${args.oldController} to ${args.newController}`;

      case 'DidMetadataChanged':
        return `DID ${args.did} metadata changed by ${args.updater}`;

      case 'OwnershipTransferred':
        return `Ownership transferred from ${args.previousOwner} to ${args.newOwner}`;

      default:
        return `Event: ${eventName}`;
    }
  }
}
