'use server';

import { DataRegistryABI } from '@/abi/data-registry.abi';
import { revalidatePath } from 'next/cache';
import {
  RegisterProducerInput,
  RegisterRecordInput,
  UpdateRecordInput,
  ShareDataInput,
  ShareToProviderInput,
  TriggerAccessInput,
  RevokeAccessInput,
  VerifyRecordInput,
  UpdateProducerConsentInput,
  parseDataRegistryError,
} from '../types/contract';

/**
 * Configuration for the Data Registry contract
 */
type ContractConfig = {
  contractAddress: `0x${string}`;
  chainId: number;
  rpcUrl: string;
};

// Default configuration - should be overridden in production
const defaultConfig: ContractConfig = {
  contractAddress: (process.env.DATA_REGISTRY_CONTRACT_ADDRESS || '0x0') as `0x${string}`,
  chainId: 31337,
  rpcUrl: process.env.RPC_URL || 'http://localhost:8545',
};

/**
 * Type for prepared transaction
 */
type PreparedTransaction = {
  contractAddress: `0x${string}`;
  abi: typeof DataRegistryABI;
  functionName: string;
  args: any[];
};

/**
 * Type for transaction preparation response
 */
type TransactionPreparation = {
  success: boolean;
  error?: string;
  transaction?: PreparedTransaction;
};

/**
 * Revalidate a path after successful transaction
 */
export async function revalidateAfterTransaction(path: string): Promise<void> {
  revalidatePath(path);
}

/**
 * Prepare a transaction to register a producer
 * @param input - Producer registration input
 * @returns Prepared transaction
 */
