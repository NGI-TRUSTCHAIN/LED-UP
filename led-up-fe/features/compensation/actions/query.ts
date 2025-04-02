'use server';
/**
 * @file Compensation Query Actions
 * @description This file contains all read-only functions from the Compensation ABI.
 */

import { createPublicClient, http, PublicClient } from 'viem';
import { hardhat } from 'viem/chains';
import { CompensationABI } from '@/abi/compensation.abi';
import { VerifyPaymentResponse, ProducerBalanceResponse, parseCompensationError } from '../types/contract';
import { ERC20ABI } from '@/abi/erc20.abi';

/**
 * Configuration for the Compensation contract
 */
type ContractConfig = {
  contractAddress: `0x${string}`;
  chainId: number;
  rpcUrl: string;
};

// Default configuration - should be overridden in production
const compensationConfig: ContractConfig = {
  contractAddress: (process.env.COMPENSATION_CONTRACT_ADDRESS || '0x0') as `0x${string}`,
  chainId: 31337,
  rpcUrl: process.env.RPC_URL || 'http://localhost:8545',
};

const tokenConfig: ContractConfig = {
  contractAddress: (process.env.TOKEN_CONTRACT_ADDRESS || '0x0') as `0x${string}`,
  chainId: 31337,
  rpcUrl: process.env.RPC_URL || 'http://localhost:8545',
};

/**
 * Create a public client for reading from the blockchain
 */
const getPublicClient = (config: ContractConfig = compensationConfig) => {
  return createPublicClient({
    chain: hardhat,
    transport: http(config.rpcUrl),
  });
};

/**
 * Verify if a payment has been processed for a record
 * @param recordIdStr - The record ID to check
 * @param config - Optional contract configuration
 * @returns Payment verification response
 */
export async function verifyPayment(
  recordIdStr: string,
  config: ContractConfig = compensationConfig
): Promise<VerifyPaymentResponse> {
  try {
    if (!recordIdStr) {
      throw new Error('Record ID is required');
    }

    const publicClient = getPublicClient(config);

    const result = await publicClient.readContract({
      address: config.contractAddress,
      abi: CompensationABI,
      functionName: 'verifyPayment',
      args: [recordIdStr],
    });

    // Contract returns a single boolean value
    return {
      isPaid: result as boolean,
    };
  } catch (error) {
    console.error('Error verifying payment:', error);
    const parsedError = parseCompensationError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw error;
  }
}

/**
 * Get producer balance information
 * @param producer - The producer address
 * @param config - Optional contract configuration
 * @returns Producer balance in tokens
 */
export async function getProducerBalance(
  producer: `0x${string}`,
  config: ContractConfig = compensationConfig
): Promise<ProducerBalanceResponse> {
  try {
    if (!producer) {
      throw new Error('Producer address is required');
    }

    const publicClient = getPublicClient(config);

    const result = await publicClient.readContract({
      address: config.contractAddress,
      abi: CompensationABI,
      functionName: 'getProducerBalance',
      args: [producer],
    });

    // Return the balance directly as a bigint
    return result as bigint;
  } catch (error) {
    console.error('Error getting producer balance:', error);
    const parsedError = parseCompensationError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw error;
  }
}

/**
 * Get the service fee percentage
 * @param config - Optional contract configuration
 * @returns Service fee percentage (0-100)
 */
export async function getServiceFee(config: ContractConfig = compensationConfig): Promise<number> {
  try {
    const publicClient = getPublicClient(config);

    const result = await publicClient.readContract({
      address: config.contractAddress,
      abi: CompensationABI,
      functionName: 'getServiceFee',
      args: [],
    });

    return result as number;
  } catch (error) {
    console.error('Error getting service fee:', error);
    const parsedError = parseCompensationError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw error;
  }
}

/**
 * Get the accumulated service fee balance
 * @param config - Optional contract configuration
 * @returns Service fee balance in tokens
 */
