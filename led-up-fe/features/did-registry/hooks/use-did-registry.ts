'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as didRegistryActions from '../actions';
import { DIDDocument } from '../actions/query';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { type WalletClient, type PublicClient } from 'viem';

// Query Hooks

/**
 * Hook to get the DID for an address
 * @param address - The address to get the DID for
 */
export function useAddressToDID(address?: string) {
  return useQuery({
    queryKey: ['didRegistry', 'addressToDID', address],
    queryFn: () => didRegistryActions.addressToDID(address!),
    enabled: !!address,
  });
}

/**
 * Hook to get the controller address for a DID
 * @param did - The DID to get the controller for
 */
export function useGetController(did?: string) {
  return useQuery({
    queryKey: ['didRegistry', 'getController', did],
    queryFn: () => didRegistryActions.getController(did!),
    enabled: !!did,
  });
}

/**
 * Hook to get the DID document for a DID
 * @param did - The DID to get the document for
 */
export function useGetDocument(did?: string) {
  return useQuery({
    queryKey: ['didRegistry', 'getDocument', did],
    queryFn: () => didRegistryActions.getDocument(did!),
    enabled: !!did,
  });
}

/**
 * Hook to get the DID document for a DID (alternative method)
 * @param did - The DID to get the document for
 */
export function useGetDocumentForDid(did?: string) {
  return useQuery({
    queryKey: ['didRegistry', 'getDocumentForDid', did],
    queryFn: () => didRegistryActions.getDocumentForDid(did!),
    enabled: !!did,
  });
}

/**
 * Hook to get the last updated timestamp for a DID
 * @param did - The DID to get the last updated timestamp for
 */
export function useGetLastUpdated(did?: string) {
  return useQuery({
    queryKey: ['didRegistry', 'getLastUpdated', did],
    queryFn: () => didRegistryActions.getLastUpdated(did!),
    enabled: !!did,
  });
}

/**
 * Hook to get the last updated timestamp for a DID (alternative method)
 * @param did - The DID to get the last updated timestamp for
 */
export function useGetLastUpdatedForDid(did?: string) {
  return useQuery({
    queryKey: ['didRegistry', 'getLastUpdatedForDid', did],
    queryFn: () => didRegistryActions.getLastUpdatedForDid(did!),
    enabled: !!did,
  });
}

/**
 * Hook to get the public key for a DID
 * @param did - The DID to get the public key for
 */
export function useGetPublicKey(did?: string) {
  return useQuery({
    queryKey: ['didRegistry', 'getPublicKey', did],
    queryFn: () => didRegistryActions.getPublicKey(did!),
    enabled: !!did,
  });
}

/**
 * Hook to get the public key for a DID (alternative method)
 * @param did - The DID to get the public key for
 */
export function useGetPublicKeyForDid(did?: string) {
  return useQuery({
    queryKey: ['didRegistry', 'getPublicKeyForDid', did],
    queryFn: () => didRegistryActions.getPublicKeyForDid(did!),
    enabled: !!did,
  });
}

/**
 * Hook to get the subject address for a DID
 * @param did - The DID to get the subject for
 */
export function useGetSubject(did?: string) {
  return useQuery({
    queryKey: ['didRegistry', 'getSubject', did],
    queryFn: () => didRegistryActions.getSubject(did!),
    enabled: !!did,
  });
}

/**
 * Hook to get the subject address for a DID (alternative method)
 * @param did - The DID to get the subject for
 */
export function useGetSubjectForDid(did?: string) {
  return useQuery({
    queryKey: ['didRegistry', 'getSubjectForDid', did],
    queryFn: () => didRegistryActions.getSubjectForDid(did!),
    enabled: !!did,
  });
}

/**
 * Hook to check if a DID is active
 * @param did - The DID to check
 */
export function useIsActive(did?: string) {
  return useQuery({
    queryKey: ['didRegistry', 'isActive', did],
    queryFn: () => didRegistryActions.isActive(did!),
    enabled: !!did,
  });
}

