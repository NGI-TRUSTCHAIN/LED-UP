# LEDUP - DidIssuer TypeScript SDK

**Version:** 1.0.0  
**Last Updated:** March 2025  
**Status:** Production

## Overview

The DidIssuerSDK provides a TypeScript interface for interacting with the DidIssuer smart contract in the LEDUP ecosystem. This SDK enables applications to securely issue and validate verifiable credentials, establishing trust relationships between issuers and subjects within the decentralized identity framework.

## Core Features

### Credential Issuance

The SDK enables applications to issue credentials to subjects:

```typescript
// Generate a unique credential ID
const credentialId = ethers.utils.keccak256(
  ethers.utils.defaultAbiCoder.encode(['string', 'string', 'uint256'], [credentialType, subjectDid, Date.now()])
);

// Issue a credential
const tx = await didIssuerSDK.issueCredential(
  'HealthCareCredential', // Credential type
  'did:ledup:sepolia:0x123...', // Subject DID
  credentialId // Unique credential ID
);

await tx.wait();
console.log(`Credential issued with ID: ${credentialId}`);
```

### Credential Validation

The SDK provides methods for validating issued credentials:

```typescript
// Check if a credential is valid
const isValid = await didIssuerSDK.isCredentialValid(credentialId);

if (isValid) {
  console.log('Credential is valid');
  // Process the credential
} else {
  console.log('Credential is invalid or does not exist');
  // Handle invalid credential
}
```

## Integration Patterns

### Credential Issuing Service

```typescript
// Example: Credential issuing service using the SDK
class CredentialIssuingService {
  constructor(private sdk: DidIssuerSDK) {}

  async issueHealthCredential(subjectDid: string, credentialData: any) {
    try {
      // Generate a deterministic credential ID from the data
      const credentialId = this.generateCredentialId('HealthCareCredential', subjectDid, credentialData);

      // Issue the credential on-chain
      const tx = await this.sdk.issueCredential('HealthCareCredential', subjectDid, credentialId);

      await tx.wait();

      // Store additional credential data off-chain (e.g., IPFS)
      const offChainDataHash = await this.storeCredentialData(credentialId, credentialData);

      return {
        success: true,
        credentialId: ethers.utils.hexlify(credentialId),
        transactionHash: tx.hash,
        offChainDataHash,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to issue credential:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async verifyCredential(credentialId: string) {
    try {
      // Check if credential exists on-chain
      const isValid = await this.sdk.isCredentialValid(credentialId);

      if (!isValid) {
        return {
          valid: false,
          reason: 'CREDENTIAL_NOT_FOUND',
        };
      }

      // Retrieve the credential metadata from events
      const events = await this.sdk.getCredentialEvents(credentialId);

      if (events.length === 0) {
        return {
          valid: false,
          reason: 'NO_ISSUANCE_EVENT',
        };
      }

      const { credentialType, subject, timestamp } = events[0];

      // Optionally retrieve and verify the off-chain data
      const offChainData = await this.retrieveCredentialData(credentialId);

      return {
        valid: true,
        credentialType,
        subject,
        issuedAt: new Date(timestamp * 1000),
        data: offChainData,
      };
    } catch (error) {
      console.error('Failed to verify credential:', error);
      return {
        valid: false,
        error: error.message,
      };
    }
  }

  private generateCredentialId(credentialType: string, subject: string, data: any): string {
    // Create a deterministic hash from the credential data
    return ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ['string', 'string', 'string'],
        [credentialType, subject, JSON.stringify(data)]
      )
    );
  }

  private async storeCredentialData(credentialId: string, data: any): Promise<string> {
    // Implementation to store data in IPFS or other storage
    // This is just a placeholder
    console.log(`Storing data for credential ${credentialId}`);
    return 'ipfs://QmHash...';
  }

  private async retrieveCredentialData(credentialId: string): Promise<any> {
    // Implementation to retrieve data from IPFS or other storage
    // This is just a placeholder
    console.log(`Retrieving data for credential ${credentialId}`);
    return {
      /* credential data */
    };
  }
}
```

