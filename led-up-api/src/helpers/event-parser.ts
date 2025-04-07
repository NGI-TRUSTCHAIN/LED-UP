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
 * Parses transaction logs into readable event objects
 * @param receipt The transaction receipt containing logs
 * @param contract The contract instance to parse events with
 * @returns An array of parsed events
 */
export function parseTransactionEvents(
  receipt: TransactionReceipt,
  contract: Contract
): ParsedEvent[] {
  const events: ParsedEvent[] = [];

  if (!receipt.logs || receipt.logs.length === 0) {
    return events;
  }

  for (const log of receipt.logs) {
    try {
      // Try to parse the log as an event using the contract
      const parsedLog = contract.interface.parseLog({
        topics: log.topics as string[],
        data: log.data,
      });

      if (parsedLog) {
        // Format the event arguments
        const formattedArgs: Record<string, any> = {};

        // Convert named arguments
        if (parsedLog.args) {
          // Handle both numeric and named properties
          for (const [key, value] of Object.entries(parsedLog.args)) {
            // Skip numeric indices
            if (!isNaN(Number(key))) continue;

            formattedArgs[key] = formatEventValue(value);
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
    } catch (error) {
      // Skip logs that can't be parsed as events from this contract
      continue;
    }
  }

  return events;
}

/**
 * Listens for events from a contract and returns them in a readable format
 * @param contract The contract to listen for events from
 * @param eventName The name of the event to listen for
 * @param filter Optional filter for the event
 * @param callback Callback function to handle the parsed event
 * @returns A function to remove the event listener
 */
export function listenForEvents(
  contract: Contract,
  eventName: string,
  filter: any = {},
  callback: (event: ParsedEvent) => void
): () => void {
  // Apply filter if provided
  const eventFilter =
    Object.keys(filter).length > 0 ? contract.filters[eventName](filter) : eventName;

  const listener = (...args: any[]): void => {
    const event = args[args.length - 1] as EventLog;

    // Format the event arguments
    const formattedArgs: Record<string, any> = {};

    // Get named parameters from the event
    for (const [key, value] of Object.entries(event.args || {})) {
      // Skip numeric indices
      if (!isNaN(Number(key))) continue;

      formattedArgs[key] = formatEventValue(value);
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

    callback(parsedEvent);
  };

  contract.on(eventFilter, listener);

  // Return a function to remove the listener
  return () => {
    contract.off(eventFilter, listener);
  };
}

/**
 * Formats a value from an event to a readable format
 * @param value The value to format
 * @returns The formatted value
 */
export function formatEventValue(value: any): any {
  // Handle BigInt values
  if (typeof value === 'bigint') {
    return formatBigInt(value);
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return value.map(formatEventValue);
  }

  // Handle objects
  if (value && typeof value === 'object') {
    const formatted: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
      formatted[key] = formatEventValue(val);
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
export function formatBigInt(value: bigint): string {
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
 * Parses an error from a transaction
 * @param error The error object from a failed transaction
 * @param contract The contract instance to parse the error with
 * @returns A formatted error object
 */
export function parseContractError(
  error: any,
  contract: Contract
): {
  name: string;
  args: Record<string, any>;
  message: string;
} | null {
  try {
    // Check if the error has transaction data
    if (error.data) {
      // Try to parse the error using the contract interface
      const errorInfo = contract.interface.parseError(error.data);

      if (errorInfo) {
        // Format the error arguments
        const formattedArgs: Record<string, any> = {};

        // Convert named arguments
        if (errorInfo.args) {
          for (const [key, value] of Object.entries(errorInfo.args)) {
            // Skip numeric indices
            if (!isNaN(Number(key))) continue;

            formattedArgs[key] = formatEventValue(value);
          }
        }

        return {
          name: errorInfo.name,
          args: formattedArgs,
          message: formatErrorMessage(errorInfo.name, formattedArgs),
        };
      }
    }

    // If we can't parse the error, return a generic error
    return {
      name: 'UnknownError',
      args: {},
      message: error.message || 'Unknown contract error',
    };
  } catch (parseError) {
    // If parsing fails, return the original error message
    return {
      name: 'ParseError',
      args: {},
      message: error.message || 'Error parsing contract error',
    };
  }
}

/**
 * Formats an error message based on the error name and arguments
 * @param errorName The name of the error
 * @param args The error arguments
 * @returns A formatted error message
 */
function formatErrorMessage(errorName: string, args: Record<string, any>): string {
  // Format common error types
  switch (errorName) {
    case 'AccessControlUnauthorizedAccount':
      return `Account ${args.account} is missing role ${args.neededRole}`;

    case 'ERC20InsufficientBalance':
      return `Insufficient balance: address ${args.sender} has ${args.balance} but needs ${args.needed}`;

    case 'ERC20InsufficientAllowance':
      return `Insufficient allowance: spender ${args.spender} has allowance ${args.allowance} but needs ${args.needed}`;

    case 'ReentrancyGuardReentrantCall':
      return 'Reentrant call detected';

    case 'OwnableUnauthorizedAccount':
      return `Caller ${args.account} is not the owner`;

    case 'OwnableInvalidOwner':
      return `Invalid owner: ${args.owner}`;

    default: {
      // For custom errors, create a message from the arguments
      const argString = Object.entries(args)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');

      return `${errorName}${argString ? ` (${argString})` : ''}`;
    }
  }
}

/**
 * Serializes an object with BigInt values to JSON
 * @param obj The object to serialize
 * @returns A JSON string with BigInt values converted to strings
 */
export function serializeBigInt(obj: any): string {
  return JSON.stringify(obj, (_, value) => (typeof value === 'bigint' ? value.toString() : value));
}

/**
 * Deserializes a JSON string with BigInt values
 * @param json The JSON string to deserialize
 * @returns An object with string values converted to BigInt where appropriate
 */
export function deserializeBigInt(json: string): any {
  return JSON.parse(json, (_, value) => {
    // Check if the value is a string that looks like a BigInt
    if (typeof value === 'string' && /^-?\d+n$/.test(value)) {
      return BigInt(value.slice(0, -1));
    }
    return value;
  });
}

/**
 * Formats a transaction receipt into a human-readable object
 * @param receipt The transaction receipt
 * @param contract The contract instance to parse events with
 * @returns A formatted receipt object
 */
export function formatTransactionReceipt(
  receipt: TransactionReceipt,
  contract: Contract
): Record<string, any> {
  const events = parseTransactionEvents(receipt, contract);

  return {
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    blockHash: receipt.blockHash,
    from: receipt.from,
    to: receipt.to,
    status: receipt.status === 1 ? 'Success' : 'Failed',
    gasUsed: formatBigInt(receipt.gasUsed),
    effectiveGasPrice: formatBigInt(receipt.gasPrice || 0n),
    events: events,
  };
}

/**
 * Formats a log object into a human-readable format
 * @param log The log object
 * @param contract The contract instance to parse the log with
 * @returns A formatted log object
 */
export function formatLog(log: Log, contract: Contract): Record<string, any> {
  try {
    const parsedLog = contract.interface.parseLog({
      topics: log.topics as string[],
      data: log.data,
    });

    if (!parsedLog) {
      return {
        blockNumber: log.blockNumber,
        blockHash: log.blockHash,
        transactionHash: log.transactionHash,
        index: log.index,
        address: log.address,
        topics: log.topics,
        data: log.data,
        parsed: false,
      };
    }

    // Format the event arguments
    const formattedArgs: Record<string, any> = {};

    // Convert named arguments
    if (parsedLog.args) {
      for (const [key, value] of Object.entries(parsedLog.args)) {
        // Skip numeric indices
        if (!isNaN(Number(key))) continue;

        formattedArgs[key] = formatEventValue(value);
      }
    }

    return {
      blockNumber: log.blockNumber,
      blockHash: log.blockHash,
      transactionHash: log.transactionHash,
      index: log.index,
      address: log.address,
      event: parsedLog.name,
      args: formattedArgs,
      parsed: true,
    };
  } catch (error) {
    // Return the raw log if parsing fails
    return {
      blockNumber: log.blockNumber,
      blockHash: log.blockHash,
      transactionHash: log.transactionHash,
      index: log.index,
      address: log.address,
      topics: log.topics,
      data: log.data,
      parsed: false,
      parseError: (error as Error).message,
    };
  }
}
