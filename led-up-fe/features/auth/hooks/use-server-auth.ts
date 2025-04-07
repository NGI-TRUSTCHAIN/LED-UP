'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount, useDisconnect, useSignMessage } from 'wagmi';
import {
  authenticate,
  generateChallenge,
  refreshToken,
  verifyToken,
  logout as serverLogout,
  createDid,
  getDidForAddress,
  ApiError,
  isAuthenticated as checkServerAuthentication,
} from '@/features/auth';
import { getRedirectUrl } from '@/features/auth/client';
import { User } from '@/features/auth/types';
import { useRegisterProducer } from '@/features/data-registry/hooks/use-data-registry';

import { toast } from 'sonner';
import { ConsentStatus, RecordStatus, ProducerRegistrationParam } from '@/features/data-registry/types';
import { Address } from 'viem';
import { getPublicKeyForDid } from '@/features/did-registry/actions';

// Define the auth state interface
export interface ServerAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  did: string;
  publicKey: string;
  address: Address | null;
  user: User | null;
  error: string | null;
  tokenExpiresAt?: number; // New field to track token expiration
}

// Constants for token refresh
const TOKEN_REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // Refresh 5 minutes before expiry
const LOCAL_STORAGE_AUTH_KEY = 'led_up_auth_state';
const SESSION_CHECK_INTERVAL = 60 * 1000; // Check session every minute

