'use server';

import { revalidateTag } from 'next/cache';
import { API_ENDPOINTS } from '../../../lib/config';
import { AuthResponse, User } from '../types';
import { setAuthToken, setRefreshToken } from '../utils';
import { ApiError } from '@/lib/error';
import { fetchWithErrorHandling } from '@/lib/apiHelper';

/**
 * Server action to authenticate a user with their wallet address and signature
 *
 * @param address - The Ethereum wallet address
 * @param signature - The signature of the challenge
 * @returns The authenticated user information
 * @throws ApiError if authentication fails
 */
export async function authenticate(address: string, signature: string): Promise<User> {
  if (!address || !signature) {
    throw new ApiError('Address and signature are required', 400);
  }

  try {
    const response = await fetchWithErrorHandling<AuthResponse>(API_ENDPOINTS.AUTH.AUTHENTICATE, {
      method: 'POST',
      body: JSON.stringify({ address, signature }),
      cache: 'no-store',
    });

    if (!response.success || !response.data) {
      throw new ApiError(response.message || 'Authentication failed', 401);
    }

    const { accessToken, refreshToken, expiresIn, user } = response.data;

    // Store tokens in cookies
    await setAuthToken(accessToken, expiresIn);
    await setRefreshToken(refreshToken);

    // Ensure user object has the required fields
    if (!user || !user.address) {
      throw new ApiError('Invalid user data received from server', 500);
    }

    // Revalidate auth-related cache
    revalidateTag('auth');

    return user;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Authentication failed', 401);
  }
}
