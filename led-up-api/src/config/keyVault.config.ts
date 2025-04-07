/**
 * Configuration for Azure Key Vault
 */

export const keyVaultConfig = {
  /**
   * The URL of the Azure Key Vault instance
   * Format: https://{vault-name}.vault.azure.net/
   */
  vaultUrl: process.env.KEY_VAULT_URL || '',

  /**
   * Prefix for data encryption keys stored in Key Vault
   */
  keyPrefix: 'data-key-',

  /**
   * Prefix for secrets stored in Key Vault
   */
  secretPrefix: 'encryption-secret-',

  /**
   * Default key type for asymmetric keys
   */
  defaultKeyType: 'RSA',

  /**
   * Default key size for RSA keys
   */
  defaultRsaKeySize: 2048,
};
