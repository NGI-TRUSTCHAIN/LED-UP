'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { 
  requestChallenge, 
  authenticate, 
  checkAuth, 
  refreshToken,
  getOrCreateDid,
  ChallengeResponse,
  AuthenticationResponse
} from '@/utils/api/did-auth';

// Token storage key in localStorage
const TOKEN_STORAGE_KEY = 'led_up_auth_token';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  did: string;
  address: string;
  token: string | null;
  error: string | null;
}

export function useDidAuth() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: false,
    did: '',
    address: '',
    token: null,
    error: null,
  });

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    
    if (storedToken && isConnected) {
      setAuthState(prev => ({
        ...prev,
        isLoading: true,
      }));
      
      // Verify the token validity
      checkAuth(storedToken).then(response => {
        if (response.success && response.data.authenticated) {
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            did: response.data.user.did,
            address: response.data.user.address,
            token: storedToken,
            error: null,
          });
        } else {
          // Token is invalid, clear it
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            did: '',
            address: '',
            token: null,
            error: 'Session expired, please authenticate again',
          });
        }
      });
    }
  }, [isConnected]);

  /**
   * Login with DID
   * This initiates the challenge-response auth flow
   */
  const login = useCallback(async () => {
    if (!isConnected || !address) {
      setAuthState(prev => ({
        ...prev,
        error: 'Wallet not connected',
      }));
      return;
    }

    try {
      setAuthState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      // 1. Get or create a DID for this address from the API
      const did = await getOrCreateDid(address);
      
      if (!did) {
        throw new Error('Failed to create or retrieve DID');
      }

      // 2. Request challenge from server
      const challengeResponse = await requestChallenge(did);
      
      if (!challengeResponse.success) {
        throw new Error(challengeResponse.error || 'Failed to get challenge');
      }

      // 3. Sign the challenge message
      const signature = await signMessageAsync({
        message: challengeResponse.data.message,
      });

      // 4. Authenticate with signed message
      const authResponse = await authenticate(
        did,
        challengeResponse.data.message,
        signature
      );

      if (!authResponse.success || !authResponse.data.authenticated) {
        throw new Error(authResponse.error || 'Authentication failed');
      }

      // 5. Store the token and update state
      localStorage.setItem(TOKEN_STORAGE_KEY, authResponse.data.token);
      
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        did: authResponse.data.did,
        address: authResponse.data.controller,
        token: authResponse.data.token,
        error: null,
      });

      return true;
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Authentication failed',
      }));
      return false;
    }
  }, [address, isConnected, signMessageAsync]);

  /**
   * Logout - clear token and reset state
   */
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      did: '',
      address: '',
      token: null,
      error: null,
    });
  }, []);

  /**
   * Refresh the authentication token
   */
  const refresh = useCallback(async () => {
    if (!authState.token) return false;

    try {
      const result = await refreshToken(authState.token);
      
      if (result && result.token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, result.token);
        setAuthState(prev => ({
          ...prev,
          token: result.token,
        }));
        return true;
      }
      
      // If refresh failed, logout
      logout();
      return false;
    } catch {
      logout();
      return false;
    }
  }, [authState.token, logout]);

  /**
   * Get the authorization header for API requests
   */
  const getAuthHeader = useCallback(() => {
    if (!authState.token) return {};
    return {
      Authorization: `Bearer ${authState.token}`,
    };
  }, [authState.token]);

  return {
    // State
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    did: authState.did,
    address: authState.address,
    token: authState.token,
    error: authState.error,
    
    // Actions
    login,
    logout,
    refresh,
    getAuthHeader,
  };
}