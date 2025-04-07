import { Abi, Log, decodeEventLog, type TransactionReceipt, type GetBlockReturnType } from 'viem';

/**
 * Interface for parsed event data
 */
export interface ParsedContractEvent {
  eventName: string;
  args: Record<string, any>;
  description: string;
  blockNumber: bigint;
  transactionHash: string;
  logIndex: number;
  timestamp?: number;
}

/**
 * Base class for contract event parsers
 */
export abstract class BaseEventParser {
  protected abi: Abi;

  /**
   * Creates a new instance of the BaseEventParser
   * @param abi The contract ABI
   */
  constructor(abi: Abi) {
    this.abi = abi;
  }

  /**
   * Parses transaction logs into readable event objects
   * @param receipt The transaction receipt containing logs
   * @param blockTimestamp Optional block timestamp to include with events
   * @returns An array of parsed events
   */
  public parseEvents(receipt: TransactionReceipt, blockTimestamp?: number): ParsedContractEvent[] {
    try {
      return receipt.logs
        .map((log) => {
          try {
            const decodedLog = decodeEventLog({
              abi: this.abi,
              data: log.data,
              topics: log.topics,
            });

            if (!decodedLog.eventName) {
              console.error('Event name not found in decoded log');
              return null;
            }

            const formattedArgs = this.formatEventArgs(decodedLog.args || {});

            const event: ParsedContractEvent = {
              eventName: decodedLog.eventName,
              args: formattedArgs,
              description: this.getEventDescription(decodedLog.eventName, formattedArgs),
              blockNumber: log.blockNumber || 0n,
              transactionHash: log.transactionHash || '0x',
              logIndex: log.logIndex || 0,
              timestamp: blockTimestamp,
            };

            return event;
          } catch (error) {
            console.error('Error decoding event log:', error);
            return null;
          }
        })
        .filter((event): event is ParsedContractEvent => event !== null);
    } catch (error: any) {
      console.error('Error parsing events:', error);
      return [];
    }
  }

  /**
   * Parse a specific event type from a transaction receipt
   * @param receipt The transaction receipt
   * @param eventName The name of the event to parse
   * @param blockTimestamp Optional block timestamp to include with events
   * @returns An array of parsed events of the specified type
   */
  public parseEventsByName(
    receipt: TransactionReceipt,
    eventName: string,
    blockTimestamp?: number
  ): ParsedContractEvent[] {
    try {
      return receipt.logs
        .map((log) => {
          try {
            const decodedLog = decodeEventLog({
              abi: this.abi,
              data: log.data,
              topics: log.topics,
            });

            if (!decodedLog.eventName || decodedLog.eventName !== eventName) {
              return null;
            }

            const formattedArgs = this.formatEventArgs(decodedLog.args || {});

            const event: ParsedContractEvent = {
              eventName: decodedLog.eventName,
              args: formattedArgs,
              description: this.getEventDescription(decodedLog.eventName, formattedArgs),
              blockNumber: log.blockNumber || 0n,
              transactionHash: log.transactionHash || '0x',
              logIndex: log.logIndex || 0,
              timestamp: blockTimestamp,
            };

            return event;
          } catch (error) {
            console.error('Error decoding event log:', error);
            return null;
          }
        })
        .filter((event): event is ParsedContractEvent => event !== null);
    } catch (error: any) {
      console.error(`Error parsing ${eventName} events:`, error);
      return [];
    }
  }

  /**
   * Format event arguments to handle BigInt values
   * @param args The event arguments
   * @returns Formatted event arguments
   */
  protected formatEventArgs(args: Record<string, any>): Record<string, any> {
    const formatted: Record<string, any> = {};

    for (const [key, value] of Object.entries(args)) {
      if (typeof value === 'bigint') {
        formatted[key] = value.toString();
      } else if (Array.isArray(value)) {
        formatted[key] = value.map((item) => (typeof item === 'bigint' ? item.toString() : item));
      } else if (value && typeof value === 'object') {
        formatted[key] = this.formatEventArgs(value);
      } else {
        formatted[key] = value;
      }
    }

    return formatted;
  }

  /**
   * Decode a single log using the ABI
   * @param log The log to decode
   * @returns The decoded log or null if decoding fails
   */
  protected decodeSingleLog(log: Log): { eventName: string; args: Record<string, any> } | null {
    try {
      const decoded = decodeEventLog({
        abi: this.abi,
        data: log.data,
        topics: log.topics,
      });

      return {
        eventName: decoded.eventName || 'Unknown',
        args: decoded.args as Record<string, any>,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Formats a BigInt value to a readable string
   * @param value The BigInt value to format
   * @returns The formatted string
   */
  protected formatBigInt(value: bigint): string {
    // For very large numbers, use scientific notation
    if (value > 10n ** 15n) {
      const scientific = value.toString();
      const exponent = scientific.length - 1;
      const mantissa = `${scientific[0]}.${scientific.substring(1, 4)}`;
      return `${mantissa}e+${exponent}`;
    }

    // For token amounts, format with decimals
    const stringValue = value.toString();

    // If it's likely a token amount (18 decimals), format it
    if (stringValue.length > 18) {
      const whole = stringValue.slice(0, -18) || '0';
      const fraction = stringValue.slice(-18).padStart(18, '0');

      // Trim trailing zeros in the fraction
      const trimmedFraction = fraction.replace(/0+$/, '');

      if (trimmedFraction.length > 0) {
        return `${whole}.${trimmedFraction}`;
      }
      return whole;
    }

    return stringValue;
  }

  /**
   * Formats a transaction receipt into a human-readable object
   * @param receipt The transaction receipt
   * @param block Optional block information
   * @returns A formatted receipt object
   */
  public formatTransactionReceipt(receipt: TransactionReceipt, block?: GetBlockReturnType): Record<string, any> {
    const events = this.parseEvents(receipt, block ? Number(block.timestamp) : undefined);

    return {
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      blockHash: receipt.blockHash,
      from: receipt.from,
      to: receipt.to,
      status: receipt.status === 'success' ? 'Success' : 'Failed',
      gasUsed: receipt.gasUsed.toString(),
      effectiveGasPrice: receipt.effectiveGasPrice.toString(),
      events: events,
      timestamp: block ? Number(block.timestamp) : undefined,
    };
  }

  /**
   * Get a user-friendly description for an event
   * @param eventName The name of the event
   * @param args The event arguments
   * @returns A user-friendly description
   */
  protected abstract getEventDescription(eventName: string, args: Record<string, any>): string;
}