export function useServerAuth() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const { mutate: registerProducer } = useRegisterProducer();
  // Use refs to track timers
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionCheckTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track if initial server check has completed
  const initialServerCheckRef = useRef<boolean>(false);

  const [authState, setAuthState] = useState<ServerAuthState>({
    isAuthenticated: false,
    isLoading: true, // Start with loading true
    did: '',
    publicKey: '',
    address: null,
    user: null,
    error: null,
  });

  // Initialize auth state by checking server-side session first
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // First check if we're already authenticated on the server
        const isServerAuthenticated = await checkServerAuthentication();

        if (isServerAuthenticated) {
          // If server says we're authenticated, get the user data
          if (address) {
            try {
              const didResponse = await getDidForAddress(address);
              const publicKey = await getPublicKeyForDid(didResponse as string);

              if (didResponse) {
                const user: User = {
                  did: didResponse,
                  publicKey: publicKey as string,
                  address: address,
                  role: 'user',
                };

                // Set auth state with server-validated session
                setAuthState({
                  isAuthenticated: true,
                  isLoading: false,
                  did: user.did || '',
                  publicKey: user.publicKey || '',
                  address: user.address as `0x${string}`,
                  user,
                  error: null,
                  // We don't know the exact expiry time, but we can refresh if needed
                  tokenExpiresAt: Date.now() + 3600 * 1000, // Assume 1 hour
                });

                // Store in localStorage as backup
                if (typeof window !== 'undefined') {
                  localStorage.setItem(
                    LOCAL_STORAGE_AUTH_KEY,
                    JSON.stringify({
                      isAuthenticated: true,
                      isLoading: false,
                      did: user.did || '',
                      publicKey: user.publicKey || '',
                      address: user.address,
                      user,
                      error: null,
                      tokenExpiresAt: Date.now() + 3600 * 1000,
                    })
                  );
                }

                initialServerCheckRef.current = true;
                return;
              }
            } catch (error) {
              toast.error('Error getting DID for address:', {
                description: error instanceof Error ? error.message : 'Unknown error',
              });
            }
          }
        } else {
          toast.error('No server-side authentication detected');
        }

        // If server authentication failed or we couldn't get the DID,
        // try to load from localStorage as fallback
        if (typeof window !== 'undefined') {
          try {
            const storedAuthState = localStorage.getItem(LOCAL_STORAGE_AUTH_KEY);
            if (storedAuthState) {
              const parsedState = JSON.parse(storedAuthState) as ServerAuthState;

              // Only restore if token hasn't expired
              if (parsedState.tokenExpiresAt && parsedState.tokenExpiresAt > Date.now()) {
                setAuthState(parsedState);

                // Verify the restored session with the server
                verifyToken().then((isValid) => {
                  if (!isValid) {
                    localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
                    setAuthState({
                      isAuthenticated: false,
                      isLoading: false,
                      did: '',
                      publicKey: '',
                      address: null,
                      user: null,
                      error: null,
                    });
                  } else {
                    refreshTokenSilently().catch((err) => {
                      toast.error('Error refreshing token during initialization:', {
                        description: err instanceof Error ? err.message : 'Unknown error',
                      });
                    });
                  }
                });

                initialServerCheckRef.current = true;
                return;
              } else {
                localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
              }
            }
          } catch (error) {
            toast.error('Error loading auth state from localStorage:', {
              description: error instanceof Error ? error.message : 'Unknown error',
            });
            localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
          }
        }

        // If we get here, we're not authenticated
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          did: '',
          publicKey: '',
          address: null,
          user: null,
          error: null,
        });

        initialServerCheckRef.current = true;
      } catch (error) {
        toast.error('Error during authentication initialization:', {
          description: error instanceof Error ? error.message : 'Unknown error',
        });
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          did: '',
          publicKey: '',
          address: null,
          user: null,
          error: error instanceof Error ? error.message : 'Authentication initialization failed',
        });

        initialServerCheckRef.current = true;
      }
    };

    if (!initialServerCheckRef.current) {
      initializeAuth();
    }
  }, [address]);

  // Save auth state to localStorage when it changes
  useEffect(() => {
    if (typeof window === 'undefined' || !initialServerCheckRef.current) return;

    if (authState.isAuthenticated && authState.user) {
      localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify(authState));
    } else if (!authState.isLoading) {
      // Only clear if we're not in a loading state
      localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
    }
  }, [authState]);

  // Periodically check session validity
  useEffect(() => {
    // Don't set up timer until initial server check is complete
    if (!initialServerCheckRef.current || !authState.isAuthenticated) return;

    // Clear any existing timer
    if (sessionCheckTimerRef.current) {
      clearInterval(sessionCheckTimerRef.current);
      sessionCheckTimerRef.current = null;
    }

    // Set up periodic session check
    sessionCheckTimerRef.current = setInterval(async () => {
      try {
        const isValid = await verifyToken();
        if (!isValid) {
          const refreshed = await refreshTokenSilently();
          if (!refreshed) {
            await logout();
          }
        }
      } catch (error) {
        toast.error('Error during session check:', {
          description: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }, SESSION_CHECK_INTERVAL);

    return () => {
      if (sessionCheckTimerRef.current) {
        clearInterval(sessionCheckTimerRef.current);
        sessionCheckTimerRef.current = null;
      }
    };
  }, [authState.isAuthenticated, initialServerCheckRef.current]);

  /**
   * Register a producer
   * @param formData - The form data containing producer registration information
   * @returns A promise that resolves when the producer is registered
   * @throws An error if the producer registration fails
   */
  const register = useCallback(async (formData: FormData) => {
    try {
      // Default to Active status and Allowed consent
      const params: ProducerRegistrationParam = {
        status: (Number(formData.get('status')) as RecordStatus) || RecordStatus.Active,
        consent: (Number(formData.get('consent')) as ConsentStatus) || ConsentStatus.Allowed,
      };

      await registerProducer(params);
    } catch (error) {
      toast.error('Error registering producer:', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, []);

  /**
   * Logout - clear token and reset state
   */
  const logout = useCallback(async () => {
    try {
      await serverLogout();

      await disconnect();
    } catch (error) {
      toast.error('Logout error:', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      // Clear any timers
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }

      if (sessionCheckTimerRef.current) {
        clearInterval(sessionCheckTimerRef.current);
        sessionCheckTimerRef.current = null;
      }

      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
      }

      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        did: '',
        publicKey: '',
        address: null,
        user: null,
        error: null,
      });
    }
  }, []);

  /**
   * Silently refresh the token without showing loading state
   * This is used for automatic token refresh
   */
  const refreshTokenSilently = useCallback(async () => {
    if (!authState.isAuthenticated) return false;

    try {
      // refreshToken now returns user data
      const user = await refreshToken();

      // Calculate token expiry time based on the expiresIn value from the API
      // Default to 1 hour if not specified
      const expiresIn = (user as any).expiresIn || 3600; // seconds
      const tokenExpiresAt = Date.now() + expiresIn * 1000;

      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: true,
        did: user.did || '',
        publicKey: user.publicKey || '',
        address: user.address as `0x${string}`,
        user,
        error: null,
        tokenExpiresAt,
      }));

      return true;
    } catch (error) {
      toast.error('Silent token refresh error:', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });

      // If refresh fails, log out
      await logout();
      return false;
    }
  }, [authState.isAuthenticated, logout]);

  // Setup token refresh timer when auth state changes
  useEffect(() => {
    // Don't set up timer until initial server check is complete
    if (!initialServerCheckRef.current) return;

    // Clear any existing timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    // If authenticated and we have an expiry time, set up refresh timer
    if (authState.isAuthenticated && authState.tokenExpiresAt) {
      const timeUntilRefresh = authState.tokenExpiresAt - Date.now() - TOKEN_REFRESH_THRESHOLD_MS;

      if (timeUntilRefresh <= 0) {
        // Token is already close to expiry, refresh immediately
        refreshTokenSilently();
      } else {
        // Set timer to refresh before expiry
        refreshTimerRef.current = setTimeout(() => {
          refreshTokenSilently();
        }, timeUntilRefresh);
      }
    }

    // Cleanup function
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [authState.isAuthenticated, authState.tokenExpiresAt, refreshTokenSilently, initialServerCheckRef.current]);

  // Handle wallet connection changes
  useEffect(() => {
    // Don't react to connection changes until initial server check is complete
    if (!initialServerCheckRef.current) return;

    if (!isConnected || !address) {
      // Reset state if wallet is disconnected
      setAuthState((prev) => {
        // Only update if we were previously authenticated
        if (prev.isAuthenticated) {
          return {
            isAuthenticated: false,
            isLoading: false,
            did: '',
            publicKey: '',
            address: null,
            user: null,
            error: null,
          };
        }
        return prev;
      });
    }
  }, [isConnected, address]);

  /**
   * Login with DID
   * This initiates the challenge-response auth flow using server actions
   * @param redirectAfterLogin Whether to redirect after successful login
   * @param defaultRedirect The default redirect URL if no redirect is specified
   * @returns A boolean indicating whether the login was successful
   */
  const login = useCallback(
    async (redirectAfterLogin: boolean = true, defaultRedirect: string = '/dashboard') => {
      if (!isConnected || !address) {
        setAuthState((prev) => ({
          ...prev,
          error: 'Wallet not connected',
        }));
        return false;
      }

      try {
        setAuthState((prev) => ({
          ...prev,
          isLoading: true,
          error: null,
        }));

        // 1. Get or create a DID for this address
        let did: string;
        try {
          const didResponse = await getDidForAddress(address);

          if (didResponse) {
            did = didResponse;
          } else {
            // If DID doesn't exist, create a new one

            const createDidResponse = await createDid(address);

            if (!createDidResponse || !createDidResponse.did) {
              throw new Error('Failed to create DID: Invalid response');
            }

            did = createDidResponse.did;
          }
        } catch (error) {
          toast.error('Error in DID retrieval/creation:', {
            description: error instanceof Error ? error.message : 'Unknown error',
          });
          // Try to create a new DID as fallback
          try {
            const createDidResponse = await createDid(address);

            if (!createDidResponse || !createDidResponse.did) {
              throw new Error('Failed to create DID: Invalid response');
            }

            did = createDidResponse.did;

            if (!did) {
              throw new Error('Failed to create or retrieve DID');
            }
          } catch (fallbackError) {
            toast.error('Fallback DID creation also failed:', {
              description: fallbackError instanceof Error ? fallbackError.message : 'Unknown error',
            });
          }
        }

        // 2. Request challenge from server
        const challenge = await generateChallenge(address);

        // 3. Sign the challenge message
        const signature = await signMessageAsync({
          message: challenge.challenge,
        });

        // 4. Authenticate with signed message
        const user = (await authenticate(address, signature)) as User;

        // Calculate token expiry time based on the expiresIn value from the API
        // Default to 1 hour if not specified
        const expiresIn = (user as any).expiresIn || 3600; // seconds
        const tokenExpiresAt = Date.now() + expiresIn * 1000;

        // 5. Update state
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          did: user.did || '',
          publicKey: user.publicKey || '',
          address: user.address as `0x${string}`,
          user,
          error: null,
          tokenExpiresAt,
        });

        // 6. Redirect if requested (default is true)
        if (redirectAfterLogin && typeof window !== 'undefined') {
          const redirectUrl = getRedirectUrl(defaultRedirect);

          // Use window.location.href for a full page reload to ensure cookies are properly set
          window.location.href = redirectUrl;
        }

        return true;
      } catch (error: any) {
        toast.error('Authentication error:', {
          description: error instanceof Error ? error.message : 'Unknown error',
        });

        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof ApiError ? error.message : 'Authentication failed',
        }));

        return false;
      }
    },
    [address, isConnected, signMessageAsync]
  );

  return {
    // State
    authState,
    // Actions
    register,
    login,
    logout,
    refreshTokenSilently,
  };
}
