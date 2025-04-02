'use server';

import { API_ENDPOINTS } from '../../../lib/config';
import { getAuthToken } from '../utils';
import { ApiError } from '@/lib/error';
import { fetchWithErrorHandling } from '@/lib/apiHelper';

/**
 * Server action to check if a DID is active
 *
 * @param did - The DID to check
 * @returns A boolean indicating whether the DID is active
 * @throws ApiError if the check fails
 */
export async function checkDidActive(did: string): Promise<boolean> {
  if (!did) {
    throw new ApiError('DID is required', 400);
  }

  const token = getAuthToken();

  try {
    const response = await fetchWithErrorHandling<{ active: boolean }>(
      `${API_ENDPOINTS.DID.CHECK_ACTIVE}?did=${encodeURIComponent(did)}`,
      {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        next: {
          revalidate: 60, // Cache for 1 minute
          tags: ['did-status', did],
        },
      }
    );

    if (!response.success || response.data === undefined) {
      throw new ApiError(response.message || 'Failed to check DID status', 500);
    }

    return response.data.active;
  } catch (error) {
    console.error('Error checking DID status:', error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Failed to check DID status', 500);
  }
}