/**
 * Hook to check if a DID is active (alternative method)
 * @param did - The DID to check
 */
export function useIsActiveForDid(did?: string) {
  return useQuery({
    queryKey: ['didRegistry', 'isActiveForDid', did],
    queryFn: () => didRegistryActions.isActiveForDid(did!),
    enabled: !!did,
  });
}

/**
 * Hook to resolve a DID to get its full document
 * @param did - The DID to resolve
 */
export function useResolveDid(did?: string) {
  return useQuery<DIDDocument>({
    queryKey: ['didRegistry', 'resolveDid', did],
    queryFn: () => didRegistryActions.resolveDid(did!),
    enabled: !!did,
  });
}

// Mutation Hooks

/**
 * Hook to register a new DID
 */
export function useRegisterDid() {
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  return useMutation({
    mutationFn: async (params: { did: string; document: string; publicKey: string }) => {
      if (!address) throw new Error('Wallet not connected');
      if (!walletClient) throw new Error('Wallet client not available');
      if (!publicClient) throw new Error('Public client not available');

      // Prepare the transaction data on the server
      const preparedTx = await didRegistryActions.registerDid(params.did, params.document, params.publicKey);

      if (!preparedTx.success) {
        throw new Error(preparedTx.error || 'Failed to prepare DID registration');
      }

      // Ensure we have all the required data
      if (!preparedTx.contractAddress || !preparedTx.abi || !preparedTx.functionName) {
        throw new Error('Incomplete transaction data received from server');
      }

      try {
        // Execute the transaction using the client's wallet
        const hash = await walletClient.writeContract({
          address: preparedTx.contractAddress,
          abi: preparedTx.abi,
          functionName: preparedTx.functionName,
          args: preparedTx.args || [],
        });

        // Wait for the transaction to be mined
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        // Process the receipt on the server to revalidate caches if needed
        await didRegistryActions.processTransactionReceipt(hash);

        return {
          success: receipt.status === 'success',
          hash,
          receipt,
        };
      } catch (error: any) {
        console.error('Error executing transaction:', error);
        throw new Error(error.message || 'Failed to execute transaction');
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['didRegistry'] });
      queryClient.invalidateQueries({ queryKey: ['didRegistry', 'addressToDID', address] });
      queryClient.invalidateQueries({ queryKey: ['didRegistry', 'resolveDid', variables.did] });
    },
  });
}

/**
 * Hook to deactivate a DID
 */
export function useDeactivateDid() {
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  return useMutation({
    mutationFn: async (params: { did: string }) => {
      if (!address) throw new Error('Wallet not connected');
      if (!walletClient) throw new Error('Wallet client not available');
      if (!publicClient) throw new Error('Public client not available');

      // Prepare the transaction data on the server
      const preparedTx = await didRegistryActions.deactivateDid(params.did);

      if (!preparedTx.success) {
        throw new Error(preparedTx.error || 'Failed to prepare DID deactivation');
      }

      // Ensure we have all the required data
      if (!preparedTx.contractAddress || !preparedTx.abi || !preparedTx.functionName) {
        throw new Error('Incomplete transaction data received from server');
      }

      try {
        // Execute the transaction using the client's wallet
        const hash = await walletClient.writeContract({
          address: preparedTx.contractAddress,
          abi: preparedTx.abi,
          functionName: preparedTx.functionName,
          args: preparedTx.args || [],
        });

        // Wait for the transaction to be mined
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        // Process the receipt on the server to revalidate caches if needed
        await didRegistryActions.processTransactionReceipt(hash);

        return {
          success: receipt.status === 'success',
          hash,
          receipt,
        };
      } catch (error: any) {
        throw new Error(error.message || 'Failed to execute transaction');
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['didRegistry'] });
      queryClient.invalidateQueries({ queryKey: ['didRegistry', 'isActive', variables.did] });
      queryClient.invalidateQueries({ queryKey: ['didRegistry', 'isActiveForDid', variables.did] });
      queryClient.invalidateQueries({ queryKey: ['didRegistry', 'resolveDid', variables.did] });
    },
  });
}

