'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';
import { useWalletClient, usePublicClient, type Config } from 'wagmi';
import { type WalletClient, type PublicClient, type Account } from 'viem';
import { DataRegistryABI } from '@/abi/data-registry.abi';
import {
  producerExists,
  getProducerDid,
  getProducerMetadata,
  getProducerRecords,
  getRecordInfo,
  checkAccess,
  isConsumerAuthorized,
  getTotalRecords,
  isRecordVerified,
  isAuthorizedProvider,
  getPauseState,
} from '../actions/query';
import {
  prepareRegisterProducer,
  prepareRegisterRecord,
  prepareUpdateRecord,
  prepareShareData,
  prepareShareToProvider,
  prepareTriggerAccess,
  prepareRevokeAccess,
  prepareVerifyRecord,
  prepareUpdateProducerConsent,
  preparePauseContract,
  prepareUnpauseContract,
  prepareUpdateDidAuthAddress,
  prepareUpdateCompensationAddress,
  revalidateAfterTransaction,
} from '../actions/mutation';
import {
  RegisterProducerInput,
  RegisterRecordInput,
  UpdateRecordInput,
  ShareDataInput,
  ShareToProviderInput,
  RevokeAccessInput,
  UpdateProducerConsentInput,
  AddressUpdateInput,
} from '../types/contract';

// Define ContractConfig type
type ContractConfig = {
  contractAddress: `0x${string}`;
  chainId: number;
  rpcUrl: string;
};

// Default configuration
const defaultConfig: ContractConfig = {
  contractAddress: (process.env.NEXT_PUBLIC_DATA_REGISTRY_CONTRACT_ADDRESS || '0x0') as `0x${string}`,
  chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '31337'),
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'http://localhost:8545',
};

/**
 * Type for transaction response
 */
type TransactionResponse = {
  success: boolean;
  hash?: `0x${string}`;
  error?: string;
};

/**
 * Process a transaction with the wallet client
 */
const executeTransaction = async (
  walletClient: WalletClient,
  publicClient: PublicClient,
  transaction: any,
  account: Account,
  path?: string
): Promise<TransactionResponse> => {
  try {
    // Simulate the contract call first
    const { request } = await publicClient.simulateContract({
      address: defaultConfig.contractAddress,
      abi: DataRegistryABI,
      functionName: transaction.functionName,
      args: transaction.args,
      account: account.address,
    });

    // Execute the transaction
    const hash = await walletClient.writeContract(request);

    // If a path is provided, revalidate it after the transaction
    if (path) {
      revalidateAfterTransaction(path);
    }

    return {
      success: true,
      hash,
    };
  } catch (error) {
    console.error('Error executing transaction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown transaction error',
    };
  }
};

/**
 * Query keys for data registry
 */
export const DATA_REGISTRY_KEYS = {
  all: ['dataRegistry'] as const,
  producer: {
    exists: (producer?: string) => [...DATA_REGISTRY_KEYS.all, 'producer', 'exists', producer] as const,
    did: (producer?: string) => [...DATA_REGISTRY_KEYS.all, 'producer', 'did', producer] as const,
    metadata: (producer?: string) => [...DATA_REGISTRY_KEYS.all, 'producer', 'metadata', producer] as const,
    records: (producer?: string) => [...DATA_REGISTRY_KEYS.all, 'producer', 'records', producer] as const,
  },
  record: {
    info: (recordId?: string) => [...DATA_REGISTRY_KEYS.all, 'record', 'info', recordId] as const,
    access: (recordId?: string, consumer?: string) =>
      [...DATA_REGISTRY_KEYS.all, 'record', 'access', recordId, consumer] as const,
    authorized: (recordId?: string, consumer?: string) =>
      [...DATA_REGISTRY_KEYS.all, 'record', 'authorized', recordId, consumer] as const,
    verified: (recordId?: string) => [...DATA_REGISTRY_KEYS.all, 'record', 'verified', recordId] as const,
    providerAuthorized: (provider?: string, recordId?: string) =>
      [...DATA_REGISTRY_KEYS.all, 'record', 'providerAuthorized', provider, recordId] as const,
  },
  totalRecords: () => [...DATA_REGISTRY_KEYS.all, 'totalRecords'] as const,
  paused: () => [...DATA_REGISTRY_KEYS.all, 'paused'] as const,
  recordInfo: (recordId?: string) => [...DATA_REGISTRY_KEYS.all, 'record', 'info', recordId] as const,
  producerRecords: (producer?: string) => [...DATA_REGISTRY_KEYS.all, 'producer', 'records', producer] as const,
  producerMetadata: (producer?: string) => [...DATA_REGISTRY_KEYS.all, 'producer', 'metadata', producer] as const,
  accessForData: (cid: string, did: string, address: string, recordId: string) =>
    [...DATA_REGISTRY_KEYS.all, 'access', 'data', cid, did, address, recordId] as const,
} as const;

