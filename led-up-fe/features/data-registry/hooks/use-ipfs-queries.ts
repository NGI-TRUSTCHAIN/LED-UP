'use client';

import { useQuery, type UseQueryOptions, type QueryKey } from '@tanstack/react-query';
import { getIPFSData, getRawIPFSData, getBulkIPFSData, getAccessForData } from '../actions/ipfs';
import { getRecordInfo, getProducerMetadata } from '../actions/query';
import { DATA_REGISTRY_KEYS } from './use-data-registry';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import {
  ProducerRecordsResponse,
  ResourceType,
  ConsentStatus,
  ResourceMetadata,
  ProducerMetadataResponse,
} from '../types';
import { Address } from 'viem';
import { parseDataRegistryError } from '../utils/errors';
import { DataRegistryABI } from '@/abi/data-registry.abi';
import { useMemo, useEffect, useCallback } from 'react';
import { AsymmetricEncryptOutput, decryptWithPrivateKey } from '@/features/cryptography';
import { useState } from 'react';
import { logger } from '@/lib/logger';

// Default configuration - should be overridden in production
const defaultConfig = {
  contractAddress: (process.env.NEXT_PUBLIC_DATA_REGISTRY_CONTRACT_ADDRESS || '0x0') as `0x${string}`,
  chainId: Number(process.env.CHAIN_ID || 1),
  rpcUrl: process.env.RPC_URL || 'http://127.0.0.1:8545',
};

// Create a utility hook for queries that should be fetched infrequently
export function useInfrequentQuery<TData = unknown, TError = unknown>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError, TData, QueryKey>, 'queryKey' | 'queryFn'>
) {
  return useQuery<TData, TError>({
    queryKey,
    queryFn,
    // Apply aggressive caching defaults
    staleTime: 120 * 60 * 1000, // 2 hours
    gcTime: 240 * 60 * 1000, // 4 hours
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1, // Only retry once to reduce API load
    ...options,
  });
}

/**
 * Hook to fetch and decode IPFS data for a given CID
 * @param cid - Content identifier to fetch
 * @param options - Additional query options
 * @returns Query object with the IPFS data
 */
export function useIPFSData(cid: string | undefined, options: { enabled?: boolean } = {}) {
  return useInfrequentQuery(
    ['ipfs', 'data', cid],
    async () => {
      if (!cid) throw new Error('CID is required');
      return await getIPFSData(cid);
    },
    {
      enabled: !!cid && options.enabled !== false,
    }
  );
}

/**
 * Hook to fetch raw IPFS data for a given CID
 * @param cid - Content identifier to fetch
 * @param options - Additional query options
 * @returns Query object with the raw IPFS data
 */
export function useRawIPFSData(cid: string | undefined, options: { enabled?: boolean } = {}) {
  return useInfrequentQuery(
    ['ipfs', 'raw', cid],
    async () => {
      if (!cid) throw new Error('CID is required');
      return await getRawIPFSData(cid);
    },
    {
      enabled: !!cid && options.enabled !== false,
    }
  );
}

/**
 * Hook to fetch record data from both blockchain and IPFS
 * @param recordId - The record ID to fetch
 * @param options - Additional query options
 * @returns Query object with the combined record data
 */
export function useRecordWithIPFSData(recordId: string | undefined, options: { enabled?: boolean } = {}) {
  const recordInfoQuery = useInfrequentQuery(
    DATA_REGISTRY_KEYS.recordInfo(recordId),
    async () => {
      if (!recordId) throw new Error('Record ID is required');
      return await getRecordInfo(recordId);
    },
    {
      enabled: !!recordId && options.enabled !== false,
    }
  );

  const cid = recordInfoQuery.data?.metadata?.cid;

  const ipfsDataQuery = useIPFSData(cid, {
    enabled: !!cid && !recordInfoQuery.isLoading && !recordInfoQuery.isError,
  });

  return {
    isLoading: recordInfoQuery.isLoading || ipfsDataQuery.isLoading,
    isError: recordInfoQuery.isError || ipfsDataQuery.isError,
    error: recordInfoQuery.error || ipfsDataQuery.error,
    data:
      recordInfoQuery.data && ipfsDataQuery.data
        ? {
            recordInfo: recordInfoQuery.data,
            ipfsData: ipfsDataQuery.data,
          }
        : undefined,
    recordInfoQuery,
    ipfsDataQuery,
  };
}

