'use client';

/**
 * @file Compensation Hooks
 * @description This file contains all React Query hooks for the Compensation contract.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWalletClient, usePublicClient, useAccount } from 'wagmi';
import { type WalletClient, type PublicClient, type Account } from 'viem';
import { CompensationABI } from '@/abi/compensation.abi';
import { CompensationInterfaceABI } from '@/abi/compensation.interface.abi';
import {
  verifyPayment,
  getProducerBalance,
  getServiceFee,
  getMinimumWithdrawAmount,
  getUnitPrice,
  isPaused,
  getOwner,
  getTokenAddress,
  getDidAuthAddress,
  producerExists,
  getServiceFeeBalance,
  getPaymentDetails,
} from '../actions/query';

import { getRecordInfo } from '@/features/data-registry/actions/query';
import {
  prepareProcessPayment,
  prepareWithdrawProducerBalance,
  prepareWithdrawServiceFee,
  prepareRemoveProducer,
  prepareChangeServiceFee,
  prepareChangeUnitPrice,
  prepareSetMinimumWithdrawAmount,
  prepareChangeTokenAddress,
  preparePauseService,
  prepareUnpauseService,
  prepareUpdateDidAuthAddress,
  revalidateAfterTransaction,
} from '../actions/mutation';
import type {
  ProcessPaymentInput,
  WithdrawProducerBalanceInput,
  WithdrawServiceFeeInput,
  RemoveProducerInput,
  ChangeServiceFeeInput,
  ChangeUnitPriceInput,
  SetMinimumWithdrawAmountInput,
  ChangeTokenAddressInput,
} from '../types/contract';

import { useContractEventsWithMocks } from '@/hooks/use-contract-events';
import { useCallback } from 'react';
import { ERC20ABI } from '@/abi';

// Define ContractConfig type
type ContractConfig = {
  contractAddress: `0x${string}`;
  chainId: number;
  rpcUrl: string;
};

// Default configuration
const defaultConfig: ContractConfig = {
  contractAddress: (process.env.NEXT_PUBLIC_COMPENSATION_CONTRACT_ADDRESS || '0x0') as `0x${string}`,
  chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '31337'),
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'http://localhost:8545',
};

/**
 * Type for transaction response
 */
export type TransactionResponse = {
  success: boolean;
  hash?: `0x${string}`;
  error?: string;
};

/**
 * Compensation query keys for caching
 */
