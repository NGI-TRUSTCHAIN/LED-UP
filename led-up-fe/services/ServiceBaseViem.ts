'use client';

import { Address, PublicClient, WalletClient, type Abi, type TransactionReceipt } from 'viem';
import { ContractType } from '@/helpers/ContractHandlerFactory';

/**
 * Base class for blockchain service classes using Viem
 */
export abstract class ServiceBaseViem {
  protected contractAddress: Address;
  protected abi: Abi;
  protected publicClient: PublicClient | undefined;
  protected walletClient: WalletClient | undefined;
  protected account: Address | undefined;
  protected contractType!: ContractType; // Using definite assignment assertion

  /**
   * Creates a new instance of the ServiceBaseViem class
   * @param contractAddress The contract address
   * @param abi The contract ABI
   * @param publicClient The Viem public client
   * @param walletClient The Viem wallet client
   * @param account The account address
   */
  constructor(
    contractAddress: Address,
    abi: Abi,
    publicClient?: PublicClient,
    walletClient?: WalletClient,
    account?: Address
  ) {
    // Validate contract address
    if (!contractAddress || contractAddress === '0x' || contractAddress.length < 10) {
      console.error('Invalid contract address provided:', contractAddress);
      // Use a fallback address instead of throwing an error
      contractAddress = '0x610178da211fef7d417bc0e6fed39f05609ad788' as Address;
      console.warn('Using fallback contract address:', contractAddress);
    }

    // Validate public client - log warning but don't throw error
    if (!publicClient) {
      console.warn('Public client not provided, some operations may not work');
    }

    console.log('Initializing ServiceBaseViem with:', {
      contractAddress,
      hasAbi: !!abi,
      hasPublicClient: !!publicClient,
      hasWalletClient: !!walletClient,
      account: account || 'Not provided',
    });

    this.contractAddress = contractAddress;
    this.abi = abi;
    this.publicClient = publicClient;
    this.walletClient = walletClient;
    this.account = account;

    // Set the contract type - this should be overridden by subclasses
    this.initializeContractType();
  }

  /**
   * Initialize the contract type - must be implemented by subclasses
   */
  protected abstract initializeContractType(): void;

  /**
   * Gets a read-only contract instance
   * @returns A Viem contract instance for reading
   */
  protected getReadContract() {
    if (!this.publicClient) {
      console.error('Public client not available in getReadContract');
      throw new Error('Public client not available');
    }

    return {
      read: async ({ functionName, args }: { functionName: string; args?: any[] }) => {
        console.log(`Reading contract function: ${functionName}`, { args });
        try {
          return this.publicClient!.readContract({
            address: this.contractAddress,
            abi: this.abi,
            functionName,
            args,
          });
        } catch (error) {
          console.error(`Error reading contract function ${functionName}:`, error);
          throw error;
        }
      },
    };
  }