/**
 * Hook to fetch all producer records from the blockchain
 * @param producer - The producer address
 * @returns Query object with the producer records from blockchain
 */
export function useProducerBlockchainRecords(producer?: string) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  // Create a stable producer value for the query key
  const producerKey = useMemo(() => producer as `0x${string}`, [producer]);

  return useInfrequentQuery<ProducerRecordsResponse>(
    DATA_REGISTRY_KEYS.producerRecords(producerKey),
    async () => {
      if (!producer) {
        throw new Error('Producer address is required');
      }

      if (!address || !walletClient || !publicClient) {
        throw new Error('Wallet not connected');
      }

      try {
        // First get producer metadata using the authenticated wallet
        const metadata = (await publicClient.readContract({
          address: defaultConfig.contractAddress,
          abi: DataRegistryABI,
          functionName: 'getProducerMetadata',
          args: [producer],
          account: address,
        })) as [string, number, number, boolean, number, number];

        // Get record IDs using the authenticated wallet
        const recordIds = (await publicClient.readContract({
          address: defaultConfig.contractAddress,
          abi: DataRegistryABI,
          functionName: 'getProducerRecords',
          args: [producer],
          account: address,
        })) as string[];

        // Get record info for each record
        const healthRecords = await Promise.all(
          recordIds.map(async (recordId) => {
            try {
              const result = (await publicClient.readContract({
                address: defaultConfig.contractAddress,
                abi: DataRegistryABI,
                functionName: 'getRecordInfo',
                args: [recordId],
                account: address,
              })) as [Address, ResourceMetadata];

              const [producer, metadata] = result;

              const isVerified = (await publicClient.readContract({
                address: defaultConfig.contractAddress,
                abi: DataRegistryABI,
                functionName: 'isRecordVerified',
                args: [recordId],
                account: address,
              })) as boolean;

              return {
                recordId: metadata.recordId,
                producer: producer as `0x${string}`,
                resourceType: metadata.resourceType as ResourceType,
                cid: metadata.cid,
                contentHash: metadata.contentHash as `0x${string}`,
                dataSize: Number(metadata.dataSize),
                sharedCount: Number(metadata.sharedCount),
                updatedAt: Number(metadata.updatedAt),
                isVerified,
              };
            } catch (error) {
              console.error(`Error fetching record info for ${recordId}:`, error);
              // Check if this is a RecordNotFound error (common during initialization)
              const errorData = error as { data?: string };
              if (errorData?.data?.includes('0x4282e7ae')) {
                console.log(`Record ${recordId} not found - may still be initializing`);
              }
              return null;
            }
          })
        );

        const [did, consent, entries, isActive, lastUpdated, nonce] = metadata;

        return {
          recordIds,
          healthRecords: healthRecords.filter((r): r is NonNullable<typeof r> => r !== null),
          metadata: {
            did,
            consent: consent as ConsentStatus,
            entries: Number(entries),
            isActive,
            lastUpdated: Number(lastUpdated),
            nonce: Number(nonce),
          },
          total: recordIds.length,
        };
      } catch (error) {
        console.error('Error getting producer records:', error);
        const parsedError = parseDataRegistryError(error);
        if (parsedError) {
          throw new Error(parsedError.message);
        }
        throw new Error('Failed to get producer records');
      }
    },
    {
      enabled: !!producer && !!address && !!walletClient && !!publicClient,
    }
  );
}

/**
 * Hook to fetch all producer records with their associated IPFS data
 * Using a bulk IPFS data fetch approach for better performance
 *
 * @param producer - The producer address
 * @param options - Additional query options
 * @returns Query object with the producer records and their IPFS data
 */
