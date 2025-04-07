import { Contract, ContractRunner } from 'ethers';
import { ContractType } from '@/helpers/ContractHandlerFactory';
import { ServiceBase } from './ServiceBase';

/**
 * Service class for interacting with the DID Registry smart contract.
 * This class provides methods to manage DIDs (Decentralized Identifiers) on the blockchain.
 */
export class DidRegistryService extends ServiceBase {
  /**
   * Creates a new instance of the DidRegistryService class.
   * @param contractAddress The address of the DID Registry contract.
   * @param abi The ABI of the DID Registry contract.
   * @param signerOrContract The signer to use or a contract instance.
   */
  constructor(contractAddress: string, abi: any, signerOrContract?: ContractRunner | Contract) {
    super(contractAddress, abi, signerOrContract);
  }

  /**
   * Initialize the contract type
   */
  protected initializeContractType(): void {
    this.contractType = ContractType.DID_REGISTRY;
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
      const tx = await this.contract.registerDid(did, document, publicKey);
      const receipt = await tx.wait();

      // Format the receipt with events
      return this.formatTransactionReceipt(receipt);
    } catch (error) {
      throw this.errorHandler.handleError(error);
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
      const tx = await this.contract.updateDidDocument(did, document);
      const receipt = await tx.wait();

      // Format the receipt with events
      return this.formatTransactionReceipt(receipt);
    } catch (error) {
      throw this.errorHandler.handleError(error);
    }
  }

  /**
   * Deactivates a DID.
   * @param did The DID to deactivate.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async deactivateDid(did: string): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.deactivateDid(did);
      const receipt = await tx.wait();

      // Format the receipt with events
      return this.formatTransactionReceipt(receipt);
    } catch (error) {
      throw this.errorHandler.handleError(error);
    }
  }

  async resolveDid(did: string): Promise<string> {
    try {
      return await this.contract.resolveDid(did);
    } catch (error) {
      throw this.errorHandler.handleError(error);
    }
  }

  /**
   * Gets the DID document for a DID.
   * @param did The DID to get the document for.
   * @returns A promise that resolves to the DID document.
   */
  async getDocument(did: string): Promise<string> {
    try {
      return await this.contract.getDocument(did);
    } catch (error) {
      throw this.errorHandler.handleError(error);
    }
  }

  /**
   * Checks if a DID exists.
   * @param did The DID to check.
   * @returns A promise that resolves to a boolean indicating if the DID exists.
   */
  async didExists(did: string): Promise<boolean> {
    try {
      return await this.contract.didExists(did);
    } catch (error) {
      // Handle the case where the error is due to the DID not existing
      if (this.errorHandler.isErrorType(error, 'DidRegistry__DidNotFound')) {
        return false;
      }
      throw this.errorHandler.handleError(error);
    }
  }

  /**
   * Checks if a DID is active.
   * @param did The DID to check.
   * @returns A promise that resolves to a boolean indicating if the DID is active.
   */
  async isDidActive(did: string): Promise<boolean> {
    try {
      return await this.contract.isActive(did);
    } catch (error) {
      throw this.errorHandler.handleError(error);
    }
  }

  /**
   * Gets the controller address for a DID.
   * @param did The DID to get the controller for.
   * @returns A promise that resolves to the controller address.
   */
  async getDidController(did: string): Promise<string> {
    try {
      return await this.contract.getController(did);
    } catch (error) {
      throw this.errorHandler.handleError(error);
    }
  }

  /**
   * Transfers ownership of the contract to a new address.
   * @param newOwner The address to transfer ownership to.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async transferOwnership(newOwner: string): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.transferOwnership(newOwner);
      const receipt = await tx.wait();

      // Format the receipt with events
      return this.formatTransactionReceipt(receipt);
    } catch (error) {
      throw this.errorHandler.handleError(error);
    }
  }

  /**
   * Renounces ownership of the contract.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async renounceOwnership(): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.renounceOwnership();
      const receipt = await tx.wait();

      // Format the receipt with events
      return this.formatTransactionReceipt(receipt);
    } catch (error) {
      throw this.errorHandler.handleError(error);
    }
  }

  /**
   * Gets the DID for an address.
   * @param address The address to get the DID for.
   * @returns A promise that resolves to the DID.
   */
  async getDidForAddress(address: string): Promise<string> {
    try {
      return await this.contract.getDidForAddress(address);
    } catch (error) {
      // Handle the case where the error is due to the address not having a DID
      if (this.errorHandler.isErrorType(error, 'DidRegistry__DidNotFound')) {
        return '';
      }
      throw this.errorHandler.handleError(error);
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
      // Log the transaction details for debugging
      console.log('Updating public key for DID:', did);
      console.log('New public key:', newPublicKey);

      // Debug contract and signer information
      const contractAddress = await this.contract.getAddress();
      console.log('Contract address:', contractAddress);

      // Check if the contract has a signer
      if (!this.contract.runner) {
        console.error('Contract does not have a runner/signer');
        throw new Error('Contract does not have a runner/signer');
      }

      // Get network information
      let isLocalNetwork = false;
      let networkChainId = 0;

      try {
        const provider = this.contract.runner.provider;
        if (provider) {
          const network = await provider.getNetwork();
          networkChainId = Number(network.chainId);
          console.log('Network:', {
            chainId: network.chainId,
            name: network.name,
          });

          // Check if we're on a local network
          if (Number(network.chainId) === 31337) {
            console.log('Using Hardhat local network');
            isLocalNetwork = true;
          } else if (Number(network.chainId) === 1337) {
            console.log('Using Ganache local network');
            isLocalNetwork = true;
          }
        }
      } catch (networkError) {
        console.error('Error getting network information:', networkError);
      }

      // Try to get the signer address
      let signerAddress = '';
      try {
        const signer = this.contract.runner;
        if (signer && typeof signer === 'object' && 'getAddress' in signer && typeof signer.getAddress === 'function') {
          signerAddress = await (signer as { getAddress(): Promise<string> }).getAddress();
          console.log('Signer address:', signerAddress);

          // Check if the signer is the controller of the DID
          try {
            const didController = await this.contract.getController(did);
            console.log('DID controller:', didController);
            console.log('Is signer the controller?', signerAddress.toLowerCase() === didController.toLowerCase());

            // If not the controller, this will likely fail
            if (signerAddress.toLowerCase() !== didController.toLowerCase()) {
              console.warn('WARNING: Signer is not the controller of the DID. This transaction will likely fail.');
            }
          } catch (controllerError) {
            console.error('Error checking DID controller:', controllerError);
          }
        } else {
          console.error('Signer does not have getAddress method');
        }
      } catch (signerError) {
        console.error('Error getting signer information:', signerError);
      }

      let tx;
      let receipt;

      // Use different approaches based on the network
      if (isLocalNetwork && networkChainId === 31337) {
        // For Hardhat network, use a more direct approach
        console.log('Using special handling for Hardhat network...');

        // Get the function fragment for updateDidPublicKey
        const functionFragment = this.contract.interface.getFunction('updateDidPublicKey');

        if (!functionFragment) {
          throw new Error('Function updateDidPublicKey not found in contract interface');
        }

        // Encode the function data
        const data = this.contract.interface.encodeFunctionData(functionFragment, [did, newPublicKey]);

        // Get the provider
        const provider = this.contract.runner.provider;

        if (!provider) {
          throw new Error('Provider not available');
        }

        // Get the signer
        const signer = this.contract.runner;
        if (!signer || !('sendTransaction' in signer)) {
          throw new Error('Signer not available or does not support sendTransaction');
        }

        // Create the transaction request with explicit chainId
        const txRequest = {
          to: contractAddress,
          from: signerAddress,
          data: data,
          gasLimit: 500000, // Higher gas limit for local networks
          chainId: 1337, // Explicitly set chainId to 1337 for local networks
        };

        console.log('Sending transaction with custom request:', txRequest);

        // Send the transaction
        tx = await (signer as any).sendTransaction(txRequest);
        console.log('Transaction sent:', tx.hash);

        // Wait for the transaction
        receipt = await tx.wait();
        console.log('Transaction confirmed:', receipt);
      } else {
        // For other networks, use the standard approach
        console.log('Sending transaction with standard method...');
        tx = await this.contract.updateDidPublicKey(did, newPublicKey, {
          gasLimit: 300000,
        });

        console.log('Transaction sent:', tx.hash);
        receipt = await tx.wait();
        console.log('Transaction confirmed:', receipt);
      }

      // Format the receipt with events
      return this.formatTransactionReceipt(receipt);
    } catch (error) {
      console.error('Error in updateDidPublicKey:', error);

      // Check if this is a controller authorization error
      if (error && typeof error === 'object' && 'reason' in error) {
        const errorReason = (error as any).reason;
        if (errorReason && errorReason.includes('Unauthorized')) {
          throw new Error('You are not authorized to update this DID. Only the controller can update it.');
        }
      }

      // Check for JSON-RPC errors
      if (error && typeof error === 'object' && 'code' in error) {
        const errorCode = (error as any).code;
        const errorMessage = (error as any).message || 'Unknown error';
        console.error(`JSON-RPC error (${errorCode}): ${errorMessage}`);

        // Check for specific error codes
        if (errorCode === -32603) {
          console.error('Internal JSON-RPC error. This might be due to:');
          console.error('1. Insufficient gas');
          console.error('2. Contract execution error');
          console.error('3. Network issues');
          console.error('4. The contract might not be deployed on this network');

          // Try to get more details from the error object
          if (error && typeof error === 'object' && 'error' in error) {
            const innerError = (error as any).error;
            console.error('Inner error:', innerError);
          }
        }
      }

      throw this.errorHandler.handleError(error);
    }
  }

  /**
   * Gets the DID for an address.
   * @param address The address to get the DID for.
   * @returns A promise that resolves to the DID.
   */
  async addressToDID(address: string): Promise<string> {
    try {
      return await this.contract.addressToDID(address);
    } catch (error) {
      throw this.errorHandler.handleError(error);
    }
  }

  /**
   * Verifies a signature.
   * @param address The address that signed the message.
   * @param message The message that was signed.
   * @param signature The signature to verify.
   * @returns A promise that resolves to a boolean indicating if the signature is valid.
   */
  async verifySignature(address: string, message: string, signature: string): Promise<boolean> {
    try {
      const recoveredAddress = await this.contract.verifySignature(message, signature);
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      throw this.errorHandler.handleError(error);
    }
  }

  /**
   * Gets the contract instance.
   * @returns The contract instance.
   */
  getContract() {
    return this.contract;
  }

  /**
   * Gets the contract address.
   * @returns The contract address.
   */
  async getContractAddress(): Promise<string> {
    return await this.contract.getAddress();
  }
}
