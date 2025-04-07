'use server';

/**
 * @file Consent Management Query Actions
 * @description This file contains all read-only functions from the Consent Management ABI.
 */

import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { ConsentManagementABI } from '@/abi/consent-management.abi';

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
 * Check if a producer has given valid consent to a provider
 * @param producerDid - The DID of the producer
 * @param providerDid - The DID of the provider
 * @returns True if valid consent exists, false otherwise
 */
export async function hasValidConsent(producerDid: string, providerDid: string): Promise<boolean> {
  try {
    const publicClient = getPublicClient();

    const hasConsent = await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: ConsentManagementABI,
      functionName: 'hasValidConsent',
      args: [producerDid, providerDid],
    });

    return hasConsent as boolean;
  } catch (error) {
    console.error('Error checking consent validity:', error);
    throw error;
  }
}

/**
 * Query consent details between a producer and provider
 * @param producerDid - The DID of the producer
 * @param providerDid - The DID of the provider
 * @returns Consent details including status, timestamp, and purpose
 */
export async function queryConsent(
  producerDid: string,
  providerDid: string
): Promise<{ status: number; timestamp: bigint; purpose: string }> {
  try {
    const publicClient = getPublicClient();

    const consentDetails = await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: ConsentManagementABI,
      functionName: 'queryConsent',
      args: [producerDid, providerDid],
    });

    // The contract returns a tuple with [status, timestamp, purpose]
    const [status, timestamp, purpose] = consentDetails as [number, bigint, string];

    return {
      status,
      timestamp,
      purpose,
    };
  } catch (error) {
    console.error('Error querying consent details:', error);
    throw error;
  }
}

/**
 * Get the authority address for the contract
 * @returns The authority address
 */
export async function getAuthority(): Promise<`0x${string}`> {
  try {
    const publicClient = getPublicClient();

    const authority = await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: ConsentManagementABI,
      functionName: 'authority',
      args: [],
    });

    return authority as `0x${string}`;
  } catch (error) {
    console.error('Error getting authority address:', error);
    throw error;
  }
}
