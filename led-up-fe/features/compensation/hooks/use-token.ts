'use client';

import { useCallback } from 'react';
import { useWalletClient, usePublicClient, useAccount } from 'wagmi';
import { type WalletClient, type PublicClient, type Account } from 'viem';
import { ERC20ABI } from '@/abi/erc20.abi';
import { revalidateAfterTransaction } from '@/lib/utils';

// Define ContractConfig type
type ContractConfig = {
  contractAddress: `0x${string}`;
  chainId: number;
  rpcUrl: string;
};

// Default configuration
const defaultConfig: ContractConfig = {
  contractAddress: (process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS || '0x0') as `0x${string}`,
  chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '31337'),
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'http://localhost:8545',
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
 * Hook for token approval
 */
export const useTokenApproval = () => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { address } = useAccount();

  const approve = useCallback(
    async (params: { spender: `0x${string}`; amount: bigint }) => {
      if (!walletClient || !publicClient || !address) {
        throw new Error('Wallet and public client must be connected');
      }

      const transaction = {
        address: defaultConfig.contractAddress,
        abi: ERC20ABI,
        functionName: 'approve',
        args: [params.spender, params.amount],
      };

      return executeTransaction(walletClient, publicClient, transaction, { address } as Account, '/compensation');
    },
    [walletClient, publicClient, address]
  );

  return { approve };
};

/**
 * Hook for checking token balance
 */
export const useTokenBalance = (address: `0x${string}`) => {
  const publicClient = usePublicClient();

  const getBalance = useCallback(async () => {
    if (!publicClient || !address) {
      throw new Error('Public client must be connected and address must be provided');
    }

    const balance = await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: ERC20ABI,
      functionName: 'balanceOf',
      args: [address],
    });

    return balance;
  }, [publicClient, address]);

  return { getBalance };
};

/**
 * Hook for checking token allowance
 */
export const useTokenAllowance = (owner: `0x${string}`, spender: `0x${string}`) => {
  const publicClient = usePublicClient();

  const getAllowance = useCallback(async () => {
    if (!publicClient || !owner || !spender) {
      throw new Error('Public client and addresses must be provided');
    }

    const allowance = await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: ERC20ABI,
      functionName: 'allowance',
      args: [owner, spender],
    });

    return allowance;
  }, [publicClient, owner, spender]);

  return { getAllowance };
};
