'use client';

import { Address, PublicClient, WalletClient, parseGwei, type Abi, type TransactionReceipt } from 'viem';
import { ContractType } from '@/helpers/ContractHandlerFactory';
import { ServiceBaseViem } from './ServiceBaseViem';

/**
 * Service class for interacting with the DID Registry smart contract using Viem.
 * This class provides methods to manage DIDs (Decentralized Identifiers) on the blockchain.
 */
export class DidRegistryServiceViem extends ServiceBaseViem {
  /**
   * Creates a new instance of the DidRegistryServiceViem class.
   * @param contractAddress The address of the DID Registry contract.
   * @param abi The ABI of the DID Registry contract.
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
    super(contractAddress, abi, publicClient, walletClient, account);

    // Verify the contract asynchronously
    if (publicClient) {
      this.verifyDidRegistryContract().catch((error) => {
        console.error('Contract verification failed:', error);
      });
    }
  }

  /**
   * Initialize the contract type
   */
  protected initializeContractType(): void {
    this.contractType = ContractType.DID_REGISTRY;
  }

  /**
   * Verifies that the contract is a valid DID Registry contract
   */
  private async verifyDidRegistryContract(): Promise<void> {
    try {
      // List of essential functions that should be in the DID Registry contract
      const essentialFunctions = [
        'registerDid',
        'updateDidDocument',
        'deactivateDid',
        'getController',
        'isActive',
        'getDidByAddress',
      ];

      await this.verifyContract(essentialFunctions);
      console.log('DID Registry contract verified successfully');
    } catch (error) {
      console.error('DID Registry contract verification failed:', error);
      // We don't throw here to allow the service to be created even if verification fails
      // This allows for more graceful error handling when methods are called
    }
  }

