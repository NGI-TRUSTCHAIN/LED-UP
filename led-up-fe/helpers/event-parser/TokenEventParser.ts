import { Abi } from 'viem';
import { BaseEventParser, ParsedContractEvent } from './BaseEventParser';

/**
 * Event parser for the Token contract
 */
export class TokenEventParser extends BaseEventParser {
  /**
   * Creates a new instance of the TokenEventParser
   * @param abi The Token contract ABI
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
      case 'Transfer':
        return `Transfer of ${this.formatTokenAmount(args.value)} tokens from ${args.from} to ${args.to}`;

      case 'Approval':
        return `Approval of ${this.formatTokenAmount(args.value)} tokens from ${args.owner} to ${args.spender}`;

      case 'OwnershipTransferred':
        return `Ownership transferred from ${args.previousOwner} to ${args.newOwner}`;

      default:
        return `Event: ${eventName}`;
    }
  }

  /**
   * Format token amount with decimals
   * @param value The token amount as a string
   * @returns Formatted token amount
   */
  private formatTokenAmount(value: string): string {
    // Assuming 18 decimals for the token
    const decimals = 18;
    const amount = BigInt(value);

    if (amount === 0n) return '0';

    const whole = amount / 10n ** BigInt(decimals);
    const fraction = amount % 10n ** BigInt(decimals);

    if (fraction === 0n) return whole.toString();

    const fractionStr = fraction.toString().padStart(decimals, '0');
    const trimmedFraction = fractionStr.replace(/0+$/, '');

    return `${whole}.${trimmedFraction}`;
  }
}