/**
 * Hook to check if a producer exists
 * @param producer - Producer address
 * @param config - Optional contract configuration
 */
export function useProducerExists(producer?: string, config: Partial<ContractConfig> = {}): UseQueryResult<boolean> {
  const publicClient = usePublicClient() as PublicClient;

  return useQuery({
    queryKey: DATA_REGISTRY_KEYS.producer.exists(producer),
    queryFn: async () => {
      if (!producer || !publicClient) return false;

      const result = await publicClient.readContract({
        address: defaultConfig.contractAddress,
        abi: DataRegistryABI,
        functionName: 'producerExists',
        args: [producer as `0x${string}`],
      });

      return result as boolean;
    },
    enabled: !!producer && !!publicClient,
  });
}

/**
 * Hook to get a producer's DID
 * @param producer - Producer address
 * @param config - Optional contract configuration
 */
export function useProducerDid(producer?: string, config: Partial<ContractConfig> = {}): UseQueryResult<string> {
  return useQuery({
    queryKey: DATA_REGISTRY_KEYS.producer.did(producer),
    queryFn: () => getProducerDid(producer as `0x${string}`),
    enabled: !!producer,
  });
}

/**
 * Hook to get producer metadata
 * @param producer - Producer address
 * @param config - Optional contract configuration
 */
export function useProducerMetadata(producer?: string, config: Partial<ContractConfig> = {}) {
  return useQuery({
    queryKey: DATA_REGISTRY_KEYS.producer.metadata(producer),
    queryFn: () => getProducerMetadata(producer as `0x${string}`),
    enabled: !!producer,
  });
}

/**
 * Hook to get records for a producer
 * @param producer - Producer address
 * @param config - Optional contract configuration
 */
export function useProducerRecords(producer?: `0x${string}`, config: Partial<ContractConfig> = {}) {
  return useQuery({
    queryKey: DATA_REGISTRY_KEYS.producer.records(producer),
    queryFn: () => {
      if (!producer) {
        return Promise.reject(new Error('Producer address is required'));
      }
      return getProducerRecords(producer);
    },
    enabled: !!producer,
  });
}

/**
 * Hook to get record information
 * @param recordId - Record ID
 * @param config - Optional contract configuration
 */
export function useRecordInfo(recordId?: string, config: Partial<ContractConfig> = {}) {
  return useQuery({
    queryKey: DATA_REGISTRY_KEYS.record.info(recordId),
    queryFn: async () => {
      if (!recordId) {
        return Promise.reject(new Error('Record ID is required'));
      }

      return await getRecordInfo(recordId as string);
    },

    enabled: !!recordId,
  });
}

/**
 * Hook to check if a consumer has access to a record
 * @param recordId - Record ID
 * @param consumerAddress - Consumer address
 * @param config - Optional contract configuration
 */
export function useCheckAccess(recordId?: string, consumerAddress?: string, config: Partial<ContractConfig> = {}) {
  return useQuery({
    queryKey: DATA_REGISTRY_KEYS.record.access(recordId, consumerAddress),
    queryFn: () => checkAccess(recordId as string, consumerAddress as `0x${string}`),
    enabled: !!recordId && !!consumerAddress,
  });
}

/**
 * Hook to check if a consumer is authorized for a record
 * @param recordId - Record ID
 * @param consumerAddress - Consumer address
 * @param config - Optional contract configuration
 */
