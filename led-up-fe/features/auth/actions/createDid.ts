'use server';

import { API_ENDPOINTS } from '../../../lib/config';
import { CreateDidResponse } from '../types';
import { getAuthToken } from '../utils';
import { ApiError } from '@/lib/error';
import { fetchWithErrorHandling } from '@/lib/apiHelper';

/**
 * Server action to create a DID (Decentralized Identifier) for a wallet address
 *
 * @param address - The Ethereum wallet address to create a DID for
 * @returns The created DID and DID document
 * @throws ApiError if the DID creation fails
 */
export async function createDid(address: string): Promise<CreateDidResponse> {
  if (!address) {
    throw new ApiError('Address is required', 400);
  }

  const token = await getAuthToken();

  try {
    const response = await fetchWithErrorHandling<CreateDidResponse>(API_ENDPOINTS.DID.CREATE, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify({ address }),
      cache: 'no-store',
    });

    if (!response.success || !response.data) {
      throw new ApiError(response.message || 'Failed to create DID', 500);
    }

    return response.data;
  } catch (error) {
    console.error('Error creating DID:', error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Failed to create DID', 500);
  }
}