### React Integration

```typescript
// Example: React hook for credential issuance
function useCredentialIssuance(didIssuerSDK) {
  const [issuanceState, setIssuanceState] = useState({
    loading: false,
    error: null,
    result: null,
  });

  const issueCredential = useCallback(
    async (credentialType, subjectDid, data) => {
      try {
        setIssuanceState({
          loading: true,
          error: null,
          result: null,
        });

        // Generate credential ID
        const credentialId = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(
            ['string', 'string', 'string'],
            [credentialType, subjectDid, JSON.stringify(data)]
          )
        );

        // Issue credential
        const tx = await didIssuerSDK.issueCredential(credentialType, subjectDid, credentialId);

        // Wait for transaction confirmation
        await tx.wait();

        // Set success state
        setIssuanceState({
          loading: false,
          error: null,
          result: {
            credentialId: ethers.utils.hexlify(credentialId),
            transactionHash: tx.hash,
            timestamp: new Date().toISOString(),
          },
        });

        return credentialId;
      } catch (error) {
        // Set error state
        setIssuanceState({
          loading: false,
          error: error.message,
          result: null,
        });

        throw error;
      }
    },
    [didIssuerSDK]
  );

  return {
    issueCredential,
    issuanceState,
  };
}

// Usage in a component
function CredentialIssuerComponent({ didIssuerSDK, subjectDid }) {
  const { issueCredential, issuanceState } = useCredentialIssuance(didIssuerSDK);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const credentialData = {
      name: event.target.name.value,
      birthDate: event.target.birthDate.value,
      expiryDate: new Date(Date.now() + 31536000000).toISOString(), // 1 year from now
      additionalData: {
        // Additional credential-specific data
      },
    };

    try {
      await issueCredential('HealthCareCredential', subjectDid, credentialData);
      // Handle success
    } catch (error) {
      // Handle error
      console.error('Failed to issue credential:', error);
    }
  };

  return (
    <div>
      <h2>Issue Health Credential</h2>
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
        <button type="submit" disabled={issuanceState.loading}>
          {issuanceState.loading ? 'Issuing...' : 'Issue Credential'}
        </button>
      </form>

      {issuanceState.error && <div className="error">{issuanceState.error}</div>}
      {issuanceState.result && (
        <div className="success">
          <p>Credential issued successfully!</p>
          <p>ID: {issuanceState.result.credentialId}</p>
          <p>Transaction: {issuanceState.result.transactionHash}</p>
        </div>
      )}
    </div>
  );
}
```

## API Reference

### DidIssuerSDK

```typescript
class DidIssuerSDK {
  /**
   * Constructor for the DidIssuerSDK
   */
  constructor(config: DidIssuerSDKConfig);

  /**
   * Initialize the SDK
   */
  async initialize(): Promise<void>;

  /**
   * Issue a new credential
   */
  async issueCredential(
    credentialType: string,
    subject: string,
    credentialId: string | Uint8Array
  ): Promise<TransactionResponse>;

  /**
   * Check if a credential is valid
   */
  async isCredentialValid(credentialId: string | Uint8Array): Promise<boolean>;

  /**
   * Get events related to a specific credential
   */
  async getCredentialEvents(credentialId: string | Uint8Array): Promise<CredentialEvent[]>;

  /**
   * Get all credentials issued for a subject
   */
  async getCredentialsForSubject(subject: string): Promise<CredentialEvent[]>;

  /**
   * Get all credentials of a specific type
   */
  async getCredentialsByType(credentialType: string): Promise<CredentialEvent[]>;

  /**
   * Generate a unique credential ID
   */
  generateCredentialId(credentialType: string, subject: string, data?: any): string;
}
```

### Configuration

