import { Contract, EventLog, Log, TransactionReceipt } from 'ethers';

/**
 * Interface for parsed event data
 */
export interface ParsedEvent {
  name: string;
  args: Record<string, any>;
  blockNumber: number;
  blockHash: string;
  transactionHash: string;
  index: number;
  transactionIndex: number;
}

/**
 * Base class for contract event parsers
 */
export abstract class BaseEventParser {
  protected contract: Contract;

  /**
   * Creates a new instance of the BaseEventParser
   * @param contract The contract instance
   */
  constructor(contract: Contract) {
    this.contract = contract;
  }

  /**
   * Parses transaction logs into readable event objects
   * @param receipt The transaction receipt containing logs
   * @returns An array of parsed events
   */
  public parseTransactionEvents(receipt: TransactionReceipt): ParsedEvent[] {
    const events: ParsedEvent[] = [];

    if (!receipt.logs || receipt.logs.length === 0) {
      return events;
    }

    for (const log of receipt.logs) {
      try {
        // In ethers v6, logs can already be EventLog objects with parsed data
        if ('args' in log && 'eventName' in log) {
          const eventLog = log as EventLog;

          // Format the event arguments
          const formattedArgs: Record<string, any> = {};

          // Convert named arguments from the Result object
          if (eventLog.args) {
            for (const [key, value] of Object.entries(eventLog.args)) {
              // Skip numeric indices
              if (!isNaN(Number(key))) continue;

              formattedArgs[key] = this.formatEventValue(value);
            }
          }

          events.push({
            name: eventLog.eventName,
            args: formattedArgs,
            blockNumber: log.blockNumber,
            blockHash: log.blockHash,
            transactionHash: log.transactionHash,
            index: log.index,
            transactionIndex: log.transactionIndex,
          });
        } else {
          // For raw logs, use parseLog
          const parsedLog = this.contract.interface.parseLog({
            topics: log.topics as string[],
            data: log.data,
          });

          if (parsedLog) {
            // Format the event arguments
            const formattedArgs: Record<string, any> = {};

            // Convert named arguments
            if (parsedLog.args) {
              for (const [key, value] of Object.entries(parsedLog.args)) {
                // Skip numeric indices
                if (!isNaN(Number(key))) continue;

                formattedArgs[key] = this.formatEventValue(value);
              }
            }

            events.push({
              name: parsedLog.name,
              args: formattedArgs,
              blockNumber: log.blockNumber,
              blockHash: log.blockHash,
              transactionHash: log.transactionHash,
              index: log.index,
              transactionIndex: log.transactionIndex,
            });
          }
        }
      } catch (error) {
        // Skip logs that can't be parsed as events from this contract
        continue;
      }
    }

    // Process each event with contract-specific logic
    return events.map(event => {
      const processedData = this.processEventData(event);
      return { ...event, args: { ...event.args, ...processedData } };
    });
  }

  /**
   * Decodes a known event directly using the event fragment
   * @param eventName The name of the event to decode
   * @param data The event data
   * @param topics The event topics
   * @returns The decoded event arguments
   */
  public decodeKnownEvent(eventName: string, data: string, topics: string[]): Record<string, any> {
    try {
      const eventFragment = this.contract.interface.getEvent(eventName);
      const result = this.contract.interface.decodeEventLog(eventFragment, data, topics);

      // Format the result
      const formattedArgs: Record<string, any> = {};

      for (const [key, value] of Object.entries(result)) {
        // Skip numeric indices
        if (!isNaN(Number(key))) continue;

        formattedArgs[key] = this.formatEventValue(value);
      }

      return formattedArgs;
    } catch (error) {
      throw new Error(`Failed to decode event ${eventName}: ${error.message}`);
    }
  }

  /**
   * Listens for events from a contract and returns them in a readable format
   * @param eventName The name of the event to listen for
   * @param filter Optional filter for the event
   * @param callback Callback function to handle the parsed event
   * @returns A function to remove the event listener
   */
  public listenForEvents(
    eventName: string,
    filter: any = {},
    callback: (event: ParsedEvent) => void
  ): () => void {
    // Apply filter if provided
    const eventFilter =
      Object.keys(filter).length > 0 ? this.contract.filters[eventName](filter) : eventName;

    const listener = (...args: any[]): void => {
      const event = args[args.length - 1] as EventLog;

      // Format the event arguments
      const formattedArgs: Record<string, any> = {};

      // Get named parameters from the event
      for (const [key, value] of Object.entries(event.args || {})) {
        // Skip numeric indices
        if (!isNaN(Number(key))) continue;

        formattedArgs[key] = this.formatEventValue(value);
      }

      const parsedEvent: ParsedEvent = {
        name: event.eventName || eventName,
        args: formattedArgs,
        blockNumber: event.blockNumber,
        blockHash: event.blockHash,
        transactionHash: event.transactionHash,
        index: event.index,
        transactionIndex: event.transactionIndex,
      };

      // Process the event with contract-specific logic
      const processedData = this.processEventData(parsedEvent);
      parsedEvent.args = { ...parsedEvent.args, ...processedData };

      callback(parsedEvent);
    };

    this.contract.on(eventFilter, listener);

    // Return a function to remove the listener
    return () => {
      this.contract.off(eventFilter, listener);
    };
  }

