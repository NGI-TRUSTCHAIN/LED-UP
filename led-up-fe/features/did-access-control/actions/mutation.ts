'use server';

import { createWalletClient, http, createPublicClient } from 'viem';
import { mainnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { DidAccessControlABI } from '@/abi/did-access-control.abi';
import { revalidatePath } from 'next/cache';

/**
 * Configuration for the DID Access Control contract
 */
type ContractConfig = {
  contractAddress: `0x${string}`;
  chainId: number;
  rpcUrl: string;
};

// Default configuration - should be overridden in production
const defaultConfig: ContractConfig = {
  contractAddress: (process.env.DID_ACCESS_CONTROL_CONTRACT_ADDRESS || '0x0') as `0x${string}`,
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
 * Grant a role to a DID
 * @param did - The DID to grant the role to
 * @param role - The role to grant
 * @param privateKey - The private key for signing transactions
 */
export async function grantDidRole(did: string, role: `0x${string}`, privateKey: string): Promise<TransactionResponse> {
  try {
    const walletClient = await getWalletClient(privateKey);
    const account = walletClient.account;

    if (!account) {
      throw new Error('No account available');
    }

    const hash = await walletClient.writeContract({
      address: defaultConfig.contractAddress,
      abi: DidAccessControlABI,
      functionName: 'grantDidRole',
      args: [did, role],
    });

    return processTransactionReceipt(hash, 'grantDidRole', [did, role]);
  } catch (error) {
    console.error('Error granting DID role:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      method: 'grantDidRole',
      args: [did, role],
    };
  }
}

/**
 * Grant a role to an account
 * @param role - The role to grant
 * @param account - The account to grant the role to
 * @param privateKey - The private key for signing transactions
 */
export async function grantRole(
  role: `0x${string}`,
  account: `0x${string}`,
  privateKey: string
): Promise<TransactionResponse> {
  try {
    const walletClient = await getWalletClient(privateKey);
    const walletAccount = walletClient.account;

    if (!walletAccount) {
      throw new Error('No account available');
    }

    const hash = await walletClient.writeContract({
      address: defaultConfig.contractAddress,
      abi: DidAccessControlABI,
      functionName: 'grantRole',
      args: [role, account],
    });

    return processTransactionReceipt(hash, 'grantRole', [role, account]);
  } catch (error) {
    console.error('Error granting role:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      method: 'grantRole',
      args: [role, account],
    };
  }
}

/**
 * Renounce a role
 * @param role - The role to renounce
 * @param callerConfirmation - The caller confirmation
 * @param privateKey - The private key for signing transactions
 */
export async function renounceRole(
  role: `0x${string}`,
  callerConfirmation: `0x${string}`,
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
      abi: DidAccessControlABI,
      functionName: 'renounceRole',
      args: [role, callerConfirmation],
    });

    return processTransactionReceipt(hash, 'renounceRole', [role, callerConfirmation]);
  } catch (error) {
    console.error('Error renouncing role:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      method: 'renounceRole',
      args: [role, callerConfirmation],
    };
  }
}

/**
 * Revoke a role from a DID
 * @param did - The DID to revoke the role from
 * @param role - The role to revoke
 * @param privateKey - The private key for signing transactions
 */
export async function revokeDidRole(
  did: string,
  role: `0x${string}`,
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
      abi: DidAccessControlABI,
      functionName: 'revokeDidRole',
      args: [did, role],
    });

    return processTransactionReceipt(hash, 'revokeDidRole', [did, role]);
  } catch (error) {
    console.error('Error revoking DID role:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      method: 'revokeDidRole',
      args: [did, role],
    };
  }
}

/**
 * Revoke a role from an account
 * @param role - The role to revoke
 * @param account - The account to revoke the role from
 * @param privateKey - The private key for signing transactions
 */
export async function revokeRole(
  role: `0x${string}`,
  account: `0x${string}`,
  privateKey: string
): Promise<TransactionResponse> {
  try {
    const walletClient = await getWalletClient(privateKey);
    const walletAccount = walletClient.account;

    if (!walletAccount) {
      throw new Error('No account available');
    }

    const hash = await walletClient.writeContract({
      address: defaultConfig.contractAddress,
      abi: DidAccessControlABI,
      functionName: 'revokeRole',
      args: [role, account],
    });

    return processTransactionReceipt(hash, 'revokeRole', [role, account]);
  } catch (error) {
    console.error('Error revoking role:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      method: 'revokeRole',
      args: [role, account],
    };
  }
}

/**
 * Set a requirement for a role
 * @param role - The role to set the requirement for
 * @param requirement - The requirement to set
 * @param privateKey - The private key for signing transactions
 */
export async function setRoleRequirement(
  role: `0x${string}`,
  requirement: string,
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
      abi: DidAccessControlABI,
      functionName: 'setRoleRequirement',
      args: [role, requirement],
    });

    return processTransactionReceipt(hash, 'setRoleRequirement', [role, requirement]);
  } catch (error) {
    console.error('Error setting role requirement:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      method: 'setRoleRequirement',
      args: [role, requirement],
    };
  }
}

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
