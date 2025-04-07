import { Contract, ethers } from 'ethers';

import { ContractHandlerFactory, ContractType } from '../../helpers/ContractHandlerFactory';
import { DidRegistryErrorHandler } from '../../helpers/error-handler/DidRegistryErrorHandler';
import { DidRegistryEventParser } from '../../helpers/event-parser/DidRegistryEventParser';
import { signer } from '../../helpers/get-signer';

/**
 * Service class for interacting with the DID Registry smart contract.
 * This class provides methods to manage DIDs (Decentralized Identifiers) on the blockchain.
 */
export class DidRegistryService {
  private contract: Contract;
  private errorHandler: DidRegistryErrorHandler;
  private eventParser: DidRegistryEventParser;

  /**
   * Creates a new instance of the DidRegistryService.
   * @param contractAddress The address of the DID Registry contract.
   * @param abi The ABI of the DID Registry contract.
   */
  constructor(contractAddress: string, abi: any) {
    this.contract = new Contract(contractAddress, abi, signer);

    // Initialize error handler and event parser
    this.errorHandler = ContractHandlerFactory.createErrorHandler(
      ContractType.DID_REGISTRY,
      this.contract
    ) as DidRegistryErrorHandler;

    this.eventParser = ContractHandlerFactory.createEventParser(
      ContractType.DID_REGISTRY,
      this.contract
    ) as DidRegistryEventParser;
  }

