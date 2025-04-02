# LEDUP - DidVerifier TypeScript SDK

**Version:** 1.0.0  
**Last Updated:** March 2025  
**Status:** Production

## Overview

The DidVerifierSDK provides a streamlined TypeScript interface for interacting with the DidVerifier smart contract in the LEDUP ecosystem. This SDK enables applications to verify credentials and manage trusted issuers for specific credential types, supporting the decentralized identity and trust framework of the platform.

## Core Features

### Credential Verification

The SDK enables applications to verify credentials issued by trusted issuers:

```typescript
// Verify a credential
const isValid = await didVerifierSDK.verifyCredential(
  'HealthCareCredential', // Credential type
  '0x123...abc', // Issuer address
  'did:ledup:sepolia:0x456...' // Subject DID
);

if (isValid) {
  console.log('Credential is valid!');
  // Grant access to protected resources
} else {
  console.log('Credential verification failed');
  // Handle invalid credential
}
```

### Trust Management

The SDK provides methods for managing trusted issuers:

```typescript
// Add a trusted issuer for a specific credential type
await didVerifierSDK.setIssuerTrustStatus(
  'HealthCareCredential', // Credential type
  '0x123...abc', // Issuer address
  true // Trust status (true = trusted)
);

// Check if an issuer is trusted
const isTrusted = await didVerifierSDK.isIssuerTrusted(
  'HealthCareCredential', // Credential type
  '0x123...abc' // Issuer address
);

console.log(`Issuer is ${isTrusted ? 'trusted' : 'not trusted'}`);
```

## Integration Patterns

### Access Control Integration

```typescript
// Example: Access control middleware using the SDK
function createVerifierMiddleware(didVerifierSDK, credentialType) {
  return async function verifyCredentialMiddleware(req, res, next) {
    try {
      const { issuerAddress, userDid } = req.auth; // Extracted from authentication token

      // Verify the credential
      const isValid = await didVerifierSDK.verifyCredential(credentialType, issuerAddress, userDid);

      if (isValid) {
        // Credential is valid, proceed to protected route
        next();
      } else {
        // Invalid credential
        res.status(403).json({
          error: 'Access denied',
          message: 'Required credential could not be verified',
        });
      }
    } catch (error) {
      // Handle specific error types
      if (error.code === 'UNTRUSTED_ISSUER') {
        res.status(403).json({
          error: 'Access denied',
          message: 'Credential issuer is not trusted',
        });
      } else if (error.code === 'INVALID_CREDENTIAL') {
        res.status(403).json({
          error: 'Access denied',
          message: 'Credential is invalid',
        });
      } else {
        // Generic error handling
        res.status(500).json({
          error: 'Verification error',
          message: error.message,
        });
      }
    }
  };
}

// Usage in Express application
const app = express();
const healthDataMiddleware = createVerifierMiddleware(didVerifierSDK, 'HealthCareCredential');

app.get('/api/health-records', healthDataMiddleware, (req, res) => {
  // Route logic for protected health records
});
```

### Trust Management Service

```typescript
// Example: Trust management service using the SDK
class TrustManagementService {
  constructor(private sdk: DidVerifierSDK) {}

  async addTrustedIssuer(credentialType, issuerAddress, adminSignature) {
    try {
      // Verify admin privileges (implementation dependent)
      this.verifyAdminSignature(adminSignature);

      // Add the issuer as trusted
      const tx = await this.sdk.setIssuerTrustStatus(credentialType, issuerAddress, true);

      await tx.wait();

      return {
        success: true,
        transactionHash: tx.hash,
        message: `Issuer ${issuerAddress} is now trusted for ${credentialType}`,
      };
    } catch (error) {
      console.error('Failed to add trusted issuer:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async removeTrustedIssuer(credentialType, issuerAddress, adminSignature) {
    try {
      // Verify admin privileges
      this.verifyAdminSignature(adminSignature);

      // Remove the issuer as trusted
      const tx = await this.sdk.setIssuerTrustStatus(credentialType, issuerAddress, false);

      await tx.wait();

      return {
        success: true,
        transactionHash: tx.hash,
        message: `Issuer ${issuerAddress} is no longer trusted for ${credentialType}`,
      };
    } catch (error) {
      console.error('Failed to remove trusted issuer:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async checkIssuerTrustStatus(credentialType, issuerAddress) {
    try {
      const isTrusted = await this.sdk.isIssuerTrusted(credentialType, issuerAddress);

      return {
        success: true,
        credentialType,
        issuerAddress,
        isTrusted,
      };
    } catch (error) {
      console.error('Failed to check issuer trust status:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private verifyAdminSignature(signature) {
    // Implementation of admin signature verification
    // This would typically validate that the signer has admin privileges
    if (!isValidAdminSignature(signature)) {
      throw new Error('Unauthorized: Admin signature invalid');
    }
  }
}
```

