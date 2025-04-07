'use server';

import { API_ENDPOINTS } from '../../../lib/config';
import { getAuthToken } from '../utils';
import { ApiError } from '@/lib/error';
import { fetchWithErrorHandling } from '@/lib/apiHelper';

/**
 * Server action to get the DID associated with an Ethereum address
 *
 * @param address - The Ethereum address to get the DID for
 * @returns The DID associated with the address, or null if none exists
 * @throws ApiError if the request fails
 */
export async function getDidForAddress(address: string): Promise<string | null> {
  if (!address) {
    throw new ApiError('Address is required', 400);
  }

  const token = await getAuthToken();

  try {
    const response = await fetchWithErrorHandling<{ did: string }>(API_ENDPOINTS.AUTH.GET_DID_FOR_ADDRESS, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify({ address }),
      cache: 'no-store',
    });

    if (response.success && response.data?.did) {
      return response.data.did;
    }
    return response.data?.did || null;
  } catch (error) {
    console.error('Error getting DID for address:', error);

    // If the error is that no DID exists, return null
    if (
      error instanceof ApiError &&
      (error.message.includes('not found') || error.message.includes('No DID') || error.status === 404)
    ) {
      return null;
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Failed to get DID for address', 500);
  }
}
