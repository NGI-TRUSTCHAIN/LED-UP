'use server';

import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { DidAccessControlABI } from '@/abi/did-access-control.abi';

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
 * Get the ADMIN role
 */
export async function getAdminRole(): Promise<`0x${string}`> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAccessControlABI,
      functionName: 'ADMIN',
      args: [],
    })) as `0x${string}`;
  } catch (error) {
    console.error('Error getting ADMIN role:', error);
    throw new Error('Failed to get ADMIN role');
  }
}

/**
 * Get the DEFAULT_ADMIN_ROLE
 */
export async function getDefaultAdminRole(): Promise<`0x${string}`> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAccessControlABI,
      functionName: 'DEFAULT_ADMIN_ROLE',
      args: [],
    })) as `0x${string}`;
  } catch (error) {
    console.error('Error getting DEFAULT_ADMIN_ROLE:', error);
    throw new Error('Failed to get DEFAULT_ADMIN_ROLE');
  }
}

/**
 * Get the OPERATOR role
 */
export async function getOperatorRole(): Promise<`0x${string}`> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAccessControlABI,
      functionName: 'OPERATOR',
      args: [],
    })) as `0x${string}`;
  } catch (error) {
    console.error('Error getting OPERATOR role:', error);
    throw new Error('Failed to get OPERATOR role');
  }
}

/**
 * Get the DID Registry contract address
 */
export async function getDidRegistryAddress(): Promise<`0x${string}`> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAccessControlABI,
      functionName: 'didRegistry',
      args: [],
    })) as `0x${string}`;
  } catch (error) {
    console.error('Error getting DID Registry address:', error);
    throw new Error('Failed to get DID Registry address');
  }
}

/**
 * Get the admin role for a role
 * @param role - The role to get the admin role for
 */
export async function getRoleAdmin(role: `0x${string}`): Promise<`0x${string}`> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAccessControlABI,
      functionName: 'getRoleAdmin',
      args: [role],
    })) as `0x${string}`;
  } catch (error) {
    console.error('Error getting role admin:', error);
    throw new Error('Failed to get role admin');
  }
}

/**
 * Get the requirement for a role
 * @param role - The role to get the requirement for
 */
export async function getRoleRequirement(role: `0x${string}`): Promise<string> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAccessControlABI,
      functionName: 'getRoleRequirement',
      args: [role],
    })) as string;
  } catch (error) {
    console.error('Error getting role requirement:', error);
    throw new Error('Failed to get role requirement');
  }
}

/**
 * Check if a DID has a role
 * @param did - The DID to check
 * @param role - The role to check
 */
export async function hasDidRole(did: string, role: `0x${string}`): Promise<boolean> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAccessControlABI,
      functionName: 'hasDidRole',
      args: [did, role],
    })) as boolean;
  } catch (error) {
    console.error('Error checking if DID has role:', error);
    throw new Error('Failed to check if DID has role');
  }
}

/**
 * Check if an account has a role
 * @param role - The role to check
 * @param account - The account to check
 */
export async function hasRole(role: `0x${string}`, account: `0x${string}`): Promise<boolean> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAccessControlABI,
      functionName: 'hasRole',
      args: [role, account],
    })) as boolean;
  } catch (error) {
    console.error('Error checking if account has role:', error);
    throw new Error('Failed to check if account has role');
  }
}

/**
 * Check if the contract supports an interface
 * @param interfaceId - The interface ID to check
 */
export async function supportsInterface(interfaceId: `0x${string}`): Promise<boolean> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAccessControlABI,
      functionName: 'supportsInterface',
      args: [interfaceId],
    })) as boolean;
  } catch (error) {
    console.error('Error checking if contract supports interface:', error);
    throw new Error('Failed to check if contract supports interface');
  }
}
