'use client';

import { useState } from 'react';
import { useUploadToIPFS, useCreateRecordWithIPFS, useUpdateRecordWithIPFS } from './use-ipfs-mutations';
import { useIPFSData } from './use-ipfs-queries';
import { toast } from 'sonner';

/**
 * Hook for managing IPFS data upload and retrieval flow
 * @returns Functions and state for IPFS operations
 */
export function useIPFSUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploadedCid, setUploadedCid] = useState<string | null>(null);

  const uploadToIPFSMutation = useUploadToIPFS();
  const createRecordMutation = useCreateRecordWithIPFS();
  const updateRecordMutation = useUpdateRecordWithIPFS();

  const uploadedDataQuery = useIPFSData(uploadedCid || undefined, {
    enabled: !!uploadedCid,
  });

  /**
   * Upload data to IPFS without blockchain registration
   * @param data - The data to upload
   * @param producer - The producer address
   * @returns The IPFS response
   */
  const uploadToIPFS = async (data: Record<string, any>, producer: string) => {
    try {
      setUploading(true);
      const response = await uploadToIPFSMutation.mutateAsync({ data, producer });
      setUploadedCid(response.cid);
      return response;
    } catch (error) {
      toast.error(`Failed to upload to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  /**
   * Upload data to IPFS and register it on the blockchain
   * @param data - The data to upload
   * @param producer - The producer address
   * @param privateKey - The private key for blockchain transaction
   * @returns The blockchain transaction response
   */
  const uploadAndRegister = async (data: Record<string, any>, producer: string, privateKey: string) => {
    try {
      setUploading(true);
      const response = await createRecordMutation.mutateAsync({ data, producer, privateKey });
      return response;
    } catch (error) {
      toast.error(`Failed to upload and register: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  /**
   * Upload data to IPFS and update an existing record on the blockchain
   * @param data - The data to upload
   * @param producer - The producer address
   * @param privateKey - The private key for blockchain transaction
   * @returns The blockchain transaction response
   */
  const uploadAndUpdate = async (data: Record<string, any>, producer: string, privateKey: string) => {
    try {
      setUploading(true);
      const response = await updateRecordMutation.mutateAsync({ data, producer, privateKey });
      return response;
    } catch (error) {
      toast.error(`Failed to upload and update: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    uploadedCid,
    uploadedData: uploadedDataQuery.data,
    isLoadingUploadedData: uploadedDataQuery.isLoading,
    uploadToIPFS,
    uploadAndRegister,
    uploadAndUpdate,
    reset: () => setUploadedCid(null),
  };
}
