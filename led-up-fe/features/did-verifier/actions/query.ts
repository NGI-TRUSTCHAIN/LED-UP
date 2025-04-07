'use server';

/**
 * @file DID Verifier Query Actions
 * @description This file contains all read-only functions from the DID Verifier ABI.
 */

import { createPublicClient, http } from 'viem';
import { hardhat, mainnet } from 'viem/chains';
import { DidVerifierABI } from '@/abi/did-verifier.abi';

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
 * Create a public client for reading from the blockchain
 */
const getPublicClient = (config: ContractConfig = defaultConfig) => {
  return createPublicClient({
    chain: hardhat,
    transport: http(config.rpcUrl),
  });
};

/**
 * Check if an issuer is trusted for a specific credential type
 * @param credentialType - The type of credential
 * @param issuer - The issuer address
 * @returns True if the issuer is trusted, false otherwise
 */
export async function isIssuerTrusted(credentialType: string, issuer: `0x${string}`): Promise<boolean> {
  try {
    const publicClient = getPublicClient();

    const isTrusted = await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidVerifierABI,
      functionName: 'isIssuerTrusted',
      args: [credentialType, issuer],
    });

    return isTrusted as boolean;
  } catch (error) {
    console.error('Error checking if issuer is trusted:', error);
    throw error;
  }
}

/**
 * Verify a credential
 * @param credentialType - The type of credential
 * @param issuer - The issuer address
 * @param subject - The subject of the credential
 * @returns True if the credential is valid, false otherwise
 */
export async function verifyCredential(
  credentialType: string,
  issuer: `0x${string}`,
  subject: string
): Promise<boolean> {
  try {
    const publicClient = getPublicClient();

    const isValid = await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidVerifierABI,
      functionName: 'verifyCredential',
      args: [credentialType, issuer, subject],
    });

    return isValid as boolean;
  } catch (error) {
    console.error('Error verifying credential:', error);
    throw error;
  }
}