## API Reference

### DidVerifierSDK

```typescript
class DidVerifierSDK {
  /**
   * Constructor for the DidVerifierSDK
   */
  constructor(config: DidVerifierSDKConfig);

  /**
   * Initialize the SDK
   */
  async initialize(): Promise<void>;

  /**
   * Set the trust status for an issuer regarding a specific credential type
   */
  async setIssuerTrustStatus(
    credentialType: string,
    issuerAddress: string,
    trusted: boolean
  ): Promise<TransactionResponse>;

  /**
   * Check if an issuer is trusted for a specific credential type
   */
  async isIssuerTrusted(credentialType: string, issuerAddress: string): Promise<boolean>;

  /**
   * Verify a credential by checking if it was issued by a trusted issuer
   */
  async verifyCredential(credentialType: string, issuerAddress: string, subjectDid: string): Promise<boolean>;

  /**
   * Get all trusted issuers for a specific credential type
   */
  async getTrustedIssuers(credentialType: string): Promise<string[]>;

  /**
   * Get all credential types for which an issuer is trusted
   */
  async getIssuerCredentialTypes(issuerAddress: string): Promise<string[]>;
}
```

### Configuration

```typescript
interface DidVerifierSDKConfig {
  /**
   * Provider for connecting to Ethereum
   */
  provider: Provider;

  /**
   * Wallet or signer for transactions
   */
  wallet?: Wallet | Signer;

  /**
   * Address of the DidVerifier contract
   */
  contractAddress: string;

  /**
   * Optional address of the DidRegistry contract
   * If not provided, it will be fetched from the DidVerifier contract
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

## Event Handling

The SDK provides access to contract events:

```typescript
// Listen for trust status updates
didVerifierSDK.events.on('IssuerTrustStatusUpdated', (event) => {
  const { credentialType, issuer, trusted } = event.args;
  console.log(`Issuer ${issuer} is now ${trusted ? 'trusted' : 'not trusted'} ` + `for ${credentialType}`);

  // Update application state
  updateTrustRegistry(credentialType, issuer, trusted);
});

// Start listening for events
await didVerifierSDK.events.startListening();
```

## Error Handling

The SDK provides standardized error handling:

```typescript
import { DidVerifierError, ErrorCode } from '@ledup/didverifier-sdk';