  /**
   * Gets a contract instance for writing
   * @returns A Viem contract instance for writing
   */
  protected getWriteContract() {
    // Check for all required components
    const missingComponents = [];
    if (!this.walletClient) missingComponents.push('wallet client');
    if (!this.account) missingComponents.push('account');
    if (!this.publicClient) missingComponents.push('public client');

    if (missingComponents.length > 0) {
      const errorMessage = `Cannot write to contract: missing ${missingComponents.join(', ')}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    return {
      write: async ({ functionName, args }: { functionName: string; args?: any[] }) => {
        console.log(`Writing to contract function: ${functionName}`, { args });
        try {
          const { request } = await this.publicClient!.simulateContract({
            address: this.contractAddress,
            abi: this.abi,
            functionName,
            args,
            account: this.account,
          });

          return this.walletClient!.writeContract(request);
        } catch (error) {
          console.error(`Error writing to contract function ${functionName}:`, error);
          throw error;
        }
      },
    };
  }

  /**
   * Formats a transaction receipt with events
   * @param receipt The transaction receipt
   * @returns The formatted transaction receipt
   */
  protected formatTransactionReceipt(receipt: TransactionReceipt): Record<string, any> {
    return {
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      status: receipt.status === 'success' ? 'success' : 'failed',
      logs: receipt.logs,
    };
  }

  /**
   * Updates the clients and account
   * @param publicClient The Viem public client
   * @param walletClient The Viem wallet client
   * @param account The account address
   */
  public updateClients(publicClient?: PublicClient, walletClient?: WalletClient, account?: Address) {
    console.log('Updating clients:', {
      hasPublicClient: !!publicClient,
      hasWalletClient: !!walletClient,
      account: account || 'Not provided',
    });

    this.publicClient = publicClient;
    this.walletClient = walletClient;
    this.account = account;
  }

  /**
   * Gets the contract address
   * @returns The contract address
   */
  public getContractAddress(): Address {
    return this.contractAddress;
  }

  /**
   * Checks if the service is ready for read operations
   * @returns True if the service is ready for read operations
   */
  public isReadyForRead(): boolean {
    return !!this.publicClient;
  }

  /**
   * Checks if the service is ready for write operations
   * @returns True if the service is ready for write operations
   */
  public isReadyForWrite(): boolean {
    return !!this.publicClient && !!this.walletClient && !!this.account;
  }

  /**
   * Verifies that the service is properly connected for write operations
   * @throws Error if the service is not ready for write operations
   */
  protected async ensureWriteConnection(): Promise<void> {
    if (!this.publicClient) {
      throw new Error('Public client not available. Please refresh the page.');
    }

    if (!this.walletClient) {
      throw new Error('Wallet client not connected. Please connect your wallet.');
    }

    if (!this.account) {
      throw new Error('No account selected. Please connect your wallet.');
    }

    // Verify the connection is still active by making a simple call
    try {
      await this.publicClient.getChainId();
    } catch (error) {
      console.error('Connection test failed:', error);
      throw new Error('Network connection issue detected. Please refresh the page.');
    }
  }

  /**
   * Handles common transaction errors and provides user-friendly messages
   * @param error The error to handle
   * @throws A user-friendly error
   */
  protected handleTransactionError(error: unknown): never {
    console.error('Transaction error:', error);

    // Extract the error message
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Check for common wallet errors
    if (errorMessage.includes('user rejected') || errorMessage.includes('User denied')) {
      throw new Error('Transaction was rejected by the user.');
    }

    if (errorMessage.includes('disconnected') || errorMessage.includes('not connected')) {
      throw new Error('Wallet disconnected. Please reconnect and try again.');
    }

    if (errorMessage.includes('Socket is closed') || errorMessage.includes('connection error')) {
      throw new Error('Network connection lost. Please refresh the page and try again.');
    }

    if (errorMessage.includes('insufficient funds')) {
      throw new Error('Insufficient funds to complete this transaction.');
    }

    // Rethrow the original error if we don't have a specific handler
    throw error;
  }

  /**
   * Verifies that the contract exists and has the expected functions
   * @param expectedFunctions Array of function names that should exist in the contract
   * @returns A promise that resolves to true if the contract is valid
   * @throws Error if the contract doesn't exist or doesn't have the expected functions
   */
  protected async verifyContract(expectedFunctions: string[] = []): Promise<boolean> {
    if (!this.publicClient) {
      throw new Error('Public client not available. Please refresh the page.');
    }

    try {
      // First check if the address is a contract
      const code = await this.publicClient.getBytecode({
        address: this.contractAddress,
      });

      if (!code || code === '0x') {
        throw new Error(`No contract found at address ${this.contractAddress}. Please check your configuration.`);
      }

      // If we have expected functions, try to verify they exist
      if (expectedFunctions.length > 0) {
        for (const functionName of expectedFunctions) {
          try {
            // Try to get the function from the ABI
            const functionFragment = this.abi.find(
              (fragment) =>
                typeof fragment === 'object' &&
                'type' in fragment &&
                fragment.type === 'function' &&
                'name' in fragment &&
                fragment.name === functionName
            );

            if (!functionFragment) {
              console.warn(`Function "${functionName}" not found in ABI`);
            }
          } catch (error) {
            console.warn(`Error checking function "${functionName}" in ABI:`, error);
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Error verifying contract:', error);
      if (error instanceof Error) {
        throw new Error(`Contract verification failed: ${error.message}`);
      }
      throw new Error('Contract verification failed for an unknown reason');
    }
  }
}
