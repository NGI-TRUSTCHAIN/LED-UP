'use client';

import { SymmetricCryptoService, SymmetricAlgorithm } from '@/services/SymmetricCryptoService';
import { IPFSService } from '@/services/IPFSService';
import { HashingService, HashAlgorithm, HashEncoding } from '@/services/HashingService';
import { ConsentStatus, RecordMetadata, RecordStatus, ProducerRegistrationParam } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { WalletClient, toHex } from 'viem';

/**
 * Service for handling FHIR record registration, including data processing,
 * encryption, IPFS storage, and blockchain integration.
 */
export class RecordRegistrationService {
  private symmetricCryptoService: SymmetricCryptoService;
  private ipfsService: IPFSService;
  private hashingService: HashingService;

  constructor() {
    this.symmetricCryptoService = new SymmetricCryptoService(SymmetricAlgorithm.AES_256_GCM);
    this.ipfsService = new IPFSService();
    this.hashingService = new HashingService(HashAlgorithm.SHA256, HashEncoding.HEX);
  }

  /**
   * Generates a unique record ID
   * @returns A unique record ID
   */
  public generateRecordId(): string {
    return `record-${uuidv4()}`;
  }

  /**
   * Signs data with the wallet
   * @param walletClient The wallet client
   * @param account The account address
   * @param data The data to sign
   * @returns The signature
   */
  public async signData(walletClient: WalletClient, account: string, data: any): Promise<string> {
    try {
      // Convert the data to a JSON string
      const message = JSON.stringify(data);

      // Create a hash of the message using the hashing service
      const messageHash = await this.hashingService.hashHex(message);

      // Convert account to the expected format
      const formattedAccount = account as `0x${string}`;

      // Sign the hash with the wallet
      const signature = await walletClient.signMessage({
        account: formattedAccount,
        message: { raw: toHex(messageHash) },
      });

      return signature;
    } catch (error) {
      console.error('Error signing data:', error);
      throw new Error(`Failed to sign data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Encrypts FHIR resource data
   * @param data The FHIR resource data to encrypt
   * @param encryptionKey The encryption key to use (if not provided, a new one will be generated)
   * @returns The encrypted data and the encryption key used
   */
  public async encryptData(data: any, encryptionKey?: string): Promise<{ encryptedData: string; key: string }> {
    try {
      // Generate a new encryption key if one wasn't provided
      const key = encryptionKey || this.symmetricCryptoService.generateKeyAsHex();

      // Convert the data to a JSON string
      const jsonData = JSON.stringify(data);

      // Encrypt the data
      const encryptedData = this.symmetricCryptoService.encryptToString(
        jsonData,
        this.symmetricCryptoService.toCipherKey(key),
        SymmetricAlgorithm.AES_256_GCM
      );

      return { encryptedData, key };
    } catch (error) {
      console.error('Error encrypting data:', error);
      throw new Error(`Failed to encrypt data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Uploads encrypted data to IPFS
   * @param encryptedData The encrypted data to upload
   * @param resourceType The type of FHIR resource
   * @returns The IPFS response containing the CID
   */
  public async uploadToIPFS(encryptedData: string, resourceType: string): Promise<any> {
    try {
      console.log(`Uploading encrypted ${resourceType} data to IPFS...`);

      const response = await this.ipfsService.uploadToIPFS(encryptedData, resourceType);

      // Validate the response to ensure it has the expected structure
      if (!response || !response.cid) {
        console.error('Invalid IPFS response:', response);
        throw new Error('Invalid response from IPFS service: Missing CID');
      }

      console.log(`Successfully uploaded to IPFS with CID: ${response.cid}`);
      return response;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw new Error(`Failed to upload to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculates the hash of encrypted data
   * @param encryptedData The encrypted data to hash
   * @returns The hash of the encrypted data
   */
  public async calculateHash(encryptedData: string): Promise<string> {
    try {
      // Calculate the hash using the hashing service
      const hash = await this.hashingService.hashHex(encryptedData);

      // Ensure the hash is properly formatted for the contract
      // The contract expects a bytes32 value, which is a hex string of 32 bytes (64 hex characters)

      // Remove the '0x' prefix if it exists
      const cleanHash = hash.startsWith('0x') ? hash.slice(2) : hash;

      // Ensure the hash is exactly 32 bytes (64 hex characters)
      // If it's longer, truncate it; if shorter, pad with zeros
      const formattedHash = cleanHash.length > 64 ? cleanHash.slice(0, 64) : cleanHash.padStart(64, '0');

      // Return the hash with '0x' prefix to indicate it's a hex value
      return `0x${formattedHash}`;
    } catch (error) {
      console.error('Error calculating hash:', error);
      throw new Error(`Failed to calculate hash: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Prepares record metadata for blockchain registration
   * @param cid The IPFS CID
   * @param hash The hash of the encrypted data
   * @param url Optional URL for the record
   * @returns The record metadata
   */
  public prepareRecordMetadata(cid: string, hash: string, url: string = ''): RecordMetadata {
    // Convert the hash string to a bytes32 format
    // The contract expects a bytes32 value, which is a hex string of 32 bytes (64 hex characters)

    // Remove the '0x' prefix if it exists
    const cleanHash = hash.startsWith('0x') ? hash.slice(2) : hash;

    // Ensure the hash is exactly 32 bytes (64 hex characters)
    // If it's longer, truncate it; if shorter, pad with zeros
    const formattedHash = cleanHash.length > 64 ? cleanHash.slice(0, 64) : cleanHash.padStart(64, '0');

    // Add the '0x' prefix to indicate it's a hex value
    const bytes32Hash = `0x${formattedHash}`;

    return {
      cid,
      url: url || `ipfs://${cid}`,
      hash: bytes32Hash,
    };
  }

  /**
   * Prepares the parameters for producer record registration
   * @param ownerDid The DID of the record owner
   * @param recordId The unique record ID
   * @param producer The producer address
   * @param signature The digital signature
   * @param resourceType The type of FHIR resource
   * @param metadata The record metadata
   * @param status The record status (default: ACTIVE)
   * @param consent The consent status (default: PENDING)
   * @param updaterDid Optional DID of the updater
   * @returns The producer registration parameters
   */
  public prepareRegistrationParams(
    ownerDid: string,
    recordId: string,
    producer: string,
    signature: string,
    resourceType: string,
    metadata: RecordMetadata,
    status: RecordStatus = RecordStatus.ACTIVE,
    consent: ConsentStatus = ConsentStatus.PENDING,
    updaterDid?: string
  ): ProducerRegistrationParam {
    return {
      ownerDid,
      recordId,
      producer,
      signature,
      resourceType,
      metadata,
      status,
      consent,
      updaterDid,
    };
  }

  /**
   * Processes a FHIR resource for registration
   * @param data The FHIR resource data
   * @param resourceType The type of FHIR resource
   * @param ownerDid The DID of the owner
   * @param producer The address of the producer
   * @param walletClient The wallet client for signing (optional)
   * @param encryptionKey The encryption key to use (optional)
   * @returns The registration parameters and encryption key
   */
  public async processResourceForRegistration(
    data: any,
    resourceType: string,
    ownerDid: string,
    producer: string,
    walletClient?: WalletClient,
    encryptionKey?: string
  ): Promise<{ registrationParams: ProducerRegistrationParam; encryptionKey: string }> {
    try {
      console.log(`Processing ${resourceType} resource for registration...`);

      // Generate a record ID
      const recordId = this.generateRecordId();
      console.log(`Generated record ID: ${recordId}`);

      // Encrypt the data
      console.log('Encrypting data...');
      const { encryptedData, key } = await this.encryptData(data, encryptionKey);
      console.log('Data encrypted successfully');

      // Upload to IPFS
      console.log('Uploading encrypted data to IPFS...');
      const ipfsResponse = await this.uploadToIPFS(encryptedData, resourceType);
      console.log('IPFS upload successful:', ipfsResponse);

      if (!ipfsResponse || !ipfsResponse.cid) {
        throw new Error('Invalid IPFS response: Missing CID');
      }

      const cid = ipfsResponse.cid;
      console.log(`IPFS CID: ${cid}`);

      // Calculate hash
      console.log('Calculating hash...');
      const hash = await this.calculateHash(JSON.stringify(data));
      console.log(`Hash calculated: ${hash.substring(0, 10)}...`);

      // Prepare metadata
      const metadata = this.prepareRecordMetadata(cid, hash);
      console.log('Metadata prepared:', metadata);
      console.log('Metadata hash format:', typeof metadata.hash, metadata.hash);

      // Generate signature using the wallet client
      let signature: string;

      if (walletClient) {
        try {
          console.log('Signing data with wallet...');
          // Create a message containing the record ID and metadata
          const message = {
            recordId,
            resourceType,
            ownerDid,
            metadata,
            timestamp: Date.now(),
          };

          // Sign the message with the wallet
          signature = await this.signData(walletClient, producer, message);
          console.log('Data signed successfully with wallet');
        } catch (error) {
          console.warn('Failed to sign with wallet, using default signature:', error);
          // Use a default signature if signing fails
          signature = '0x1234567890abcdef';
        }
      } else {
        console.warn('Wallet client not provided, using default signature');
        signature = '0x1234567890abcdef';
      }

      // Prepare registration parameters
      const registrationParams = this.prepareRegistrationParams(
        ownerDid,
        recordId,
        producer,
        signature,
        resourceType,
        metadata
      );
      console.log('Registration parameters prepared');

      return { registrationParams, encryptionKey: key };
    } catch (error) {
      console.error('Error processing resource for registration:', error);
      throw new Error(`Failed to process resource: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export a singleton instance of the service
export const recordRegistrationService = new RecordRegistrationService();
