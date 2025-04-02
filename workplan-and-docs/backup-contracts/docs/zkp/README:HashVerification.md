# ZKP Hash Verification API

The ZKP Hash Verification API provides an endpoint for verifying hash-related zero-knowledge proofs. This API allows users to prove they know a preimage for a given hash without revealing the preimage itself.

## Overview

The Hash Verification API is responsible for:

1. Verifying that a user knows a preimage for a given hash without revealing the preimage
2. Registering the verification result on the blockchain
3. Supporting both simple hash verification and enhanced hash verification

## API Endpoint

### POST /api/zkp/hash-verification

Verifies a hash-related zero-knowledge proof and registers the result on the blockchain.

#### Request Body

```json
{
  "verificationType": 1,
  "preimage": "secret-value",
  "expectedHash": [
    "0x1234567890123456789012345678901234567890123456789012345678901234",
    "0x5678901234567890123456789012345678901234567890123456789012345678"
  ],
  "subject": "0x1234567890123456789012345678901234567890",
  "expirationDays": 30,
  "metadata": {
    "description": "Password verification"
  }
}
```

#### Parameters

- `verificationType` (required): The type of hash verification to perform
  - `1`: Simple hash verification
  - `2`: Enhanced hash verification
- `preimage` (required for testing only): The preimage to verify. In production, this should be kept secret and only used client-side.
- `expectedHash` (required): The expected hash as an array of 2 elements (representing a uint256[2])
- `subject` (required): The Ethereum address of the subject being verified
- `expirationDays` (optional): The number of days until the verification expires (0 = never)
- `metadata` (optional): Additional metadata about the verification

#### Example Response

```json
{
  "success": true,
  "verificationId": "0x1234567890123456789012345678901234567890123456789012345678901234",
  "transactionHash": "0x5678901234567890123456789012345678901234567890123456789012345678",
  "result": true,
  "metadata": {
    "verificationType": 1,
    "expectedHash": [
      "0x1234567890123456789012345678901234567890123456789012345678901234",
      "0x5678901234567890123456789012345678901234567890123456789012345678"
    ],
    "description": "Password verification"
  }
}
```

## Verification Types

### Simple Hash Verification (Type 1)

The simple hash verification proves that a user knows a preimage for a given hash without revealing the preimage. This is useful for:

- Password verification
- Document verification
- Credential verification

### Enhanced Hash Verification (Type 2)

The enhanced hash verification extends the simple hash verification with additional features, such as:

- Verifying multiple hashes
- Verifying complex hash-based proofs
- Supporting more advanced cryptographic primitives

## Implementation Details

The Hash Verification API is implemented as an Azure Function that:

1. Validates the request parameters
2. Creates a temporary directory for ZoKrates files
3. Downloads verification keys from Azure Blob Storage
4. Generates a zero-knowledge proof using ZoKrates
5. Registers the verification result on the blockchain using the ZKP Verification Registry
6. Returns the verification result to the client

## Security Considerations

- The preimage should never be sent to the server in a production environment
- The API endpoints require function-level authentication
- The verification keys are stored securely in Azure Blob Storage
- The verification result is registered on the blockchain for transparency and auditability

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `400 Bad Request`: Missing or invalid parameters
- `500 Internal Server Error`: Server-side errors

Error responses include a JSON body with an `error` field containing a descriptive message.

## Environment Configuration

The API requires the following environment variables:

- `AZURE_STORAGE_CONNECTION_STRING`: The connection string for Azure Blob Storage
- `ZKP_REGISTRY_CONTRACT_ADDRESS`: The address of the ZKP Verification Registry smart contract

## Related Components

- ZKP Verification Registry: Stores verification results on the blockchain
- ZKP Verifier Factory: Deploys and manages ZKP verifier contracts
- Hash Verifier Contract: The smart contract that verifies hash-related zero-knowledge proofs

## Client-Side Integration

To integrate with the Hash Verification API, clients should:

1. Generate a hash of the secret value (preimage) client-side
2. Send the hash and other required parameters to the API
3. Receive the verification result and store the verification ID for future reference

## Example Use Cases

- **Password Verification**: Verify that a user knows a password without revealing the password
- **Document Verification**: Verify that a user has a document with a specific hash without revealing the document
- **Credential Verification**: Verify that a user has a credential with a specific hash without revealing the credential