export function useProducerRecordsWithIPFSData(
  producer: string | undefined,
  options: { enabled?: boolean; fetchIPFS?: boolean } = {}
) {
  const { fetchIPFS = true, ...restOptions } = options;

  // Get blockchain records with optimized caching
  const producerRecordsQuery = useProducerBlockchainRecords(producer);

  // Get records for memoization - stable reference
  const records = useMemo(() => {
    return producerRecordsQuery.data?.healthRecords || [];
  }, [producerRecordsQuery.data?.healthRecords]);

  // Create a stable key for the CIDs query - use a hash of the CIDs if possible
  const cidsString = useMemo(() => {
    if (!fetchIPFS) return '';
    return records.map((record) => record.cid).join(',');
  }, [records, fetchIPFS]);

  // Use a single query to fetch all IPFS data in bulk with a stable query key
  const bulkIPFSDataQuery = useInfrequentQuery(
    ['ipfs', 'bulk-data', cidsString],
    async () => {
      if (!cidsString) return {};
      try {
        const cids = cidsString.split(',').filter(Boolean);
        if (cids.length === 0) return {};

        const result = await getBulkIPFSData(cids);

        // Convert the array of results to a map for easier lookup
        const ipfsDataMap: Record<string, { data: any; metadata: any }> = {};
        if (result.success && result.results && Array.isArray(result.results)) {
          result.results.forEach((item) => {
            if (item.success && item.cid) {
              ipfsDataMap[item.cid] = {
                data: item.data,
                metadata: item.metadata || {},
              };
            }
          });
        }

        return ipfsDataMap;
      } catch (error) {
        console.error('Error fetching bulk IPFS data:', error);
        throw error;
      }
    },
    {
      enabled: fetchIPFS && cidsString.length > 0 && !producerRecordsQuery.isLoading && !producerRecordsQuery.isError,
      retry: 1, // Limit retries to avoid too many API calls
    }
  );

  // Check if any queries are loading or have errors
  const isLoading = producerRecordsQuery.isLoading || (fetchIPFS && bulkIPFSDataQuery.isLoading);
  const isError = producerRecordsQuery.isError || (fetchIPFS && bulkIPFSDataQuery.isError);
  const error = producerRecordsQuery.error || bulkIPFSDataQuery.error;

  // Combine the data - memoize the combined result to prevent unnecessary recalculations
  const recordsWithIPFSData = useMemo(() => {
    if (!records.length) return [];

    return records.map((record) => {
      // If we have IPFS data, add it to the record
      if (fetchIPFS && bulkIPFSDataQuery.data && record.cid && bulkIPFSDataQuery.data[record.cid]) {
        const ipfsData = bulkIPFSDataQuery.data[record.cid];
        return {
          ...record,
          ipfsData: ipfsData.data,
          ipfsMetadata: ipfsData.metadata,
        };
      }

      // Otherwise just return the record
      return { ...record };
    });
  }, [records, bulkIPFSDataQuery.data, fetchIPFS]);

  // Return the combined data in a memoized structure to prevent unnecessary re-renders
  const combinedData = useMemo(() => {
    if (!producerRecordsQuery.data) return undefined;

    return {
      ...producerRecordsQuery.data,
      healthRecords: recordsWithIPFSData,
    };
  }, [producerRecordsQuery.data, recordsWithIPFSData]);

  return {
    isLoading,
    isError,
    error,
    data: combinedData,
    producerRecordsQuery,
    bulkIPFSDataQuery,
  };
}

/**
 * Hook for getting the producer metadata
 * @param producer - The address of the producer
 * @returns Query object with the producer metadata
 */
export function useProducerMetadata(producer?: string) {
  return useInfrequentQuery<ProducerMetadataResponse>(
    DATA_REGISTRY_KEYS.producerMetadata(producer),
    () => (producer ? getProducerMetadata(producer) : Promise.reject(new Error('Producer address is required'))),
    {
      enabled: !!producer,
    }
  );
}

/**
 * Hook to get access for a given CID with better error handling
 * @param cid - The CID to get access for
 * @param did - The DID of the producer
 * @param address - The address of the consumer
 * @returns Query object with the access information
 */
