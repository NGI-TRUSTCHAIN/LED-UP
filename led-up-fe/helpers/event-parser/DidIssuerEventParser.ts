import { Abi } from 'viem';
import { BaseEventParser, ParsedContractEvent } from './BaseEventParser';

/**
 * Event parser for the DidIssuer contract
 */
export class DidIssuerEventParser extends BaseEventParser {
  /**
   * Creates a new instance of the DidIssuerEventParser
   * @param abi The DidIssuer contract ABI
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
      case 'CredentialIssued':
        return `Credential of type ${args.credentialType} issued to subject ${args.subject} with ID ${args.credentialId} at timestamp ${args.timestamp}`;

      case 'OwnershipTransferred':
        return `Ownership transferred from ${args.previousOwner} to ${args.newOwner}`;

      default:
        return `Event: ${eventName}`;
    }
  }
}
