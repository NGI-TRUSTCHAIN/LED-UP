/**
 * Utility functions for working with BigInt values in Ethereum applications
 */

/**
 * Formats a BigInt value to a human-readable string with optional decimal places
 * @param value The BigInt value to format
 * @param decimals The number of decimal places (default: 18 for ETH/ERC20)
 * @param maxDisplayDecimals Maximum number of decimal places to display (default: 4)
 * @returns A formatted string representation of the value
 */
export function formatTokenAmount(value: bigint, decimals = 18, maxDisplayDecimals = 4): string {
  if (value === 0n) return '0';

  const divisor = 10n ** BigInt(decimals);
  const wholePart = value / divisor;
  const fractionalPart = value % divisor;

  if (fractionalPart === 0n) {
    return wholePart.toString();
  }

  // Convert to string and pad with leading zeros
  let fractionalStr = fractionalPart.toString().padStart(decimals, '0');

  // Trim trailing zeros
  fractionalStr = fractionalStr.replace(/0+$/, '');

  // Limit to maxDisplayDecimals
  if (fractionalStr.length > maxDisplayDecimals) {
    fractionalStr = fractionalStr.substring(0, maxDisplayDecimals);
  }

  return `${wholePart}.${fractionalStr}`;
}

/**
 * Parses a string value to a BigInt with the specified number of decimals
 * @param value The string value to parse
 * @param decimals The number of decimal places (default: 18 for ETH/ERC20)
 * @returns A BigInt representation of the value
 */
export function parseTokenAmount(value: string, decimals = 18): bigint {
  if (!value || value === '0') return 0n;

  const parts = value.split('.');
  const wholePart = parts[0];
  let fractionalPart = parts[1] || '';

  // Pad or truncate fractional part to match decimals
  if (fractionalPart.length > decimals) {
    fractionalPart = fractionalPart.substring(0, decimals);
  } else {
    fractionalPart = fractionalPart.padEnd(decimals, '0');
  }

  // Combine whole and fractional parts
  const combinedValue = `${wholePart}${fractionalPart}`;

  // Remove leading zeros to avoid parsing as octal
  const normalizedValue = combinedValue.replace(/^0+/, '') || '0';

  return BigInt(normalizedValue);
}

/**
 * Formats a BigInt value to a currency string with the specified symbol
 * @param value The BigInt value to format
 * @param decimals The number of decimal places (default: 18 for ETH/ERC20)
 * @param symbol The currency symbol (default: 'ETH')
 * @param symbolPosition Position of the symbol ('prefix' or 'suffix', default: 'suffix')
 * @returns A formatted currency string
 */
export function formatCurrency(
  value: bigint,
  decimals = 18,
  symbol = 'ETH',
  symbolPosition: 'prefix' | 'suffix' = 'suffix'
): string {
  const formattedValue = formatTokenAmount(value, decimals);

  return symbolPosition === 'prefix'
    ? `${symbol} ${formattedValue}`
    : `${formattedValue} ${symbol}`;
}

/**
 * Formats a gas value (wei) to Gwei
 * @param wei The gas value in wei
 * @returns The gas value in Gwei as a string
 */
export function weiToGwei(wei: bigint): string {
  return formatTokenAmount(wei, 9, 2);
}

/**
 * Formats a gas value (wei) to ETH
 * @param wei The gas value in wei
 * @returns The gas value in ETH as a string
 */
export function weiToEth(wei: bigint): string {
  return formatTokenAmount(wei, 18, 6);
}

/**
 * Calculates the gas cost in ETH
 * @param gasUsed The amount of gas used
 * @param gasPrice The gas price in wei
 * @returns The gas cost in ETH as a string
 */
export function calculateGasCost(gasUsed: bigint, gasPrice: bigint): string {
  const gasCostWei = gasUsed * gasPrice;
  return weiToEth(gasCostWei);
}

/**
 * Formats a BigInt for display in a table or UI
 * @param value The BigInt value to format
 * @param options Formatting options
 * @returns A formatted string suitable for display
 */
export function formatBigIntForDisplay(
  value: bigint,
  options: {
    decimals?: number;
    abbreviate?: boolean;
    currency?: string;
    showPlusSign?: boolean;
  } = {}
): string {
  const { decimals = 18, abbreviate = false, currency = '', showPlusSign = false } = options;

  let formatted = formatTokenAmount(value, decimals);

  // Add plus sign for positive values if requested
  if (showPlusSign && value > 0n) {
    formatted = `+${formatted}`;
  }

  // Abbreviate large numbers
  if (abbreviate) {
    const numValue = Number(formatted.replace(/,/g, ''));
    if (numValue >= 1e9) {
      formatted = `${(numValue / 1e9).toFixed(2)}B`;
    } else if (numValue >= 1e6) {
      formatted = `${(numValue / 1e6).toFixed(2)}M`;
    } else if (numValue >= 1e3) {
      formatted = `${(numValue / 1e3).toFixed(2)}K`;
    }
  }

  // Add currency if provided
  if (currency) {
    formatted = `${formatted} ${currency}`;
  }

  return formatted;
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
    if (typeof value === 'string' && /^-?\d+$/.test(value)) {
      // Only convert very large numbers or those explicitly marked
      if (value.length > 15 || value.endsWith('n')) {
        return BigInt(value.endsWith('n') ? value.slice(0, -1) : value);
      }
    }
    return value;
  });
}
