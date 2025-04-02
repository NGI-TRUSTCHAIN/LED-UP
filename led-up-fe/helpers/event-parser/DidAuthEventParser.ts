import { Abi } from 'viem';
import { BaseEventParser, ParsedContractEvent } from './BaseEventParser';

/**
 * Event parser for the DidAuth contract
 */
export class DidAuthEventParser extends BaseEventParser {
  /**
   * Creates a new instance of the DidAuthEventParser
   * @param abi The DidAuth contract ABI
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
      case 'AuthenticationSuccessful':
        return `Authentication successful for DID ${args.did} with role ${args.role} at timestamp ${args.timestamp}`;

      case 'AuthenticationFailed':
        return `Authentication failed for DID ${args.did} with role ${args.role} at timestamp ${args.timestamp}`;

      case 'CredentialVerified':
        return `Credential verified for DID ${args.did} of type ${args.credentialType} at timestamp ${args.timestamp}`;

      default:
        return `Event: ${eventName}`;
    }
  }
}