export const compensationKeys = {
  all: ['compensation'] as const,
  payment: (recordId: string) => [...compensationKeys.all, 'payment', recordId] as const,
  paymentDetails: (recordId: string) => [...compensationKeys.all, 'paymentDetails', recordId] as const,
  producerBalance: (producer: `0x${string}`) => [...compensationKeys.all, 'balance', producer] as const,
  serviceFee: () => [...compensationKeys.all, 'serviceFee'] as const,
  serviceFeeBalance: () => [...compensationKeys.all, 'serviceFeeBalance'] as const,
  minimumWithdraw: () => [...compensationKeys.all, 'minimumWithdraw'] as const,
  unitPrice: () => [...compensationKeys.all, 'unitPrice'] as const,
  paused: () => [...compensationKeys.all, 'paused'] as const,
  owner: () => [...compensationKeys.all, 'owner'] as const,
  token: () => [...compensationKeys.all, 'token'] as const,
  didAuth: () => [...compensationKeys.all, 'didAuth'] as const,
  producer: (address: `0x${string}`) => [...compensationKeys.all, 'producer', address] as const,
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
): Promise<{ success: boolean; hash?: `0x${string}`; error?: string }> => {
  try {
    // Simulate the contract call first
    const { request } = await publicClient.simulateContract({
      ...transaction,
      account: account.address,
    });

    console.log('request', request);

    // Execute the transaction
    const hash = await walletClient.writeContract({
      ...request,
      account: account.address,
    });

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
 * Hook to verify if a payment has been processed for a record
 * @param recordId - The record ID to check
 * @param config - Optional contract configuration
 */
export function useVerifyPayment(recordId: string, config?: Partial<ContractConfig>) {
  return useQuery({
    queryKey: compensationKeys.payment(recordId),
    queryFn: async () => {
      if (!recordId) {
        throw new Error('Record ID is required');
      }
      return await verifyPayment(recordId);
    },
    enabled: !!recordId,
  });
}

/**
 * Hook to get producer balance information
 * @param producer - The producer address
 * @param config - Optional contract configuration
 */
export function useProducerBalance(producer: `0x${string}`, config?: Partial<ContractConfig>) {
  return useQuery({
    queryKey: compensationKeys.producerBalance(producer),
    queryFn: async () => {
      if (!producer) {
        throw new Error('Producer address is required');
      }
      return await getProducerBalance(producer);
    },
    enabled: !!producer,
  });
}

/**
 * Hook to get the service fee percentage
 * @param config - Optional contract configuration
 */
export function useServiceFee(config?: Partial<ContractConfig>) {
  return useQuery({
    queryKey: compensationKeys.serviceFee(),
    queryFn: async () => await getServiceFee(),
  });
}

/**
 * Hook to get the service fee balance
 * @param config - Optional contract configuration
 */
export function useServiceFeeBalance(config?: Partial<ContractConfig>) {
  return useQuery({
    queryKey: compensationKeys.serviceFeeBalance(),
    queryFn: async () => await getServiceFeeBalance(),
  });
}

/**
 * Hook to get the minimum withdrawal amount
 * @param config - Optional contract configuration
 */
export function useMinimumWithdrawAmount(config?: Partial<ContractConfig>) {
  return useQuery({
    queryKey: compensationKeys.minimumWithdraw(),
    queryFn: async () => await getMinimumWithdrawAmount(),
  });
}

/**
 * Hook to get the unit price
 * @param config - Optional contract configuration
 */
export function useUnitPrice(config?: Partial<ContractConfig>) {
  return useQuery({
    queryKey: compensationKeys.unitPrice(),
    queryFn: async () => await getUnitPrice(),
  });
}

/**
 * Hook to check if the compensation service is paused
 * @param config - Optional contract configuration
 */
export function useIsPaused(config?: Partial<ContractConfig>) {
  return useQuery({
    queryKey: compensationKeys.paused(),
    queryFn: async () => await isPaused(),
  });
}

/**
 * Hook to get the contract owner
 * @param config - Optional contract configuration
 */
export function useOwner(config?: Partial<ContractConfig>) {
  return useQuery({
    queryKey: compensationKeys.owner(),
    queryFn: async () => await getOwner(),
  });
}

/**
 * Hook to get the token contract address
 * @param config - Optional contract configuration
 */
export function useTokenAddress(config?: Partial<ContractConfig>) {
  return useQuery({
    queryKey: compensationKeys.token(),
    queryFn: async () => await getTokenAddress(),
  });
}

/**
 * Hook to get the DID Auth contract address
 * @param config - Optional contract configuration
 */
export function useDidAuthAddress(config?: Partial<ContractConfig>) {
  return useQuery({
    queryKey: compensationKeys.didAuth(),
    queryFn: async () => await getDidAuthAddress(),
  });
}

/**
 * Hook to check if a producer exists
 * @param producer - The producer address
 * @param config - Optional contract configuration
 */
export function useProducerExists(producer: `0x${string}`, config?: Partial<ContractConfig>) {
  return useQuery({
    queryKey: compensationKeys.producer(producer),
    queryFn: async () => {
      if (!producer) {
        throw new Error('Producer address is required');
      }
      return await producerExists(producer);
    },
    enabled: !!producer,
  });
}

/**
 * Hook for processing payments
 */
export const useProcessPayment = () => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const processPayment = useCallback(
    async (params: ProcessPaymentInput) => {
      if (!walletClient || !publicClient || !address) {
        throw new Error('Wallet and public client must be connected');
      }

      console.log('Payment params:', params);

      // Verify the payment hasn't already been processed
      const paymentVerified = await publicClient.readContract({
        address: defaultConfig.contractAddress,
        abi: CompensationABI,
        functionName: 'verifyPayment',
        args: [params.recordId],
      });

      console.log('Payment verification check:', paymentVerified);

      if (paymentVerified) {
        return {
          success: false,
          error: 'This record has already been paid for.',
        };
      }

      // Check if producer DID is valid
      try {
        const producerDid = await publicClient.readContract({
          address: defaultConfig.contractAddress,
          abi: CompensationABI,
          functionName: 'getProducerDid',
          args: [params.producer],
        });
        console.log('Producer DID check:', producerDid);

        if (!producerDid || (typeof producerDid === 'string' && producerDid.length === 0)) {
          return {
            success: false,
            error: 'Producer DID not found or not registered. The producer may not have the correct role.',
          };
        }
      } catch (error) {
        console.error('Error checking producer DID:', error);
      }

      // Get the actual token address from the contract to make sure we're checking the right token
      let tokenAddress;
      try {
        tokenAddress = await publicClient.readContract({
          address: defaultConfig.contractAddress,
          abi: CompensationABI,
          functionName: 'getPaymentTokenAddress',
          args: [],
        });
        console.log('Actual token address from contract:', tokenAddress);
        console.log('Token address from env:', process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS);

        if (
          tokenAddress &&
          process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS &&
          (tokenAddress as string).toLowerCase() !== process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS.toLowerCase()
        ) {
          console.warn('⚠️ WARNING: Token address mismatch between contract and environment variable');
          console.warn('Contract token:', tokenAddress);
          console.warn('Env token:', process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS);
        }

        // Check token allowance directly to verify
        const allowance = await publicClient.readContract({
          address: tokenAddress as `0x${string}`,
          abi: ERC20ABI,
          functionName: 'allowance',
          args: [address, defaultConfig.contractAddress],
        });

        console.log('Actual on-chain allowance:', (allowance as bigint).toString());

        const estimatedPaymentAmount = (params.dataSize * 1_100_000_000_000_000_000n).toString();
        console.log('Estimated payment amount:', estimatedPaymentAmount);

        if ((allowance as bigint) === 0n) {
          return {
            success: false,
            error: 'Token allowance is zero. Please approve tokens before making a payment.',
          };
        }

        // Also check token balance
        const balance = await publicClient.readContract({
          address: tokenAddress as `0x${string}`,
          abi: ERC20ABI,
          functionName: 'balanceOf',
          args: [address],
        });

        console.log('Token balance:', (balance as bigint).toString());

        if ((balance as bigint) < BigInt(estimatedPaymentAmount)) {
          return {
            success: false,
            error: 'Insufficient token balance for payment.',
          };
        }
      } catch (error) {
        console.error('Error checking token address or allowance:', error);
      }

      // Create transaction with combined ABI for better error decoding
      const transaction = {
        address: defaultConfig.contractAddress,
        abi: [...CompensationABI, ...ERC20ABI],
        functionName: 'processPayment',
        args: [params.producer, params.recordId, params.dataSize, params.consumerDid],
      };

      // Log the final transaction details
      console.log('Executing transaction with:', {
        contract: defaultConfig.contractAddress,
        function: 'processPayment',
        producer: params.producer,
        recordId: params.recordId,
        dataSize: params.dataSize.toString(),
        consumerDid: params.consumerDid,
      });

      try {
        const result = await executeTransaction(
          walletClient,
          publicClient,
          transaction,
          { address } as Account,
          '/compensation'
        );

        if (result.success) {
          // Invalidate relevant queries
          queryClient.invalidateQueries({ queryKey: compensationKeys.payment(params.recordId) });
        }

        return result;
      } catch (error) {
        console.error('Payment error:', error);

        // Extract more descriptive error messages based on custom errors
        let errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

        // Log the full error for debugging
        console.error('Full error details:', JSON.stringify(error, null, 2));

        // Create a more detailed and helpful error message based on the signature
        if (typeof errorMessage === 'string') {
          if (errorMessage.includes('ERC20InsufficientAllowance')) {
            errorMessage = 'Insufficient token allowance. Please approve tokens before making a payment.';
          } else if (errorMessage.includes('0xfb8f41b2')) {
            // This error looks like it could be related to duplicate payment or DID authentication
            return {
              success: false,
              error:
                'Payment processing failed. This could be due to one of the following reasons:\n\n' +
                '1. The record has already been paid for\n' +
                "2. The producer DID is not registered or doesn't have the producer role\n" +
                "3. Your consumer DID is not registered or doesn't have the consumer role\n\n" +
                'Please check these items and try again.',
            };
          } else if (errorMessage.includes('Compensation__InvalidDataSize')) {
            errorMessage = 'Invalid data size provided for payment';
          } else if (errorMessage.includes('Compensation__InsufficientBalance')) {
            errorMessage = 'Insufficient token balance for payment';
          } else if (errorMessage.includes('Compensation__InvalidProducer')) {
            errorMessage = 'Invalid producer address or DID authentication failed for producer';
          } else if (errorMessage.includes('Compensation__InvalidConsumer')) {
            errorMessage = 'Consumer DID authentication failed';
          } else if (errorMessage.includes('Compensation__InvalidConsumerDID')) {
            errorMessage = 'Invalid consumer DID format';
          } else if (errorMessage.includes('Compensation__TokenTransferFailed')) {
            errorMessage = 'Token transfer failed. Check token allowance and balance.';
          } else if (errorMessage.includes('execution reverted')) {
            // Generic reverted error
            errorMessage =
              'Transaction reverted. This could be due to a DID authentication issue or the record has already been paid for.';
          }
        }

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [walletClient, publicClient, address, queryClient]
  );

  return { processPayment };
};

/**
 * Hook for withdrawing producer balance
 */
export const useWithdrawProducerBalance = () => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { address } = useAccount();

  const withdrawBalance = useCallback(
    async (params: WithdrawProducerBalanceInput) => {
      if (!walletClient || !publicClient || !address) {
        throw new Error('Wallet and public client must be connected');
      }

      const transaction = {
        address: defaultConfig.contractAddress,
        abi: CompensationABI,
        functionName: 'withdrawProducerBalance',
        args: [params.amount],
      };

      return executeTransaction(walletClient, publicClient, transaction, { address } as Account, '/compensation');
    },
    [walletClient, publicClient, address]
  );

  return { withdrawBalance };
};

/**
 * Hook to withdraw service fee (admin only)
 * @param config - Optional contract configuration
 */
export function useWithdrawServiceFee(config?: Partial<ContractConfig>) {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient() as PublicClient;

  return useMutation({
    mutationFn: async (params: WithdrawServiceFeeInput) => {
      if (!walletClient?.account || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      const preparation = await prepareWithdrawServiceFee(params);

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      return executeTransaction(walletClient, publicClient, preparation.transaction, walletClient.account);
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: compensationKeys.serviceFeeBalance() });
      }
    },
  });
}

