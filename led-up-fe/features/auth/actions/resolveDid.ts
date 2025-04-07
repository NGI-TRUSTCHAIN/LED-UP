'use server';

import { API_ENDPOINTS } from '../../../lib/config';
import { DidDocument } from '../types';
import { getAuthToken } from '../utils';
import { ApiError } from '@/lib/error';
import { fetchWithErrorHandling } from '@/lib/apiHelper';

/**
 * Server action to resolve a DID to its DID document
 *
 * @param did - The DID to resolve
 * @returns The resolved DID document
 * @throws ApiError if the resolution fails
 */
export async function resolveDid(did: string): Promise<DidDocument> {
  if (!did) {
    throw new ApiError('DID is required', 400);
  }

  const token = getAuthToken();

  try {
    const response = await fetchWithErrorHandling<DidDocument>(
      `${API_ENDPOINTS.DID.RESOLVE}?did=${encodeURIComponent(did)}`,
      {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        next: {
          revalidate: 3600, // Cache for 1 hour
          tags: ['did-resolve', did],
        },
      }
    );

    if (!response.success || !response.data) {
      throw new ApiError(response.message || 'Failed to resolve DID', 404);
    }

    return response.data;
  } catch (error) {
    console.error('Error resolving DID:', error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Failed to resolve DID', 500);
  }
}