  /**
   * Creates a new DID for a user.
   * @param did The DID to create.
   * @param document The DID document to associate with the DID.
   * @param publicKey The public key associated with the DID.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async registerDid(
    did: string,
    document: string,
    publicKey: string
  ): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.registerDid(did, document, publicKey);
      const receipt = await tx.wait();

      // Format the receipt with events
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  // Alias for backward compatibility
  async createDid(did: string, publicKey: string, document: string): Promise<Record<string, any>> {
    return this.registerDid(did, document, publicKey);
  }

  /**
   * Updates a DID document.
   * @param did The DID to update.
   * @param document The new DID document.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async updateDidDocument(did: string, document: string): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.updateDidDocument(did, document);
      const receipt = await tx.wait();

      // Format the receipt with events
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
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
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Retrieves a DID document.
   * @param did The DID to retrieve the document for.
   * @returns A promise that resolves to the DID document.
   */
  async getDocument(did: string): Promise<string> {
    try {
      return await this.contract.getDocument(did);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  // Alias for backward compatibility
  async getDidDocument(did: string): Promise<string> {
    return this.getDocument(did);
  }

  /**
   * Checks if a DID exists.
   * @param did The DID to check.
   * @returns A promise that resolves to a boolean indicating if the DID exists.
   */
  async didExists(did: string): Promise<boolean> {
    try {
      // Since there's no direct method in the contract, we'll try to resolve the DID
      // and check if it returns a valid document
      const document = await this.contract.resolveDid(did);
      return document && document.subject !== '0x0000000000000000000000000000000000000000';
    } catch (error) {
      if (this.errorHandler.isErrorType(error, 'DidRegistry__InvalidDID')) {
        return false;
      }
      throw new Error(this.errorHandler.handleError(error));
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
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets the controller of a DID.
   * @param did The DID to check.
   * @returns A promise that resolves to the controller address.
   */
  async getDidController(did: string): Promise<string> {
    try {
      return await this.contract.getController(did);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Transfers ownership of the contract to a new owner.
   * @param newOwner The address of the new owner.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async transferOwnership(newOwner: string): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.transferOwnership(newOwner);
      const receipt = await tx.wait();

      // Format the receipt with events
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
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
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets the public key for a DID.
   * @param did The DID to get the public key for.
   * @returns A promise that resolves to the public key.
   */
  async getPublicKeyForDid(did: string): Promise<string> {
    try {
      return await this.contract.getPublicKeyForDid(did);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Checks if a specific error occurred
   * @param error The error to check
   * @param errorName The name of the error to check for
   * @returns True if the error matches the specified name
   */
  isErrorType(error: any, errorName: string): boolean {
    return this.errorHandler.isErrorType(error, errorName);
  }

  /**
   * Listens for events from the contract
   * @param eventName The name of the event to listen for
   * @param filter Optional filter for the event
   * @param callback Callback function to handle the parsed event
   * @returns A function to remove the event listener
   */
  listenForEvents(eventName: string, filter: any = {}, callback: (event: any) => void): () => void {
    return this.eventParser.listenForEvents(eventName, filter, callback);
  }

  /**
   * Gets the DID document for a given address.
   *
   * @param address - The Ethereum address to get the DID for
   * @returns The DID document if found, null otherwise
   */
  async getDidForAddress(address: string): Promise<any> {
    try {
      // Normalize the address to lowercase for consistency
      const normalizedAddress = address.toLowerCase();

      // Get the DID string for this address
      try {
        const did = await this.contract.addressToDID(normalizedAddress);

        // If no DID is found, return null
        if (
          !did ||
          did === '' ||
          did === '0x' ||
          did === '0x0000000000000000000000000000000000000000'
        ) {
          return null;
        }

        // Get the full DID document
        const didDocument = await this.contract.resolveDid(did);

        // Return the DID document with the DID string
        return {
          did,
          ...didDocument,
        };
      } catch (contractError) {
        // If there's a decoding error or the address doesn't have a DID, return null
        if (
          this.errorHandler.isErrorType(contractError, 'AddressHasNoDID') ||
          (contractError instanceof Error &&
            (contractError.message.includes('could not decode result data') ||
              contractError.message.includes('BAD_DATA')))
        ) {
          return null;
        }
        throw contractError;
      }
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Updates the public key associated with a DID.
   * @param did The DID to update.
   * @param newPublicKey The new public key to associate with the DID.
   * @returns A promise that resolves to the formatted transaction receipt.
   */
  async updateDidPublicKey(did: string, newPublicKey: string): Promise<Record<string, any>> {
    try {
      const tx = await this.contract.updateDidPublicKey(did, newPublicKey);
      const receipt = await tx.wait();

      // Format the receipt with events
      return this.eventParser.formatTransactionReceipt(receipt);
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Gets the DID associated with an Ethereum address.
   * @param address The Ethereum address to query.
   * @returns A promise that resolves to the DID string, or null if no DID is found.
   */
  async addressToDID(address: string): Promise<string | null> {
    try {
      // Normalize the address to lowercase for consistency
      const normalizedAddress = address.toLowerCase();

      try {
        // Call the contract method to get the DID for this address
        const did = await this.contract.addressToDID(normalizedAddress);

        // If the returned DID is empty or the zero address, return null
        if (
          !did ||
          did === '' ||
          did === '0x' ||
          did === '0x0000000000000000000000000000000000000000'
        ) {
          return null;
        }

        return did;
      } catch (contractError) {
        // If there's a decoding error or the address doesn't have a DID, return null
        if (
          this.errorHandler.isErrorType(contractError, 'AddressHasNoDID') ||
          (contractError instanceof Error &&
            (contractError.message.includes('could not decode result data') ||
              contractError.message.includes('BAD_DATA')))
        ) {
          return null;
        }
        throw contractError;
      }
    } catch (error) {
      // If the error is because the address doesn't have a DID, return null
      if (this.errorHandler.isErrorType(error, 'AddressHasNoDID')) {
        return null;
      }

      throw new Error(this.errorHandler.handleError(error));
    }
  }

  /**
   * Verifies a signature against an address and message.
   * @param address The Ethereum address that supposedly signed the message.
   * @param message The message that was signed.
   * @param signature The signature to verify.
   * @returns A promise that resolves to a boolean indicating if the signature is valid.
   */
  async verifySignature(address: string, message: string, signature: string): Promise<boolean> {
    try {
      // Since there's no direct method in the contract, we'll use ethers.js to verify
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      throw new Error(this.errorHandler.handleError(error));
    }
  }
}