/**
 * Hook to remove a producer (admin only)
 * @param config - Optional contract configuration
 */
export function useRemoveProducer(config?: Partial<ContractConfig>) {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient() as PublicClient;

  return useMutation({
    mutationFn: async (params: RemoveProducerInput) => {
      if (!walletClient?.account || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      const preparation = await prepareRemoveProducer(params);

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      return executeTransaction(walletClient, publicClient, preparation.transaction, walletClient.account);
    },
    onSuccess: (data, variables) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: compensationKeys.producer(variables.producer) });
        queryClient.invalidateQueries({ queryKey: compensationKeys.producerBalance(variables.producer) });
      }
    },
  });
}

/**
 * Hook to change the service fee (admin only)
 * @param config - Optional contract configuration
 */
export function useChangeServiceFee(config?: Partial<ContractConfig>) {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient() as PublicClient;

  return useMutation({
    mutationFn: async (params: ChangeServiceFeeInput) => {
      if (!walletClient?.account || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      const preparation = await prepareChangeServiceFee(params);

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      return executeTransaction(walletClient, publicClient, preparation.transaction, walletClient.account);
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: compensationKeys.serviceFee() });
      }
    },
  });
}

/**
 * Hook to change the unit price (admin only)
 * @param config - Optional contract configuration
 */
