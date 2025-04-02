'use server';

/**
 * @file DID Issuer Query Actions
 * @description This file contains all read-only functions from the DID Issuer ABI.
 */

import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { DidIssuerABI } from '../../../abi/did-issuer.abi';

/**
 * Configuration for the DID Issuer contract
 */
type ContractConfig = {
  contractAddress: `0x${string}`;
  chainId: number;
  rpcUrl: string;
};

// Default configuration - should be overridden in production
const defaultConfig: ContractConfig = {
  contractAddress: (process.env.DID_ISSUER_CONTRACT_ADDRESS || '0x0') as `0x${string}`,
  chainId: Number(process.env.CHAIN_ID || 1),
  rpcUrl: process.env.RPC_URL || 'http://127.0.0.1:8545',
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
 * Check if a credential is valid
 * @param credentialId - The credential ID to check
 * @returns True if the credential is valid, false otherwise
 */
export async function isCredentialValid(credentialId: string): Promise<boolean> {
  try {
    const publicClient = getPublicClient();

    const isValid = await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidIssuerABI,
      functionName: 'isCredentialValid',
      args: [credentialId as `0x${string}`],
    });

    return isValid as boolean;
  } catch (error) {
    console.error('Error checking if credential is valid:', error);
    throw error;
  }
}