  /**
   * Formats a value from an event to a readable format
   * @param value The value to format
   * @returns The formatted value
   */
  protected formatEventValue(value: any): any {
    // Handle BigInt values
    if (typeof value === 'bigint') {
      return this.formatBigInt(value);
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return value.map(v => this.formatEventValue(v));
    }

    // Handle objects
    if (value && typeof value === 'object') {
      const formatted: Record<string, any> = {};
      for (const [key, val] of Object.entries(value)) {
        formatted[key] = this.formatEventValue(val);
      }
      return formatted;
    }

    // Return other values as is
    return value;
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
   * @returns A formatted receipt object
   */
  public formatTransactionReceipt(receipt: TransactionReceipt): Record<string, any> {
    const events = this.parseTransactionEvents(receipt);

    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      blockHash: receipt.blockHash,
      from: receipt.from,
      to: receipt.to,
      status: receipt.status === 1 ? 'Success' : 'Failed',
      gasUsed: this.formatBigInt(receipt.gasUsed),
      effectiveGasPrice: this.formatBigInt(receipt.gasPrice || 0n),
      events: events,
    };
  }

  /**
   * Formats a log object into a human-readable format
   * @param log The log object
   * @returns A formatted log object
   */
  public formatLog(log: Log): Record<string, any> {
    try {
      // If it's already an EventLog, use its properties directly
      if ('args' in log && 'eventName' in log) {
        const eventLog = log as EventLog;

        // Format the event arguments
        const formattedArgs: Record<string, any> = {};

        // Convert named arguments
        if (eventLog.args) {
          for (const [key, value] of Object.entries(eventLog.args)) {
            // Skip numeric indices
            if (!isNaN(Number(key))) continue;

            formattedArgs[key] = this.formatEventValue(value);
          }
        }

        return {
          name: eventLog.eventName,
          args: formattedArgs,
          blockNumber: log.blockNumber,
          blockHash: log.blockHash,
          transactionHash: log.transactionHash,
          transactionIndex: log.transactionIndex,
          index: log.index,
        };
      }

      // For raw logs, use parseLog
      const parsedLog = this.contract.interface.parseLog({
        topics: log.topics as string[],
        data: log.data,
      });

      if (!parsedLog) {
        return {
          topics: log.topics,
          data: log.data,
          blockNumber: log.blockNumber,
          blockHash: log.blockHash,
          transactionHash: log.transactionHash,
          transactionIndex: log.transactionIndex,
          index: log.index,
        };
      }

      // Format the event arguments
      const formattedArgs: Record<string, any> = {};

      // Convert named arguments
      if (parsedLog.args) {
        for (const [key, value] of Object.entries(parsedLog.args)) {
          // Skip numeric indices
          if (!isNaN(Number(key))) continue;

          formattedArgs[key] = this.formatEventValue(value);
        }
      }

      return {
        name: parsedLog.name,
        args: formattedArgs,
        blockNumber: log.blockNumber,
        blockHash: log.blockHash,
        transactionHash: log.transactionHash,
        transactionIndex: log.transactionIndex,
        index: log.index,
      };
    } catch (error) {
      // If parsing fails, return the raw log
      return {
        topics: log.topics,
        data: log.data,
        blockNumber: log.blockNumber,
        blockHash: log.blockHash,
        transactionHash: log.transactionHash,
        transactionIndex: log.transactionIndex,
        index: log.index,
      };
    }
  }

  /**
   * Serializes an object with BigInt values to a JSON string
   * @param obj The object to serialize
   * @returns A JSON string
   */
  public serializeBigInt(obj: any): string {
    return JSON.stringify(obj, (_, value) => {
      if (typeof value === 'bigint') {
        return value.toString() + 'n';
      }
      return value;
    });
  }

  /**
   * Deserializes a JSON string with BigInt values
   * @param json The JSON string to deserialize
   * @returns An object with string values converted to BigInt where appropriate
   */
  public deserializeBigInt(json: string): any {
    return JSON.parse(json, (_, value) => {
      // Check if the value is a string that looks like a BigInt
      if (typeof value === 'string' && /^-?\d+n$/.test(value)) {
        return BigInt(value.slice(0, -1));
      }
      return value;
    });
  }

  /**
   * Process event-specific data
   * This method should be implemented by derived classes to provide
   * contract-specific event processing
   * @param event The parsed event
   * @returns Processed event data
   */
  protected abstract processEventData(event: ParsedEvent): Record<string, any>;
}
