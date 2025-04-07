import { Abi } from 'viem';
import { BaseEventParser, ParsedContractEvent } from './BaseEventParser';

/**
 * Event parser for the DidVerifier contract
 */
export class DidVerifierEventParser extends BaseEventParser {
  /**
   * Creates a new instance of the DidVerifierEventParser
   * @param abi The DidVerifier contract ABI
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
      case 'IssuerTrustStatusUpdated':
        return `Issuer ${args.issuer} trust status for credential type ${args.credentialType} updated to ${
          args.trusted ? 'trusted' : 'untrusted'
        }`;

      case 'OwnershipTransferred':
        return `Ownership transferred from ${args.previousOwner} to ${args.newOwner}`;

      default:
        return `Event: ${eventName}`;
    }
  }
}