  /**
   * Creates a new DID for a user.
   * @param did The DID to create.
   * @param document The DID document to associate with the DID.
   * @param publicKey The public key associated with the DID.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async registerDid(did: string, document: string, publicKey: string): Promise<Record<string, any>> {
    try {
      // Ensure we have an active connection before proceeding
      await this.ensureWriteConnection();

      console.log('Registering DID with Viem:', {
        did,
        document,
        publicKey,
        account: this.account,
        contractAddress: this.contractAddress,
      });

      // Verify contract address is valid
      if (!this.contractAddress || this.contractAddress === '0x' || this.contractAddress.length < 10) {
        throw new Error('Invalid contract address. Please check your configuration.');
      }

      // Check if the DID already exists
      try {
        console.log('Checking if DID exists:', did);
        const exists = await this.didExists(did);
        console.log('DID exists check result:', exists);

        if (exists) {
          throw new Error(`DID ${did} already exists`);
        }
      } catch (checkError) {
        // Only throw if it's not related to the DID not existing
        if (checkError instanceof Error) {
          // If the error is about the DID not existing, that's what we want
          if (checkError.message.includes('not exist') || checkError.message.includes('Invalid DID')) {
            console.log('DID does not exist, proceeding with registration');
          } else {
            console.error('Error checking if DID exists:', checkError);
            throw new Error(`Failed to check if DID exists: ${checkError.message}`);
          }
        } else {
          console.error('Unknown error checking if DID exists:', checkError);
          throw new Error('Failed to check if DID exists due to an unknown error');
        }
      }

      // Simulate the transaction to check for errors
      try {
        console.log('Simulating contract call for registerDid...');

        // Verify we have all required parameters
        if (!did) throw new Error('DID is required');
        if (!document) throw new Error('Document is required');
        if (!publicKey) throw new Error('Public key is required');

        const { request } = await this.publicClient!.simulateContract({
          address: this.contractAddress,
          abi: this.abi,
          functionName: 'registerDid',
          args: [did, document, publicKey],
          account: this.account!,
        });

        // If simulation succeeds, send the transaction
        console.log('Simulation successful, sending transaction...');
        let hash;
        try {
          hash = await this.walletClient!.writeContract(request);
        } catch (writeError) {
          console.error('Error writing contract:', writeError);
          this.handleTransactionError(writeError);
        }

        console.log('Transaction sent, hash:', hash);

        // Wait for the transaction to be mined
        console.log('Waiting for transaction receipt...');
        const receipt = await this.publicClient!.waitForTransactionReceipt({
          hash,
          confirmations: 1,
          timeout: 60_000, // 60 seconds timeout
        });

        console.log('Transaction receipt:', receipt);

        // Format the receipt with events
        return this.formatTransactionReceipt(receipt);
      } catch (txError) {
        console.error('Transaction error in registerDid:', txError);

        // Check for specific contract errors
        if (txError instanceof Error) {
          const errorMsg = txError.message;

          if (errorMsg.includes('DidRegistry__DIDAlreadyRegistered')) {
            throw new Error('This DID is already registered');
          }

          if (errorMsg.includes('DidRegistry__InvalidDID')) {
            throw new Error('The DID format is invalid');
          }

          if (errorMsg.includes('returned no data') || errorMsg.includes('ContractFunctionZeroDataError')) {
            throw new Error('Contract interaction failed. Please verify the contract address and ABI are correct.');
          }

          if (errorMsg.includes('execution reverted')) {
            throw new Error(
              `Contract execution reverted: ${errorMsg.split('execution reverted:')[1]?.trim() || 'Unknown reason'}`
            );
          }
        }

        // Handle other transaction errors
        this.handleTransactionError(txError);
      }
    } catch (error) {
      console.error('Error registering DID:', error);
      throw error;
    }
  }

  /**
   * Updates the DID document for a DID.
   * @param did The DID to update.
   * @param document The new DID document.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async updateDidDocument(did: string, document: string): Promise<Record<string, any>> {
    try {
      // Ensure we have an active connection before proceeding
      await this.ensureWriteConnection();

      // Check if the DID exists and is active
      try {
        const exists = await this.didExists(did);
        if (!exists) {
          throw new Error(`DID ${did} does not exist`);
        }

        const isActive = await this.isDidActive(did);
        if (!isActive) {
          throw new Error(`DID ${did} is not active`);
        }

        const controller = await this.getDidController(did);
        console.log('DID controller:', controller);
        console.log('Current account:', this.account);

        if (controller.toLowerCase() !== this.account!.toLowerCase()) {
          throw new Error(`Only the controller (${controller}) can update this DID`);
        }
      } catch (checkError) {
        console.error('Error checking DID before updating document:', checkError);
        throw checkError;
      }

      // Now try to update the document
      try {
        console.log('Simulating contract call...');

        // Simulate the contract call first to validate it will succeed
        const { request } = await this.publicClient!.simulateContract({
          address: this.contractAddress,
          abi: this.abi,
          functionName: 'updateDidDocument',
          args: [did, document],
          account: this.account!,
        });

        console.log('Simulation successful, sending transaction...');

        // Send the transaction
        let hash;
        try {
          hash = await this.walletClient!.writeContract(request);
        } catch (writeError) {
          this.handleTransactionError(writeError);
        }

        console.log('Transaction sent, hash:', hash);

        // Wait for the transaction to be mined with timeout
        console.log('Waiting for transaction receipt...');
        const receipt = await this.publicClient!.waitForTransactionReceipt({
          hash,
          confirmations: 1,
          timeout: 60_000, // 60 seconds timeout
        });

        console.log('Transaction receipt:', receipt);

        // Format the receipt with events
        return this.formatTransactionReceipt(receipt);
      } catch (txError) {
        // Check for specific contract errors
        if (txError instanceof Error) {
          if (txError.message.includes('DidRegistry__InvalidDID')) {
            throw new Error('The DID format is invalid');
          }
          if (txError.message.includes('DidRegistry__NotAuthorized')) {
            throw new Error('You are not authorized to update this DID');
          }
        }

        // Handle other transaction errors
        this.handleTransactionError(txError);
      }
    } catch (error) {
      console.error('Error updating DID document:', error);
      throw error;
    }
  }

  /**
   * Deactivates a DID.
   * @param did The DID to deactivate.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async deactivateDid(did: string): Promise<Record<string, any>> {
    try {
      // Ensure we have an active connection before proceeding
      await this.ensureWriteConnection();

      console.log('Deactivating DID with Viem:', {
        did,
        account: this.account,
        contractAddress: this.contractAddress,
      });

      // Check if the DID exists and if the caller is the controller
      try {
        const exists = await this.didExists(did);
        if (!exists) {
          throw new Error(`DID ${did} does not exist`);
        }

        const isActive = await this.isDidActive(did);
        if (!isActive) {
          throw new Error(`DID ${did} is already deactivated`);
        }

        const controller = await this.getDidController(did);
        console.log('DID controller:', controller);
        console.log('Current account:', this.account);

        if (controller.toLowerCase() !== this.account!.toLowerCase()) {
          throw new Error(`Only the controller (${controller}) can deactivate this DID`);
        }
      } catch (checkError) {
        console.error('Error checking DID before deactivation:', checkError);
        throw checkError;
      }

      // Now try to deactivate the DID
      try {
        console.log('Simulating contract call...');

        // Simulate the contract call first to validate it will succeed
        const { request } = await this.publicClient!.simulateContract({
          address: this.contractAddress,
          abi: this.abi,
          functionName: 'deactivateDid',
          args: [did],
          account: this.account!,
        });

        console.log('Simulation successful, sending transaction...');

        // Send the transaction
        let hash;
        try {
          hash = await this.walletClient!.writeContract(request);
        } catch (writeError) {
          this.handleTransactionError(writeError);
        }

        console.log('Transaction sent, hash:', hash);

        // Wait for the transaction to be mined
        console.log('Waiting for transaction receipt...');
        const receipt = await this.publicClient!.waitForTransactionReceipt({
          hash,
          confirmations: 1,
          timeout: 60_000, // 60 seconds timeout
        });

        console.log('Transaction receipt:', receipt);

        // Format the receipt with events
        return this.formatTransactionReceipt(receipt);
      } catch (txError) {
        // Check for specific contract errors
        if (txError instanceof Error) {
          if (txError.message.includes('DidRegistry__InvalidDID')) {
            throw new Error('The DID format is invalid');
          }
          if (txError.message.includes('DidRegistry__NotAuthorized')) {
            throw new Error('You are not authorized to deactivate this DID');
          }
          if (txError.message.includes('DidRegistry__DeactivatedDID')) {
            throw new Error('This DID is already deactivated');
          }
        }

        // Handle other transaction errors
        this.handleTransactionError(txError);
      }
    } catch (error) {
      console.error('Error deactivating DID:', error);
      throw error;
    }
  }

  /**
   * Resolves a DID to its document.
   * @param did The DID to resolve.
   * @returns A promise that resolves to the DID document.
   */
  async resolveDid(did: string): Promise<any> {
    try {
      if (!this.publicClient) {
        throw new Error('Public client not available');
      }

      // The contract returns a DIDDocument struct
      const didDocument = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: 'resolveDid',
        args: [did],
      });