export async function getServiceFeeBalance(config: ContractConfig = compensationConfig): Promise<bigint> {
  try {
    const publicClient = getPublicClient(config);

    const result = await publicClient.readContract({
      address: config.contractAddress,
      abi: CompensationABI,
      functionName: 'serviceFeeBalance',
      args: [],
    });

    return result as bigint;
  } catch (error) {
    console.error('Error getting service fee balance:', error);
    const parsedError = parseCompensationError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw error;
  }
}

/**
 * Get the minimum amount required for withdrawal
 * @param config - Optional contract configuration
 * @returns Minimum withdrawal amount in tokens
 */
export async function getMinimumWithdrawAmount(config: ContractConfig = compensationConfig): Promise<bigint> {
  try {
    const publicClient = getPublicClient(config);

    const result = await publicClient.readContract({
      address: config.contractAddress,
      abi: CompensationABI,
      functionName: 'getMinimumWithdrawAmount',
      args: [],
    });

    return result as bigint;
  } catch (error) {
    console.error('Error getting minimum withdraw amount:', error);
    const parsedError = parseCompensationError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw error;
  }
}

/**
 * Get the unit price for data
 * @param config - Optional contract configuration
 * @returns Unit price in tokens
 */
export async function getUnitPrice(config: ContractConfig = compensationConfig): Promise<bigint> {
  try {
    const publicClient = getPublicClient(config);

    const result = await publicClient.readContract({
      address: config.contractAddress,
      abi: CompensationABI,
      functionName: 'getUnitPrice',
      args: [],
    });

    return result as bigint;
  } catch (error) {
    console.error('Error getting unit price:', error);
    const parsedError = parseCompensationError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw error;
  }
}

/**
 * Get the token contract address
 * @param config - Optional contract configuration
 * @returns Token contract address
 */
export async function getTokenAddress(config: ContractConfig = tokenConfig): Promise<`0x${string}`> {
  try {
    const publicClient = getPublicClient(config);

    const result = await publicClient.readContract({
      address: config.contractAddress,
      abi: CompensationABI,
      functionName: 'getTokenAddress',
      args: [],
    });

    return result as `0x${string}`;
  } catch (error) {
    console.error('Error getting token address:', error);
    const parsedError = parseCompensationError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw error;
  }
}

/**
 * Check if the contract is paused
 * @param config - Optional contract configuration
 * @returns True if paused, false otherwise
 */
export async function isPaused(config: ContractConfig = compensationConfig): Promise<boolean> {
  try {
    const publicClient = getPublicClient(config);

    const result = await publicClient.readContract({
      address: config.contractAddress,
      abi: CompensationABI,
      functionName: 'paused',
      args: [],
    });

    return result as boolean;
  } catch (error) {
    console.error('Error checking pause state:', error);
    const parsedError = parseCompensationError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw error;
  }
}

/**
 * Get the contract owner address
 * @param config - Optional contract configuration
 * @returns Owner address
 */
export async function getOwner(config: ContractConfig = compensationConfig): Promise<`0x${string}`> {
  try {
    const publicClient = getPublicClient(config);

    const result = await publicClient.readContract({
      address: config.contractAddress,
      abi: CompensationABI,
      functionName: 'owner',
      args: [],
    });

    return result as `0x${string}`;
  } catch (error) {
    console.error('Error getting owner:', error);
    const parsedError = parseCompensationError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw error;
  }
}

/**
 * Check if a producer exists
 * @param producer - The producer address to check
 * @param config - Optional contract configuration
 * @returns True if the producer exists, false otherwise
 */
export async function producerExists(
  producer: `0x${string}`,
  config: ContractConfig = compensationConfig
): Promise<boolean> {
  try {
    if (!producer) {
      throw new Error('Producer address is required');
    }

    const publicClient = getPublicClient(config);

    const result = await publicClient.readContract({
      address: config.contractAddress,
      abi: CompensationABI,
      functionName: 'producerExists',
      args: [producer],
    });

    return result as boolean;
  } catch (error) {
    console.error('Error checking if producer exists:', error);
    const parsedError = parseCompensationError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw error;
  }
}