/**
 * Hook to update a DID document
 */
export function useUpdateDidDocument() {
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  return useMutation({
    mutationFn: async (params: { did: string; newDocument: string }) => {
      if (!address) throw new Error('Wallet not connected');
      if (!walletClient) throw new Error('Wallet client not available');
      if (!publicClient) throw new Error('Public client not available');

      // First, prepare the transaction data on the server
      const preparedTx = await didRegistryActions.updateDidDocument(params.did, params.newDocument);

      if (!preparedTx.success) {
        throw new Error(preparedTx.error || 'Failed to prepare DID document update');
      }

      // Ensure we have all the required data
      if (!preparedTx.contractAddress || !preparedTx.abi || !preparedTx.functionName) {
        throw new Error('Incomplete transaction data received from server');
      }

      try {
        // Execute the transaction using the client's wallet
        const hash = await walletClient.writeContract({
          address: preparedTx.contractAddress,
          abi: preparedTx.abi,
          functionName: preparedTx.functionName,
          args: preparedTx.args || [],
        });

        // Wait for the transaction to be mined
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        // Process the receipt on the server to revalidate caches if needed
        await didRegistryActions.processTransactionReceipt(hash);

        return {
          success: receipt.status === 'success',
          hash,
          receipt,
        };
      } catch (error: any) {
        throw new Error(error.message || 'Failed to execute transaction');
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['didRegistry', 'getDocument', variables.did] });
      queryClient.invalidateQueries({ queryKey: ['didRegistry', 'getDocumentForDid', variables.did] });
      queryClient.invalidateQueries({ queryKey: ['didRegistry', 'resolveDid', variables.did] });
      queryClient.invalidateQueries({ queryKey: ['didRegistry', 'getLastUpdated', variables.did] });
      queryClient.invalidateQueries({ queryKey: ['didRegistry', 'getLastUpdatedForDid', variables.did] });

      // Also invalidate the public key queries as the document might contain public key information
      queryClient.invalidateQueries({ queryKey: ['didRegistry', 'getPublicKey', variables.did] });
      queryClient.invalidateQueries({ queryKey: ['didRegistry', 'getPublicKeyForDid', variables.did] });
    },
  });
}

/**
 * Hook to update a DID public key
 */
export function useUpdateDidPublicKey() {
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  return useMutation({
    mutationFn: async (params: { did: string; newPublicKey: string }) => {
      if (!address) throw new Error('Wallet not connected');
      if (!walletClient) throw new Error('Wallet client not available');
      if (!publicClient) throw new Error('Public client not available');

      // First, prepare the transaction data on the server
      const preparedTx = await didRegistryActions.updateDidPublicKey(params.did, params.newPublicKey);

      if (!preparedTx.success) {
        throw new Error(preparedTx.error || 'Failed to prepare DID public key update');
      }

      // Ensure we have all the required data
      if (!preparedTx.contractAddress || !preparedTx.abi || !preparedTx.functionName) {
        throw new Error('Incomplete transaction data received from server');
      }

      try {
        // Execute the transaction using the client's wallet
        const hash = await walletClient.writeContract({
          address: preparedTx.contractAddress,
          abi: preparedTx.abi,
          functionName: preparedTx.functionName,
          args: preparedTx.args || [],
        });

        // Wait for the transaction to be mined
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        // Process the receipt on the server to revalidate caches if needed
        await didRegistryActions.processTransactionReceipt(hash);

        return {
          success: receipt.status === 'success',
          hash,
          receipt,
        };
      } catch (error: any) {
        console.error('Error executing transaction:', error);
        throw new Error(error.message || 'Failed to execute transaction');
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['didRegistry', 'getPublicKey', variables.did] });
      queryClient.invalidateQueries({ queryKey: ['didRegistry', 'getPublicKeyForDid', variables.did] });
      queryClient.invalidateQueries({ queryKey: ['didRegistry', 'resolveDid', variables.did] });
    },
  });
}
