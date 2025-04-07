'use server';

import { createPublicClient, http } from 'viem';
import { hardhat } from 'viem/chains';
import { DidAuthABI } from '@/abi/did-auth.abi';

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
 * Authenticate a DID for a specific role
 * @param did - The DID to authenticate
 * @param role - The role to authenticate for
 * @returns Whether the DID is authenticated for the role
 */
export async function authenticate(did: string, role: string): Promise<boolean> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'authenticate',
      args: [did, role],
    })) as boolean;
  } catch (error) {
    console.error('Error authenticating DID:', error);
    throw new Error('Failed to authenticate DID');
  }
}

/**
 * Get the DID for an address
 * @param address - The address to get the DID for
 * @returns The DID associated with the address
 */
export async function getDid(address: string): Promise<string> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'getDid',
      args: [address],
    })) as string;
  } catch (error) {
    console.error('Error getting DID for address:', error);
    throw new Error('Failed to get DID for address');
  }
}

/**
 * Get the required credential for a role
 * @param role - The role to get the required credential for
 * @returns The required credential for the role
 */
export async function getRequiredCredentialForRole(role: string): Promise<string> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'getRequiredCredentialForRole',
      args: [role],
    })) as string;
  } catch (error) {
    console.error('Error getting required credential for role:', error);
    throw new Error('Failed to get required credential for role');
  }
}

/**
 * Check if a DID has the required roles and credentials
 * @param did - The DID to check
 * @param roles - The roles to check
 * @param credentialIds - The credential IDs to check
 * @returns Whether the DID has the required roles and credentials
 */
export async function hasRequiredRolesAndCredentials(
  did: string,
  roles: string[],
  credentialIds: string[]
): Promise<boolean> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'hasRequiredRolesAndCredentials',
      args: [did, roles, credentialIds],
    })) as boolean;
  } catch (error) {
    console.error('Error checking required roles and credentials:', error);
    throw new Error('Failed to check required roles and credentials');
  }
}

/**
 * Verify a credential for an action
 * @param did - The DID to verify
 * @param credentialType - The credential type to verify
 * @param credentialId - The credential ID to verify
 * @returns Whether the credential is verified for the action
 */
export async function verifyCredentialForAction(
  did: string,
  credentialType: string,
  credentialId: string
): Promise<boolean> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'verifyCredentialForAction',
      args: [did, credentialType, credentialId],
    })) as boolean;
  } catch (error) {
    console.error('Error verifying credential for action:', error);
    throw new Error('Failed to verify credential for action');
  }
}

/**
 * Get the consumer credential type
 * @returns The consumer credential type
 */
export async function getConsumerCredential(): Promise<string> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'CONSUMER_CREDENTIAL',
      args: [],
    })) as string;
  } catch (error) {
    console.error('Error getting consumer credential:', error);
    throw new Error('Failed to get consumer credential');
  }
}

/**
 * Get the consumer role
 * @returns The consumer role
 */
export async function getConsumerRole(): Promise<string> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'CONSUMER_ROLE',
      args: [],
    })) as string;
  } catch (error) {
    console.error('Error getting consumer role:', error);
    throw new Error('Failed to get consumer role');
  }
}

/**
 * Get the producer credential type
 * @returns The producer credential type
 */
export async function getProducerCredential(): Promise<string> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'PRODUCER_CREDENTIAL',
      args: [],
    })) as string;
  } catch (error) {
    console.error('Error getting producer credential:', error);
    throw new Error('Failed to get producer credential');
  }
}

/**
 * Get the producer role
 * @returns The producer role
 */
export async function getProducerRole(): Promise<string> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'PRODUCER_ROLE',
      args: [],
    })) as string;
  } catch (error) {
    console.error('Error getting producer role:', error);
    throw new Error('Failed to get producer role');
  }
}

/**
 * Get the service provider credential type
 * @returns The service provider credential type
 */
export async function getServiceProviderCredential(): Promise<string> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'SERVICE_PROVIDER_CREDENTIAL',
      args: [],
    })) as string;
  } catch (error) {
    console.error('Error getting service provider credential:', error);
    throw new Error('Failed to get service provider credential');
  }
}

/**
 * Get the service provider role
 * @returns The service provider role
 */