export function useAccessForData(cid?: string, did?: string, address?: string, recordId?: string) {
  return useInfrequentQuery(
    DATA_REGISTRY_KEYS.accessForData(cid || '', did || '', address || '', recordId || ''),
    async () => {
      if (!cid) throw new Error('CID is required');
      if (!did) throw new Error('DID is required');
      if (!address) throw new Error('Address is required');
      if (!recordId) throw new Error('Record ID is required');

      try {
        const result = await getAccessForData(cid, did, address, recordId);
        console.log('===============result', result);
        return result;
      } catch (error) {
        logger.error('Error getting access for data:', error);
        throw error;
      }
    },
    {
      enabled: !!cid && !!did && !!address,
      retry: 1,
    }
  );
}

/**
 * Hook to decrypt health data using the private key
 * @param encryptedData - The encrypted data to decrypt
 * @param privateKey - The private key to use for decryption
 * @returns Object containing the decrypted data and loading/error states
 */
export function useDecryptHealthData(encryptedData: string | undefined, privateKey: string | undefined) {
  const [state, setState] = useState<{
    isDecrypting: boolean;
    error: Error | null;
    decryptedData: any | null;
  }>({
    isDecrypting: false,
    error: null,
    decryptedData: null,
  });

  useEffect(() => {
    // Reset state when inputs change
    if (!encryptedData || !privateKey) {
      setState({
        isDecrypting: false,
        error: null,
        decryptedData: null,
      });
      return;
    }

    const decryptData = async () => {
      setState((prev) => ({ ...prev, isDecrypting: true, error: null }));

      try {
        // Parse the encrypted data
        let parsedData: AsymmetricEncryptOutput;
        try {
          parsedData =
            typeof encryptedData === 'string'
              ? (JSON.parse(encryptedData) as AsymmetricEncryptOutput)
              : (encryptedData as AsymmetricEncryptOutput);
        } catch (parseError) {
          throw new Error(
            `Failed to parse encrypted data: ${parseError instanceof Error ? parseError.message : 'Invalid format'}`
          );
        }

        // Decrypt the data
        const decrypted = decryptWithPrivateKey(parsedData, privateKey);

        // Parse the decrypted JSON data
        let result;
        try {
          result = JSON.parse(decrypted);
        } catch (jsonError) {
          logger.warn('Decrypted data is not valid JSON, returning as string');
          result = decrypted;
        }

        setState({
          isDecrypting: false,
          error: null,
          decryptedData: result,
        });
      } catch (error) {
        logger.error('Error decrypting health data:', error);
        setState({
          isDecrypting: false,
          error: error instanceof Error ? error : new Error('Unknown decryption error'),
          decryptedData: null,
        });
      }
    };

    decryptData();
  }, [encryptedData, privateKey]);

  return state;
}

/**
 * High-level hook that combines data access and decryption
 * @param cid - The CID of the health record
 * @param did - The DID of the producer
 * @param address - The address of the consumer
 * @param privateKey - The private key for decryption
 * @returns Object containing the decrypted health data and loading/error states
 */
export function useDecryptedHealthData(
  cid?: string,
  did?: string,
  address?: string,
  privateKey?: string,
  recordId?: string
) {
  // First get the encrypted access data
  const {
    data: accessData,
    isLoading: isAccessLoading,
    error: accessError,
  } = useAccessForData(cid, did, address, recordId);

  // Get the actual encrypted data from the response
  const encryptedData = useMemo(() => {
    if (!accessData) return undefined;
    return typeof accessData.data === 'string' ? accessData.data : JSON.stringify(accessData.data);
  }, [accessData]);

  // Then decrypt the data with the private key
  const { decryptedData, isDecrypting, error: decryptionError } = useDecryptHealthData(encryptedData, privateKey);

  return {
    data: decryptedData,
    isLoading: isAccessLoading || isDecrypting,
    error: accessError || decryptionError,
    // Include raw data for debugging
    rawAccessData: accessData,
    encryptedData,
  };
}

/**
 * Hook to manage the authorized revealing of health data with permission tracking
 * @param cid - The CID of the health record to reveal
 * @param did - The DID of the producer
 * @param consumerAddress - The address of the data consumer (current user)
 * @param privateKey - The private key for decryption
 * @param options - Additional options for revealing data
 * @returns Object containing the revealed data with loading/error states and access control
 */
