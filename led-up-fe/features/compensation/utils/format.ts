/**
 * Utility functions for formatting values
 */

/**
 * Format a BigInt to a human-readable string with decimal places
 * @param value - The BigInt value to format
 * @param decimals - Number of decimals to apply (default: 18 for Ether)
 * @param maxDecimals - Maximum decimals to display after the decimal point
 * @returns Formatted string
 */
export function formatBigInt(value: bigint | undefined | null, decimals: number = 18, maxDecimals: number = 4): string {
  if (value === undefined || value === null) {
    return '0';
  }

  if (value === 0n) {
    return '0';
  }

  // Convert to a decimal string
  const divisor = BigInt(10 ** decimals);
  const integerPart = value / divisor;
  const fractionalPart = value % divisor;

  // Format the fractional part with the specified precision
  let fractionalStr = fractionalPart.toString().padStart(decimals, '0');

  // Trim trailing zeros
  fractionalStr = fractionalStr.replace(/0+$/, '');

  // Truncate to maxDecimals
  fractionalStr = fractionalStr.slice(0, maxDecimals);

  return fractionalStr ? `${integerPart}.${fractionalStr}` : integerPart.toString();
}

/**
 * Format a wallet address to a shortened display form
 * @param address - Wallet address to format
 * @returns Shortened address string
 */
export function formatAddress(address: string | undefined | null): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
