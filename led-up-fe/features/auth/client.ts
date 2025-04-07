'use client';

/**
 * Client-side authentication utilities
 */

/**
 * Get the redirect URL from the query parameters
 * @param defaultRedirect The default redirect URL if no redirect is specified
 * @returns The redirect URL
 */
export function getRedirectUrl(defaultRedirect: string = '/dashboard'): string {
  if (typeof window === 'undefined') return defaultRedirect;

  const urlParams = new URLSearchParams(window.location.search);
  const redirectUrl = urlParams.get('redirect');

  // Validate the redirect URL to prevent open redirect vulnerabilities
  if (redirectUrl) {
    try {
      // Check if the URL is relative (starts with /) or is on the same domain
      if (redirectUrl.startsWith('/')) {
        return redirectUrl;
      }

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
