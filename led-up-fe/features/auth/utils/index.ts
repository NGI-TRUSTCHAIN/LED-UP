'use server';
/**
 * Utility functions for authentication
 */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';

// Cookie configuration
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  sameSite: 'strict' as const,
  // Add cache control directives
  maxAge: 0, // Ensure the cookie is a session cookie by default
};

// Cache the authentication check to avoid multiple cookie reads
export const isAuthenticatedCached = cache(async () => {
  return !!(await getAuthToken());
});

/**
 * Get the authentication token from cookies
 */
export async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('auth_token')?.value;
}

/**
 * Set the authentication token in cookies
 */
export async function setAuthToken(token: string, expiresIn: number): Promise<void> {
  const cookieStore = await cookies();

  // Convert expiresIn from seconds to milliseconds and add to current time
  const expiryDate = new Date(Date.now() + expiresIn * 1000);

  cookieStore.set('auth_token', token, {
    ...COOKIE_OPTIONS,
    expires: expiryDate,
    maxAge: expiresIn, // Set maxAge in seconds for better browser compatibility
  });
}

/**
 * Set the refresh token in cookies
 */
export async function setRefreshToken(token: string): Promise<void> {
  const cookieStore = await cookies();

  // Set refresh token to expire in 30 days
  const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const maxAge = 30 * 24 * 60 * 60; // 30 days in seconds

  cookieStore.set('refresh_token', token, {
    ...COOKIE_OPTIONS,
    expires: expiryDate,
    maxAge: maxAge,
  });
}

/**
 * Get the refresh token from cookies
 */
export async function getRefreshToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('refresh_token')?.value;
}

/**
 * Clear authentication cookies
 */
export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();

  // Delete by setting expired date and empty value
  cookieStore.set('auth_token', '', {
    ...COOKIE_OPTIONS,
    expires: new Date(0),
    maxAge: 0,
  });

  cookieStore.set('refresh_token', '', {
    ...COOKIE_OPTIONS,
    expires: new Date(0),
    maxAge: 0,
  });
}

/**
 * Check if the user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  return await isAuthenticatedCached();
}

/**
 * Redirect to login if not authenticated
 */
export async function requireAuth(redirectTo: string = '/auth/signin'): Promise<void> {
  if (!(await isAuthenticated())) {
    redirect(redirectTo);
  }
}

/**
 * Get the redirect URL from the query parameters
 * @param defaultRedirect The default redirect URL if no redirect is specified
 * @returns The redirect URL
 */
export async function getRedirectUrl(defaultRedirect: string = '/'): Promise<string> {
  if (typeof window === 'undefined') return defaultRedirect;

  const urlParams = new URLSearchParams(window.location.search);
  const redirectUrl = urlParams.get('redirect');

  // Validate the redirect URL to prevent open redirect vulnerabilities
  if (redirectUrl) {
    try {
      // Check if the URL is relative (starts with /)
      if (redirectUrl.startsWith('/')) {
        return redirectUrl;
      }

      // Check if the URL is on the same domain
      const url = new URL(redirectUrl, window.location.origin);
      if (url.origin === window.location.origin) {
        return redirectUrl;
      }
    } catch (error) {
      console.error('Invalid redirect URL:', error);
    }
  }

  return defaultRedirect;
}