```typescript
interface DidIssuerSDKConfig {
  /**
   * Provider for connecting to Ethereum
   */
  provider: Provider;

  /**
   * Wallet or signer for transactions
   */
  wallet?: Wallet | Signer;

  /**
   * Address of the DidIssuer contract
   */
  contractAddress: string;

  /**
   * Optional address of the DidRegistry contract
   * If not provided, it will be fetched from the DidIssuer contract
   */
  didRegistryAddress?: string;

  /**
   * Optional gas settings
   */
  gasSettings?: {
    gasLimit?: number;
    gasPrice?: BigNumber;
  };
}
```

### Types

```typescript
interface CredentialEvent {
  /**
   * The type of credential
   */
  credentialType: string;

  /**
   * The subject DID
   */
  subject: string;

  /**
   * The credential ID
   */
  credentialId: string;

  /**
   * Timestamp of issuance
   */
  timestamp: number;

  /**
   * The block number of the issuance
   */
  blockNumber: number;

  /**
   * The transaction hash of the issuance
   */
  transactionHash: string;
}
```

## Event Handling

The SDK provides access to contract events:

```typescript
// Listen for credential issuance events
didIssuerSDK.events.on('CredentialIssued', (event) => {
  const { credentialType, subject, credentialId, timestamp } = event.args;

  console.log(`New credential issued: ${credentialType}`);
  console.log(`Subject: ${subject}`);
  console.log(`Credential ID: ${ethers.utils.hexlify(credentialId)}`);
  console.log(`Timestamp: ${new Date(timestamp * 1000)}`);

  // Update application state
  updateCredentialRegistry(credentialType, subject, credentialId, timestamp);
});

// Start listening for events
await didIssuerSDK.events.startListening();
```

## Error Handling

The SDK provides standardized error handling:

```typescript
import { DidIssuerError, ErrorCode } from '@ledup/didissuer-sdk';

try {
  await didIssuerSDK.issueCredential(credentialType, subjectDid, credentialId);
} catch (error) {
  if (error instanceof DidIssuerError) {
    switch (error.code) {
      case ErrorCode.INVALID_SUBJECT:
        console.error('The subject DID is invalid or inactive');
        break;
      case ErrorCode.CREDENTIAL_ALREADY_ISSUED:
        console.error('A credential with this ID already exists');
        break;
      default:
        console.error('Error:', error.message);
    }
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Implementation Example

Here's a complete example of implementing the DidIssuer SDK in a TypeScript application:

```typescript
import { DidIssuerSDK } from '@ledup/didissuer-sdk';
import { ethers } from 'ethers';

// Initialize provider and wallet
const provider = new ethers.providers.JsonRpcProvider('https://rpc-url.example.com');
const wallet = new ethers.Wallet('PRIVATE_KEY', provider);

// Initialize the SDK
const didIssuerSDK = new DidIssuerSDK({
  provider,
  wallet,
  contractAddress: '0xDidIssuerContractAddress',
});
await didIssuerSDK.initialize();

// Implementation of a healthcare credential issuer
class HealthcareCredentialIssuer {
  constructor(private sdk: DidIssuerSDK) {}

