'use server';

/**
 * @file Consent Management Mutation Actions
 * @description This file contains all state-changing functions from the Consent Management ABI.
 */

import { createWalletClient, createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { ConsentManagementABI } from '@/abi/consent-management.abi';
import { revalidatePath } from 'next/cache';

/**
 * Configuration for the Consent Management contract
 */
type ContractConfig = {
  contractAddress: `0x${string}`;
  chainId: number;
  rpcUrl: string;
};

// Default configuration - should be overridden in production
const defaultConfig: ContractConfig = {
  contractAddress: (process.env.CONSENT_MANAGEMENT_CONTRACT_ADDRESS || '0x0') as `0x${string}`,
  chainId: Number(process.env.CHAIN_ID || 1),
  rpcUrl: process.env.RPC_URL || 'http://127.0.0.1:8545',
};

/**
 * Type for transaction response with additional metadata
 */
type TransactionResponse = {
  success: boolean;
  hash?: `0x${string}`;
  error?: string;
  data?: string;
  to?: string;
  from?: string;
  method?: string;
  args?: any[];
};

/**
 * Create a wallet client for sending transactions
 */
const getWalletClient = async (privateKey: string, config: ContractConfig = defaultConfig) => {
  const account = privateKeyToAccount(privateKey as `0x${string}`);

  return createWalletClient({
    account,
    chain: {
      ...mainnet,
      id: config.chainId,
    },
    transport: http(config.rpcUrl),
  });
};

/**
 * Create a public client for reading from the blockchain
 */
const getPublicClient = (config: ContractConfig = defaultConfig) => {
  return createPublicClient({
    chain: {
      ...mainnet,
      id: config.chainId,
    },
    transport: http(config.rpcUrl),
  });
};

/**
 * Process a transaction receipt and return a standardized response
 */
const processTransactionReceipt = async (
  hash: `0x${string}`,
  method: string,
  args: any[] = []
): Promise<TransactionResponse> => {
  try {
    const publicClient = getPublicClient();
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (receipt.status === 'success') {
      return {
        success: true,
        hash,
        method,
        args,
      };
    } else {
      return {
        success: false,
        hash,
        error: 'Transaction failed',
        method,
        args,
      };
    }
  } catch (error) {
    console.error('Error processing transaction receipt:', error);
    return {
      success: false,
      hash,
      error: error instanceof Error ? error.message : 'Unknown error',
      method,
      args,
    };
  }
};

/**
 * Process a transaction response
 * @param txHash - The transaction hash
 * @param path - The path to revalidate
 */
export async function processTransactionResponse(
  txHash: `0x${string}`,
  path?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const publicClient = getPublicClient();
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

    if (receipt.status === 'success') {
      if (path) {
        revalidatePath(path);
      }
      return { success: true };
    } else {
      return { success: false, error: 'Transaction failed' };
    }
  } catch (error) {
    console.error('Error processing transaction response:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Grant consent to a provider
 * @param providerDid - The DID of the provider
 * @param purpose - The purpose of the consent
 * @param expiryTime - The expiry time of the consent (Unix timestamp)
 * @param privateKey - The private key for signing transactions
 */
export async function grantConsent(
  providerDid: string,
  purpose: string,
  expiryTime: bigint,
  privateKey: string
): Promise<TransactionResponse> {
  try {
    const walletClient = await getWalletClient(privateKey);
    const account = walletClient.account;

    if (!account) {
      throw new Error('No account available');
    }

    const hash = await walletClient.writeContract({
      address: defaultConfig.contractAddress,
      abi: ConsentManagementABI,
      functionName: 'grantConsent',
      args: [providerDid, purpose, expiryTime],
    });

    return processTransactionReceipt(hash, 'grantConsent', [providerDid, purpose, expiryTime]);
  } catch (error) {
    console.error('Error granting consent:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      method: 'grantConsent',
      args: [providerDid, purpose, expiryTime],
    };
  }
}

/**
 * Revoke consent from a provider
 * @param providerDid - The DID of the provider
 * @param reason - The reason for revoking consent
 * @param privateKey - The private key for signing transactions
 */
export async function revokeConsent(
  providerDid: string,
  reason: string,
  privateKey: string
): Promise<TransactionResponse> {
  try {
    const walletClient = await getWalletClient(privateKey);
    const account = walletClient.account;

    if (!account) {
      throw new Error('No account available');
    }

    const hash = await walletClient.writeContract({
      address: defaultConfig.contractAddress,
      abi: ConsentManagementABI,
      functionName: 'revokeConsent',
      args: [providerDid, reason],
    });

    return processTransactionReceipt(hash, 'revokeConsent', [providerDid, reason]);
  } catch (error) {
    console.error('Error revoking consent:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      method: 'revokeConsent',
      args: [providerDid, reason],
    };
  }
}

/**
 * Set the authority address for the contract
 * @param newAuthority - The new authority address
 * @param privateKey - The private key for signing transactions
 */
export async function setAuthority(newAuthority: `0x${string}`, privateKey: string): Promise<TransactionResponse> {
  try {
    const walletClient = await getWalletClient(privateKey);
    const account = walletClient.account;

    if (!account) {
      throw new Error('No account available');
    }

    const hash = await walletClient.writeContract({
      address: defaultConfig.contractAddress,
      abi: ConsentManagementABI,
      functionName: 'setAuthority',
      args: [newAuthority],
    });

    return processTransactionReceipt(hash, 'setAuthority', [newAuthority]);
  } catch (error) {
    console.error('Error setting authority:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      method: 'setAuthority',
      args: [newAuthority],
    };
  }
}
