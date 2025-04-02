# ZKP Verification Registry

## Overview

The ZKP Verification Registry is a smart contract that implements an offchain-first approach to Zero-Knowledge Proof (ZKP) verification. In this architecture, the actual ZKP verification is performed by Azure Functions, and only the verification results are stored on-chain. This approach offers several advantages:

1. **Cost Efficiency**: ZKP verification on-chain can be gas-intensive. By moving the verification process off-chain, we significantly reduce gas costs.
2. **Scalability**: Off-chain verification can handle more complex proofs and larger data sets.
3. **Privacy**: Only verification results are stored on-chain, not the actual data being verified.
4. **Flexibility**: The system can be easily extended to support new types of verifications.

## Architecture

The ZKP Verification Registry follows a role-based access control model:

- **Owner**: The deployer of the contract, with full administrative privileges.
- **Administrators**: Accounts that can manage verifiers and revoke verifications.
- **Verifiers**: Authorized accounts (typically Azure Functions) that can register verification results.
- **Subjects**: Users whose data is being verified.

## Key Features

### Verification Management

- **Register Verification**: Authorized verifiers can register verification results for subjects.
- **Revoke Verification**: Administrators can revoke previously registered verifications.
- **Verification Expiration**: Verifications can have an expiration time, after which they are no longer valid.
- **Verification Metadata**: Additional data about the verification can be stored as metadata.

### Access Control

- **Administrator Management**: The owner can add and remove administrators.
- **Verifier Authorization**: Administrators can authorize and revoke verifiers for specific verification types.

### Query Functions

- **Get Verification**: Retrieve details about a specific verification.
- **Check Verification Validity**: Check if a verification is valid (not expired, not revoked, and has a positive result).
- **Get Subject Verifications**: Retrieve all verifications for a specific subject.
- **Check Verifier Authorization**: Check if a verifier is authorized for a specific verification type.
- **Check Administrator Status**: Check if an account is an administrator.

## Verification Types

The registry supports different types of verifications, identified by a bytes32 type identifier. Common verification types include:

- **Age Verification**: Verify that a person is above a certain age threshold.
- **Hash Verification**: Verify that a hash matches expected data.
- **FHIR Verification**: Verify health information according to FHIR standards.

## Integration with ZKP Verifiers

The ZKP Verification Registry works in conjunction with specific ZKP verifier contracts:

1. **AgeVerifier**: Verifies age-related proofs.
2. **EnhancedAgeVerifier**: Provides more advanced age verification capabilities, including birth date verification and age bracket verification.
3. **HashVerifier**: Verifies hash-based proofs.
4. **FHIRVerifier**: Verifies health information proofs.

## Offchain-First Workflow

1. **Proof Generation**: The user generates a ZKP using a client-side library.
2. **Offchain Verification**: The proof is sent to an Azure Function, which verifies it using the appropriate ZKP verifier.
3. **Result Registration**: If the verification is successful, the Azure Function (acting as an authorized verifier) registers the result on-chain.
4. **Result Querying**: Applications can query the registry to check if a subject has valid verifications.

## Security Considerations

- **Role Separation**: Clear separation of roles (owner, administrators, verifiers) ensures proper access control.
- **Verification Revocation**: Ability to revoke verifications if they are found to be invalid or compromised.
- **Expiration Mechanism**: Verifications can expire, requiring periodic re-verification.
- **Event Logging**: All important actions emit events for transparency and auditability.

## Testing

The ZKP Verification Registry has been thoroughly tested with a comprehensive test suite covering:

- Deployment verification
- Administrator management
- Verifier authorization
- Verification registration and revocation
- Verification validity checks
- Subject verification queries

All tests are passing, ensuring the reliability and correctness of the contract.

## Usage Examples

### Registering a Verification

```typescript
// Authorize a verifier (must be called by an admin)
await zkpVerificationRegistry.write.authorizeVerifier([verifierAddress, verificationType], { account: adminAccount });

// Register a verification (must be called by an authorized verifier)
await zkpVerificationRegistry.write.registerVerification(
  [
    subjectAddress,
    verificationType,
    verificationId,
    true, // result
    expirationTime,
    metadata,
  ],
  { account: verifierAccount }
);
```

### Checking Verification Validity

```typescript
// Check if a verification is valid
const isValid = await zkpVerificationRegistry.read.isVerificationValid([verificationId]);

// Get detailed verification information
const verification = await zkpVerificationRegistry.read.getVerification([verificationId]);
```

### Managing Administrators and Verifiers

```typescript
// Add an administrator (must be called by the owner)
await zkpVerificationRegistry.write.addAdministrator([adminAddress], { account: ownerAccount });

// Authorize a verifier (must be called by an admin)
await zkpVerificationRegistry.write.authorizeVerifier([verifierAddress, verificationType], { account: adminAccount });
```

## Conclusion

The ZKP Verification Registry provides a secure, efficient, and flexible way to manage ZKP verification results on-chain. By adopting an offchain-first approach, it combines the security benefits of blockchain with the scalability and cost-efficiency of off-chain computation.
