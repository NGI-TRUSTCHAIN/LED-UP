import { type Abi, type Address } from 'viem';
import { DataRegistryErrorHandler } from '@/helpers/error-handler/DataRegistryErrorHandler';
import * as ABI from '@/abi';
import {
  ContractName,
  ContractWriteRequest,
  ContractWriteResponse,
  ContractReadResponse,
  ContractInteractionOptions,
} from '../features/data-registry/types';
import { defaultConfig, getPublicClient } from '@/features/helpers';

/**
 * Select the appropriate ABI based on contract name
 */
export const getContractAbi = (contractName: ContractName): Abi => {
  switch (contractName) {
    case ContractName.DataRegistry:
      return ABI.DataRegistryABI as Abi;
    case ContractName.Compensation:
      return ABI.CompensationABI as Abi;
    case ContractName.DidIssuer:
      return ABI.DidIssuerABI as Abi;
    case ContractName.DidVerifier:
      return ABI.DidVerifierABI as Abi;
    case ContractName.Token:
      return ABI.ERC20ABI as Abi;
    case ContractName.DidRegistry:
      return ABI.DidRegistryABI as Abi;
    case ContractName.DidAuth:
      return ABI.DidAuthABI as Abi;
    case ContractName.DidAccessControl:
      return ABI.DidAccessControlABI as Abi;
    case ContractName.ConsentManagement:
      return ABI.ConsentManagementABI as Abi;
    default:
      throw new Error(`Unsupported contract: ${contractName}`);
  }
};

/**
 * Get the appropriate error handler for a contract
 */
export const getErrorHandler = (contractName: ContractName) => {
  const abi = getContractAbi(contractName);
  return new DataRegistryErrorHandler(abi);
};

/**
 * Prepare a contract write request
 */
export const prepareContractWriteRequest = async (
  functionName: string,
  args: unknown[],
  contractName: ContractName = ContractName.DataRegistry
): Promise<ContractWriteRequest> => {
  const config = await defaultConfig(contractName);

  return {
    contractAddress: config.contractAddress,
    abi: getContractAbi(contractName),
    functionName,
    args,
  };
};

/**
 * Wrapper for handling contract write operations with error handling
 */
export const withContractWrite = async (
  operation: () => Promise<ContractWriteRequest>,
  options: ContractInteractionOptions = {}
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
    const contractName = options.contractName || ContractName.DataRegistry;
    const errorHandler = getErrorHandler(contractName);

    // Get user-friendly error message
    const errorMessage = errorHandler.getUserFriendlyMessage(error);

    // Call error callback if provided
    if (options.onError) {
      options.onError(new Error(errorMessage));
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Wrapper for handling contract read operations with error handling
 */
export const withContractRead = async <T>(
  operation: () => Promise<T>,
  options: ContractInteractionOptions = {}
): Promise<ContractReadResponse<T>> => {
  try {
    // Execute the read operation
    const data = await operation();

    // Call success callback if provided
    if (options.onSuccess) {
      options.onSuccess(data);
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    // Create error handler
    const contractName = options.contractName || ContractName.DataRegistry;
    const errorHandler = getErrorHandler(contractName);

    // Get user-friendly error message
    const errorMessage = errorHandler.getUserFriendlyMessage(error);

    // Call error callback if provided
    if (options.onError) {
      options.onError(new Error(errorMessage));
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Check if a contract is paused
 */
export const isContractPaused = async (contractName: ContractName = ContractName.DataRegistry): Promise<boolean> => {
  try {
    const publicClient = await getPublicClient(contractName);
    const config = await defaultConfig(contractName);

    const isPaused = await publicClient.readContract({
      address: config.contractAddress,
      abi: getContractAbi(contractName),
      functionName: 'paused',
      args: [],
    });

    return !!isPaused;
  } catch (error) {
    console.error(`Error checking if contract ${contractName} is paused:`, error);
    return false;
  }
};

/**
 * Validate common contract conditions
 */
export const validateContractConditions = async (
  contractName: ContractName = ContractName.DataRegistry
): Promise<void> => {
  const isPaused = await isContractPaused(contractName);
  if (isPaused) {
    throw new Error(`The ${contractName} contract is currently paused`);
  }
};
