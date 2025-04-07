import { KeyVaultService } from '../auth/KeyVault.service';
import { DataRegistryService } from '../contracts';
import { AsymmetricCryptoService } from '../crypto';
import { EncryptionService } from '../crypto/Encryption.service';
import { IPFSService } from '../ipfs/IPFSService';

/**
 * Service responsible for controlling secure data access and sharing between data owners and consumers.
 * Implements encryption, access control, and secure data sharing mechanisms.
 */
export class DataAccessControllerService {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly asymmetricCryptoService: AsymmetricCryptoService,
    private readonly ipfsService: IPFSService,
    private readonly dataRegistryService: DataRegistryService,
    private readonly keyVaultService: KeyVaultService
  ) {}

  /**
   * Validates if a consumer has access to specific data
   * @param cid Content identifier of the data
   * @param address Consumer's address
   * @returns Boolean indicating if access is allowed
   */
  async validateConsumerAccess(cid: string, address: string): Promise<boolean> {
    try {
      // check for access control
      const hasAccess = await this.dataRegistryService.checkAccess(cid, address);

      if (!hasAccess) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating consumer access:', error);
      return false;
    }
  }

  /**
   * Generates a secure shared secret for data encryption
   * @returns Generated shared secret
   */
  async generateSharedSecret(): Promise<string> {
    try {
      // Generate a secure random key using the encryption service
      const sharedSecret = this.encryptionService.generateKey();

      // Store the shared secret securely
      await this.keyVaultService.storeEphemeralKey(sharedSecret, {
        expiresIn: 24 * 60,
        type: 'shared-secret',
      });

      return sharedSecret;
    } catch (error) {
      console.error('Error generating shared secret:', error);
      throw new Error('Failed to generate shared secret');
    }
  }

  /**
   * Encrypts data using a shared secret
   * @param data Data to encrypt
   * @param secret Shared secret for encryption
   * @returns Encrypted data
   */
  async encryptWithSharedSecret(data: any, secret: string): Promise<string> {
    try {
      // Convert data to string if needed
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);

      // Encrypt the data using the shared secret
      return this.encryptionService.encryptWithKey(dataString, secret);
    } catch (error) {
      console.error('Error encrypting with shared secret:', error);
      throw new Error('Failed to encrypt data with shared secret');
    }
  }

  /**
   * Encrypts a shared secret for a specific consumer using their public key
   * @param secret Shared secret to encrypt
   * @param publicKey Consumer's public key
   * @returns Encrypted shared secret
   */
  async encryptSharedSecretForConsumer(secret: string, publicKey: string): Promise<string> {
    try {
      // Encrypt the shared secret using the consumer's public key
      return this.asymmetricCryptoService.encryptWithPublicKey(secret, publicKey);
    } catch (error) {
      console.error('Error encrypting shared secret for consumer:', error);
      throw new Error('Failed to encrypt shared secret for consumer');
    }
  }

  /**
   * Process a data access request from a consumer
   * @param did Consumer's DID
   * @param publicKey Consumer's public key
   * @param cid Content identifier of the requested data
   * @returns Encrypted data and encrypted shared secret
   */
  async processDataAccessRequest(
    publicKey: string,
    cid: string,
    address: string
  ): Promise<{ encryptedData: string; encryptedSharedSecret: string }> {
    try {
      // Validate access
      const hasAccess = await this.validateConsumerAccess(cid, address);
      if (!hasAccess) {
        throw new Error('Access denied');
      }

      // Fetch encrypted data from IPFS
      const { data: decryptedData } = await this.ipfsService.fetchAndDecrypt(cid);

      // Generate new shared secret
      const sharedSecret = await this.generateSharedSecret();

      // Re-encrypt data with shared secret
      const reencryptedData = await this.encryptWithSharedSecret(decryptedData, sharedSecret);

      // Encrypt shared secret for consumer
      const encryptedSharedSecret = await this.encryptSharedSecretForConsumer(
        sharedSecret,
        publicKey
      );

      return {
        encryptedData: reencryptedData,
        encryptedSharedSecret,
      };
    } catch (error) {
      console.error('Error processing data access request:', error);
      throw new Error('Failed to process data access request');
    }
  }
}