export function useIsConsumerAuthorized(
  recordId?: string,
  consumerAddress?: string,
  config: Partial<ContractConfig> = {}
) {
  return useQuery({
    queryKey: DATA_REGISTRY_KEYS.record.authorized(recordId, consumerAddress),
    queryFn: () => isConsumerAuthorized(recordId as string, consumerAddress as `0x${string}`),
    enabled: !!recordId && !!consumerAddress,
  });
}

/**
 * Hook to get the total number of records
 * @param config - Optional contract configuration
 */
export function useTotalRecords(config: Partial<ContractConfig> = {}) {
  return useQuery({
    queryKey: DATA_REGISTRY_KEYS.totalRecords(),
    queryFn: () => getTotalRecords(),
  });
}

/**
 * Hook to check if a record is verified
 * @param recordId - Record ID
 * @param config - Optional contract configuration
 */
export function useIsRecordVerified(recordId?: string, config: Partial<ContractConfig> = {}) {
  return useQuery({
    queryKey: DATA_REGISTRY_KEYS.record.verified(recordId),
    queryFn: () => isRecordVerified(recordId as string),
    enabled: !!recordId,
  });
}

/**
 * Hook to check if a provider is authorized for a record
 * @param provider - Provider address
 * @param recordId - Record ID
 * @param config - Optional contract configuration
 */
export function useIsAuthorizedProvider(provider?: string, recordId?: string, config: Partial<ContractConfig> = {}) {
  return useQuery({
    queryKey: DATA_REGISTRY_KEYS.record.providerAuthorized(provider, recordId),
    queryFn: () => isAuthorizedProvider(provider as `0x${string}`, recordId as string),
    enabled: !!provider && !!recordId,
  });
}

/**
 * Hook to check if the contract is paused
 * @param config - Optional contract configuration
 */
export function useIsPaused(config: Partial<ContractConfig> = {}) {
  return useQuery({
    queryKey: DATA_REGISTRY_KEYS.paused(),
    queryFn: () => getPauseState(),
  });
}

/**
 * Hook to register a new producer
 * @param config - Optional contract configuration
 */