export function useChangeUnitPrice(config?: Partial<ContractConfig>) {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient() as PublicClient;

  return useMutation({
    mutationFn: async (params: ChangeUnitPriceInput) => {
      if (!walletClient?.account || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      const preparation = await prepareChangeUnitPrice(params);

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      return executeTransaction(walletClient, publicClient, preparation.transaction, walletClient.account);
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: compensationKeys.unitPrice() });
      }
    },
  });
}

/**
 * Hook to set the minimum withdraw amount (admin only)
 * @param config - Optional contract configuration
 */
export function useSetMinimumWithdrawAmount(config?: Partial<ContractConfig>) {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient() as PublicClient;

  return useMutation({
    mutationFn: async (params: SetMinimumWithdrawAmountInput) => {
      if (!walletClient?.account || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      const preparation = await prepareSetMinimumWithdrawAmount(params);

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      return executeTransaction(walletClient, publicClient, preparation.transaction, walletClient.account);
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: compensationKeys.minimumWithdraw() });
      }
    },
  });
}

/**
 * Hook to change the token address (admin only)
 * @param config - Optional contract configuration
 */
export function useChangeTokenAddress(config?: Partial<ContractConfig>) {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient() as PublicClient;

  return useMutation({
    mutationFn: async (params: ChangeTokenAddressInput) => {
      if (!walletClient?.account || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      const preparation = await prepareChangeTokenAddress(params);

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      return executeTransaction(walletClient, publicClient, preparation.transaction, walletClient.account);
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: compensationKeys.token() });
      }
    },
  });
}

