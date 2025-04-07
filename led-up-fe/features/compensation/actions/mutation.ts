'use server';

/**
 * @file Compensation Mutation Actions
 * @description Server actions for preparing state-changing operations for the Compensation contract
 */

import { CompensationABI } from '@/abi/compensation.abi';
import { ERC20ABI } from '@/abi/erc20.abi';
import { revalidatePath } from 'next/cache';
import { type TransactionRequest } from '../types/transaction';
import {
  ProcessPaymentInput,
  WithdrawProducerBalanceInput,
  WithdrawServiceFeeInput,
  RemoveProducerInput,
  ChangeServiceFeeInput,
  ChangeUnitPriceInput,
  SetMinimumWithdrawAmountInput,
  ChangeTokenAddressInput,
  parseCompensationError,
} from '../types/contract';

/**
 * Configuration for the compensation contract
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
  contractAddress: process.env.TOKEN_CONTRACT_ADDRESS as `0x${string}`,
  chainId: 31337,
  rpcUrl: process.env.RPC_URL || 'http://localhost:8545',
};

/**
 * Type for prepared transaction
 */
type PreparedTransaction = {
  contractAddress: `0x${string}`;
  abi: typeof CompensationABI | typeof ERC20ABI;
  functionName: string;
  args: any[];
};

/**
 * Type for transaction preparation response
 */
interface TransactionPreparation {
  success: boolean;
  error?: string;
  transaction?: PreparedTransaction | TransactionRequest;
}

/**
 * Revalidate a path after successful transaction
 */
export async function revalidateAfterTransaction(path: string): Promise<void> {
  revalidatePath(path);
}

/**
 * Prepare a transaction to process payment for a record
 * @param params - Payment parameters
 * @returns Prepared transaction
 */
