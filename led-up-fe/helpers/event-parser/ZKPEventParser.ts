import { Abi } from 'viem';
import { BaseEventParser, ParsedContractEvent } from './BaseEventParser';

/**
 * Event parser for the ZKP contract
 */
export class ZKPEventParser extends BaseEventParser {
  /**
   * Creates a new instance of the ZKPEventParser
   * @param abi The ZKP contract ABI
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
      case 'ProofVerified':
        return `Proof verified for user ${args.user} with proof ID ${args.proofId}`;

      case 'ProofRejected':
        return `Proof rejected for user ${args.user} with proof ID ${args.proofId}`;

      case 'CircuitRegistered':
        return `Circuit registered with ID ${args.circuitId} by ${args.registrar}`;

      case 'CircuitUpdated':
        return `Circuit with ID ${args.circuitId} updated by ${args.updater}`;

      case 'VerifierRegistered':
        return `Verifier registered with ID ${args.verifierId} by ${args.registrar}`;

      case 'VerifierUpdated':
        return `Verifier with ID ${args.verifierId} updated by ${args.updater}`;

      case 'OwnershipTransferred':
        return `Ownership transferred from ${args.previousOwner} to ${args.newOwner}`;

      default:
        return `Event: ${eventName}`;
    }
  }
}
