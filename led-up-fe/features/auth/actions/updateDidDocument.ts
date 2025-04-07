'use server';

import { revalidateTag } from 'next/cache';

import { API_ENDPOINTS } from '../../../lib/config';
import { DidDocument } from '../types';
import { getAuthToken } from '../utils';
import { ApiError } from '@/lib/error';
import { fetchWithErrorHandling } from '@/lib/apiHelper';

/**
 * Server action to update a DID document
 *
 * @param did - The DID to update
 * @param document - The updated DID document
 * @returns The updated DID document
 * @throws ApiError if the update fails
 */
export async function updateDidDocument(did: string, document: DidDocument): Promise<DidDocument> {
  if (!did || !document) {
    throw new ApiError('DID and document are required', 400);
  }

  const token = getAuthToken();

  if (!token) {
    throw new ApiError('Authentication required', 401);
  }

  try {
    const response = await fetchWithErrorHandling<DidDocument>(API_ENDPOINTS.DID.UPDATE_DOCUMENT, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ did, document }),
      cache: 'no-store',
    });

    if (!response.success || !response.data) {
      throw new ApiError(response.message || 'Failed to update DID document', 500);
    }

    // Revalidate the cache for this DID
    revalidateTag('did');
    revalidateTag(did);

    return response.data;
  } catch (error) {
    console.error('Error updating DID document:', error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Failed to update DID document', 500);
  }
}
