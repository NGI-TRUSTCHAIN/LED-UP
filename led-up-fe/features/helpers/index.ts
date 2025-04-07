'use server';
import { DataRegistryErrorHandler } from '@/helpers/error-handler/DataRegistryErrorHandler.old';
import * as ABI from '@/abi';
import { DataRegistryEventParser } from '@/helpers/event-parser/DataRegistryEventParser';
import { ParsedContractError } from '@/helpers/error-handler/BaseErrorHandler';
import { createWalletClient, createPublicClient, http } from 'viem';
import { localhost } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { revalidatePath } from 'next/cache';
import { ContractWriteRequest, ContractWriteResponse } from '@/features/data-registry';
import type { Abi, Address } from 'viem';

/**
 * Configuration for the data registry contract
 */
type ContractConfig = {
  contractAddress: Address;
  chainId: number;
  rpcUrl: string;
};

// Default configuration - should be overridden in production
export const defaultConfig = async (contractName: string): Promise<ContractConfig> => {
  return {
    contractAddress: (await getContractAddress(contractName)) as Address,
    chainId: Number(process.env.CHAIN_ID || 1),
    rpcUrl: process.env.RPC_URL || 'http://127.0.0.1:8545',
  };
};

/**
 * Type for transaction response with additional metadata
 */
export type TransactionResponse = {
  success: boolean;
  hash?: `0x${string}`;
  error?: string;
  data?: string;
  to?: string;
  from?: string;
  method?: string;
  args?: any[];
  // For client-side transaction preparation
  contractAddress?: Address;
  abi?: Abi;
  functionName?: string;
  // Add parsed events and errors
  events?: any[];
  parsedError?: ParsedContractError;
};

/**
 * Create a wallet client for sending transactions
 */
export const getWalletClient = async (privateKey: string, config: ContractConfig) => {
  if (!config) {
    throw new Error('Contract config is required');
  }
  const account = privateKeyToAccount(privateKey as `0x${string}`);

  return createWalletClient({
    account,
    chain: {
      ...localhost,
      id: config.chainId,
    },
    transport: http(config.rpcUrl),
  });
};

/**
 * Create a public client for reading from the blockchain
 */
export const getPublicClient = async (contractName: string) => {
  const config = await defaultConfig(contractName);
  return createPublicClient({
    chain: {
      ...localhost,
      id: config.chainId,
    },
    transport: http(config.rpcUrl),
  });
};

/**
 * Process a transaction receipt and return a formatted response
 */
export const processTransactionReceipt = async (
  hash: `0x${string}`,
  method: string,
  args: any[] = [],
  contractName: string
): Promise<TransactionResponse> => {
  try {
    const publicClient = getPublicClient(contractName);
    const receipt = await (await publicClient).waitForTransactionReceipt({ hash });
    const abi = await selectAbi(contractName);

    // Create error and event handlers
    const eventParser = new DataRegistryEventParser(abi);

    // Parse events from the receipt
    const parsedEvents = eventParser.parseEvents(receipt as any);

    return {
      success: true,
      hash,
      method,
      args,
      events: parsedEvents,
    };
  } catch (error) {
    console.error('Transaction processing error:', error);

    // Create error handler
    const errorHandler = new DataRegistryErrorHandler(ABI.DataRegistryABI as Abi);

    // Parse the error
    const parsedError = errorHandler.parseError(error);

    return {
      success: false,
      hash,
      error: parsedError.message,
      method,
      args,
      parsedError,
    };
  }
};

/**
 * Process a transaction response and revalidate the path if needed
 */
