'use server';

import { revalidateTag } from 'next/cache';

import { API_ENDPOINTS } from '../../../lib/config';
import { getAuthToken } from '../utils';
import { ApiError } from '@/lib/error';
import { fetchWithErrorHandling } from '@/lib/apiHelper';

/**
 * Server action to deactivate a DID
 *
 * @param did - The DID to deactivate
 * @returns A boolean indicating whether the deactivation was successful
 * @throws ApiError if the deactivation fails
 */
export async function deactivateDid(did: string): Promise<boolean> {
  if (!did) {
    throw new ApiError('DID is required', 400);
  }

  const token = getAuthToken();

  if (!token) {
    throw new ApiError('Authentication required', 401);
  }

  try {
    const response = await fetchWithErrorHandling<{ deactivated: boolean }>(API_ENDPOINTS.DID.DEACTIVATE, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ did }),
      cache: 'no-store',
    });

    if (!response.success || !response.data) {
      throw new ApiError(response.message || 'Failed to deactivate DID', 500);
    }

    // Revalidate the cache for this DID
    revalidateTag('did');
    revalidateTag(did);

    return response.data.deactivated;
  } catch (error) {
    console.error('Error deactivating DID:', error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Failed to deactivate DID', 500);
  }
}
