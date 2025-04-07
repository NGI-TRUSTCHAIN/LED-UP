/**
 * Export all authentication-related functionality
 */
import { fetchWithErrorHandling } from '@/lib/apiHelper';

// Export server actions
export * from './actions';

// Export types
export * from './types';
export * from '../../lib/error';

// Export utilities
export {
  getAuthToken,
  setAuthToken,
  setRefreshToken,
  getRefreshToken,
  clearAuthCookies,
  isAuthenticated,
  requireAuth,
  getRedirectUrl,
} from './utils';

// Export API endpoints
export { API_ENDPOINTS } from '../../lib/config';

export * from './hooks';
export * from './components';