export async function processTransactionResponse(
  txHash: `0x${string}`,
  path?: string
): Promise<{ success: boolean; error?: string; events?: any[] }> {
  try {
    const receipt = await processTransactionReceipt(txHash, 'unknown', [], 'DataRegistry');

    if (path) {
      revalidatePath(path);
    }

    if (receipt.success) {
      return {
        success: true,
        events: receipt.events,
      };
    } else {
      return {
        success: false,
        error: receipt.error,
        events: receipt.events,
      };
    }
  } catch (error) {
    console.error('Error processing transaction response:', error);

    // Create error handler
    const errorHandler = new DataRegistryErrorHandler(ABI.DataRegistryABI as Abi);

    // Get user-friendly error message
    const errorMessage = errorHandler.getUserFriendlyMessage(error);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Prepare transaction data for client-side execution
 * @param functionName - The contract function to call
 * @param args - The arguments for the function
 * @returns Transaction data for client-side execution
 */
export const prepareTransactionData = async (
  functionName: string,
  args: any[],
  contractName: string = 'DataRegistry'
) => {
  return {
    contractAddress: (await defaultConfig(contractName)).contractAddress,
    abi: selectAbi(contractName),
    functionName,
    args,
  };
};

/**
 * Wrapper for handling contract write operations with error handling
 */
export const withContractWrite = async <T>(
  operation: () => Promise<ContractWriteRequest>,
  config: { revalidatePath?: string } = {},
  contractName?: string
): Promise<ContractWriteResponse> => {
  try {
    // Get the contract write request
    const request = await operation();

    // Return the prepared request for client-side execution
    return {
      success: true,
      request,
    };
  } catch (error) {
    // Create error handler
    const errorHandler = new DataRegistryErrorHandler(ABI.DataRegistryABI as Abi);

    // Get user-friendly error message
    const errorMessage = errorHandler.getUserFriendlyMessage(error);

    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Prepare contract write request for client-side execution
 */
export const prepareContractWriteRequest = async (
  functionName: string,
  args: unknown[],
  contractName: string = 'DataRegistry'
): Promise<ContractWriteRequest> => {
  return {
    contractAddress: (await defaultConfig(contractName)).contractAddress,
    abi: await selectAbi(contractName),
    functionName,
    args,
  };
};

export const selectAbi = async (contractName: string): Promise<Abi> => {
  switch (contractName) {
    case 'DataRegistry':
      return ABI.DataRegistryABI as Abi;
    case 'DataRegistryInterface':
      return ABI.DataRegistryInterfaceABI as Abi;
    case 'Compensation':
      return ABI.CompensationABI as Abi;
    case 'CompensationInterface':
      return ABI.CompensationInterfaceABI as Abi;
    case 'DidIssuer':
      return ABI.DidIssuerABI as Abi;
    case 'DidVerifier':
      return ABI.DidVerifierABI as Abi;
    case 'Token':
      return ABI.ERC20ABI as Abi;
    case 'DidRegistry':
      return ABI.DidRegistryABI as Abi;
    case 'DidAuth':
      return ABI.DidAuthABI as Abi;
    case 'DidAccessControl':
      return ABI.DidAccessControlABI as Abi;
    case 'ConsentManagement':
      return ABI.ConsentManagementABI as Abi;
    // case 'ZKPRegistry':
    //   return ABI.ZKPRegistryABI;
    // case 'ZKPVerifier':
    //   return ABI.ZKPVerifierABI;
    default:
      throw new Error(`Unsupported contract: ${contractName}`);
  }
};

export const getContractAddress = async (contractName: string) => {
  switch (contractName) {
    case 'DataRegistry':
      return process.env.DATA_REGISTRY_CONTRACT_ADDRESS;
    case 'Compensation':
      return process.env.COMPENSATION_CONTRACT_ADDRESS;
    case 'DidIssuer':
      return process.env.DID_ISSUER_CONTRACT_ADDRESS;
    case 'DidVerifier':
      return process.env.DID_VERIFIER_CONTRACT_ADDRESS;
    case 'Token':
      return process.env.TOKEN_CONTRACT_ADDRESS;
    case 'DidRegistry':
      return process.env.DID_REGISTRY_CONTRACT_ADDRESS;
    case 'DidAuth':
      return process.env.DID_AUTH_CONTRACT_ADDRESS;
    case 'DidAccessControl':
      return process.env.DID_ACCESS_CONTROL_CONTRACT_ADDRESS;
    case 'ConsentManagement':
      return process.env.CONSENT_MANAGEMENT_CONTRACT_ADDRESS;
    // case 'ZKPRegistry':
    //   return process.env.ZKP_REGISTRY_CONTRACT_ADDRESS;
    // case 'ZKPVerifier':
    //   return process.env.ZKP_VERIFIER_CONTRACT_ADDRESS;
    default:
      throw new Error(`Unsupported contract: ${contractName}`);
  }
};
