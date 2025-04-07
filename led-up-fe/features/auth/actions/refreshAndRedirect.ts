'use server';

import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { refreshToken } from './refreshToken';
import { getRefreshToken } from '../utils';

/**
 * Server action to refresh the token and redirect to the specified URL
 * This is used by the middleware when a user has a refresh token but no auth token
 *
 * @param redirectUrl The URL to redirect to after refreshing the token
 */
export async function refreshAndRedirect(redirectUrl: string = '/'): Promise<void> {
  try {
    // Prevent redirect loops - don't redirect back to login or refresh pages
    const safeRedirectUrl =
      redirectUrl.startsWith('/auth/signin') || redirectUrl.startsWith('/auth/refresh') ? '/dashboard' : redirectUrl;

    // Get the refresh token from cookies
    const refreshTokenValue = await getRefreshToken();

    if (!refreshTokenValue) {
      // No refresh token, redirect to login
      redirect(`/auth/signin?redirect=${encodeURIComponent(safeRedirectUrl)}`);
    }

    try {
      // Attempt to refresh the token
      const user = await refreshToken();

      if (!user) {
        throw new Error('Failed to refresh token');
      }

      // Revalidate auth-related cache
      revalidateTag('auth');

      // Token refreshed successfully, redirect to the original URL
      redirect(safeRedirectUrl);
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Refresh failed, redirect to login
      redirect(`/auth/signin?redirect=${encodeURIComponent(safeRedirectUrl)}`);
    }
  } catch (error) {
    console.error('Error in refreshAndRedirect action:', error);
    // Something went wrong, redirect to login
    redirect('/auth/signin');
  }
}
