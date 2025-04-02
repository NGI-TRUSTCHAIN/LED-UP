'use server';

import { createPublicClient, http } from 'viem';
import { hardhat } from 'viem/chains';
import { DidRegistryABI } from '@/abi/did-registry.abi';
import { revalidatePath } from 'next/cache';

/**
 * Configuration for the DID Registry contract
 */
type ContractConfig = {
  contractAddress: `0x${string}`;
  chainId: number;
  rpcUrl: string;
};

// Default configuration - should be overridden in production
const defaultConfig: ContractConfig = {
  contractAddress: (process.env.NEXT_PUBLIC_DID_REGISTRY_CONTRACT_ADDRESS || '0x0') as `0x${string}`,
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
  abi?: typeof DidRegistryABI;
  functionName?: string;
  args?: any[];
};

/**
 * Create a public client for reading from the blockchain
 */
const getPublicClient = () => {
  return createPublicClient({
    chain: hardhat,
    transport: http(defaultConfig.rpcUrl),
  });
};

/**
 * Prepare transaction data for client-side execution
 * @param functionName - The contract function to call
 * @param args - The arguments for the function
 * @returns Transaction data for client-side execution
 */
const prepareTransactionData = (functionName: string, args: any[]) => {
  return {
    contractAddress: defaultConfig.contractAddress,
    abi: DidRegistryABI,
    functionName,
    args,
  };
};

/**
 * Update a DID document - server-side preparation
 * @param did - The DID to update
 * @param newDocument - The new DID document
 * @returns The transaction data for client-side execution
 */
export async function updateDidDocument(did: string, newDocument: string): Promise<TransactionResponse> {
  try {
    // Get public client to check DID status
    const publicClient = getPublicClient();

    // Check if the DID exists and is active before attempting to update
    try {
      // Use resolveDid to check if the DID exists and is active
      const didDocument = await publicClient.readContract({
        address: defaultConfig.contractAddress,
        abi: DidRegistryABI,
        functionName: 'resolveDid',
        args: [did],
      });

      // Check if the DID exists (if resolveDid returns a valid document)
      if (!didDocument) {
        return {
          success: false,
          error: `DID ${did} does not exist`,
        };
      }

      // Check if the DID is active
      const isActive = await publicClient.readContract({
        address: defaultConfig.contractAddress,
        abi: DidRegistryABI,
        functionName: 'isActive',
        args: [did],
      });

      if (!isActive) {
        return {
          success: false,
          error: `DID ${did} is not active`,
        };
      }

      // Get the DID controller to log for debugging
      const controller = await publicClient.readContract({
        address: defaultConfig.contractAddress,
        abi: DidRegistryABI,
        functionName: 'getController',
        args: [did],
      });
    } catch (checkError: any) {
      return {
        success: false,
        error: checkError.message || 'Error checking DID status',
      };
    }

    // Prepare transaction data for client-side execution
    return {
      success: true,
      ...prepareTransactionData('updateDidDocument', [did, newDocument]),
    };
  } catch (error: any) {
    console.error('Error preparing DID document update:', error);
    return {
      success: false,
      error: error.message || 'Failed to prepare DID document update',
    };
  }
}

/**
 * Update a DID public key - server-side preparation
 * @param did - The DID to update
 * @param newPublicKey - The new public key
 * @returns The transaction data for client-side execution
 */
