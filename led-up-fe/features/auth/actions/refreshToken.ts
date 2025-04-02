'use server';

import { revalidateTag } from 'next/cache';
import { API_ENDPOINTS } from '../../../lib/config';
import { AuthResponse, User } from '../types';
import { getRefreshToken, setAuthToken, setRefreshToken } from '../utils';
import { ApiError } from '@/lib/error';
import { fetchWithErrorHandling } from '@/lib/apiHelper';

/**
 * Server action to refresh the authentication token using the refresh token
 *
 * @returns The user data if the token refresh was successful
 * @throws ApiError if the token refresh fails
 */
export async function refreshToken(): Promise<User> {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    throw new ApiError('No refresh token available', 401);
  }

  try {
    const response = await fetchWithErrorHandling<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    });

    if (!response.success || !response.data) {
      throw new ApiError(response.message || 'Failed to refresh token', 401);
    }

    const { accessToken, refreshToken: newRefreshToken, expiresIn, user } = response.data;

    // Update tokens in cookies
    await setAuthToken(accessToken, expiresIn);

    // Only update refresh token if a new one was provided
    if (newRefreshToken) {
      await setRefreshToken(newRefreshToken);
    }

    // Ensure user object has the required fields
    if (!user || !user.did || !user.address) {
      throw new ApiError('Invalid user data received from server', 500);
    }

    // Revalidate auth-related cache
    revalidateTag('auth');

    return user;
  } catch (error) {
    console.error('Token refresh error:', error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Failed to refresh token', 401);
  }
}