export function useRegisterProducer(config: Partial<ContractConfig> = {}) {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient() as PublicClient;

  return useMutation({
    mutationFn: async (params: RegisterProducerInput) => {
      if (!walletClient?.account || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      // Prepare transaction on the server
      const preparation = await prepareRegisterProducer(params);

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      // Execute transaction on the client
      return executeTransaction(walletClient, publicClient, preparation.transaction, walletClient.account);
    },
    onSuccess: (data, variables) => {
      if (data.success && walletClient?.account) {
        // Invalidate relevant queries
        queryClient.invalidateQueries({
          queryKey: DATA_REGISTRY_KEYS.producer.exists(walletClient.account.address),
        });
        queryClient.invalidateQueries({
          queryKey: DATA_REGISTRY_KEYS.producer.metadata(walletClient.account.address),
        });
      }
    },
  });
}

/**
 * Hook to register a new record
 * @param config - Optional contract configuration
 */
export function useRegisterRecord(config: Partial<ContractConfig> = {}) {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  return useMutation({
    mutationFn: async (params: RegisterRecordInput) => {
      if (!walletClient?.account || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      // Prepare transaction on the server
      const preparation = await prepareRegisterRecord(params);

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      // Execute transaction on the client
      return executeTransaction(walletClient, publicClient, preparation.transaction, walletClient.account);
    },
    onSuccess: (data, variables) => {
      if (data.success) {
        // Invalidate relevant queries
        queryClient.invalidateQueries({
          queryKey: DATA_REGISTRY_KEYS.producer.records(variables.producer),
        });
        queryClient.invalidateQueries({
          queryKey: DATA_REGISTRY_KEYS.record.info(variables.recordId),
        });
        queryClient.invalidateQueries({
          queryKey: DATA_REGISTRY_KEYS.totalRecords(),
        });
      }
    },
  });
}

/**
 * Hook to update an existing record
 * @param config - Optional contract configuration
 */
export function useUpdateRecord(config: Partial<ContractConfig> = {}) {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  return useMutation({
    mutationFn: async (params: UpdateRecordInput) => {
      if (!walletClient || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      // Prepare transaction on the server
      const preparation = await prepareUpdateRecord(params);

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      // Execute transaction on the client
      return executeTransaction(walletClient, publicClient, preparation.transaction, walletClient.account);
    },
    onSuccess: (data, variables) => {
      if (data.success) {
        // Invalidate relevant queries
        queryClient.invalidateQueries({
          queryKey: DATA_REGISTRY_KEYS.record.info(variables.recordId),
        });
      }
    },
  });
}

/**
 * Hook to share data with a consumer
 * @param config - Optional contract configuration
 */
export function useShareData(config: Partial<ContractConfig> = {}) {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  return useMutation({
    mutationFn: async (params: ShareDataInput) => {
      if (!walletClient || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      // Prepare transaction on the server
      const preparation = await prepareShareData(params);

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      // Execute transaction on the client
      return executeTransaction(walletClient, publicClient, preparation.transaction, walletClient.account);
    },
    onSuccess: (data, variables) => {
      if (data.success) {
        // Invalidate relevant queries
        queryClient.invalidateQueries({
          queryKey: DATA_REGISTRY_KEYS.record.access(variables.recordId, variables.consumerAddress),
        });
        queryClient.invalidateQueries({
          queryKey: DATA_REGISTRY_KEYS.record.authorized(variables.recordId, variables.consumerAddress),
        });
      }
    },
  });
}

/**
 * Hook to share data with a provider
 * @param config - Optional contract configuration
 */
export function useShareToProvider(config: Partial<ContractConfig> = {}) {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  return useMutation({
    mutationFn: async (params: ShareToProviderInput) => {
      if (!walletClient || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      // Prepare transaction on the server
      const preparation = await prepareShareToProvider(params);

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      // Execute transaction on the client
      return executeTransaction(walletClient, publicClient, preparation.transaction, walletClient.account);
    },
    onSuccess: (data, variables) => {
      if (data.success) {
        // Invalidate relevant queries
        queryClient.invalidateQueries({
          queryKey: DATA_REGISTRY_KEYS.record.providerAuthorized(variables.provider, variables.recordId),
        });
      }
    },
  });
}

/**
 * Hook to trigger access to a record
 * @param config - Optional contract configuration
 */
export function useTriggerAccess(config: Partial<ContractConfig> = {}) {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  return useMutation({
    mutationFn: async (recordId: string) => {
      if (!walletClient || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      // Prepare transaction on the server
      const preparation = await prepareTriggerAccess({ recordId });

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      // Execute transaction on the client
      return executeTransaction(walletClient, publicClient, preparation.transaction, walletClient.account);
    },
    onSuccess: (data, variables) => {
      if (data.success) {
        // The consumer's address would be the wallet address
        const walletAddress = walletClient?.account?.address;

        if (walletAddress) {
          // Invalidate relevant queries
          queryClient.invalidateQueries({
            queryKey: DATA_REGISTRY_KEYS.record.access(variables, walletAddress),
          });
        }
      }
    },
  });
}

/**
 * Hook to revoke access for a consumer
 * @param config - Optional contract configuration
 */
export function useRevokeAccess(config: Partial<ContractConfig> = {}) {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  return useMutation({
    mutationFn: async (params: RevokeAccessInput) => {
      if (!walletClient || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      // Prepare transaction on the server
      const preparation = await prepareRevokeAccess(params);

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      // Execute transaction on the client
      return executeTransaction(walletClient, publicClient, preparation.transaction, walletClient.account);
    },
    onSuccess: (data, variables) => {
      if (data.success) {
        // Invalidate relevant queries
        queryClient.invalidateQueries({
          queryKey: DATA_REGISTRY_KEYS.record.access(variables.recordId, variables.consumerAddress),
        });
        queryClient.invalidateQueries({
          queryKey: DATA_REGISTRY_KEYS.record.authorized(variables.recordId, variables.consumerAddress),
        });
      }
    },
  });
}

/**
 * Hook to verify a record
 * @param config - Optional contract configuration
 */
export function useVerifyRecord(config: Partial<ContractConfig> = {}) {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  return useMutation({
    mutationFn: async (recordId: string) => {
      if (!walletClient || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      // Prepare transaction on the server
      const preparation = await prepareVerifyRecord({ recordId });

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      // Execute transaction on the client
      return executeTransaction(walletClient, publicClient, preparation.transaction, walletClient.account);
    },
    onSuccess: (data, variables) => {
      if (data.success) {
        // Invalidate relevant queries
        queryClient.invalidateQueries({
          queryKey: DATA_REGISTRY_KEYS.record.verified(variables),
        });
        queryClient.invalidateQueries({
          queryKey: DATA_REGISTRY_KEYS.record.info(variables),
        });
      }
    },
  });
}

/**
 * Hook to update producer consent
 * @param config - Optional contract configuration
 */
export function useUpdateProducerConsent(config: Partial<ContractConfig> = {}) {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  return useMutation({
    mutationFn: async (params: UpdateProducerConsentInput) => {
      if (!walletClient || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      // Prepare transaction on the server
      const preparation = await prepareUpdateProducerConsent(params);

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      // Execute transaction on the client
      return executeTransaction(walletClient, publicClient, preparation.transaction, walletClient.account);
    },
    onSuccess: (data, variables) => {
      if (data.success) {
        // Invalidate relevant queries
        queryClient.invalidateQueries({
          queryKey: DATA_REGISTRY_KEYS.producer.metadata(variables.producer),
        });
      }
    },
  });
}

/**
 * Hook to pause the contract
 * @param config - Optional contract configuration
 */
export function usePauseContract(config: Partial<ContractConfig> = {}) {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  return useMutation({
    mutationFn: async () => {
      if (!walletClient || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      // Prepare transaction on the server
      const preparation = await preparePauseContract();

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      // Execute transaction on the client
      return executeTransaction(walletClient, publicClient, preparation.transaction, walletClient.account);
    },
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate relevant queries
        queryClient.invalidateQueries({
          queryKey: DATA_REGISTRY_KEYS.paused(),
        });
      }
    },
  });
}

/**
 * Hook to unpause the contract
 * @param config - Optional contract configuration
 */
export function useUnpauseContract(config: Partial<ContractConfig> = {}) {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  return useMutation({
    mutationFn: async () => {
      if (!walletClient || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      // Prepare transaction on the server
      const preparation = await prepareUnpauseContract();

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      // Execute transaction on the client
      return executeTransaction(walletClient, publicClient, preparation.transaction, walletClient.account);
    },
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate relevant queries
        queryClient.invalidateQueries({
          queryKey: DATA_REGISTRY_KEYS.paused(),
        });
      }
    },
  });
}

/**
 * Hook to update DidAuth contract address
 * @param config - Optional contract configuration
 */
export function useUpdateDidAuthAddress(config: Partial<ContractConfig> = {}) {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  return useMutation({
    mutationFn: async (params: AddressUpdateInput) => {
      if (!walletClient || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      // Prepare transaction on the server
      const preparation = await prepareUpdateDidAuthAddress(params.newAddress);

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      // Execute transaction on the client
      return executeTransaction(walletClient, publicClient, preparation.transaction, walletClient.account);
    },
    onSuccess: (data) => {
      if (data.success) {
        // You may want to invalidate any queries that depend on the DidAuth address
        // This is a system-level change, so a page reload might be appropriate
      }
    },
  });
}

/**
 * Hook to update Compensation contract address
 * @param config - Optional contract configuration
 */
export function useUpdateCompensationAddress(config: Partial<ContractConfig> = {}) {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  return useMutation({
    mutationFn: async (params: AddressUpdateInput) => {
      if (!walletClient || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      // Prepare transaction on the server
      const preparation = await prepareUpdateCompensationAddress(params.newAddress);

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      // Execute transaction on the client
      return executeTransaction(walletClient, publicClient, preparation.transaction, walletClient.account);
    },
    onSuccess: (data) => {
      if (data.success) {
        // You may want to invalidate any queries that depend on the Compensation address
        // This is a system-level change, so a page reload might be appropriate
      }
    },
  });
}