  async issueHealthRecord(patientDid: string, doctorAddress: string, recordData: any) {
    try {
      // Validate patient DID format
      if (!patientDid.startsWith('did:ledup:')) {
        throw new Error('Invalid patient DID format');
      }

      // Create credential data with metadata
      const credentialData = {
        ...recordData,
        issuedBy: doctorAddress,
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 31536000000).toISOString(), // 1 year validity
        type: 'HealthCareCredential',
      };

      // Generate credential ID
      const credentialId = this.sdk.generateCredentialId('HealthCareCredential', patientDid, credentialData);

      // Issue the credential on-chain
      const tx = await this.sdk.issueCredential('HealthCareCredential', patientDid, credentialId);

      // Wait for confirmation
      const receipt = await tx.wait();

      // Return the issuance details
      return {
        success: true,
        credentialId: ethers.utils.hexlify(credentialId),
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        issuedAt: new Date().toISOString(),
        data: credentialData,
      };
    } catch (error) {
      console.error('Error issuing health record credential:', error);

      if (error.message.includes('InvalidSubject')) {
        return {
          success: false,
          error: 'INVALID_SUBJECT',
          message: 'The patient DID is invalid or inactive',
        };
      } else if (error.message.includes('CredentialAlreadyIssued')) {
        return {
          success: false,
          error: 'DUPLICATE_CREDENTIAL',
          message: 'This credential has already been issued',
        };
      }

      return {
        success: false,
        error: 'ISSUANCE_FAILED',
        message: error.message,
      };
    }
  }

  async verifyHealthRecord(credentialId: string) {
    try {
      // Check if credential exists
      const isValid = await this.sdk.isCredentialValid(credentialId);

      if (!isValid) {
        return {
          valid: false,
          reason: 'CREDENTIAL_NOT_FOUND',
          message: 'The credential does not exist or has been revoked',
        };
      }

      // Get credential metadata from events
      const events = await this.sdk.getCredentialEvents(credentialId);

      if (events.length === 0) {
        return {
          valid: false,
          reason: 'NO_ISSUANCE_EVENT',
          message: 'No issuance event found for this credential',
        };
      }

      const latestEvent = events[0];

      return {
        valid: true,
        credentialType: latestEvent.credentialType,
        subject: latestEvent.subject,
        issuedAt: new Date(latestEvent.timestamp * 1000),
        transactionHash: latestEvent.transactionHash,
      };
    } catch (error) {
      console.error('Error verifying health record credential:', error);
      return {
        valid: false,
        error: error.message,
      };
    }
  }
}

// Usage example
async function main() {
  const healthcareIssuer = new HealthcareCredentialIssuer(didIssuerSDK);

  // Issue a health record credential
  const patientDid = 'did:ledup:sepolia:0x1234567890123456789012345678901234567890';
  const doctorAddress = '0x0987654321098765432109876543210987654321';

  const healthRecordData = {
    diagnosis: 'Regular check-up',
    date: new Date().toISOString(),
    bloodPressure: '120/80',
    temperature: '98.6 F',
    recommendations: 'Stay hydrated, exercise regularly',
  };

  const issuanceResult = await healthcareIssuer.issueHealthRecord(patientDid, doctorAddress, healthRecordData);

  console.log('Health record issuance result:', issuanceResult);

  if (issuanceResult.success) {
    // Verify the credential
    const verificationResult = await healthcareIssuer.verifyHealthRecord(issuanceResult.credentialId);

    console.log('Verification result:', verificationResult);
  }
}

main().catch(console.error);
```

## Best Practices

1. **Secure Credential ID Generation**: Use cryptographic methods to generate unique credential IDs
2. **Store Data Off-Chain**: Store detailed credential data off-chain (e.g., IPFS) and only the hash on-chain
3. **Implement Credential Revocation**: Consider implementing additional logic for credential revocation
4. **Validate Subject DIDs**: Always validate subject DIDs before issuing credentials
5. **Audit Logging**: Maintain detailed logs of all credential issuance operations
6. **Batch Operations**: When issuing multiple credentials, consider batching transactions
7. **Handle Events Efficiently**: Set up proper event filtering to efficiently track credential issuance

## Security Considerations

1. **Access Control**: Restrict credential issuance to authorized entities
2. **Data Privacy**: Ensure sensitive data is not stored directly on-chain
3. **Avoid Transaction Frontrunning**: Be aware of potential transaction frontrunning when issuing credentials
4. **Credential Expiry**: Consider implementing expiration timestamps for credentials
5. **Secure Credential Storage**: Store credential IDs securely to prevent unauthorized access

---

**© 2025 LEDUP - All rights reserved.**
