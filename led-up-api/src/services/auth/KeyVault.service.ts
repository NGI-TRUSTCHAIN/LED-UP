/**
 * KeyVaultService for secure key management using Azure Key Vault
 *
 * This service provides centralized key management functionality through Azure Key Vault,
 * replacing the previous deterministic key generation approach with a more secure,
 * managed solution.
 */

import * as crypto from 'crypto';

import { DefaultAzureCredential } from '@azure/identity';
import { KeyClient } from '@azure/keyvault-keys';
import { SecretClient } from '@azure/keyvault-secrets';

import { keyVaultConfig } from '../../config/keyVault.config';

/**
 * KeyVaultService provides secure key management using Azure Key Vault
 */
export class KeyVaultService {
  private keyClient: KeyClient;
  private secretClient: SecretClient;
  private credential: DefaultAzureCredential;

  /**
   * Constructor initializes Azure Key Vault clients
   */
  constructor() {
    if (!keyVaultConfig.vaultUrl) {
      throw new Error('Azure Key Vault URL is not configured');
    }

    // Use DefaultAzureCredential which supports multiple authentication methods
    this.credential = new DefaultAzureCredential();

    // Initialize Key and Secret clients
    this.keyClient = new KeyClient(keyVaultConfig.vaultUrl, this.credential);
    this.secretClient = new SecretClient(keyVaultConfig.vaultUrl, this.credential);
  }

  /**
   * Generates or retrieves a data encryption key for a specific data ID
   *
   * @param dataId The unique identifier for the data
   * @returns The encryption key as a Buffer
   */
  async getDataEncryptionKey(dataId: string): Promise<Buffer> {
    const secretName = this.getSecretNameFromDataId(dataId);

    try {
      // Try to get existing secret
      const secret = await this.secretClient.getSecret(secretName);

      return Buffer.from(secret.value || '', 'base64');
    } catch (error) {
      // If secret doesn't exist, create a new one
      if ((error as any).code === 'SecretNotFound') {
        return this.createDataEncryptionKey(dataId);
      }
      throw error;
    }
  }

  /**
   * Stores an ephemeral key in Key Vault
   * @param key The key to store
   * @param options The options for the key
   */
  async storeEphemeralKey(
    key: string,
    options: { expiresIn: number; type: string }
  ): Promise<void> {
    const secretName = this.getSecretNameFromDataId(key);

    await this.secretClient.setSecret(secretName, key, {
      expiresOn: new Date(Date.now() + options.expiresIn),
      contentType: options.type,
    });
  }

  /**
   * Creates a new data encryption key and stores it in Key Vault
   *
   * @param dataId The unique identifier for the data
   * @returns The new encryption key as a Buffer
   */
  async createDataEncryptionKey(dataId: string): Promise<Buffer> {
    // Generate a secure random key (AES-256 = 32 bytes)
    const keyBuffer = crypto.randomBytes(32);
    const keyBase64 = keyBuffer.toString('base64');

    // Store the key in Key Vault as a secret
    const secretName = this.getSecretNameFromDataId(dataId);
    await this.secretClient.setSecret(secretName, keyBase64);

    return keyBuffer;
  }

  /**
   * Encrypts a data encryption key with a user's public key
   *
   * @param dataId The unique identifier for the data
   * @param userPublicKey The user's public key for encryption
   * @returns The encrypted key as a Base64 string
   */
  async encryptKeyForUser(dataId: string, userPublicKey: string): Promise<string> {
    // Get the data encryption key
    const keyBuffer = await this.getDataEncryptionKey(dataId);

    // Encrypt using the user's public key
    const encryptedKey = crypto.publicEncrypt(
      {
        key: userPublicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      keyBuffer
    );

    return encryptedKey.toString('base64');
  }

  /**
   * Rotates a data encryption key
   *
   * @param dataId The unique identifier for the data
   * @returns The new encryption key as a Buffer
   */
  async rotateDataEncryptionKey(dataId: string): Promise<Buffer> {
    const secretName = this.getSecretNameFromDataId(dataId);

    // Generate a new key
    const newKeyBuffer = crypto.randomBytes(32);
    const newKeyBase64 = newKeyBuffer.toString('base64');

    // Update the secret in Key Vault
    await this.secretClient.setSecret(secretName, newKeyBase64);

    return newKeyBuffer;
  }

  /**
   * Deletes a data encryption key
   *
   * @param dataId The unique identifier for the data
   */
  async deleteDataEncryptionKey(dataId: string): Promise<void> {
    const secretName = this.getSecretNameFromDataId(dataId);

    // Start the deletion process
    const poller = await this.secretClient.beginDeleteSecret(secretName);

    // Wait for deletion to complete
    await poller.pollUntilDone();
  }

  /**
   * Creates a standardized secret name from a data ID
   *
   * @param dataId The unique identifier for the data
   * @returns The standardized secret name
   */
  private getSecretNameFromDataId(dataId: string): string {
    // Remove any special characters not allowed in Key Vault names
    const sanitizedId = dataId.replace(/[^a-zA-Z0-9-]/g, '');
    return `${keyVaultConfig.secretPrefix}${sanitizedId}`;
  }

  /**
   * Creates a standardized key name from a data ID
   *
   * @param dataId The unique identifier for the data
   * @returns The standardized key name
   */
  private getKeyNameFromDataId(dataId: string): string {
    // Remove any special characters not allowed in Key Vault names
    const sanitizedId = dataId.replace(/[^a-zA-Z0-9-]/g, '');
    return `${keyVaultConfig.keyPrefix}${sanitizedId}`;
  }
}