/**
 * Get the DID Auth contract address
 * @param config - Optional contract configuration
 * @returns DID Auth contract address
 */
export async function getDidAuthAddress(config: ContractConfig = compensationConfig): Promise<`0x${string}`> {
  try {
    const publicClient = getPublicClient(config);

    const result = await publicClient.readContract({
      address: config.contractAddress,
      abi: CompensationABI,
      functionName: 'getDidAuthAddress',
      args: [],
    });

    return result as `0x${string}`;
  } catch (error) {
    console.error('Error getting DID Auth address:', error);
    const parsedError = parseCompensationError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw error;
  }
}

/**
 * Get the consumer DID for a given address
 * @param consumer - The consumer address
 * @returns The consumer DID
 */
export async function getConsumerDid(consumer: `0x${string}`): Promise<string> {
  try {
    const publicClient = getPublicClient();

    const consumerDid = await publicClient.readContract({
      address: compensationConfig.contractAddress,
      abi: CompensationABI,
      functionName: 'getConsumerDid',
      args: [consumer],
    });

    return consumerDid as string;
  } catch (error) {
    console.error('Error getting consumer DID:', error);
    throw error;
  }
}

/**
 * Get the Levea wallet address
 * @returns The Levea wallet address
 */
export async function getLeveaWallet(): Promise<`0x${string}`> {
  try {
    const publicClient = getPublicClient();

    const leveaWallet = await publicClient.readContract({
      address: compensationConfig.contractAddress,
      abi: CompensationABI,
      functionName: 'getLeveaWallet',
    });

    return leveaWallet as `0x${string}`;
  } catch (error) {
    console.error('Error getting Levea wallet address:', error);
    throw error;
  }
}

/**
 * Get the Levea wallet balance
 * @returns The Levea wallet balance
 */
export async function getLeveaWalletBalance(): Promise<bigint> {
  try {
    const publicClient = getPublicClient();

    const balance = await publicClient.readContract({
      address: compensationConfig.contractAddress,
      abi: CompensationABI,
      functionName: 'getLeveaWalletBalance',
    });

    return balance as bigint;
  } catch (error) {
    console.error('Error getting Levea wallet balance:', error);
    throw error;
  }
}

/**
 * Get the payment token address
 * @returns The payment token address
 */
export async function getPaymentTokenAddress(): Promise<`0x${string}`> {
  try {
    const publicClient = getPublicClient();

    const tokenAddress = await publicClient.readContract({
      address: compensationConfig.contractAddress,
      abi: CompensationABI,
      functionName: 'getPaymentTokenAddress',
    });

    return tokenAddress as `0x${string}`;
  } catch (error) {
    console.error('Error getting payment token address:', error);
    throw error;
  }
}

/**
 * Get the producer DID for a given address
 * @param producer - The producer address
 * @returns The producer DID
 */
export async function getProducerDid(producer: `0x${string}`): Promise<string> {
  try {
    const publicClient = getPublicClient();

    const producerDid = await publicClient.readContract({
      address: compensationConfig.contractAddress,
      abi: CompensationABI,
      functionName: 'getProducerDid',
      args: [producer],
    });

    return producerDid as string;
  } catch (error) {
    console.error('Error getting producer DID:', error);
    throw error;
  }
}

/**
 * Get the producer wallet balance
 * @param producer - The producer address (optional)
 * @returns The producer wallet balance
 */
export async function getProducerWalletBalance(producer?: `0x${string}`): Promise<bigint> {
  try {
    const publicClient = getPublicClient();

    if (producer) {
      const balance = await publicClient.readContract({
        address: compensationConfig.contractAddress,
        abi: CompensationABI,
        functionName: 'getProducerBalance',
        args: [producer],
      });

      return balance as bigint;
    } else {
      const balance = await publicClient.readContract({
        address: compensationConfig.contractAddress,
        abi: CompensationABI,
        functionName: 'getProducerBalance',
      });

      return balance as bigint;
    }
  } catch (error) {
    console.error('Error getting producer wallet balance:', error);
    throw error;
  }
}