try {
  await didVerifierSDK.verifyCredential(credentialType, issuerAddress, subjectDid);
} catch (error) {
  if (error instanceof DidVerifierError) {
    switch (error.code) {
      case ErrorCode.INVALID_ISSUER:
        console.error('The issuer address is invalid');
        break;
      case ErrorCode.UNTRUSTED_ISSUER:
        console.error('The issuer is not trusted for this credential type');
        break;
      case ErrorCode.INVALID_CREDENTIAL:
        console.error('The credential is invalid or the subject DID is inactive');
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

Here's a complete example of implementing the DidVerifier SDK in a TypeScript application:

```typescript
import { DidVerifierSDK } from '@ledup/didverifier-sdk';
import { ethers } from 'ethers';

// Initialize provider and wallet
const provider = new ethers.providers.JsonRpcProvider('https://rpc-url.example.com');
const wallet = new ethers.Wallet('PRIVATE_KEY', provider);

// Initialize the SDK
const didVerifierSDK = new DidVerifierSDK({
  provider,
  wallet,
  contractAddress: '0xDidVerifierContractAddress',
});
await didVerifierSDK.initialize();

// Implementation of a credential verification service
class CredentialVerificationService {
  constructor(private sdk: DidVerifierSDK) {}

  async verifyHealthCredential(issuerAddress: string, patientDid: string) {
    try {
      const credentialType = 'HealthCareCredential';

      // First check if the issuer is trusted
      const isTrusted = await this.sdk.isIssuerTrusted(credentialType, issuerAddress);

      if (!isTrusted) {
        return {
          valid: false,
          reason: 'UNTRUSTED_ISSUER',
          message: 'The credential issuer is not trusted for healthcare credentials',
        };
      }

      // Verify the credential
      const isValid = await this.sdk.verifyCredential(credentialType, issuerAddress, patientDid);

      return {
        valid: isValid,
        issuer: issuerAddress,
        subject: patientDid,
        credentialType,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error verifying credential:', error);

      // Provide user-friendly error messages
      if (error.message.includes('InvalidIssuer')) {
        return {
          valid: false,
          reason: 'INVALID_ISSUER',
          message: 'The issuer address is invalid',
        };
      } else if (error.message.includes('UntrustedIssuer')) {
        return {
          valid: false,
          reason: 'UNTRUSTED_ISSUER',
          message: 'The credential issuer is not trusted',
        };
      } else if (error.message.includes('InvalidCredential')) {
        return {
          valid: false,
          reason: 'INVALID_CREDENTIAL',
          message: 'The subject DID is inactive or the credential is invalid',
        };
      }

      return {
        valid: false,
        reason: 'UNKNOWN_ERROR',
        message: error.message,
      };
    }
  }

  async addTrustedHospital(hospitalAddress: string) {
    try {
      const tx = await this.sdk.setIssuerTrustStatus('HealthCareCredential', hospitalAddress, true);

      await tx.wait();

      return {
        success: true,
        message: `Hospital ${hospitalAddress} is now a trusted issuer of healthcare credentials`,
        transactionHash: tx.hash,
      };
    } catch (error) {
      console.error('Error adding trusted hospital:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// Usage example
async function main() {
  const verificationService = new CredentialVerificationService(didVerifierSDK);

  // Add a trusted hospital
  const addResult = await verificationService.addTrustedHospital('0x1234567890123456789012345678901234567890');
  console.log('Add trusted hospital result:', addResult);

  // Verify a patient's healthcare credential
  const verifyResult = await verificationService.verifyHealthCredential(
    '0x1234567890123456789012345678901234567890', // Hospital address
    'did:ledup:sepolia:0x9876543210987654321098765432109876543210' // Patient DID
  );
  console.log('Verification result:', verifyResult);

  if (verifyResult.valid) {
    console.log('✅ Credential verified successfully');
    // Grant access to protected health records
  } else {
    console.log('❌ Credential verification failed:', verifyResult.message);
    // Deny access
  }
}

main().catch(console.error);
```

## Best Practices

1. **Cache Trust Status**: Cache the trust status of frequently used issuers to reduce blockchain calls
2. **Use Event Listeners**: Monitor trust status updates to keep your application in sync with on-chain state
3. **Implement Proper Error Handling**: Handle all potential errors gracefully with user-friendly messages
4. **Validate Inputs Client-Side**: Perform basic validation of addresses and DIDs before sending transactions
5. **Combine with DidRegistry**: Integrate with DidRegistry SDK for complete DID resolution and verification
6. **Implement Rate Limiting**: For public-facing services, implement rate limiting to prevent abuse
7. **Audit Trail**: Maintain logs of all verification attempts for compliance and debugging

## Security Considerations

1. **Access Control**: Restrict access to trust management functions to authorized administrators
2. **Multi-Signature**: Consider using multi-signature wallets for trust management operations
3. **Credential Expiry**: Implement additional checks for credential expiry dates in your application
4. **Input Sanitization**: Always sanitize and validate inputs before passing them to the SDK
5. **Monitor Events**: Set up alerts for suspicious changes to trust relationships

---

**© 2025 LEDUP - All rights reserved.**