/**
 * Hook to pause the service (admin only)
 * @param config - Optional contract configuration
 */
export function usePauseService(config?: Partial<ContractConfig>) {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient() as PublicClient;

  return useMutation({
    mutationFn: async () => {
      if (!walletClient?.account || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      const preparation = await preparePauseService();

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      return executeTransaction(walletClient, publicClient, preparation.transaction, walletClient.account);
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: compensationKeys.paused() });
      }
    },
  });
}

/**
 * Hook to unpause the service (admin only)
 * @param config - Optional contract configuration
 */
export function useUnpauseService(config?: Partial<ContractConfig>) {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient() as PublicClient;

  return useMutation({
    mutationFn: async () => {
      if (!walletClient?.account || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      const preparation = await prepareUnpauseService();

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      return executeTransaction(walletClient, publicClient, preparation.transaction, walletClient.account);
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: compensationKeys.paused() });
      }
    },
  });
}

/**
 * Hook to change the DID Auth contract address (admin only)
 * @param config - Optional contract configuration
 */
export function useUpdateDidAuthAddress(config?: Partial<ContractConfig>) {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient() as PublicClient;

  return useMutation({
    mutationFn: async (newAddress: `0x${string}`) => {
      if (!walletClient?.account || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      const preparation = await prepareUpdateDidAuthAddress(newAddress);

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      return executeTransaction(walletClient, publicClient, preparation.transaction, walletClient.account);
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: compensationKeys.didAuth() });
      }
    },
  });
}

/**
 * Hook to fetch payment history for a producer address
 * @param producerAddress The producer's address to fetch payment history for
 * @param config Optional contract configuration
 * @param paginationOptions Pagination options with pageIndex and pageSize
 * @returns Query result with paginated payment history
 */
