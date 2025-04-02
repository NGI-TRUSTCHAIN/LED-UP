'use server';

import { API_ENDPOINTS } from '../../../lib/config';
import { getAuthToken } from '../utils';
import { fetchWithErrorHandling } from '@/lib/apiHelper';

/**
 * Server action to verify the current authentication token
 *
 * @returns A boolean indicating whether the token is valid
 */
export async function verifyToken(): Promise<boolean> {
  try {
    const token = await getAuthToken();

    if (!token) return false;

    // Check if token is in JWT format (header.payload.signature)
    if (!token.includes('.') || token.split('.').length !== 3) {
      return false;
    }

    // Send the token in the request body as expected by the backend API
    try {
      const response = await fetchWithErrorHandling<{ valid: boolean }>(API_ENDPOINTS.AUTH.VERIFY_TOKEN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
        cache: 'no-store',
      });

      const isValid = response.success && response.data?.valid === true;

      return isValid;
    } catch (error) {
      console.error('Error during token verification API call:', error);
      return false;
    }
  } catch (error) {
    console.error('Token verification error:', error);
    // Return false instead of throwing an error to avoid breaking the authentication flow
    return false;
  }
}