export async function updateDidPublicKey(did: string, newPublicKey: string): Promise<TransactionResponse> {
  try {
    // Get public client to check DID status
    const publicClient = getPublicClient();

    // Check if the DID exists and is active before attempting to update
    try {
      // Use resolveDid to check if the DID exists
      const didDocument = await publicClient.readContract({
        address: defaultConfig.contractAddress,
        abi: DidRegistryABI,
        functionName: 'resolveDid',
        args: [did],
      });

      // Check if the DID exists (if resolveDid returns a valid document)
      if (!didDocument) {
        return {
          success: false,
          error: `DID ${did} does not exist`,
        };
      }

      // Check if the DID is active
      const isActive = await publicClient.readContract({
        address: defaultConfig.contractAddress,
        abi: DidRegistryABI,
        functionName: 'isActive',
        args: [did],
      });

      if (!isActive) {
        return {
          success: false,
          error: `DID ${did} is not active`,
        };
      }

      // Get the DID controller to log for debugging
      const controller = await publicClient.readContract({
        address: defaultConfig.contractAddress,
        abi: DidRegistryABI,
        functionName: 'getController',
        args: [did],
      });
    } catch (checkError: any) {
      return {
        success: false,
        error: checkError.message || 'Error checking DID status',
      };
    }

    // Prepare transaction data for client-side execution
    return {
      success: true,
      ...prepareTransactionData('updateDidPublicKey', [did, newPublicKey]),
    };
  } catch (error: any) {
    console.error('Error preparing DID public key update:', error);
    return {
      success: false,
      error: error.message || 'Failed to prepare DID public key update',
    };
  }
}

/**
 * Prepare to register a new DID - server-side preparation
 * @param did - The DID to register
 * @param document - The DID document
 * @param publicKey - The public key
 * @returns The transaction data for client-side execution
 */
export async function registerDid(did: string, document: string, publicKey: string): Promise<TransactionResponse> {
  try {
    // Get public client to check if DID already exists
    const publicClient = getPublicClient();

    try {
      // Try to resolve the DID to check if it already exists
      const didDocument = await publicClient.readContract({
        address: defaultConfig.contractAddress,
        abi: DidRegistryABI,
        functionName: 'resolveDid',
        args: [did],
      });

      // If we get here and didDocument exists, the DID is already registered
      if (didDocument) {
        return {
          success: false,
          error: `DID ${did} is already registered`,
        };
      }
    } catch (error) {
      // If we get an error, it likely means the DID doesn't exist, which is what we want
      // Continue with the registration
    }

    // Prepare transaction data for client-side execution
    return {
      success: true,
      ...prepareTransactionData('registerDid', [did, document, publicKey]),
    };
  } catch (error: any) {
    console.error('Error preparing DID registration:', error);
    return {
      success: false,
      error: error.message || 'Failed to prepare DID registration',
    };
  }
}

/**
 * Prepare to deactivate a DID - server-side preparation
 * @param did - The DID to deactivate
 * @returns The transaction data for client-side execution
 */
export async function deactivateDid(did: string): Promise<TransactionResponse> {
  try {
    // Get public client to check DID status
    const publicClient = getPublicClient();

    // Check if the DID exists and is active before attempting to deactivate
    try {
      // Use resolveDid to check if the DID exists
      const didDocument = await publicClient.readContract({
        address: defaultConfig.contractAddress,
        abi: DidRegistryABI,
        functionName: 'resolveDid',
        args: [did],
      });

      // Check if the DID exists (if resolveDid returns a valid document)
      if (!didDocument) {
        return {
          success: false,
          error: `DID ${did} does not exist`,
        };
      }

      // Check if the DID is already inactive
      const isActive = await publicClient.readContract({
        address: defaultConfig.contractAddress,
        abi: DidRegistryABI,
        functionName: 'isActive',
        args: [did],
      });

      if (!isActive) {
        return {
          success: false,
          error: `DID ${did} is already inactive`,
        };
      }

      // Get the DID controller to log for debugging
      const controller = await publicClient.readContract({
        address: defaultConfig.contractAddress,
        abi: DidRegistryABI,
        functionName: 'getController',
        args: [did],
      });
    } catch (checkError: any) {
      return {
        success: false,
        error: checkError.message || 'Error checking DID status',
      };
    }

    // Prepare transaction data for client-side execution
    return {
      success: true,
      ...prepareTransactionData('deactivateDid', [did]),
    };
  } catch (error: any) {
    console.error('Error preparing DID deactivation:', error);
    return {
      success: false,
      error: error.message || 'Failed to prepare DID deactivation',
    };
  }
}

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