export const usePaymentHistory = (
  producerAddress: `0x${string}`,
  config?: Partial<ContractConfig>,
  paginationOptions?: { pageSize?: number; pageIndex?: number }
) => {
  // Use configuration from contract default config instead of passing it through
  const contractAddress = process.env.NEXT_PUBLIC_COMPENSATION_CONTRACT_ADDRESS as `0x${string}`;
  const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 1);
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8545';

  // Define event inputs for PaymentProcessed events
  const paymentProcessedEventInputs = [
    { type: 'string' as const, name: 'recordId' as const, indexed: true as const },
    { type: 'address' as const, name: 'producer' as const, indexed: true as const },
    { type: 'address' as const, name: 'consumer' as const, indexed: true as const },
    { type: 'uint256' as const, name: 'amount' as const, indexed: false as const },
  ];

  // Define filter to match the producer address
  const filterByProducer = (log: any) => {
    return (log.args.producer as `0x${string}`).toLowerCase() === producerAddress.toLowerCase();
  };

  // Use the generic events hook with mock data support
  const result = useContractEventsWithMocks(
    {
      contractAddress,
      chainId,
      rpcUrl,
      enabled: !!producerAddress && !!contractAddress,
    },
    {
      eventName: 'PaymentProcessed',
      eventInputs: paymentProcessedEventInputs,
      filterPredicate: filterByProducer,
    },
    {
      pageSize: paginationOptions?.pageSize || 10,
      pageIndex: paginationOptions?.pageIndex || 0,
    },
    {
      generateMockData: (count) => generateMockPaymentData(count, producerAddress),
      mockCount: 5,
    }
  );

  // Transform the events into the expected format for the UI
  const transformedEvents = result.events.map((event) => {
    const eventArgs = event.args || {};
    return {
      transactionHash: event.transactionHash,
      blockNumber: event.blockNumber,
      from: (eventArgs.consumer as `0x${string}`) || ('0x0000000000000000000000000000000000000000' as `0x${string}`),
      to: (eventArgs.producer as `0x${string}`) || producerAddress,
      amount: (eventArgs.amount as bigint) || BigInt(0),
      recordsCount: 1, // Default to 1 record per payment for now
      success: true, // Default to success since these are confirmed events
      timestamp: event.timestamp || Math.floor(Date.now() / 1000),
    };
  });

  return {
    ...result,
    data: transformedEvents,
  };
};

/**
 * Generate mock payment data for development/testing
 */
function generateMockPaymentData(count: number, producerAddress: `0x${string}`) {
  const currentTime = Math.floor(Date.now() / 1000);

  return Array.from({ length: count }).map((_, index) => {
    // Generate a unique hex string for the transaction hash
    const txHash = `0x${Math.random().toString(16).substring(2).padEnd(64, '0')}` as `0x${string}`;

    // Generate a mock consumer address
    const consumerAddress = `0x${Math.random().toString(16).substring(2).padEnd(40, '0')}` as `0x${string}`;

    // Generate a random amount between 0.1 and 5 tokens
    const amount = BigInt(Math.floor(Math.random() * 4900000000000000000 + 100000000000000000));

    // Generate a decreasing timestamp (newer entries first)
    const timestamp = currentTime - index * (24 * 60 * 60); // Each entry is one day apart

    return {
      transactionHash: txHash,
      blockNumber: 12345678 - index,
      timestamp,
      logIndex: index,
      args: {
        recordId: `record-${index}`,
        producer: producerAddress,
        consumer: consumerAddress,
        amount,
      },
    };
  });
}

/**
 * Hook to get payment details for a specific record
 * @param recordId - The record ID to check
 * @param config - Optional contract configuration
 */
export function usePaymentDetails(recordId: string, config?: Partial<ContractConfig>) {
  return useQuery({
    queryKey: compensationKeys.paymentDetails(recordId),
    queryFn: () => getPaymentDetails(recordId),
    enabled: !!recordId,
  });
}