export async function prepareRegisterProducer(input: RegisterProducerInput): Promise<TransactionPreparation> {
  console.log('prepareRegisterProducer', input);
  try {
    if (!input.status) {
      throw new Error('Status is required');
    }
    if (input.consent === undefined || input.consent === null) {
      throw new Error('Consent is required');
    }

    return {
      success: true,
      transaction: {
        contractAddress: defaultConfig.contractAddress,
        abi: DataRegistryABI,
        functionName: 'registerProducer',
        args: [input.status, input.consent],
      },
    };
  } catch (error) {
    console.error('Error preparing register producer transaction:', error);
    const parsedError = parseDataRegistryError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to register a record
 * @param input - Record registration input
 * @returns Prepared transaction
 */
export async function prepareRegisterRecord(input: RegisterRecordInput): Promise<TransactionPreparation> {
  try {
    if (!input.recordId) {
      throw new Error('Record ID is required');
    }
    if (!input.cid) {
      throw new Error('CID is required');
    }
    if (!input.contentHash) {
      throw new Error('Content hash is required');
    }
    if (!input.resourceType) {
      throw new Error('Resource type is required');
    }
    if (!input.dataSize) {
      throw new Error('Data size is required');
    }

    return {
      success: true,
      transaction: {
        contractAddress: defaultConfig.contractAddress,
        abi: DataRegistryABI,
        functionName: 'registerRecord',
        args: [input.recordId, input.cid, input.contentHash, input.resourceType, input.dataSize],
      },
    };
  } catch (error) {
    console.error('Error preparing register record transaction:', error);
    const parsedError = parseDataRegistryError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to update a record
 * @param input - Record update input
 * @returns Prepared transaction
 */
export async function prepareUpdateRecord(input: UpdateRecordInput): Promise<TransactionPreparation> {
  try {
    if (!input.recordId) {
      throw new Error('Record ID is required');
    }
    if (!input.cid) {
      throw new Error('CID is required');
    }
    if (!input.contentHash) {
      throw new Error('Content hash is required');
    }

    return {
      success: true,
      transaction: {
        contractAddress: defaultConfig.contractAddress,
        abi: DataRegistryABI,
        functionName: 'updateRecord',
        args: [input.recordId, input.cid, input.contentHash],
      },
    };
  } catch (error) {
    console.error('Error preparing update record transaction:', error);
    const parsedError = parseDataRegistryError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to share data with a consumer
 * @param input - Share data input
 * @returns Prepared transaction
 */
export async function prepareShareData(input: ShareDataInput): Promise<TransactionPreparation> {
  try {
    if (!input.recordId) {
      throw new Error('Record ID is required');
    }
    if (!input.consumerAddress) {
      throw new Error('Consumer address is required');
    }
    if (!input.accessDuration) {
      throw new Error('Access duration is required');
    }

    return {
      success: true,
      transaction: {
        contractAddress: defaultConfig.contractAddress,
        abi: DataRegistryABI,
        functionName: 'shareData',
        args: [input.recordId, input.consumerAddress, input.accessDuration],
      },
    };
  } catch (error) {
    console.error('Error preparing share data transaction:', error);
    const parsedError = parseDataRegistryError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to share data with a provider
 * @param input - Share to provider input
 * @returns Prepared transaction
 */
export async function prepareShareToProvider(input: ShareToProviderInput): Promise<TransactionPreparation> {
  try {
    if (!input.recordId) {
      throw new Error('Record ID is required');
    }
    if (!input.provider) {
      throw new Error('Provider address is required');
    }
    if (!input.accessDuration) {
      throw new Error('Access duration is required');
    }
    if (!input.accessLevel) {
      throw new Error('Access level is required');
    }

    return {
      success: true,
      transaction: {
        contractAddress: defaultConfig.contractAddress,
        abi: DataRegistryABI,
        functionName: 'shareToProvider',
        args: [input.recordId, input.provider, input.accessDuration, input.accessLevel],
      },
    };
  } catch (error) {
    console.error('Error preparing share to provider transaction:', error);
    const parsedError = parseDataRegistryError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to trigger access for a record
 * @param input - Trigger access input
 * @returns Prepared transaction
 */
export async function prepareTriggerAccess(input: TriggerAccessInput): Promise<TransactionPreparation> {
  try {
    if (!input.recordId) {
      throw new Error('Record ID is required');
    }

    return {
      success: true,
      transaction: {
        contractAddress: defaultConfig.contractAddress,
        abi: DataRegistryABI,
        functionName: 'triggerAccess',
        args: [input.recordId],
      },
    };
  } catch (error) {
    console.error('Error preparing trigger access transaction:', error);
    const parsedError = parseDataRegistryError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to revoke access to a record
 * @param input - Revoke access input
 * @returns Prepared transaction
 */
export async function prepareRevokeAccess(input: RevokeAccessInput): Promise<TransactionPreparation> {
  try {
    if (!input.recordId) {
      throw new Error('Record ID is required');
    }
    if (!input.consumerAddress) {
      throw new Error('Consumer address is required');
    }

    return {
      success: true,
      transaction: {
        contractAddress: defaultConfig.contractAddress,
        abi: DataRegistryABI,
        functionName: 'revokeAccess',
        args: [input.recordId, input.consumerAddress],
      },
    };
  } catch (error) {
    console.error('Error preparing revoke access transaction:', error);
    const parsedError = parseDataRegistryError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to verify a record
 * @param input - Verify record input
 * @returns Prepared transaction
 */
export async function prepareVerifyRecord(input: VerifyRecordInput): Promise<TransactionPreparation> {
  try {
    if (!input.recordId) {
      throw new Error('Record ID is required');
    }

    return {
      success: true,
      transaction: {
        contractAddress: defaultConfig.contractAddress,
        abi: DataRegistryABI,
        functionName: 'verifyRecord',
        args: [input.recordId],
      },
    };
  } catch (error) {
    console.error('Error preparing verify record transaction:', error);
    const parsedError = parseDataRegistryError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to update producer consent
 * @param input - Update producer consent input
 * @returns Prepared transaction
 */
export async function prepareUpdateProducerConsent(input: UpdateProducerConsentInput): Promise<TransactionPreparation> {
  try {
    if (!input.consentStatus) {
      throw new Error('Consent status is required');
    }

    return {
      success: true,
      transaction: {
        contractAddress: defaultConfig.contractAddress,
        abi: DataRegistryABI,
        functionName: 'updateProducerConsent',
        args: [input.producer, input.consentStatus],
      },
    };
  } catch (error) {
    console.error('Error preparing update producer consent transaction:', error);
    const parsedError = parseDataRegistryError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to pause the contract (admin only)
 * @returns Prepared transaction
 */
export async function preparePauseContract(): Promise<TransactionPreparation> {
  try {
    return {
      success: true,
      transaction: {
        contractAddress: defaultConfig.contractAddress,
        abi: DataRegistryABI,
        functionName: 'pauseContract',
        args: [],
      },
    };
  } catch (error) {
    console.error('Error preparing pause contract transaction:', error);
    const parsedError = parseDataRegistryError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to unpause the contract (admin only)
 * @returns Prepared transaction
 */
export async function prepareUnpauseContract(): Promise<TransactionPreparation> {
  try {
    return {
      success: true,
      transaction: {
        contractAddress: defaultConfig.contractAddress,
        abi: DataRegistryABI,
        functionName: 'unpauseContract',
        args: [],
      },
    };
  } catch (error) {
    console.error('Error preparing unpause contract transaction:', error);
    const parsedError = parseDataRegistryError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to update DID Auth address (admin only)
 * @param newAddress - New DID Auth address
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
        contractAddress: defaultConfig.contractAddress,
        abi: DataRegistryABI,
        functionName: 'updateDidAuthAddress',
        args: [newAddress],
      },
    };
  } catch (error) {
    console.error('Error preparing update DID Auth address transaction:', error);
    const parsedError = parseDataRegistryError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to update Compensation address (admin only)
 * @param newAddress - New Compensation address
 * @returns Prepared transaction
 */
export async function prepareUpdateCompensationAddress(newAddress: `0x${string}`): Promise<TransactionPreparation> {
  try {
    if (!newAddress) {
      throw new Error('New Compensation address is required');
    }

    return {
      success: true,
      transaction: {
        contractAddress: defaultConfig.contractAddress,
        abi: DataRegistryABI,
        functionName: 'updateCompensationAddress',
        args: [newAddress],
      },
    };
  } catch (error) {
    console.error('Error preparing update Compensation address transaction:', error);
    const parsedError = parseDataRegistryError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}
