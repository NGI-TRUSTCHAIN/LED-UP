'use client';

import { createContext, useContext, ReactNode, useEffect, useMemo } from 'react';
import { useServerAuth } from '@/features/auth/hooks/use-server-auth';
import { User } from '@/features/auth/types';
import { Address, keccak256, toBytes } from 'viem';
import { useUserRoles } from '../hooks/use-did-auth';

export type UserRole =
  | 'DEFAULT_ADMIN'
  | 'ADMIN'
  | 'CONSUMER'
  | 'PRODUCER'
  | 'PROVIDER'
  | 'OPERATOR'
  | 'ISSUER'
  | 'VERIFIER';

// Define role constants to match the smart contract
const ROLE_HASHES = {
  DEFAULT_ADMIN: keccak256(toBytes('DEFAULT_ADMIN')),
  ADMIN: keccak256(toBytes('ADMIN')),
  CONSUMER: keccak256(toBytes('CONSUMER')),
  PRODUCER: keccak256(toBytes('PRODUCER')),
  PROVIDER: keccak256(toBytes('PROVIDER')),
  OPERATOR: keccak256(toBytes('OPERATOR')),
  ISSUER: keccak256(toBytes('ISSUER')),
  VERIFIER: keccak256(toBytes('VERIFIER')),
} as const;

// Define the shape of the auth context
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  did: string;
  publicKey: string;
  address: Address | null;
  user: User | null;
  error: string | null;
  userRoles: UserRole[];
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  hasAllRoles: (roles: UserRole[]) => boolean;
  login: (redirectAfterLogin?: boolean, defaultRedirect?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshTokenSilently: () => Promise<boolean>;
  register: (formData: FormData) => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: false,
  did: '',
  address: null,
  user: null,
  publicKey: '',
  error: null,
  userRoles: [],
  hasRole: () => false,
  hasAnyRole: () => false,
  hasAllRoles: () => false,
  login: async () => false,
  logout: async () => {},
  refreshTokenSilently: async () => false,
  register: async () => {},
});

// Helper function to convert bytes32 role to UserRole type
function bytes32ToUserRole(roleHash: `0x${string}`): UserRole | null {
  switch (roleHash) {
    case ROLE_HASHES.ADMIN:
      return 'ADMIN';
    case ROLE_HASHES.CONSUMER:
      return 'CONSUMER';
    case ROLE_HASHES.PRODUCER:
      return 'PRODUCER';
    case ROLE_HASHES.PROVIDER:
      return 'PROVIDER';
    case ROLE_HASHES.OPERATOR:
      return 'OPERATOR';
    case ROLE_HASHES.ISSUER:
      return 'ISSUER';
    case ROLE_HASHES.VERIFIER:
      return 'VERIFIER';
    default:
      return 'CONSUMER';
  }
}

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const { authState, login, logout, refreshTokenSilently, register } = useServerAuth();
  const { data: roleHashes, isLoading: isRolesLoading } = useUserRoles(authState.did);

  const hasRole = useMemo(
    () => (role: UserRole) => {
      if (!roleHashes) return false;
      const roleHash = ROLE_HASHES[role];
      return roleHashes.includes(roleHash);
    },
    [roleHashes]
  );

  const hasAnyRole = useMemo(
    () => (checkRoles: UserRole[]) => {
      return checkRoles.some((role) => hasRole(role));
    },
    [hasRole]
  );

  const hasAllRoles = useMemo(
    () => (checkRoles: UserRole[]) => {
      return checkRoles.every((role) => hasRole(role));
    },
    [hasRole]
  );

  const userRoles = useMemo(() => {
    if (!roleHashes) return [];

    return roleHashes.map(bytes32ToUserRole).filter((role): role is UserRole => role !== null);
  }, [roleHashes]);

  // Log authentication state changes for debugging
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Auth state changed:', {
        isAuthenticated: authState.isAuthenticated,
        isLoading: authState.isLoading,
        did: authState.did ? `${authState.did.substring(0, 10)}...` : null,
        publicKey: authState.publicKey ? `${authState.publicKey.substring(0, 10)}...` : null,
        address: authState.address ? `${authState.address.substring(0, 10)}...` : null,
        hasUser: !!authState.user,
        error: authState.error,
        userRoles,
        roleHashes: roleHashes?.map((r) => r.substring(0, 10)),
      });
    }
  }, [authState, userRoles, roleHashes]);

  const authContextValue: AuthContextType = {
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading || isRolesLoading,
    did: authState.did,
    publicKey: authState.publicKey,
    address: authState.address,
    user: authState.user,
    error: authState.error,
    userRoles,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    login,
    register,
    logout,
    refreshTokenSilently,
  };

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
}

// Hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}