      // Return the full DIDDocument struct
      return didDocument;
    } catch (error) {
      console.error('Error resolving DID:', error);
      throw error;
    }
  }

  /**
   * Gets the DID document for a DID.
   * @param did The DID to get the document for.
   * @returns A promise that resolves to the DID document.
   */
  async getDocument(did: string): Promise<string> {
    try {
      if (!this.publicClient) {
        throw new Error('Public client not available');
      }

      const document = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: 'getDocument',
        args: [did],
      });

      return document as string;
    } catch (error) {
      console.error('Error getting DID document:', error);
      throw error;
    }
  }

  /**
   * Checks if a DID exists.
   * @param did The DID to check.
   * @returns A promise that resolves to true if the DID exists, false otherwise.
   */
  async didExists(did: string): Promise<boolean> {
    try {
      if (!this.publicClient) {
        throw new Error('Public client not available');
      }

      // For registration, we need to handle the case where the DID doesn't exist yet
      // In that case, getController might return no data
      try {
        const controller = await this.publicClient.readContract({
          address: this.contractAddress,
          abi: this.abi,
          functionName: 'getController',
          args: [did],
        });

        // If we get here, the DID exists
        return true;
      } catch (error) {
        console.log('Error in didExists:', error);

        // Check for specific error types
        if (error instanceof Error) {
          // If the error contains "returned no data", it likely means the DID doesn't exist
          if (error.message.includes('returned no data') || error.message.includes('ContractFunctionZeroDataError')) {
            return false;
          }

          // If the error contains "DidRegistry__InvalidDID", the DID doesn't exist
          if (error.message.includes('DidRegistry__InvalidDID')) {
            return false;
          }

          // If the error contains "execution reverted", check the reason
          if (error.message.includes('execution reverted')) {
            // If it's because the DID doesn't exist, return false
            if (error.message.includes('DID does not exist') || error.message.includes('Invalid DID')) {
              return false;
            }
          }
        }

        // Re-throw other errors
        throw error;
      }
    } catch (error) {
      console.error('Error checking if DID exists:', error);
      throw error;
    }
  }

  /**
   * Checks if a DID is active.
   * @param did The DID to check.
   * @returns A promise that resolves to true if the DID is active, false otherwise.
   */
  async isDidActive(did: string): Promise<boolean> {
    try {
      if (!this.publicClient) {
        throw new Error('Public client not available');
      }

      const isActive = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: 'isActive',
        args: [did],
      });

      return isActive as boolean;
    } catch (error) {
      console.error('Error checking if DID is active:', error);
      throw error;
    }
  }

  /**
   * Gets the controller of a DID.
   * @param did The DID to get the controller for.
   * @returns A promise that resolves to the controller address.
   */
  async getDidController(did: string): Promise<string> {
    try {
      if (!this.publicClient) {
        throw new Error('Public client not available');
      }

      const controller = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: 'getController',
        args: [did],
      });

      return controller as string;
    } catch (error) {
      console.error('Error getting DID controller:', error);
      throw error;
    }
  }

  /**
   * Gets the DID for an address.
   * @param address The address to get the DID for.
   * @returns A promise that resolves to the DID.
   */
  async getDidForAddress(address: string): Promise<string> {
    try {
      if (!this.publicClient) {
        throw new Error('Public client not available');
      }

      const did = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: 'getDidByAddress',
        args: [address],
      });

      return did as string;
    } catch (error) {
      console.error('Error getting DID for address:', error);
      throw error;
    }
  }

  /**
   * Updates the public key for a DID.
   * @param did The DID to update.
   * @param newPublicKey The new public key.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async updateDidPublicKey(did: string, newPublicKey: string): Promise<Record<string, any>> {
    try {
      // Ensure we have an active connection before proceeding
      await this.ensureWriteConnection();

      console.log('Updating DID public key with Viem:', {
        did,
        newPublicKey,
        account: this.account,
        contractAddress: this.contractAddress,
      });

      // Check if the DID exists and if the caller is the controller
      try {
        const exists = await this.didExists(did);
        if (!exists) {
          throw new Error(`DID ${did} does not exist`);
        }

        const isActive = await this.isDidActive(did);
        if (!isActive) {
          throw new Error(`DID ${did} is not active`);
        }

        const controller = await this.getDidController(did);
        console.log('DID controller:', controller);
        console.log('Current account:', this.account);

        if (controller.toLowerCase() !== this.account!.toLowerCase()) {
          throw new Error(`Only the controller (${controller}) can update this DID's public key`);
        }
      } catch (checkError) {
        console.error('Error checking DID before updating public key:', checkError);
        throw checkError;
      }

      // Now try to update the public key
      try {
        console.log('Simulating contract call...');

        // Simulate the contract call first to validate it will succeed
        const { request } = await this.publicClient!.simulateContract({
          address: this.contractAddress,
          abi: this.abi,
          functionName: 'updateDidPublicKey',
          args: [did, newPublicKey],
          account: this.account!,
        });

        console.log('Simulation successful, sending transaction...');

        // Send the transaction
        let hash;
        try {
          hash = await this.walletClient!.writeContract(request);
        } catch (writeError) {
          this.handleTransactionError(writeError);
        }

        console.log('Transaction sent, hash:', hash);

        // Wait for the transaction to be mined
        console.log('Waiting for transaction receipt...');
        const receipt = await this.publicClient!.waitForTransactionReceipt({
          hash,
          confirmations: 1,
          timeout: 60_000, // 60 seconds timeout
        });

        console.log('Transaction receipt:', receipt);

        // Format the receipt with events
        return this.formatTransactionReceipt(receipt);
      } catch (txError) {
        // Check for specific contract errors
        if (txError instanceof Error) {
          if (txError.message.includes('DidRegistry__InvalidDID')) {
            throw new Error('The DID format is invalid');
          }
          if (txError.message.includes('DidRegistry__NotAuthorized')) {
            throw new Error('You are not authorized to update this DID');
          }
          if (txError.message.includes('DidRegistry__DeactivatedDID')) {
            throw new Error('This DID has been deactivated and cannot be updated');
          }
        }

        // Handle other transaction errors
        this.handleTransactionError(txError);
      }
    } catch (error) {
      console.error('Error updating DID public key:', error);
      throw error;
    }
  }

  /**
   * Converts an address to a DID.
   * @param address The address to convert.
   * @returns A promise that resolves to the DID.
   */
  async addressToDID(address: string): Promise<string> {
    try {
      if (!this.publicClient) {
        throw new Error('Public client not available');
      }

      const did = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: 'addressToDID',
        args: [address],
      });

      return did as string;
    } catch (error) {
      console.error('Error converting address to DID:', error);
      throw error;
    }
  }

  /**
   * Verifies a signature.
   * @param address The address to verify.
   * @param message The message to verify.
   * @param signature The signature to verify.
   * @returns A promise that resolves to true if the signature is valid, false otherwise.
   */
  async verifySignature(address: string, message: string, signature: string): Promise<boolean> {
    try {
      if (!this.publicClient) {
        throw new Error('Public client not available');
      }

      const isValid = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: 'verifySignature',
        args: [address, message, signature],
      });

      return isValid as boolean;
    } catch (error) {
      console.error('Error verifying signature:', error);
      throw error;
    }
  }
}
