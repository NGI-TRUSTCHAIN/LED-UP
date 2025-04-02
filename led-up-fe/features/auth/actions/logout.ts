'use server';

import { revalidateTag } from 'next/cache';
import { API_ENDPOINTS } from '../../../lib/config';
import { clearAuthCookies } from '../utils';
import { ApiError } from '@/lib/error';
import { fetchWithErrorHandling } from '@/lib/apiHelper';

/**
 * Server action to log out a user
 * This will clear the authentication cookies and notify the server
 */
export async function logout(): Promise<void> {
  try {
    // Clear cookies first to ensure the user is logged out even if the API call fails
    await clearAuthCookies();

    // Notify the server about the logout
    try {
      await fetchWithErrorHandling(API_ENDPOINTS.AUTH.LOGOUT, {
        method: 'POST',
        cache: 'no-store',
      });
    } catch (error) {
      // Log but don't throw - we still want to clear cookies even if the API call fails
      console.error('Error notifying server about logout:', error);
    }

    // Revalidate auth-related cache
    revalidateTag('auth');
  } catch (error) {
    console.error('Logout error:', error);
    throw new ApiError(error instanceof Error ? error.message : 'Failed to log out', 500);
  }
}
