'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { uploadToIPFS, deleteIPFSData, updateBlockchain } from '../actions/ipfs';
import { DATA_REGISTRY_KEYS } from './use-data-registry';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { DataRegistryABI } from '@/abi/data-registry.abi';
import { parseDataRegistryError } from '../utils/errors';
import { hashData } from '@/lib/hash';
import { getResourceTypeEnum } from '../utils/index';

// Default configuration - should be overridden in production
const defaultConfig = {
  contractAddress: (process.env.NEXT_PUBLIC_DATA_REGISTRY_CONTRACT_ADDRESS || '0x0') as `0x${string}`,
  chainId: Number(process.env.CHAIN_ID || 1),
  rpcUrl: process.env.RPC_URL || 'http://127.0.0.1:8545',
};

/**
 * Hook for uploading data to IPFS
 * @returns Mutation object for uploading data to IPFS
 */
export function useUploadToIPFS() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data, producer }: { data: Record<string, any>; producer: string }) => {
      return await uploadToIPFS(data, producer);
    },
    onSuccess: () => {
      toast.success('Data successfully uploaded to IPFS');
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['producerRecords'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to upload to IPFS: ${error.message}`);
    },
  });
}

/**
 * Hook for deleting data from IPFS
 * @returns Mutation object for deleting data from IPFS
 */
export function useDeleteIPFSData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cid: string) => {
      return await deleteIPFSData(cid);
    },
    onSuccess: () => {
      toast.success('Data successfully deleted from IPFS');
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['producerRecords'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete from IPFS: ${error.message}`);
    },
  });
}

/**
 * Hook for updating blockchain with IPFS data
 * @returns Mutation object for updating blockchain with IPFS data
 */
export function useUpdateBlockchain() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      recordId: string;
      cid: string;
      contentHash: string;
      resourceType: number;
      dataSize: number;
    }) => {
      return await updateBlockchain(params);
    },
    onSuccess: () => {
      toast.success('Blockchain successfully updated with IPFS data');
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['producerRecords'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update blockchain: ${error.message}`);
    },
  });
}

/**
 * Hook for complete record creation flow: IPFS upload followed by blockchain registration
 * @returns Mutation object for the complete flow
 */
export function useCreateRecordWithIPFS() {
  const uploadToIPFSMutation = useUploadToIPFS();
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  return useMutation({
    mutationFn: async ({ data, producer }: { data: Record<string, any>; producer: string }) => {
      if (!address || !walletClient || !publicClient) {
        throw new Error('Wallet not connected');
      }

      try {
        console.log('Creating record with data:', {
          resourceType: data.resource.resourceType,
          metadataResourceType: data.metadata.resourceType,
          recordId: data.metadata.recordId,
        });

        // Step 1: Upload to IPFS
        const ipfsResponse = await uploadToIPFSMutation.mutateAsync({ data, producer });
        const cidHash = await hashData(ipfsResponse.cid);

        // Get the resource type from the form data
        const resourceType = data.resource.resourceType;
        console.log('Resource type from form:', resourceType);

        // Convert string resource type to enum
        const resourceTypeEnum = getResourceTypeEnum(resourceType);
        console.log('Resource type enum:', resourceTypeEnum);

        // Verify the conversion
        if (resourceTypeEnum === undefined) {
          throw new Error(`Invalid resource type: ${resourceType}`);
        }

        // Step 2: Register on blockchain using wallet client
        // Prepare the transaction
        const { request } = await publicClient.simulateContract({
          address: defaultConfig.contractAddress,
          abi: DataRegistryABI,
          functionName: 'registerRecord',
          args: [
            data.metadata.recordId,
            ipfsResponse.cid,
            `0x${data.metadata.contentHash}` as `0x${string}`,
            resourceTypeEnum,
            Number(ipfsResponse.size) || 0,
          ],
          account: address,
        });

        // Send the transaction
        const hash = await walletClient.writeContract(request);

        // Wait for the transaction to be mined
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        return {
          success: true,
          hash: receipt.transactionHash,
          receipt,
          cid: ipfsResponse.cid,
          recordId: data.metadata.recordId,
          resourceType: resourceType,
        };
      } catch (error) {
        console.error('Error creating record with IPFS:', error);
        const parsedError = parseDataRegistryError(error);
        if (parsedError) {
          throw new Error(parsedError.message);
        }
        throw new Error('Failed to create record with IPFS');
      }
    },
    onSuccess: (result, variables) => {
      toast.success(`${result.resourceType} record successfully created and registered on blockchain`);
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: DATA_REGISTRY_KEYS.producerRecords(address as `0x${string}`),
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create record: ${error.message}`);
    },
  });
}

/**
 * Hook for complete record update flow: IPFS upload followed by blockchain update
 * @returns Mutation object for the complete flow
 */
export function useUpdateRecordWithIPFS() {
  const uploadToIPFSMutation = useUploadToIPFS();
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  return useMutation({
    mutationFn: async ({ data, producer }: { data: Record<string, any>; producer: string }) => {
      if (!address || !walletClient || !publicClient) {
        throw new Error('Wallet not connected');
      }

      try {
        // Step 1: Upload to IPFS
        const ipfsResponse = await uploadToIPFSMutation.mutateAsync({ data, producer });

        // Ensure recordId is properly formatted
        const recordId = data.id || data.recordId;
        const formattedRecordId = recordId.startsWith('record-') ? recordId : `record-${recordId}`;

        // Step 2: Update on blockchain
        // Prepare the transaction
        const { request } = await publicClient.simulateContract({
          address: defaultConfig.contractAddress,
          abi: DataRegistryABI,
          functionName: 'updateRecord',
          args: [formattedRecordId, ipfsResponse.cid, ipfsResponse.contentHash as `0x${string}`],
          account: address,
        });

        // Send the transaction
        const hash = await walletClient.writeContract(request);

        // Wait for the transaction to be mined
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        return {
          success: true,
          hash: receipt.transactionHash,
          receipt,
          cid: ipfsResponse.cid,
          recordId: formattedRecordId,
        };
      } catch (error) {
        console.error('Error updating record with IPFS:', error);
        const parsedError = parseDataRegistryError(error);
        if (parsedError) {
          throw new Error(parsedError.message);
        }
        throw new Error('Failed to update record with IPFS');
      }
    },
    onSuccess: (_, variables) => {
      toast.success('Record successfully updated on IPFS and blockchain');
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: DATA_REGISTRY_KEYS.producerRecords(address as `0x${string}`),
      });
      queryClient.invalidateQueries({
        queryKey: DATA_REGISTRY_KEYS.recordInfo(variables.data.id || variables.data.recordId),
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update record: ${error.message}`);
    },
  });
}
