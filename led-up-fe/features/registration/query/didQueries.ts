'use client';

import { useReadContract } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import didRegistryAbi from '../../data-registry/abi/did-registry.abi';
import didAuthAbi from '../../data-registry/abi/did-auth.abi';

/**
 * Custom hook to check if a DID exists
 * @param address Wallet address
 * @param didRegistryAddress DID Registry contract address
 * @param generateDid Function to generate a DID from an address
 * @returns Query result with controller address if DID exists
 */
export function useDidExistsQuery(
  address: `0x${string}` | undefined,
  didRegistryAddress: `0x${string}`,
  generateDid: () => string
) {
  // Direct contract read to check if a DID exists
  const { data: controllerData, refetch: refetchController } = useReadContract({
    address: didRegistryAddress,
    abi: didRegistryAbi,
    functionName: 'getController',
    args: address ? [generateDid()] : undefined,
    query: {
      enabled: !!address,
      retry: (failureCount, error) => {
        // Don't retry if the error is because the DID doesn't exist
        if (error && typeof error === 'object' && 'message' in error) {
          const errorMessage = String(error.message);
          if (errorMessage.includes('DidRegistry__InvalidDID') || errorMessage.includes('revert')) {
            return false;
          }
        }
        return failureCount < 3;
      },
    },
  });

  // Check if a DID exists using React Query and direct contract interaction
  return useQuery({
    queryKey: ['didExists', address],
    queryFn: async () => {
      if (!address) return null;

      try {
        const result = await refetchController();
        // Ensure we return null instead of undefined if data is not available
        return result.data !== undefined ? result.data : null;
      } catch (error) {
        // If error contains InvalidDID, it means the DID doesn't exist
        if (
          error instanceof Error &&
          (error.message.includes('DidRegistry__InvalidDID') || error.message.includes('revert'))
        ) {
          return null;
        }
        // For other errors, log them but still return null to avoid undefined
        console.error('Error checking DID existence:', error);
        return null;
      }
    },
    enabled: !!address,
    // Only use initialData if it's not undefined
    initialData: controllerData !== undefined ? controllerData : null,
  });
}

/**
 * Custom hook to get role constants from the DID Auth contract
 * @param address Wallet address
 * @param didAuthAddress DID Auth contract address
 * @returns Role constants data
 */
export function useRoleConstants(address: `0x${string}` | undefined, didAuthAddress: `0x${string}`) {
  const { data: consumerRoleData } = useReadContract({
    address: didAuthAddress,
    abi: didAuthAbi,
    functionName: 'CONSUMER_ROLE',
    query: {
      enabled: !!address,
    },
  });

  const { data: producerRoleData } = useReadContract({
    address: didAuthAddress,
    abi: didAuthAbi,
    functionName: 'PRODUCER_ROLE',
    query: {
      enabled: !!address,
    },
  });

  return { consumerRoleData, producerRoleData };
}

/**
 * Custom hook to check if a DID is authenticated for a specific role
 * @param address Wallet address
 * @param didAuthAddress DID Auth contract address
 * @param generateDid Function to generate a DID from an address
 * @param role Role to check authentication for
 * @param roleBytes Role bytes from the contract
 * @returns Query result with authentication status
 */
export function useDidAuthentication(
  address: `0x${string}` | undefined,
  didAuthAddress: `0x${string}`,
  generateDid: () => string,
  role: 'consumer' | 'producer',
  roleBytes: `0x${string}` | undefined
) {
  const { data, isLoading, isError, error, refetch } = useReadContract({
    address: didAuthAddress,
    abi: didAuthAbi,
    functionName: 'authenticate',
    args: address && roleBytes ? [generateDid(), roleBytes] : undefined,
    query: {
      enabled: !!address && !!roleBytes,
      // Ensure we handle errors gracefully
      retry: (failureCount, error) => {
        // Don't retry if the error is related to authentication
        if (error && typeof error === 'object' && 'message' in error) {
          const errorMessage = String(error.message);
          if (errorMessage.includes('DidAuth__') || errorMessage.includes('revert')) {
            return false;
          }
        }
        return failureCount < 3;
      },
      // Provide a fallback value to avoid undefined
      select: (data) => {
        return data !== undefined ? data : false;
      },
    },
  });

  // Wrap the contract call in a React Query hook for better caching and state management
  return useQuery({
    queryKey: ['didAuthentication', address, role, roleBytes],
    queryFn: async () => {
      if (!address || !roleBytes) return false;

      try {
        const result = await refetch();
        return result.data === true;
      } catch (error) {
        // Handle specific authentication errors
        if (error instanceof Error) {
          const errorMessage = error.message;

          // Log specific error types for debugging
          if (errorMessage.includes('DidAuth__InvalidDID')) {
            console.error('DID Authentication Error: Invalid DID');
            return { authenticated: false, error: 'Invalid DID' };
          }

          if (errorMessage.includes('DidAuth__DeactivatedDID')) {
            console.error('DID Authentication Error: Deactivated DID');
            return { authenticated: false, error: 'Deactivated DID' };
          }

          if (errorMessage.includes('DidAuth__InvalidRole')) {
            console.error('DID Authentication Error: Invalid Role');
            return { authenticated: false, error: 'Invalid Role' };
          }

          if (errorMessage.includes('DidAuth__Unauthorized')) {
            console.error('DID Authentication Error: Unauthorized');
            return { authenticated: false, error: 'Unauthorized' };
          }

          if (errorMessage.includes('DidAuth__InvalidCredential')) {
            console.error('DID Authentication Error: Invalid Credential');
            return { authenticated: false, error: 'Invalid Credential' };
          }
        }

        console.error('Error authenticating DID:', error);
        return { authenticated: false, error: 'Unknown error' };
      }
    },
    enabled: !!address && !!roleBytes && !isLoading,
    // Use the direct contract call result as initial data if available
    initialData: data === true,
    // Structured response with authentication status and any error information
    select: (result) => {
      if (typeof result === 'boolean') {
        return { authenticated: result, error: null };
      }
      return result;
    },
  });
}

