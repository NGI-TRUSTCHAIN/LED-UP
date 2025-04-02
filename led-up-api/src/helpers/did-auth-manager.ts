/**
 * Blockchain manager for interacting with Ethereum blockchain.
 */
import { ethers } from 'ethers';

import { BaseBlockchainManager } from './base-blockchain-manager';
import { UserRole } from '../types/auth-types';

/**
 * Blockchain manager class for interacting with Ethereum blockchain
 */
export class DidAuthManager extends BaseBlockchainManager {
  // Role constants matching the smart contract
  private readonly PRODUCER_ROLE = ethers.keccak256(ethers.toUtf8Bytes('PRODUCER'));
  private readonly CONSUMER_ROLE = ethers.keccak256(ethers.toUtf8Bytes('CONSUMER'));
  private readonly PROVIDER_ROLE = ethers.keccak256(ethers.toUtf8Bytes('PROVIDER'));

  /**
   * Constructor
   */
  constructor() {
    super();
  }

  /**
   * Verify a signature
   *
   * @param address - The Ethereum address that signed the message
   * @param message - The message that was signed
   * @param signature - The signature to verify
   * @returns True if the signature is valid, false otherwise
   */
  public async verifySignature(
    address: string,
    message: string,
    signature: string
  ): Promise<boolean> {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);

      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      console.error('Error verifying signature:', error);
      return false;
    }
  }

  /**
   * Get the DID for an address
   *
   * @param address - The Ethereum address to get the DID for
   * @returns The DID if found, null otherwise
   */
  public async getDidForAddress(address: string): Promise<string | null> {
    try {
      const didRegistryContract = this.ensureContractInitialized(
        this.didRegistryContract,
        'DID Registry Contract'
      );
      const did = await didRegistryContract.addressToDID(address);

      return did || null;
    } catch (error) {
      console.error('Error getting DID for address:', error);
      return null;
    }
  }

  /**
   * Check if a DID is active
   *
   * @param did - The DID to check
   * @returns True if the DID is active, false otherwise
   */
  public async isDidActive(did: string): Promise<boolean> {
    try {
      const didRegistryContract = this.ensureContractInitialized(
        this.didRegistryContract,
        'DID Registry Contract'
      );
      const isActive = await didRegistryContract.isActive(did);
      return isActive;
    } catch (error) {
      console.error('Error checking if DID is active:', error);
      return false;
    }
  }

  /**
   * Get the role for an address
   *
   * @param address - The Ethereum address to get the role for
   * @returns The role if found, null otherwise
   */
  public async getRoleForAddress(address: string): Promise<UserRole | null> {
    try {
      const didAuthContract = this.ensureContractInitialized(
        this.didAuthContract,
        'DID Auth Contract'
      );

      // Check if the address has any of the roles
      const isProducer = await this.isProducer(address);
      if (isProducer) {
        return UserRole.PRODUCER;
      }

      const isConsumer = await didAuthContract.hasRole(this.CONSUMER_ROLE, address);
      if (isConsumer) {
        return UserRole.CONSUMER;
      }

      const isServiceProvider = await didAuthContract.hasRole(this.PROVIDER_ROLE, address);
      if (isServiceProvider) {
        return UserRole.PROVIDER;
      }

      return null;
    } catch (error) {
      console.error('Error getting role for address:', error);
      return null;
    }
  }

  /**
   * Register a DID
   *
   * @param did - The DID to register
   * @param document - The DID document
   * @param publicKey - The public key
   * @returns True if the DID was registered, false otherwise
   */
  public async registerDid(did: string, document: string, publicKey: string): Promise<boolean> {
    try {
      const didRegistryContract = this.ensureContractInitialized(
        this.didRegistryContract,
        'DID Registry Contract'
      );
      const tx = await didRegistryContract.registerDid(did, document, publicKey);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error registering DID:', error);
      return false;
    }
  }

  /**
   * Update a DID document
   *
   * @param did - The DID to update
   * @param document - The new DID document
   * @returns True if the DID document was updated successfully, false otherwise
   */
  public async updateDidDocument(did: string, document: string): Promise<boolean> {
    try {
      // Call the DID registry contract to update the DID document
      const tx = await this.didRegistryContract.updateDidDocument(did, document);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error updating DID document:', error);
      return false;
    }
  }

  /**
   * Update a DID public key
   *
   * @param did - The DID to update
   * @param publicKey - The new public key
   * @returns True if the DID public key was updated successfully, false otherwise
   */
  public async updateDidPublicKey(did: string, publicKey: string): Promise<boolean> {
    try {
      // Call the DID registry contract to update the DID public key
      const tx = await this.didRegistryContract.updateDidPublicKey(did, publicKey);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error updating DID public key:', error);
      return false;
    }
  }

  /**
   * Deactivate a DID
   *
   * @param did - The DID to deactivate
   * @returns True if the DID was deactivated successfully, false otherwise
   */
  public async deactivateDid(did: string): Promise<boolean> {
    try {
      // Call the DID registry contract to deactivate the DID
      const tx = await this.didRegistryContract.deactivateDid(did);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error deactivating DID:', error);
      return false;
    }
  }

  /**
   * Resolve a DID
   *
   * @param did - The DID to resolve
   * @returns The DID document if found, null otherwise
   */
  public async resolveDid(did: string): Promise<any | null> {
    try {
      // Call the DID registry contract to resolve the DID
      const didDocument = await this.didRegistryContract.resolveDid(did);
      return didDocument;
    } catch (error) {
      console.error('Error resolving DID:', error);
      return null;
    }
  }

  /**
   * Authenticate a DID
   *
   * @param did - The DID to authenticate
   * @param role - The role to authenticate for
   * @returns True if the DID is authenticated for the role, false otherwise
   */
  public async authenticateDid(did: string, role: UserRole): Promise<boolean> {
    try {
      // Convert the role to the corresponding bytes32 value
      let roleBytes;
      switch (role) {
        case UserRole.PRODUCER:
          roleBytes = this.PRODUCER_ROLE;
          break;
        case UserRole.CONSUMER:
          roleBytes = this.CONSUMER_ROLE;
          break;
        case UserRole.PROVIDER:
          roleBytes = this.PROVIDER_ROLE;
          break;
        default:
          return false;
      }

      // Call the DID auth contract to authenticate the DID
      return await this.didAuthContract.authenticate(did, roleBytes);
    } catch (error) {
      console.error('Error authenticating DID:', error);
      return false;
    }
  }

  /**
   * Verify a credential for a DID
   *
   * @param did - The DID to verify the credential for
   * @param credentialType - The type of credential to verify
   * @param credentialId - The ID of the credential to verify
   * @returns True if the credential is valid, false otherwise
   */
  public async verifyCredential(
    did: string,
    credentialType: string,
    credentialId: string
  ): Promise<boolean> {
    try {
      // Call the DID auth contract to verify the credential
      return await this.didAuthContract.verifyCredentialForAction(
        did,
        credentialType,
        ethers.keccak256(ethers.toUtf8Bytes(credentialId))
      );
    } catch (error) {
      console.error('Error verifying credential:', error);
      return false;
    }
  }

  /**
   * Check if an address has the producer role
   *
   * @param address - The Ethereum address to check
   * @returns True if the address has the producer role, false otherwise
   */
  private async isProducer(address: string): Promise<boolean> {
    try {
      const didAuthContract = this.ensureContractInitialized(
        this.didAuthContract,
        'DID Auth Contract'
      );
      return await didAuthContract.hasRole(this.PRODUCER_ROLE, address);
    } catch (error) {
      console.error('Error checking if address is producer:', error);
      return false;
    }
  }
}