export async function prepareProcessPayment(params: ProcessPaymentInput): Promise<TransactionPreparation> {
  try {
    if (!params.recordId) {
      throw new Error('Record ID is required');
    }
    if (!params.producer) {
      throw new Error('Producer address is required');
    }
    if (!params.dataSize || params.dataSize <= 0n) {
      throw new Error('Valid data size is required');
    }
    if (!params.consumerDid) {
      throw new Error('Consumer DID is required');
    }

    return {
      success: true,
      transaction: {
        contractAddress: compensationConfig.contractAddress,
        abi: CompensationABI,
        functionName: 'processPayment',
        args: [params.producer, params.recordId, params.dataSize, params.consumerDid],
      },
    };
  } catch (error) {
    console.error('Error preparing payment transaction:', error);
    const parsedError = parseCompensationError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to withdraw producer balance
 * @param params - Withdraw parameters
 * @returns Prepared transaction
 */
export async function prepareWithdrawProducerBalance(
  params: WithdrawProducerBalanceInput
): Promise<TransactionPreparation> {
  try {
    if (!params.amount || params.amount <= 0n) {
      throw new Error('Valid amount is required');
    }

    return {
      success: true,
      transaction: {
        contractAddress: compensationConfig.contractAddress,
        abi: CompensationABI,
        functionName: 'withdrawProducerBalance',
        args: [params.amount],
      },
    };
  } catch (error) {
    console.error('Error preparing withdraw producer balance transaction:', error);
    const parsedError = parseCompensationError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to withdraw service fee (admin only)
 * @param params - Withdraw parameters
 * @returns Prepared transaction
 */
export async function prepareWithdrawServiceFee(params: WithdrawServiceFeeInput): Promise<TransactionPreparation> {
  try {
    if (!params.amount || params.amount <= 0n) {
      throw new Error('Valid amount is required');
    }

    return {
      success: true,
      transaction: {
        contractAddress: compensationConfig.contractAddress,
        abi: CompensationABI,
        functionName: 'withdrawServiceFee',
        args: [params.amount],
      },
    };
  } catch (error) {
    console.error('Error preparing withdraw service fee transaction:', error);
    const parsedError = parseCompensationError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to remove a producer (admin only)
 * @param params - Remove producer parameters
 * @returns Prepared transaction
 */
export async function prepareRemoveProducer(params: RemoveProducerInput): Promise<TransactionPreparation> {
  try {
    if (!params.producer) {
      throw new Error('Producer address is required');
    }

    return {
      success: true,
      transaction: {
        contractAddress: compensationConfig.contractAddress,
        abi: CompensationABI,
        functionName: 'removeProducer',
        args: [params.producer],
      },
    };
  } catch (error) {
    console.error('Error preparing remove producer transaction:', error);
    const parsedError = parseCompensationError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to change service fee percentage (admin only)
 * @param params - Change service fee parameters
 * @returns Prepared transaction
 */
export async function prepareChangeServiceFee(params: ChangeServiceFeeInput): Promise<TransactionPreparation> {
  try {
    if (params.newFee < 0 || params.newFee > 100) {
      throw new Error('Service fee must be between 0 and 100');
    }

    return {
      success: true,
      transaction: {
        contractAddress: compensationConfig.contractAddress,
        abi: CompensationABI,
        functionName: 'changeServiceFee',
        args: [params.newFee],
      },
    };
  } catch (error) {
    console.error('Error preparing change service fee transaction:', error);
    const parsedError = parseCompensationError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to change unit price (admin only)
 * @param params - Change unit price parameters
 * @returns Prepared transaction
 */
export async function prepareChangeUnitPrice(params: ChangeUnitPriceInput): Promise<TransactionPreparation> {
  try {
    if (!params.newPrice || params.newPrice <= 0n) {
      throw new Error('Valid unit price is required');
    }

    return {
      success: true,
      transaction: {
        contractAddress: compensationConfig.contractAddress,
        abi: CompensationABI,
        functionName: 'changeUnitPrice',
        args: [params.newPrice],
      },
    };
  } catch (error) {
    console.error('Error preparing change unit price transaction:', error);
    const parsedError = parseCompensationError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to set minimum withdraw amount (admin only)
 * @param params - Set minimum withdraw amount parameters
 * @returns Prepared transaction
 */
export async function prepareSetMinimumWithdrawAmount(
  params: SetMinimumWithdrawAmountInput
): Promise<TransactionPreparation> {
  try {
    if (!params.newAmount || params.newAmount <= 0n) {
      throw new Error('Valid minimum withdraw amount is required');
    }

    return {
      success: true,
      transaction: {
        contractAddress: compensationConfig.contractAddress,
        abi: CompensationABI,
        functionName: 'setMinimumWithdrawAmount',
        args: [params.newAmount],
      },
    };
  } catch (error) {
    console.error('Error preparing set minimum withdraw amount transaction:', error);
    const parsedError = parseCompensationError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to change token address (admin only)
 * @param params - Change token address parameters
 * @returns Prepared transaction
 */
export async function prepareChangeTokenAddress(params: ChangeTokenAddressInput): Promise<TransactionPreparation> {
  try {
    if (!params.newTokenAddress) {
      throw new Error('New token address is required');
    }

    return {
      success: true,
      transaction: {
        contractAddress: compensationConfig.contractAddress,
        abi: CompensationABI,
        functionName: 'changeTokenAddress',
        args: [params.newTokenAddress],
      },
    };
  } catch (error) {
    console.error('Error preparing change token address transaction:', error);
    const parsedError = parseCompensationError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to pause the service (admin only)
 * @returns Prepared transaction
 */
export async function preparePauseService(): Promise<TransactionPreparation> {
  try {
    return {
      success: true,
      transaction: {
        contractAddress: compensationConfig.contractAddress,
        abi: CompensationABI,
        functionName: 'pauseService',
        args: [],
      },
    };
  } catch (error) {
    console.error('Error preparing pause service transaction:', error);
    const parsedError = parseCompensationError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to unpause the service (admin only)
 * @returns Prepared transaction
 */
export async function prepareUnpauseService(): Promise<TransactionPreparation> {
  try {
    return {
      success: true,
      transaction: {
        contractAddress: compensationConfig.contractAddress,
        abi: CompensationABI,
        functionName: 'unpauseService',
        args: [],
      },
    };
  } catch (error) {
    console.error('Error preparing unpause service transaction:', error);
    const parsedError = parseCompensationError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to update DID Auth contract address (admin only)
 * @param newAddress - New DID Auth contract address
 * @returns Prepared transaction
 */
export async function prepareUpdateDidAuthAddress(newAddress: `0x${string}`): Promise<TransactionPreparation> {
  try {
    if (!newAddress) {
      throw new Error('New DID Auth address is required');
    }

    return {
      success: true,
      transaction: {
        contractAddress: compensationConfig.contractAddress,
        abi: CompensationABI,
        functionName: 'updateDidAuthAddress',
        args: [newAddress],
      },
    };
  } catch (error) {
    console.error('Error preparing update DID Auth address transaction:', error);
    const parsedError = parseCompensationError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

interface TokenApprovalParams {
  spender: `0x${string}`;
  amount: bigint;
}

/**
 * Prepare token approval transaction
 * @param params - Token approval parameters
 * @returns Prepared transaction
 */
export async function prepareTokenApproval(params: TokenApprovalParams): Promise<TransactionPreparation> {
  try {
    if (!params.spender) {
      throw new Error('Spender address is required');
    }
    if (!params.amount || params.amount <= 0n) {
      throw new Error('Valid amount is required');
    }

    return {
      success: true,
      transaction: {
        contractAddress: tokenConfig.contractAddress,
        abi: ERC20ABI,
        functionName: 'approve',
        args: [params.spender, params.amount],
      },
    };
  } catch (error) {
    console.error('Error preparing token approval transaction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to prepare approval',
    };
  }
}