export async function getServiceProviderRole(): Promise<string> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'SERVICE_PROVIDER_ROLE',
      args: [],
    })) as string;
  } catch (error) {
    console.error('Error getting service provider role:', error);
    throw new Error('Failed to get service provider role');
  }
}

/**
 * Get the access control contract address
 * @returns The access control contract address
 */
export async function getAccessControlAddress(): Promise<string> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'accessControl',
      args: [],
    })) as string;
  } catch (error) {
    console.error('Error getting access control address:', error);
    throw new Error('Failed to get access control address');
  }
}

/**
 * Get the DID issuer contract address
 * @returns The DID issuer contract address
 */
export async function getDidIssuerAddress(): Promise<string> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'didIssuer',
      args: [],
    })) as string;
  } catch (error) {
    console.error('Error getting DID issuer address:', error);
    throw new Error('Failed to get DID issuer address');
  }
}

/**
 * Get the DID registry contract address
 * @returns The DID registry contract address
 */
export async function getDidRegistryAddress(): Promise<string> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'didRegistry',
      args: [],
    })) as string;
  } catch (error) {
    console.error('Error getting DID registry address:', error);
    throw new Error('Failed to get DID registry address');
  }
}

/**
 * Get the DID verifier contract address
 * @returns The DID verifier contract address
 */
export async function getDidVerifierAddress(): Promise<string> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'didVerifier',
      args: [],
    })) as string;
  } catch (error) {
    console.error('Error getting DID verifier address:', error);
    throw new Error('Failed to get DID verifier address');
  }
}

/**
 * Get the caller's DID
 * @returns The DID of the caller
 */
export async function getCallerDid(): Promise<string> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'getCallerDid',
      args: [],
    })) as string;
  } catch (error) {
    console.error('Error getting caller DID:', error);
    throw new Error('Failed to get caller DID');
  }
}

/**
 * Resolve a DID to its controller address
 * @param did - The DID to resolve
 * @returns The controller address of the DID
 */
export async function resolveDid(did: string): Promise<`0x${string}`> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'resolveDid',
      args: [did],
    })) as `0x${string}`;
  } catch (error) {
    console.error('Error resolving DID:', error);
    throw new Error('Failed to resolve DID');
  }
}

/**
 * Check if a DID has a specific role
 * @param did - The DID to check
 * @param role - The role to check
 * @returns Whether the DID has the role
 */
export async function hasDidRole(did: string, role: string): Promise<boolean> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'hasDidRole',
      args: [did, role],
    })) as boolean;
  } catch (error) {
    console.error('Error checking DID role:', error);
    throw new Error('Failed to check DID role');
  }
}

/**
 * Check if an account has a specific role
 * @param role - The role to check
 * @param account - The account to check
 * @returns Whether the account has the role
 */
export async function hasRole(role: string, account: `0x${string}`): Promise<boolean> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'hasRole',
      args: [role, account],
    })) as boolean;
  } catch (error) {
    console.error('Error checking role:', error);
    throw new Error('Failed to check role');
  }
}

/**
 * Check if an issuer is trusted for a credential type
 * @param credentialType - The credential type to check
 * @param issuer - The issuer address to check
 * @returns Whether the issuer is trusted for the credential type
 */
export async function isTrustedIssuer(credentialType: string, issuer: `0x${string}`): Promise<boolean> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'isTrustedIssuer',
      args: [credentialType, issuer],
    })) as boolean;
  } catch (error) {
    console.error('Error checking trusted issuer:', error);
    throw new Error('Failed to check trusted issuer');
  }
}

/**
 * Get all roles assigned to a DID
 * @param did - The DID to get roles for
 * @returns Array of roles assigned to the DID
 */
export async function getUserRoles(did: string): Promise<`0x${string}`[]> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'getUserRoles',
      args: [did],
    })) as `0x${string}`[];
  } catch (error) {
    console.error('Error getting user roles for DID:', error);
    throw new Error('Failed to get user roles for DID');
  }
}

/**
 * Get all roles assigned to an address
 * @param address - The address to get roles for
 * @returns Array of roles assigned to the address
 */
export async function getUserRolesByAddress(address: `0x${string}`): Promise<`0x${string}`[]> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'getUserRolesByAddress',
      args: [address],
    })) as `0x${string}`[];
  } catch (error) {
    console.error('Error getting user roles for address:', error);
    throw new Error('Failed to get user roles for address');
  }
}
