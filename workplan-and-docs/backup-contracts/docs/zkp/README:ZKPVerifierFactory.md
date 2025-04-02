# ZKP Verifier Factory API

The ZKP Verifier Factory API provides endpoints for deploying and managing ZKP (Zero-Knowledge Proof) verifier contracts. This API interacts with the ZKP Verifier Factory smart contract to deploy specialized verifier contracts for different types of zero-knowledge proofs.

## Overview

The ZKP Verifier Factory is responsible for:

1. Deploying specialized verifier contracts (Age, Hash, Enhanced Hash, FHIR)
2. Registering deployed verifiers in the ZKP Registry
3. Retrieving verifier addresses from the registry

## API Endpoints

### GET /api/zkp/verifier-factory

Retrieves information about deployed verifiers.

#### Query Parameters

- `action` (required): The action to perform. Currently supported: `getVerifier`
- `verifierType` (required for `getVerifier`): The type of verifier to retrieve. Supported types:
  - `AGE_VERIFIER`
  - `HASH_VERIFIER`
  - `ENHANCED_HASH_VERIFIER`
  - `FHIR_VERIFIER`

#### Example Request

```
GET /api/zkp/verifier-factory?action=getVerifier&verifierType=AGE_VERIFIER
```

#### Example Response

```json
{
  "verifierAddress": "0x1234567890123456789012345678901234567890"
}
```

### POST /api/zkp/verifier-factory

Deploys and manages verifier contracts.

#### Request Body

```json
{
  "action": "deployAgeVerifier",
  "verifierAddress": "0x1234567890123456789012345678901234567890"
}
```

#### Supported Actions

- `deployAgeVerifier`: Deploys an Age Verifier contract
- `deployHashVerifier`: Deploys a Hash Verifier contract
- `deployEnhancedHashVerifier`: Deploys an Enhanced Hash Verifier contract
- `deployFHIRVerifier`: Deploys a FHIR Verifier contract
- `getVerifier`: Retrieves a verifier address from the registry

#### Parameters

- `verifierAddress` (required for deploy actions): The address of the ZoKrates-generated verifier contract
- `verifierType` (required for `getVerifier`): The type of verifier to retrieve

#### Example Response

```json
{
  "success": true,
  "verifierAddress": "0x1234567890123456789012345678901234567890"
}
```

## Verifier Types

The ZKP Verifier Factory supports the following types of verifiers:

### Age Verifier

The Age Verifier is used to verify age-related claims without revealing the actual age. It supports:

- Simple age verification (is the user older than X?)
- Birth date verification (is the user born before a certain date?)
- Age bracket verification (which age bracket does the user fall into?)

### Hash Verifier

The Hash Verifier is used to verify that a user knows a preimage for a given hash without revealing the preimage itself. This is useful for password verification, document verification, etc.

### Enhanced Hash Verifier

The Enhanced Hash Verifier extends the Hash Verifier with additional features, such as verifying multiple hashes or more complex hash-based proofs.

### FHIR Verifier

The FHIR Verifier is specialized for verifying claims about healthcare data in FHIR format without revealing the actual data.

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `400 Bad Request`: Missing or invalid parameters
- `405 Method Not Allowed`: Unsupported HTTP method
- `500 Internal Server Error`: Server-side errors

Error responses include a JSON body with an `error` field containing a descriptive message.

## Environment Configuration

The API requires the following environment variables:

- `ZKP_VERIFIER_FACTORY_CONTRACT_ADDRESS`: The address of the ZKP Verifier Factory smart contract

## Security Considerations

- The API endpoints require function-level authentication
- Only authorized users should be able to deploy verifier contracts
- The ZKP Verifier Factory contract has its own access control mechanisms

## Implementation Details

The API is implemented as an Azure Function that interacts with the ZKP Verifier Factory smart contract. The function uses the `ZKPVerifierFactoryService` to handle the communication with the blockchain.

## Related Components

- ZKP Registry: Stores the mapping between verifier types and deployed verifier addresses
- ZKP Verification Registry: Stores verification results
- Age Verification API: Uses the Age Verifier to perform age-related verifications
