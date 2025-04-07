# Cryptographic Services Documentation

This document provides comprehensive documentation for the cryptographic services implemented in the LedUp API. These services provide secure encryption, decryption, and hashing capabilities for protecting sensitive data.

## Table of Contents

1. [Overview](#overview)
2. [Asymmetric Cryptography Service](#asymmetric-cryptography-service)
3. [Symmetric Cryptography Service](#symmetric-cryptography-service)
4. [Hashing Service](#hashing-service)
5. [Security Best Practices](#security-best-practices)
6. [Usage Examples](#usage-examples)

## Overview

The cryptographic services are divided into three main components:

- **AsymmetricCryptoService**: Handles public/private key operations using elliptic curve cryptography
- **SymmetricCryptoService**: Provides symmetric encryption/decryption using AES algorithms
- **HashingService**: Offers various hashing functions for data integrity and verification

These services are designed to be used independently or together to provide comprehensive security for your application's data.

## Asymmetric Cryptography Service

The `AsymmetricCryptoService` implements public-key cryptography using elliptic curve cryptography (ECC). It supports two curves:

1. **secp256k1**: The curve used by Bitcoin and Ethereum for ECDSA operations
2. **ed25519**: The Edwards curve used for EdDSA (Edwards-curve Digital Signature Algorithm)

### Key Features

- **Multiple Curve Support**: Choose between secp256k1 and ed25519 based on your needs
- **Key Pair Generation**: Create secure public/private key pairs for both curves
- **Digital Signatures**: Sign data with a private key and verify signatures with the corresponding public key
- **Asymmetric Encryption/Decryption**: Encrypt data with a public key that can only be decrypted with the corresponding private key (secp256k1 only)
- **Hybrid Encryption**: Efficiently encrypt large data by combining asymmetric and symmetric encryption (secp256k1 only)

### Core Methods

| Method                                                               | Description                                                    | Supported Curves |
| -------------------------------------------------------------------- | -------------------------------------------------------------- | ---------------- |
| `encryptWithPublicKey(data, publicKey)`                              | Encrypts data using a recipient's public key                   | secp256k1 only   |
| `decryptWithPrivateKey(encryptedData, privateKey)`                   | Decrypts data using the recipient's private key                | secp256k1 only   |
| `generateKeyPair()`                                                  | Creates a new key pair (public and private keys)               | Both             |
| `sign(data, privateKey)`                                             | Signs data using a private key                                 | Both             |
| `verify(data, signature, publicKey)`                                 | Verifies a signature using a public key                        | Both             |
| `encryptLargeData(data, publicKey)`                                  | Encrypts large data using hybrid encryption                    | secp256k1 only   |
| `decryptLargeData(encryptedData, encryptedSymmetricKey, privateKey)` | Decrypts large data that was encrypted using hybrid encryption | secp256k1 only   |
| `derivePublicKey(privateKey)`                                        | Derives a public key from a private key                        | Both             |
| `isValidPublicKey(publicKey)`                                        | Checks if a public key is valid                                | Both             |
| `getCurveType()`                                                     | Gets the current curve type used by the service                | Both             |

### Technical Details

#### Initialization Vectors (IVs)

For encryption operations, the service uses random initialization vectors (IVs) to ensure that the same plaintext encrypts to different ciphertexts each time. These IVs are:

- Generated using a cryptographically secure random number generator
- 16 bytes (128 bits) in length for AES-256-GCM
- Stored alongside the encrypted data and required for decryption
- Not secret, but must be unique for each encryption operation

#### Encryption Process (secp256k1)

The service uses Elliptic Curve Diffie-Hellman (ECDH) key exchange to derive a shared secret, which is then used for AES-256-GCM symmetric encryption:

1. Generate an ephemeral key pair
2. Derive a shared secret using the ephemeral private key and the recipient's public key
3. Generate a random IV
4. Encrypt the data using AES-256-GCM with the shared secret and IV
5. Include the ephemeral public key, IV, and authentication tag in the result

#### Signature Process

For secp256k1, the service uses ECDSA (Elliptic Curve Digital Signature Algorithm):

1. Hash the data to be signed
2. Sign the hash with the private key
3. Output the signature in DER format

For ed25519, the service uses EdDSA (Edwards-curve Digital Signature Algorithm):

1. Sign the data with the private key
2. Output the signature in hex format

#### Hybrid Encryption (secp256k1 only)

For large data encryption, the service uses a hybrid approach:

1. Generate a random symmetric key
2. Encrypt the data with the symmetric key using AES-256-GCM
3. Encrypt the symmetric key with the recipient's public key
4. Return both the encrypted data and the encrypted symmetric key

## Symmetric Cryptography Service

The `SymmetricCryptoService` provides symmetric encryption and decryption capabilities using the Advanced Encryption Standard (AES) with various modes of operation.

### Key Features

- **Multiple Encryption Algorithms**: Support for AES-256-CCM, AES-256-GCM, and AES-256-CBC
- **Key Management**: Generate secure random keys or derive keys from passwords
- **Password-Based Encryption**: Encrypt data using a password instead of a key
- **Flexible Output Formats**: Return encrypted data in various formats for different use cases

### Supported Algorithms

| Algorithm   | Description           | Authentication | IV Size  |
| ----------- | --------------------- | -------------- | -------- |
| AES-256-CCM | Counter with CBC-MAC  | Yes            | 12 bytes |
| AES-256-GCM | Galois/Counter Mode   | Yes            | 12 bytes |
| AES-256-CBC | Cipher Block Chaining | No             | 16 bytes |

### Core Methods

| Method                                           | Description                                           |
| ------------------------------------------------ | ----------------------------------------------------- |
| `encrypt(data, key, algorithm)`                  | Encrypts data using a symmetric key                   |
| `decrypt(data, key, algorithm)`                  | Decrypts data using a symmetric key                   |
| `generateKey()`                                  | Generates a random 32-byte key as a Buffer            |
| `generateKeyAsHex()`                             | Generates a random key and returns it as a hex string |
| `encryptWithPassword(data, password, algorithm)` | Encrypts data using a password                        |
| `decryptWithPassword(data, password, algorithm)` | Decrypts data that was encrypted using a password     |
| `deriveKeyFromPassword(password, salt)`          | Derives a key from a password using PBKDF2            |

### Technical Details

#### Initialization Vectors (IVs)

The service uses random initialization vectors (IVs) to ensure that the same plaintext encrypts to different ciphertexts each time:

- Generated using a cryptographically secure random number generator
- 12 bytes for CCM and GCM modes, 16 bytes for CBC mode
- Stored alongside the encrypted data and required for decryption
- Not secret, but must be unique for each encryption operation

#### Encryption Modes

The service uses AES-256 with different modes of operation:

- **CCM and GCM modes** provide both encryption and authentication, protecting against tampering
- **CBC mode** is provided for compatibility with legacy systems but should be used with caution

#### Password-Based Encryption

For password-based encryption, the service uses PBKDF2 (Password-Based Key Derivation Function 2) with 100,000 iterations to derive a secure key from the password, along with a random salt to protect against rainbow table attacks.

## Hashing Service

The `HashingService` provides cryptographic hashing functions for data integrity, verification, and other security purposes.

### Key Features

- **Multiple Hash Algorithms**: Support for SHA-256, SHA-512, SHA3-256, SHA3-512, and MD5
- **Flexible Output Formats**: Return hashes in hex, base64, or binary formats
- **HMAC Support**: Create and verify Hash-based Message Authentication Codes
- **Object Hashing**: Hash complex objects by converting them to JSON
- **Salt Support**: Add salts to hashes for additional security

### Supported Algorithms

| Algorithm | Description                                     | Output Size |
| --------- | ----------------------------------------------- | ----------- |
| SHA-256   | Secure Hash Algorithm 2 with 256-bit output     | 32 bytes    |
| SHA-512   | Secure Hash Algorithm 2 with 512-bit output     | 64 bytes    |
| SHA3-256  | Secure Hash Algorithm 3 with 256-bit output     | 32 bytes    |
| SHA3-512  | Secure Hash Algorithm 3 with 512-bit output     | 64 bytes    |
| MD5       | Message Digest 5 (not recommended for security) | 16 bytes    |

### Core Methods

| Method                                                   | Description                                                |
| -------------------------------------------------------- | ---------------------------------------------------------- |
| `hashData(data)`                                         | Hashes data using SHA-256 and returns binary format        |
| `hashHex(data)`                                          | Hashes data using SHA-256 and returns hexadecimal format   |
| `hashBase64(data)`                                       | Hashes data using SHA-256 and returns base64 format        |
| `hashWithAlgorithm(data, algorithm, encoding)`           | Hashes data using the specified algorithm and format       |
| `hashObject(obj, algorithm, encoding)`                   | Creates a hash of an object by first converting it to JSON |
| `verifyHash(data, hash, algorithm, encoding)`            | Verifies if given data matches a given hash                |
| `createHmac(data, secretKey, algorithm, encoding)`       | Creates an HMAC for the given data using a secret key      |
| `verifyHmac(data, hmac, secretKey, algorithm, encoding)` | Verifies an HMAC against the original data and secret key  |
| `hashBuffer(buffer, algorithm, encoding)`                | Creates a hash of a file from its buffer                   |
| `hashWithSalt(data, salt, algorithm, encoding)`          | Creates a hash of a string with a salt prepended to it     |

### Technical Details

The service uses Node.js's built-in `crypto` module to perform hashing operations. By default, it uses SHA-256, which provides a good balance of security and performance for most applications.

For HMAC operations, the service combines a secret key with the data to create a hash that can verify both the integrity and authenticity of the data.

## Security Best Practices

When using these cryptographic services, follow these best practices:

### Key Management

- **Store private keys securely**: Never hardcode private keys or store them in plaintext
- **Rotate keys regularly**: Change keys periodically to limit the impact of a compromise
- **Use key derivation for passwords**: Always use proper key derivation functions (like PBKDF2) when working with passwords

### Algorithm Selection

- **Use authenticated encryption**: Prefer AES-GCM or AES-CCM over AES-CBC when possible
- **Choose the appropriate curve**: Use secp256k1 for compatibility with blockchain applications, ed25519 for high-security signatures
- **Avoid MD5 and SHA-1**: These algorithms are considered cryptographically broken
- **Use appropriate key sizes**: Always use 256-bit keys for AES encryption

### Implementation Guidelines

- **Don't roll your own crypto**: Use the provided services rather than implementing your own
- **Keep cryptographic libraries updated**: Ensure you're using the latest versions to address security vulnerabilities
- **Implement proper error handling**: Avoid leaking information through error messages
- **Use unique IVs**: Always use a new random IV for each encryption operation

## Usage Examples

### Asymmetric Encryption with secp256k1

```typescript
// Create a new instance of the service with secp256k1 curve
const asymmetricService = new AsymmetricCryptoService(CurveType.SECP256K1);

// Generate a key pair
const keyPair = asymmetricService.generateKeyPair();

// Encrypt data with the public key
const encryptedData = asymmetricService.encryptWithPublicKey(
  'Sensitive information',
  keyPair.publicKey
);

// Decrypt data with the private key
const decryptedData = asymmetricService.decryptWithPrivateKey(encryptedData, keyPair.privateKey);
```

### Digital Signatures with ed25519

```typescript
// Create a new instance of the service with ed25519 curve
const eddsaService = new AsymmetricCryptoService(CurveType.ED25519);

// Generate a key pair
const keyPair = eddsaService.generateKeyPair();

// Sign a message
const message = 'Message to be signed';
const signature = eddsaService.sign(message, keyPair.privateKey);

// Verify the signature
const isValid = eddsaService.verify(message, signature, keyPair.publicKey);
console.log('Signature valid:', isValid); // Should output: Signature valid: true
```

### Symmetric Encryption

```typescript
// Create a new instance of the service
const symmetricService = new SymmetricCryptoService();

// Generate a random key
const key = symmetricService.generateKey();

// Encrypt data
const encryptedData = symmetricService.encrypt('Sensitive information', key);

// Decrypt data
const decryptedData = symmetricService.decrypt(encryptedData, key);

// Password-based encryption
const passwordEncrypted = symmetricService.encryptWithPassword(
  'Sensitive information',
  'mySecurePassword'
);

// Password-based decryption
const passwordDecrypted = symmetricService.decryptWithPassword(
  passwordEncrypted,
  'mySecurePassword'
);
```

### Hashing

```typescript
// Create a new instance of the service
const hashingService = new HashingService();

// Hash data in different formats
const hexHash = await hashingService.hashHex('Data to hash');
const base64Hash = await hashingService.hashBase64('Data to hash');

// Hash with a specific algorithm
const sha512Hash = await hashingService.hashWithAlgorithm(
  'Data to hash',
  HashAlgorithm.SHA512,
  HashEncoding.HEX
);

// Create and verify an HMAC
const hmac = await hashingService.createHmac('Data to authenticate', 'secretKey');
const isValid = await hashingService.verifyHmac('Data to authenticate', hmac, 'secretKey');
```

### Hybrid Encryption for Large Data

```typescript
// Create a new instance of the service with secp256k1 curve
const asymmetricService = new AsymmetricCryptoService(CurveType.SECP256K1);

// Generate a key pair
const keyPair = asymmetricService.generateKeyPair();

// Encrypt large data
const { encryptedData, encryptedSymmetricKey } = asymmetricService.encryptLargeData(
  'Large amount of sensitive information',
  keyPair.publicKey
);

// Decrypt large data
const decryptedData = asymmetricService.decryptLargeData(
  encryptedData,
  encryptedSymmetricKey,
  keyPair.privateKey
);
```
