import { ApiError } from '@/lib/error';

/**
 * Generic response type for API calls
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: any;
  message?: string;
}

/**
 * Fetch with error handling for data registry API calls
 *
 * @param url The URL to fetch from
 * @param options Fetch options
 * @returns The response data
 * @throws ApiError if the request fails
 */
export async function fetchWithErrorHandling<T = any>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || `Request failed with status ${response.status}`, response.status);
    }

    const data = await response.json();
    return data as ApiResponse<T>;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error('API request error:', error);
    throw new ApiError(error instanceof Error ? error.message : 'An unexpected error occurred', 500);
  }
}

/**
 * Formats an Ethereum address for display
 * @param address The Ethereum address
 * @param start The number of characters to show at the start
 * @param end The number of characters to show at the end
 * @returns A formatted address
 */
export function formatAddress(address: string, start = 6, end = 4): string {
  if (!address) return '';
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

/**
 * Validates an Ethereum address
 * @param address The Ethereum address to validate
 * @returns True if the address is valid, false otherwise
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validates a DID
 * @param did The DID to validate
 * @returns True if the DID is valid, false otherwise
 */
export function isValidDid(did: string): boolean {
  return /^did:ledup:[a-zA-Z0-9]+:[a-zA-Z0-9]+$/.test(did);
}

/**
 * Extracts the role from a DID
 * @param did The DID to extract the role from
 * @returns The role or null if the DID is invalid
 */
export function getRoleFromDid(did: string): string | null {
  if (!isValidDid(did)) return null;
  const parts = did.split(':');
  return parts[2] || null;
}

/**
 * Fetches the DID for a wallet address
 * @param address The wallet address
 * @returns The DID associated with the address
 */
export async function getDidFromAddress(address: string): Promise<string | null> {
  try {
    const response = await fetch(`/api/did/address/${address}`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.did || null;
  } catch (error) {
    console.error('Error fetching DID from address:', error);
    return null;
  }
}