/**
 * Comprehensive hook for managing DIDs, combining existence checks, role constants, and authentication
 * @param address Wallet address
 * @param didRegistryAddress DID Registry contract address
 * @param didAuthAddress DID Auth contract address
 * @param generateDid Function to generate a DID from an address
 * @returns Combined DID management functionality
 */
export function useDidManager(
  address: `0x${string}` | undefined,
  didRegistryAddress: `0x${string}`,
  didAuthAddress: `0x${string}`,
  generateDid: () => string
) {
  // Check if DID exists
  const didExistsQuery = useDidExistsQuery(address, didRegistryAddress, generateDid);

  // Get role constants
  const { consumerRoleData, producerRoleData } = useRoleConstants(address, didAuthAddress);

  // Check authentication for consumer role
  const consumerAuthQuery = useDidAuthentication(
    address,
    didAuthAddress,
    generateDid,
    'consumer',
    consumerRoleData as `0x${string}` | undefined
  );

  // Check authentication for producer role
  const producerAuthQuery = useDidAuthentication(
    address,
    didAuthAddress,
    generateDid,
    'producer',
    producerRoleData as `0x${string}` | undefined
  );

  // Get DID document if DID exists
  const { data: didDocument } = useReadContract({
    address: didRegistryAddress,
    abi: didRegistryAbi,
    functionName: 'getDocument',
    args: address && didExistsQuery.data ? [generateDid()] : undefined,
    query: {
      enabled: !!address && !!didExistsQuery.data,
    },
  });

  // Get DID public key if DID exists
  const { data: didPublicKey } = useReadContract({
    address: didRegistryAddress,
    abi: didRegistryAbi,
    functionName: 'getPublicKey',
    args: address && didExistsQuery.data ? [generateDid()] : undefined,
    query: {
      enabled: !!address && !!didExistsQuery.data,
    },
  });

  // Get DID last updated timestamp if DID exists
  const { data: didLastUpdated } = useReadContract({
    address: didRegistryAddress,
    abi: didRegistryAbi,
    functionName: 'getLastUpdated',
    args: address && didExistsQuery.data ? [generateDid()] : undefined,
    query: {
      enabled: !!address && !!didExistsQuery.data,
    },
  });

  return {
    // DID existence
    didExists: !!didExistsQuery.data,
    didExistsQuery,
    controller: didExistsQuery.data,

    // DID document and metadata
    did: address ? generateDid() : undefined,
    didDocument,
    didPublicKey,
    didLastUpdated,

    // Role constants
    consumerRoleData,
    producerRoleData,

    // Authentication status
    consumerAuthenticated: consumerAuthQuery.data?.authenticated || false,
    producerAuthenticated: producerAuthQuery.data?.authenticated || false,
    consumerAuthQuery,
    producerAuthQuery,

    // Authentication errors
    consumerAuthError: consumerAuthQuery.data?.error || null,
    producerAuthError: producerAuthQuery.data?.error || null,

    // Loading states
    isLoading: didExistsQuery.isLoading || consumerAuthQuery.isLoading || producerAuthQuery.isLoading,

    // Error states
    hasError: didExistsQuery.isError || consumerAuthQuery.isError || producerAuthQuery.isError,
  };
}
