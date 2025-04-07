'use server';

import { createPublicClient, http } from 'viem';
import { hardhat, mainnet } from 'viem/chains';
import { DidAuthABI } from '@/abi/did-auth.abi';
import { revalidatePath } from 'next/cache';

/**
 * Configuration for the DID Auth contract
 */
type ContractConfig = {
  contractAddress: `0x${string}`;
  chainId: number;
  rpcUrl: string;
};

// Default configuration - should be overridden in production
const defaultConfig: ContractConfig = {
  contractAddress: (process.env.DID_AUTH_CONTRACT_ADDRESS || '0x0') as `0x${string}`,
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
  // For client-side transaction preparation
  contractAddress?: `0x${string}`;
  abi?: typeof DidAuthABI;
  functionName?: string;
  args?: any[];
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
 * Process a transaction receipt
 * @param hash - The transaction hash
 * @param path - The path to revalidate
 * @returns The transaction response
 */
export async function processTransactionReceipt(
  hash: `0x${string}`,
  path?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get public client to check transaction status
    const publicClient = getPublicClient();

    // Wait for the transaction to be mined
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    // Check if receipt is valid
    if (!receipt) {
      throw new Error('Transaction receipt is null');
    }

    // Revalidate the path if provided
    if (path) {
      revalidatePath(path);
    }

    return {
      success: receipt.status === 'success',
      error: receipt.status !== 'success' ? 'Transaction failed' : undefined,
    };
  } catch (error: any) {
    console.error('Error processing transaction:', error);
    return {
      success: false,
      error: error.message || 'Failed to process transaction',
    };
  }
}

/**
 * Grant a role to a DID
 * @param did - The DID to grant the role to
 * @param role - The role to grant
 * @returns The transaction response
 */
export async function grantDidRole(did: string, role: string): Promise<TransactionResponse> {
  try {
    return {
      success: true,
      contractAddress: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'grantDidRole',
      args: [did, role],
    };
  } catch (error: any) {
    console.error('Error granting DID role:', error);
    return {
      success: false,
      error: error.message || 'Failed to grant DID role',
    };
  }
}

/**
 * Revoke a role from a DID
 * @param did - The DID to revoke the role from
 * @param role - The role to revoke
 * @returns The transaction response
 */
export async function revokeDidRole(did: string, role: string): Promise<TransactionResponse> {
  try {
    return {
      success: true,
      contractAddress: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'revokeDidRole',
      args: [did, role],
    };
  } catch (error: any) {
    console.error('Error revoking DID role:', error);
    return {
      success: false,
      error: error.message || 'Failed to revoke DID role',
    };
  }
}

/**
 * Set a trusted issuer for a credential type
 * @param credentialType - The credential type
 * @param issuer - The issuer address
 * @param trusted - Whether the issuer should be trusted
 * @returns The transaction response
 */
export async function setTrustedIssuer(
  credentialType: string,
  issuer: `0x${string}`,
  trusted: boolean
): Promise<TransactionResponse> {
  try {
    return {
      success: true,
      contractAddress: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'setTrustedIssuer',
      args: [credentialType, issuer, trusted],
    };
  } catch (error: any) {
    console.error('Error setting trusted issuer:', error);
    return {
      success: false,
      error: error.message || 'Failed to set trusted issuer',
    };
  }
}

/**
 * Set the credential requirement for a role
 * @param role - The role to set the requirement for
 * @param requirement - The credential type required
 * @returns The transaction response
 */
export async function setRoleRequirement(role: string, requirement: string): Promise<TransactionResponse> {
  try {
    return {
      success: true,
      contractAddress: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'setRoleRequirement',
      args: [role, requirement],
    };
  } catch (error: any) {
    console.error('Error setting role requirement:', error);
    return {
      success: false,
      error: error.message || 'Failed to set role requirement',
    };
  }
}

/**
 * Issue a credential to a DID
 * @param credentialType - The type of credential to issue
 * @param did - The DID to issue the credential to
 * @param credentialId - The unique identifier for the credential
 * @returns The transaction response
 */
export async function issueCredential(
  credentialType: string,
  did: string,
  credentialId: string
): Promise<TransactionResponse> {
  try {
    return {
      success: true,
      contractAddress: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'issueCredential',
      args: [credentialType, did, credentialId],
    };
  } catch (error: any) {
    console.error('Error issuing credential:', error);
    return {
      success: false,
      error: error.message || 'Failed to issue credential',
    };
  }
}

// Note: The DID Auth contract doesn't have any state-changing functions in the ABI.
// All functions are view functions, so there are no mutation functions to implement.
// This file is included for consistency with the data-registry implementation pattern.