export function useRevealData(
  cid?: string,
  did?: string,
  consumerAddress?: string,
  privateKey?: string,
  recordId?: string,
  options: {
    trackAccess?: boolean;
    redactSensitiveFields?: boolean;
    requiresAuthentication?: boolean;
  } = {}
) {
  // Default options
  const { trackAccess = true, redactSensitiveFields = true, requiresAuthentication = true } = options;

  // State for tracking access permissions and revealed data
  const [revealState, setRevealState] = useState<{
    isRevealed: boolean;
    hasPermission: boolean;
    accessGranted: Date | null;
    sensitiveFieldsHidden: boolean;
    accessLog: Array<{ timestamp: Date; action: string }>;
  }>({
    isRevealed: false,
    hasPermission: false,
    accessGranted: null,
    sensitiveFieldsHidden: redactSensitiveFields,
    accessLog: [],
  });

  // Use our existing hook to get and decrypt the data
  const {
    data: decryptedData,
    isLoading,
    error,
    rawAccessData,
  } = useDecryptedHealthData(cid, did, consumerAddress, privateKey, recordId);

  // Determine if user has permission based on the access response
  const hasPermission = useMemo(() => {
    if (!rawAccessData) return false;

    // Check if access data contains permission information
    if (typeof rawAccessData === 'object' && 'accessGranted' in rawAccessData) {
      return !!rawAccessData.accessGranted;
    }

    // If we have decrypted data, we must have permission
    return !!decryptedData;
  }, [rawAccessData, decryptedData]);

  // Process the decrypted data to redact sensitive fields if needed
  const processedData = useMemo(() => {
    if (!decryptedData) return null;

    // If we're not redacting sensitive fields, return the full data
    if (!redactSensitiveFields || !revealState.sensitiveFieldsHidden) {
      return decryptedData;
    }

    // Otherwise redact sensitive fields (this is a simple example - implement according to your data structure)
    try {
      if (typeof decryptedData === 'object') {
        // Redact common sensitive health fields - customize based on your data model
        const sensitiveFields = ['ssn', 'dob', 'address', 'phoneNumber', 'insuranceId'];
        const redacted = { ...decryptedData };

        sensitiveFields.forEach((field) => {
          if (field in redacted) {
            redacted[field] = '*** REDACTED ***';
          }
        });

        return redacted;
      }
      return decryptedData;
    } catch (e) {
      logger.error('Error redacting sensitive fields:', e);
      return decryptedData;
    }
  }, [decryptedData, redactSensitiveFields, revealState.sensitiveFieldsHidden]);

  // Log access when data is first revealed
  useEffect(() => {
    // Only track access if enabled and we have permission and data
    if (trackAccess && hasPermission && decryptedData && !revealState.isRevealed) {
      const now = new Date();

      // Update the reveal state
      setRevealState((prev) => ({
        ...prev,
        isRevealed: true,
        hasPermission,
        accessGranted: now,
        accessLog: [...prev.accessLog, { timestamp: now, action: 'initial_reveal' }],
      }));

      // Here you could also implement server-side access logging
      // e.g., call an API to log that this user viewed this record
      logger.info(`Data revealed: CID ${cid}, consumer ${consumerAddress}`);
    }
  }, [trackAccess, hasPermission, decryptedData, revealState.isRevealed, cid, consumerAddress]);

  // Function to toggle showing sensitive fields
  const toggleSensitiveFields = useCallback(() => {
    setRevealState((prev) => {
      const newState = {
        ...prev,
        sensitiveFieldsHidden: !prev.sensitiveFieldsHidden,
        accessLog: [
          ...prev.accessLog,
          {
            timestamp: new Date(),
            action: prev.sensitiveFieldsHidden ? 'reveal_sensitive_fields' : 'hide_sensitive_fields',
          },
        ],
      };

      // Log this action
      logger.info(`Sensitive fields ${newState.sensitiveFieldsHidden ? 'hidden' : 'revealed'} for CID ${cid}`);

      return newState;
    });
  }, [cid]);

  return {
    data: processedData,
    isLoading,
    error,
    isRevealed: revealState.isRevealed,
    hasPermission,
    sensitiveFieldsHidden: revealState.sensitiveFieldsHidden,
    toggleSensitiveFields,
    accessLog: revealState.accessLog,
    accessGranted: revealState.accessGranted,
    rawAccessData,
  };
}
