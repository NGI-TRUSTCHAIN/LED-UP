import { Abi } from 'viem';
import { BaseEventParser, ParsedContractEvent } from './BaseEventParser';

/**
 * Event parser for the Consent contract
 */
export class ConsentEventParser extends BaseEventParser {
  /**
   * Creates a new instance of the ConsentEventParser
   * @param abi The Consent contract ABI
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
      case 'ConsentGranted':
        return `Consent granted by producer ${args.producerDid} to provider ${args.providerDid} for purpose "${
          args.purpose
        }" until ${new Date(Number(args.expiryTime) * 1000).toLocaleString()}`;

      case 'ConsentRevoked':
        return `Consent revoked by producer ${args.producerDid} from provider ${args.providerDid} with reason "${args.reason}"`;

      case 'OwnershipTransferred':
        return `Ownership transferred from ${args.previousOwner} to ${args.newOwner}`;

      default:
        return `Event: ${eventName}`;
    }
  }
}
