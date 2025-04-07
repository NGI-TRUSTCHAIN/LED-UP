# Enhanced Age Verification Azure Function

This Azure Function implements an offchain-first approach to Zero-Knowledge Proof (ZKP) age verification. It handles the verification process and registers the results on the blockchain, providing a privacy-preserving way to verify age-related claims without revealing the actual age or birth date.

## Overview

The Enhanced Age Verification Function supports three types of verification:

1. **Simple Age Verification**: Verifies if a person is older than a specified threshold
2. **Birth Date Verification**: Verifies age based on birth date and current date
3. **Age Bracket Verification**: Determines which age bracket a person belongs to (Child, Adult, Senior)

## Architecture

This function follows an offchain-first approach:

- The ZKP verification is performed offchain in the Azure Function
- Only the verification results are stored on the blockchain
- The actual age or birth date is never revealed

## Prerequisites

- Azure Functions runtime v4.x
- Node.js 16.x or later
- ZoKrates installed on the function host
- Access to Azure Blob Storage for verification keys
- Access to an Ethereum-compatible blockchain

## Configuration

The function requires the following environment variables:

```
AZURE_STORAGE_CONNECTION_STRING=<Azure Storage connection string>
BLOCKCHAIN_PROVIDER_URL=<Blockchain RPC endpoint>
VERIFIER_PRIVATE_KEY=<Private key of the authorized verifier>
ZKP_REGISTRY_CONTRACT_ADDRESS=<Address of the ZKP Verification Registry contract>
```

## Usage

### Request Format

```json
{
  "verificationType": 1, // 1 = simple age, 2 = birth date, 3 = age bracket
  "age": 25, // Required for types 1 and 3
  "birthDate": 19980101, // Required for type 2 (YYYYMMDD format)
  "currentDate": 20230101, // Required for type 2 (YYYYMMDD format)
  "threshold": 18, // Required for types 1 and 2
  "subject": "0x1234...", // Ethereum address of the subject
  "expirationDays": 365, // Optional: days until verification expires (0 = never)
  "metadata": {
    // Optional: additional metadata
    "requestId": "abc123",
    "purpose": "service-access"
  }
}
```

### Response Format

```json
{
  "success": true,
  "verificationId": "0x1234...",  // Unique ID of the verification
  "transactionHash": "0x5678...", // Transaction hash of the blockchain registration
  "proof": {                      // ZKP proof details
    "a": [...],
    "b": [...],
    "c": [...]
  },
  "publicInputs": [...],          // Public inputs used for verification
  "result": 1                     // Result value (1 = true for types 1-2, 1-3 for age bracket)
}
```

## Error Handling

The function returns appropriate HTTP status codes and error messages:

- `400 Bad Request`: Invalid or missing parameters
- `401 Unauthorized`: Unauthorized access
- `500 Internal Server Error`: Server-side errors

## Security Considerations

- The function uses secure storage for verification keys
- The verifier must be authorized in the smart contract
- All blockchain interactions are authenticated
- Temporary files are securely cleaned up after use

## Development

### Local Testing

1. Install dependencies: `npm install`
2. Set up local.settings.json with required environment variables
3. Run locally: `func start`

### Deployment

Deploy to Azure Functions using Azure CLI or Visual Studio Code:

```bash
az functionapp deployment source config-zip -g <resource-group> -n <app-name> --src <zip-file>
```

## Related Components

- [ZKP Verification Registry Contract](../../../zkp/ZKPVerificationRegistry.sol)
- [Enhanced Age Verification Circuit](../../../circuits/ageVerifier/enhancedAgeCheck.zok)
- [Enhanced Age Verifier Contract](../../../contracts/zkp/EnhancedAgeVerifier.sol)
