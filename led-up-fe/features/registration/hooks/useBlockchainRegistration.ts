'use client';

import { useState, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { RegistrationResponse } from '../types';
import { getContractAddresses } from '../../../lib/ethers';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Import ABIs
import * as ABI from '@/abi';

// Get contract addresses
const { DID_REGISTRY_ADDRESS, DID_AUTH_ADDRESS, DID_ACCESS_CONTROL_ADDRESS, DATA_REGISTRY_ADDRESS } =
  getContractAddresses();

// Convert string addresses to `0x${string}` format for Wagmi
const didRegistryAddress = DID_REGISTRY_ADDRESS as `0x${string}`;
const didAuthAddress = DID_AUTH_ADDRESS as `0x${string}`;
const didAccessControlAddress = DID_ACCESS_CONTROL_ADDRESS as `0x${string}`;
const dataRegistryAddress = DATA_REGISTRY_ADDRESS as `0x${string}`;

export function useBlockchainRegistration() {
  const { address, isConnected } = useAccount();
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Generate a DID for the connected wallet
  const generateDid = useCallback(() => {
    if (!address) {
      throw new Error('Wallet not connected');
    }
    // Format: did:ledup:<network>:<address>
    // Using the network identifier instead of "user" to match the contract's expected format
    const network = process.env.NEXT_PUBLIC_NETWORK_NAME || 'mainnet'; // Default to mainnet if not specified
    return `did:ledup:${network}:${address.toLowerCase()}`;
  }, [address]);

  // Generate a simple DID document
  const generateDidDocument = useCallback(() => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    return JSON.stringify({
      '@context': 'https://www.w3.org/ns/did/v1',
      id: generateDid(),
      controller: address,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    });
  }, [address, generateDid]);

  // Generate a public key (simplified for demo)
  const generatePublicKey = useCallback(() => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    return address;
  }, [address]);

  // Direct contract read to check if a DID exists
  const { data: controllerData, refetch: refetchController } = useReadContract({
    address: didRegistryAddress,
    abi: ABI.DidRegistryABI,
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
  const didExistsQuery = useQuery({
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

  // Contract write for registering a DID
  const { writeContract, data: writeData } = useWriteContract();

  // Wait for transaction to complete
  const { isLoading: isWaitingForTransaction } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  // Register DID mutation with React Query
  const registerDidMutation = useMutation({
    mutationFn: async () => {
      if (!isConnected || !address) {
        throw new Error('Wallet not connected');
      }

      const did = generateDid();
      const document = generateDidDocument();
      const publicKey = generatePublicKey();

      // First check if the DID already exists
      const existingDid = await didExistsQuery.refetch();

      if (existingDid.data) {
        throw new Error('DidRegistry__DIDAlreadyRegistered');
      }

      // Call the contract write function
      const hash = await writeContract({
        address: didRegistryAddress,
        abi: ABI.DidRegistryABI,
        functionName: 'registerDid',
        args: [did, document, publicKey],
      });

      return { did, txHash: hash };
    },
    onSuccess: (data) => {
      // Invalidate queries that depend on DID status
      queryClient.invalidateQueries({ queryKey: ['didExists', address] });
    },
    onError: (error) => {
      console.error('Error registering DID:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    },
  });

  // Register a DID in the DID Registry
  const registerDid = useCallback(async (): Promise<RegistrationResponse> => {
    try {
      setError(null);

      if (!isConnected || !address) {
        throw new Error('Wallet not connected');
      }

      // If DID already exists, return early
      if (didExistsQuery.data) {
        return {
          success: false,
          error: 'DID already registered',
          message: 'This DID is already registered. Please try authenticating instead.',
        };
      }

      // Trigger the mutation
      const result = await registerDidMutation.mutateAsync();

      return {
        success: true,
        data: {
          did: result.did,
          transactionHash: result.txHash,
        },
        message: 'DID registration initiated',
      };
    } catch (error: any) {
      console.error('Error registering DID:', error);

      // Handle specific error codes
      if (error.message?.includes('DidRegistry__DIDAlreadyRegistered')) {
        setError('DID already registered');
        return {
          success: false,
          error: 'DID already registered',
          message: 'This DID is already registered. Please try authenticating instead.',
        };
      }

      if (error.message?.includes('DidRegistry__Unauthorized')) {
        setError('Unauthorized to register this DID');
        return {
          success: false,
          error: 'Unauthorized to register this DID',
          message:
            'You are not authorized to register this DID. Your wallet address may already be associated with another DID.',
        };
      }

      setError(error.message || 'Unknown error');
      return {
        success: false,
        error: error.message || 'Unknown error',
        message: 'Failed to register DID',
      };
    }
  }, [isConnected, address, didExistsQuery.data, registerDidMutation]);

  // Check if a DID exists and is active
  const checkDid = useCallback(
    async (did?: string): Promise<RegistrationResponse> => {
      try {
        setError(null);

        const didToCheck = did || generateDid();

        // Trigger a refetch of the DID exists query
        await didExistsQuery.refetch();

        if (didExistsQuery.data) {
          return {
            success: true,
            data: {
              exists: true,
              isActive: true, // Assuming active if it exists
              controller: didExistsQuery.data,
            },
            message: 'DID exists and is active',
          };
        } else {
          return {
            success: false,
            data: { exists: false },
            message: 'DID does not exist',
          };
        }
      } catch (error: any) {
        console.error('Error checking DID:', error);
        setError(error.message || 'Unknown error');
        return {
          success: false,
          error: error.message || 'Unknown error',
          message: 'Failed to check DID',
        };
      }
    },
    [generateDid, didExistsQuery]
  );

  // Read contract to get role constants
  const { data: consumerRoleData } = useReadContract({
    address: didAuthAddress,
    abi: ABI.DidAuthABI,
    functionName: 'CONSUMER_ROLE',
    query: {
      enabled: !!address,
    },
  });

  const { data: producerRoleData } = useReadContract({
    address: didAuthAddress,
    abi: ABI.DidAuthABI,
    functionName: 'PRODUCER_ROLE',
    query: {
      enabled: !!address,
    },
  });

  // Direct contract read to check authentication status
  const useDidAuthentication = (role: 'consumer' | 'producer') => {
    const roleBytes = role === 'consumer' ? consumerRoleData : producerRoleData;

    return useReadContract({
      address: didAuthAddress,
      abi: ABI.DidAuthABI,
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
  };

  // Authentication mutation using direct contract interaction
  const authenticateDidMutation = useMutation({
    mutationFn: async (role: 'consumer' | 'producer') => {
      if (!isConnected || !address) {
        throw new Error('Wallet not connected');
      }

      const did = generateDid();
      const roleBytes = role === 'consumer' ? consumerRoleData : producerRoleData;

      if (!roleBytes) {
        throw new Error('Role data not available');
      }

      // Check if already authenticated
      try {
        const isAuthenticated = await queryClient.fetchQuery({
          queryKey: ['didAuthentication', did, role],
          queryFn: async () => {
            const result = await useDidAuthentication(role);
            // Ensure we handle undefined values
            return result.data !== undefined ? result.data : false;
          },
        });

        if (isAuthenticated) {
          return { isAuthenticated: true, did, role };
        }
      } catch (error) {
        console.warn('Error checking authentication status:', error);
        // Continue with authentication even if check fails
      }

      // If not authenticated, we need to grant the role first
      const hash = await writeContract({
        address: didAccessControlAddress,
        abi: ABI.DidAccessControlABI,
        functionName: 'grantDidRole',
        args: [did, roleBytes],
      });

      return { isAuthenticated: true, did, role, txHash: hash };
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['didAuthentication', data.did, data.role] });
    },
    onError: (error) => {
      console.error('Error authenticating DID:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    },
  });

  // Authenticate a DID with a role
  const authenticateDid = useCallback(
    async (role: 'consumer' | 'producer'): Promise<RegistrationResponse> => {
      try {
        setError(null);

        if (!isConnected || !address) {
          throw new Error('Wallet not connected');
        }

        // Trigger the authentication mutation
        const result = await authenticateDidMutation.mutateAsync(role);

        return {
          success: true,
          data: {
            isAuthenticated: true,
            did: result.did,
            role: result.role,
            transactionHash: result.txHash || '0x',
          },
          message: 'DID authenticated successfully',
        };
      } catch (error: any) {
        console.error('Error authenticating DID:', error);
        setError(error.message || 'Unknown error');
        return {
          success: false,
          error: error.message || 'Unknown error',
          message: 'Failed to authenticate DID',
        };
      }
    },
    [isConnected, address, authenticateDidMutation]
  );

  // Producer registration mutation using direct contract interaction
  const registerProducerMutation = useMutation({
    mutationFn: async () => {
      if (!isConnected || !address) {
        throw new Error('Wallet not connected');
      }

      const did = generateDid();

      // First, ensure the DID is authenticated as a producer
      const producerRole = producerRoleData;
      if (!producerRole) {
        throw new Error('Producer role data not available');
      }

      // Check if already authenticated as producer
      let isAuthenticated = false;
      try {
        isAuthenticated = await queryClient.fetchQuery({
          queryKey: ['didAuthentication', did, 'producer'],
          queryFn: async () => {
            const result = await useDidAuthentication('producer');
            // Ensure we handle undefined values
            return result.data !== undefined ? result.data : false;
          },
        });
      } catch (error) {
        console.warn('Error checking producer authentication status:', error);
        // Continue with authentication even if check fails
      }

      // If not authenticated as producer, authenticate first
      if (!isAuthenticated) {
        try {
          await authenticateDidMutation.mutateAsync('producer');
        } catch (error) {
          console.error('Failed to authenticate as producer:', error);
          throw new Error('Failed to authenticate as producer before registration');
        }
      }

      // Now register as producer in the data registry
      const hash = await writeContract({
        address: dataRegistryAddress,
        abi: ABI.DataRegistryABI,
        functionName: 'registerProducer',
        args: [did, address, 1, 1], // status: ACTIVE(1), consent: GRANTED(1)
      });

      return { did, producerAddress: address, txHash: hash };
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['producerStatus', address] });
    },
    onError: (error) => {
      console.error('Error registering as producer:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    },
  });

  // Register as a producer in the Data Registry
  const registerAsProducer = useCallback(async (): Promise<RegistrationResponse> => {
    try {
      setError(null);

      if (!isConnected || !address) {
        throw new Error('Wallet not connected');
      }

      // Trigger the producer registration mutation
      const result = await registerProducerMutation.mutateAsync();

      return {
        success: true,
        data: {
          did: result.did,
          producerAddress: result.producerAddress,
          transactionHash: result.txHash,
        },
        message: 'Registered as producer successfully',
      };
    } catch (error: any) {
      console.error('Error registering as producer:', error);

      // Handle specific error codes
      if (error.message?.includes('DataRegistry__AlreadyRegistered')) {
        setError('Producer already registered');
        return {
          success: false,
          error: 'Producer already registered',
          message: 'This address is already registered as a producer.',
        };
      }

      if (error.message?.includes('DataRegistry__UnauthorizedProducer')) {
        setError('Unauthorized producer');
        return {
          success: false,
          error: 'Unauthorized producer',
          message: 'Your DID is not authorized as a producer. Please authenticate first.',
        };
      }

      setError(error.message || 'Unknown error');
      return {
        success: false,
        error: error.message || 'Unknown error',
        message: 'Failed to register as producer',
      };
    }
  }, [isConnected, address, registerProducerMutation, authenticateDidMutation]);

  // Role granting mutation using direct contract interaction
  const grantRoleMutation = useMutation({
    mutationFn: async (role: 'consumer' | 'producer') => {
      if (!isConnected || !address) {
        throw new Error('Wallet not connected');
      }

      const did = generateDid();
      const roleBytes = role === 'consumer' ? consumerRoleData : producerRoleData;

      if (!roleBytes) {
        throw new Error('Role data not available');
      }

      // Grant the role using the access control contract
      const hash = await writeContract({
        address: didAccessControlAddress,
        abi: ABI.DidAccessControlABI,
        functionName: 'grantDidRole',
        args: [did, roleBytes],
      });

      return { did, role, txHash: hash };
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['didAuthentication', data.did, data.role] });
    },
    onError: (error) => {
      console.error('Error granting role:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    },
  });

  // Grant a role to a DID
  const grantRole = useCallback(
    async (role: 'consumer' | 'producer'): Promise<RegistrationResponse> => {
      try {
        setError(null);

        if (!isConnected || !address) {
          throw new Error('Wallet not connected');
        }

        // Trigger the role granting mutation
        const result = await grantRoleMutation.mutateAsync(role);

        return {
          success: true,
          data: {
            did: result.did,
            role: result.role,
            transactionHash: result.txHash,
          },
          message: `${role.charAt(0).toUpperCase() + role.slice(1)} role granted successfully`,
        };
      } catch (error: any) {
        console.error('Error granting role:', error);

        // Handle specific error codes
        if (error.message?.includes('DidAccessControl__InvalidDID')) {
          setError('Invalid DID');
          return {
            success: false,
            error: 'Invalid DID',
            message: 'The DID is invalid or does not exist.',
          };
        }

        if (error.message?.includes('DidAccessControl__InvalidRole')) {
          setError('Invalid role');
          return {
            success: false,
            error: 'Invalid role',
            message: 'The specified role is invalid.',
          };
        }

        if (error.message?.includes('AccessControlUnauthorizedAccount')) {
          setError('Unauthorized account');
          return {
            success: false,
            error: 'Unauthorized account',
            message: 'Your account is not authorized to grant this role.',
          };
        }

        setError(error.message || 'Unknown error');
        return {
          success: false,
          error: error.message || 'Unknown error',
          message: 'Failed to grant role',
        };
      }
    },
    [isConnected, address, grantRoleMutation, consumerRoleData, producerRoleData]
  );

  return {
    isLoading:
      didExistsQuery.isLoading ||
      registerDidMutation.isPending ||
      isWaitingForTransaction ||
      authenticateDidMutation.isPending ||
      registerProducerMutation.isPending ||
      grantRoleMutation.isPending,
    error,
    generateDid,
    generateDidDocument,
    generatePublicKey,
    registerDid,
    checkDid,
    authenticateDid,
    registerAsProducer,
    grantRole,
    didExists: !!didExistsQuery.data,
  };
}
