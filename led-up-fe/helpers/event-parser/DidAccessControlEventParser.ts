import { Abi } from 'viem';
import { BaseEventParser, ParsedContractEvent } from './BaseEventParser';

/**
 * Event parser for the DidAccessControl contract
 */
export class DidAccessControlEventParser extends BaseEventParser {
  /**
   * Creates a new instance of the DidAccessControlEventParser
   * @param abi The DidAccessControl contract ABI
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
      case 'RoleRequirementSet':
        return `Role requirement set for role ${args.role} with requirement "${args.requirement}"`;

      case 'DidRoleGranted':
        return `DID ${args.did} granted role ${args.role} by ${args.grantor}`;

      case 'DidRoleRevoked':
        return `DID ${args.did} revoked role ${args.role} by ${args.revoker}`;

      case 'RoleGranted':
        return `Role ${args.role} granted to account ${args.account} by ${args.sender}`;

      case 'RoleRevoked':
        return `Role ${args.role} revoked from account ${args.account} by ${args.sender}`;

      case 'RoleAdminChanged':
        return `Role ${args.role} admin changed from ${args.previousAdminRole} to ${args.newAdminRole}`;

      default:
        return `Event: ${eventName}`;
    }
  }
}
