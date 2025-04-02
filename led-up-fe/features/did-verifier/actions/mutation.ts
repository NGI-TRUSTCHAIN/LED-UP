'use server';

/**
 * @file DID Verifier Mutation Actions
 * @description This file contains all state-changing functions from the DID Verifier ABI.
 */

import { createWalletClient, createPublicClient, http } from 'viem';
import { hardhat, mainnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { DidVerifierABI } from '@/abi/did-verifier.abi';
import { revalidatePath } from 'next/cache';

/**
 * Configuration for the DID Verifier contract
 */
type ContractConfig = {
  contractAddress: `0x${string}`;
  chainId: number;
  rpcUrl: string;
};

// Default configuration - should be overridden in production
const defaultConfig: ContractConfig = {
  contractAddress: (process.env.DID_VERIFIER_CONTRACT_ADDRESS || '0x0') as `0x${string}`,
  chainId: 31337,
  rpcUrl: process.env.RPC_URL || 'http://localhost:8545',
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
    chain: hardhat,
    transport: http(config.rpcUrl),
  });
};

/**
 * Create a public client for reading from the blockchain
 */
const getPublicClient = (config: ContractConfig = defaultConfig) => {
  return createPublicClient({
    chain: hardhat,
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
 * Set the trust status of an issuer for a specific credential type
 * @param credentialType - The type of credential
 * @param issuer - The issuer address
 * @param trusted - Whether the issuer should be trusted
 * @param privateKey - The private key for signing transactions
 */
export async function setIssuerTrustStatus(
  credentialType: string,
  issuer: `0x${string}`,
  trusted: boolean,
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
      abi: DidVerifierABI,
      functionName: 'setIssuerTrustStatus',
      args: [credentialType, issuer, trusted],
    });

    return processTransactionReceipt(hash, 'setIssuerTrustStatus', [credentialType, issuer, trusted]);
  } catch (error) {
    console.error('Error setting issuer trust status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      method: 'setIssuerTrustStatus',
      args: [credentialType, issuer, trusted],
    };
  }
}
