'use server';

import { API_ENDPOINTS } from '../../../lib/config';
import { DidDocument } from '../types';
import { getAuthToken } from '../utils';
import { ApiError } from '@/lib/error';
import { fetchWithErrorHandling } from '@/lib/apiHelper';

/**
 * Server action to retrieve a DID document by DID
 *
 * @param did - The DID to retrieve the document for
 * @returns The DID document
 * @throws ApiError if the document retrieval fails
 */
export async function getDidDocument(did: string): Promise<DidDocument> {
  if (!did) {
    throw new ApiError('DID is required', 400);
  }

  const token = getAuthToken();

  try {
    const response = await fetchWithErrorHandling<DidDocument>(
      `${API_ENDPOINTS.DID.GET_DOCUMENT}?did=${encodeURIComponent(did)}`,
      {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        next: {
          revalidate: 3600, // Cache for 1 hour
          tags: ['did', did],
        },
      }
    );

    if (!response.success || !response.data) {
      throw new ApiError(response.message || 'Failed to retrieve DID document', 404);
    }

    return response.data;
  } catch (error) {
    console.error('Error retrieving DID document:', error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Failed to retrieve DID document', 500);
  }
}
