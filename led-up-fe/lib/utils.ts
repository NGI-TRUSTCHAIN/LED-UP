import { isValidCid } from '@/features/data-registry/utils';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names into a single string, merging Tailwind classes properly
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a date into a readable string
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/**
 * Truncate a string to a specified length
 */
export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.substring(0, length)}...` : str;
}

/**
 * Format a file size in bytes to a human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Wait for a specified amount of time
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Format a token amount from bigint to a human-readable string
 * Most tokens use 18 decimals (like ETH), so this function defaults to that
 * @param amount - The token amount as a bigint
 * @param decimals - The number of decimals the token uses (default: 18)
 * @param symbol - The token symbol to append (optional)
 * @returns Formatted token amount string
 */
export function formatTokenAmount(amount: bigint | undefined, decimals: number = 18, symbol?: string): string {
  if (amount === undefined) return 'Loading...';
  if (amount === 0n) return symbol ? `0 ${symbol}` : '0';

  // Convert to string and pad with zeros if needed
  let amountStr = amount.toString();
  if (amountStr.length <= decimals) {
    amountStr = amountStr.padStart(decimals + 1, '0');
  }

  // Insert decimal point
  const integerPart = amountStr.slice(0, amountStr.length - decimals) || '0';
  const fractionalPart = amountStr.slice(amountStr.length - decimals);

  // Format with commas for thousands
  const formattedInteger = parseInt(integerPart).toLocaleString();

  // Trim trailing zeros
  const trimmedFractional = fractionalPart.replace(/0+$/, '');

  // Combine parts
  const result = trimmedFractional ? `${formattedInteger}.${trimmedFractional}` : formattedInteger;

  return symbol ? `${result} ${symbol}` : result;
}

/**
 * Shortens an Ethereum address for display purposes
 * @param address The Ethereum address to shorten
 * @param prefixLength Number of characters to keep at the start (default: 6)
 * @param suffixLength Number of characters to keep at the end (default: 4)
 * @returns Shortened address with ellipsis in between
 */
export function shortenAddress(address: string, prefixLength = 6, suffixLength = 4): string {
  if (!address) return '';
  if (address.length < prefixLength + suffixLength + 3) return address;

  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
}

/**
 * validate valid cid
 */
export function validateCid(cid: string): boolean {
  return isValidCid(cid);
}

/**
 * Revalidate a path after a transaction is completed
 * @param path The path to revalidate
 */
export const revalidateAfterTransaction = async (path: string) => {
  try {
    await fetch(`/api/revalidate?path=${path}`, {
      method: 'POST',
    });
  } catch (error) {
    console.error('Error revalidating path:', error);
  }
};

/**
 * Truncates a string to the specified length and adds an ellipsis if needed
 */
export const truncateString = (str: string, length: number): string => {
  if (!str) return '';
  if (str.length <= length) return str;
  return `${str.substring(0, length)}...`;
};
