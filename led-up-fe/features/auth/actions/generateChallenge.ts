'use server';

import { API_ENDPOINTS } from '../../../lib/config';
import { ChallengeResponse } from '../types';
import { fetchWithErrorHandling } from '@/lib/apiHelper';
import { ApiError } from '@/lib/error';

/**
 * Server action to generate an authentication challenge for a wallet address
 *
 * @param address - The Ethereum wallet address to generate a challenge for
 * @returns A challenge response containing the challenge string and expiration time
 * @throws ApiError if the request fails
 */
export async function generateChallenge(address: string): Promise<ChallengeResponse> {
  if (!address) {
    throw new ApiError('Address is required', 400);
  }

  try {
    const response = await fetchWithErrorHandling<ChallengeResponse>(API_ENDPOINTS.AUTH.CHALLENGE, {
      method: 'POST',
      body: JSON.stringify({ address }),
      cache: 'no-store',
    });

    if (!response.success || !response.data) {
      throw new ApiError(response.message || 'Failed to generate challenge', 500);
    }

    return response.data;
  } catch (error) {
    console.error('Error generating challenge:', error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Failed to generate challenge', 500);
  }
}