/**
 * Get the token address
 * @returns The token address
 */
export async function getToken(): Promise<`0x${string}`> {
  try {
    const publicClient = getPublicClient();

    const token = await publicClient.readContract({
      address: tokenConfig.contractAddress,
      abi: CompensationABI,
      functionName: 'token',
    });

    return token as `0x${string}`;
  } catch (error) {
    console.error('Error getting token address:', error);
    throw error;
  }
}

/**
 * Interface for contract event options
 */
export interface ContractEventOptions {
  address: `0x${string}`;
  fromBlock?: bigint;
  toBlock?: bigint;
}

/**
 * Event data for a payment processed event
 */
export interface PaymentProcessedEvent {
  name: 'PaymentProcessed';
  args: {
    recordId: string;
    producer: `0x${string}`;
    consumer: `0x${string}`;
    amount: bigint;
  };
  blockNumber: bigint;
  transactionHash: string;
}

/**
 * Get payment processed events from the compensation contract
 * @param client The Viem public client
 * @param options Contract event options
 * @returns Array of payment processed events
 */
export const getPaymentProcessedEvents = async (
  client: PublicClient,
  options: ContractEventOptions
): Promise<PaymentProcessedEvent[]> => {
  try {
    const events = await client.getLogs({
      address: options.address,
      event: {
        type: 'event',
        name: 'PaymentProcessed',
        inputs: [
          { type: 'string', name: 'recordId', indexed: true },
          { type: 'address', name: 'producer', indexed: true },
          { type: 'address', name: 'consumer', indexed: true },
          { type: 'uint256', name: 'amount', indexed: false },
        ],
      },
      fromBlock: options.fromBlock || BigInt(0),
      toBlock: options.toBlock || 'latest',
    });

    return events.map((event) => ({
      name: 'PaymentProcessed' as const,
      args: {
        recordId: event.args.recordId as string,
        producer: event.args.producer as `0x${string}`,
        consumer: event.args.consumer as `0x${string}`,
        amount: event.args.amount as bigint,
      },
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
    }));
  } catch (error) {
    console.error('Error fetching payment processed events:', error);
    throw error;
  }
};

/**
 * Get payment details for a specific record
 * @param recordId - The record ID to check
 * @param config - Optional contract configuration
 * @returns Payment details
 */
export async function getPaymentDetails(
  recordId: string,
  config: ContractConfig = compensationConfig
): Promise<{ amount: bigint; isPaid: boolean }> {
  try {
    if (!recordId) {
      throw new Error('Record ID is required');
    }

    const publicClient = getPublicClient(config);

    const result = await publicClient.readContract({
      address: config.contractAddress,
      abi: CompensationABI,
      functionName: 'payments',
      args: [recordId],
    });

    // Contract returns [amount, isPayed]
    const [amount, isPaid] = result as [bigint, boolean];

    return {
      amount,
      isPaid,
    };
  } catch (error) {
    console.error('Error getting payment details:', error);
    const parsedError = parseCompensationError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw error;
  }
}

/**
 * Get token balance for an address
 */
export async function getTokenBalance(address: `0x${string}`, config: ContractConfig = tokenConfig): Promise<bigint> {
  try {
    const publicClient = getPublicClient(config);

    const result = await publicClient.readContract({
      address: config.contractAddress,
      abi: ERC20ABI,
      functionName: 'balanceOf',
      args: [address],
    });

    return result as bigint;
  } catch (error) {
    console.error('Error getting token balance:', error);
    throw error;
  }
}

/**
 * Get token allowance for an owner and spender
 */
export async function getTokenAllowance(
  owner: `0x${string}`,
  spender: `0x${string}`,
  config: ContractConfig = tokenConfig
): Promise<bigint> {
  try {
    const publicClient = getPublicClient(config);

    const result = await publicClient.readContract({
      address: config.contractAddress,
      abi: ERC20ABI,
      functionName: 'allowance',
      args: [owner, spender],
    });

    return result as bigint;
  } catch (error) {
    console.error('Error getting token allowance:', error);
    throw error;
  }
}
