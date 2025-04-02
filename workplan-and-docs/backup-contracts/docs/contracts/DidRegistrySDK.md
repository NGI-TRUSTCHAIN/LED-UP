# LEDUP - DidRegistry TypeScript SDK

**Version:** 1.0.0  
**Last Updated:** March 2025  
**Status:** Production

## Overview

The DidRegistrySDK provides a TypeScript interface for interacting with the DidRegistry smart contract in the LEDUP ecosystem. This SDK simplifies the creation, management, and resolution of Decentralized Identifiers (DIDs), enabling developers to easily integrate decentralized identity capabilities into their applications.

## Core Features

### DID Registration

The SDK enables applications to create and register DIDs:

```typescript
// Create and register a new DID
const didDocument = {
  // DID document in JSON format
  '@context': ['https://www.w3.org/ns/did/v1'],
  authentication: [
    {
      id: `${did}#keys-1`,
      type: 'EcdsaSecp256k1RecoveryMethod2020',
      controller: did,
    },
  ],
};

// Serialize the document to a string
const documentString = JSON.stringify(didDocument);

// Register the DID
const tx = await didRegistrySDK.registerDid(
  did, // DID string (did:ledup:sepolia:0x123...)
  documentString, // DID document as a string
  publicKey // Public key string
);

await tx.wait();
console.log(`DID ${did} registered successfully`);
```

### DID Management

The SDK provides methods for updating and managing DIDs:

```typescript
// Update DID document
const newDocumentString = JSON.stringify(updatedDidDocument);
const updateTx = await didRegistrySDK.updateDidDocument(did, newDocumentString);
await updateTx.wait();
console.log('DID document updated');

// Update public key
const updateKeyTx = await didRegistrySDK.updateDidPublicKey(did, newPublicKey);
await updateKeyTx.wait();
console.log('DID public key updated');

// Deactivate DID
const deactivateTx = await didRegistrySDK.deactivateDid(did);
await deactivateTx.wait();
console.log('DID deactivated');

// Reactivate DID
const reactivateTx = await didRegistrySDK.reactivateDid(did);
await reactivateTx.wait();
console.log('DID reactivated');
```

### DID Resolution

The SDK provides comprehensive methods for resolving DIDs:

```typescript
// Resolve a DID to its full document
const didDocument = await didRegistrySDK.resolveDid(did);
console.log('DID Document:', didDocument);

// Get the controller/subject of a DID
const controller = await didRegistrySDK.getController(did);
console.log(`Controller of ${did} is ${controller}`);

// Check if a DID is active
const isActive = await didRegistrySDK.isActive(did);
console.log(`DID is ${isActive ? 'active' : 'inactive'}`);

// Get the DID associated with an address
const userDid = await didRegistrySDK.addressToDID(walletAddress);
console.log(`DID for address ${walletAddress}: ${userDid}`);
```

## Integration Patterns

### User Identity Management

```typescript
// Example: Identity management class using the SDK
class IdentityManager {
  constructor(private sdk: DidRegistrySDK) {}

  async createUserIdentity(address: string, publicKey: string) {
    try {
      // Generate a DID from the address
      const did = `did:ledup:sepolia:${address.slice(2).toLowerCase()}`;

      // Create minimal DID document
      const document = {
        '@context': ['https://www.w3.org/ns/did/v1'],
        id: did,
        controller: did,
        authentication: [
          {
            id: `${did}#keys-1`,
            type: 'EcdsaSecp256k1VerificationKey2019',
            controller: did,
            publicKeyHex: publicKey,
          },
        ],
      };

      // Register the DID
      const tx = await this.sdk.registerDid(did, JSON.stringify(document), publicKey);
      await tx.wait();

      return {
        success: true,
        did,
        transactionHash: tx.hash,
      };
    } catch (error) {
      console.error('Failed to create identity:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getUserIdentity(address: string) {
    try {
      // Try to get the DID for this address
      const did = await this.sdk.addressToDID(address);

      if (!did) {
        return { registered: false };
      }

      // Get DID document and status
      const document = await this.sdk.resolveDid(did);
      const isActive = await this.sdk.isActive(did);
      const lastUpdated = await this.sdk.getLastUpdated(did);

      return {
        registered: true,
        did,
        document,
        isActive,
        lastUpdated: new Date(lastUpdated * 1000),
      };
    } catch (error) {
      console.error('Failed to get identity:', error);
      return { registered: false, error: error.message };
    }
  }

  async deactivateIdentity(did: string) {
    try {
      const tx = await this.sdk.deactivateDid(did);
      await tx.wait();
      return { success: true, transactionHash: tx.hash };
    } catch (error) {
      console.error('Failed to deactivate identity:', error);
      return { success: false, error: error.message };
    }
  }
}
```

### React Integration

```typescript
// Example: React hook for DID management
function useDid(address) {
  const [didInfo, setDidInfo] = useState({ loading: true });

  useEffect(() => {
    async function loadDidInfo() {
      if (!address) {
        setDidInfo({ loading: false, registered: false });
        return;
      }

      try {
        // Get DID for address
        const did = await didRegistrySDK.addressToDID(address);

        if (!did) {
          setDidInfo({ loading: false, registered: false });
          return;
        }

        // Get additional information
        const [document, isActive, lastUpdated] = await Promise.all([
          didRegistrySDK.getDocumentForDid(did),
          didRegistrySDK.isActive(did),
          didRegistrySDK.getLastUpdated(did),
        ]);

        setDidInfo({
          loading: false,
          registered: true,
          did,
          document: JSON.parse(document),
          isActive,
          lastUpdated: new Date(lastUpdated * 1000),
        });
      } catch (error) {
        console.error('Error loading DID info:', error);
        setDidInfo({
          loading: false,
          registered: false,
          error: error.message,
        });
      }
    }

    loadDidInfo();
  }, [address]);

  return didInfo;
}
```

## API Reference

### DidRegistrySDK

```typescript
class DidRegistrySDK {
  /**
   * Constructor for the DidRegistrySDK
   */
  constructor(config: DidRegistrySDKConfig);

  /**
   * Initialize the SDK
   */
  async initialize(): Promise<void>;

  /**
   * Register a new DID
   */
  async registerDid(did: string, document: string, publicKey: string): Promise<TransactionResponse>;

  /**
   * Update the document of a DID
   */
  async updateDidDocument(did: string, newDocument: string): Promise<TransactionResponse>;

  /**
   * Update the public key of a DID
   */
  async updateDidPublicKey(did: string, newPublicKey: string): Promise<TransactionResponse>;

  /**
   * Deactivate a DID
   */
  async deactivateDid(did: string): Promise<TransactionResponse>;

  /**
   * Reactivate a previously deactivated DID
   */
  async reactivateDid(did: string): Promise<TransactionResponse>;

  /**
   * Get the public key for a DID
   */
  async getPublicKey(did: string): Promise<string>;

  /**
   * Get the subject/controller for a DID
   */
  async getController(did: string): Promise<string>;

  /**
   * Get the document for a DID
   */
  async getDocument(did: string): Promise<string>;

  /**
   * Check if a DID is active
   */
  async isActive(did: string): Promise<boolean>;

  /**
   * Get the last updated timestamp for a DID
   */
  async getLastUpdated(did: string): Promise<number>;

  /**
   * Resolve a DID to its full document and metadata
   */
  async resolveDid(did: string): Promise<DIDDocument>;

  /**
   * Convert an address to its associated DID
   */
  async addressToDID(address: string): Promise<string>;
}
```

### Configuration

```typescript
interface DidRegistrySDKConfig {
  /**
   * Provider for connecting to Ethereum
   */
  provider: Provider;

  /**
   * Wallet or signer for transactions
   */
  wallet?: Wallet | Signer;

  /**
   * Address of the DidRegistry contract
   */
  contractAddress: string;

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
interface DIDDocument {
  /**
   * The controller/subject address
   */
  subject: string;

  /**
   * Timestamp of last update
   */
  lastUpdated: number;

  /**
   * Active status flag
   */
  active: boolean;

  /**
   * Public key string
   */
  publicKey: string;

  /**
   * Document string
   */
  document: string;
}
```

## Event Handling

The SDK provides access to contract events:

```typescript
// Listen for DID registration events
didRegistrySDK.events.on('DIDRegistered', (event) => {
  const { did, controller } = event.args;
  console.log(`New DID registered: ${did} by ${controller}`);

  // Update application state
  updateIdentityRegistry(did, controller);
});

// Listen for DID update events
didRegistrySDK.events.on('DIDUpdated', (event) => {
  const { did, timestamp } = event.args;
  console.log(`DID updated: ${did} at ${new Date(timestamp * 1000)}`);

  // Update application state
  refreshDIDDocument(did);
});

// Listen for DID deactivation events
didRegistrySDK.events.on('DIDDeactivated', (event) => {
  const { did, timestamp } = event.args;
  console.log(`DID deactivated: ${did} at ${new Date(timestamp * 1000)}`);

  // Update application state
  markDIDInactive(did);
});

// Start listening for events
await didRegistrySDK.events.startListening();
```

## Error Handling

The SDK provides standardized error handling:

```typescript
import { DidRegistryError, ErrorCode } from '@ledup/didregistry-sdk';

try {
  await didRegistrySDK.updateDidDocument(did, newDocument);
} catch (error) {
  if (error instanceof DidRegistryError) {
    switch (error.code) {
      case ErrorCode.UNAUTHORIZED:
        console.error('Not authorized to update this DID');
        break;
      case ErrorCode.INVALID_DID:
        console.error('The DID is invalid or does not exist');
        break;
      case ErrorCode.DEACTIVATED_DID:
        console.error('Cannot update a deactivated DID');
        break;
      case ErrorCode.DID_ALREADY_REGISTERED:
        console.error('This DID is already registered');
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

Here's a complete example of implementing the DidRegistry SDK in a TypeScript application:

```typescript
import { DidRegistrySDK } from '@ledup/didregistry-sdk';
import { ethers } from 'ethers';

// Initialize provider and wallet
const provider = new ethers.providers.JsonRpcProvider('https://rpc-url.example.com');
const wallet = new ethers.Wallet('PRIVATE_KEY', provider);

// Initialize the SDK
const didRegistrySDK = new DidRegistrySDK({
  provider,
  wallet,
  contractAddress: '0xDidRegistryContractAddress',
});
await didRegistrySDK.initialize();

// Implementation of a DID service
class DidService {
  constructor(private sdk: DidRegistrySDK) {}

  async createDid(address: string) {
    try {
      // Generate DID string
      const did = `did:ledup:sepolia:${address.slice(2).toLowerCase()}`;

      // Generate public key (in a real app, this would be more secure)
      const publicKey = ethers.utils.hexlify(ethers.utils.randomBytes(32));

      // Create basic DID document
      const document = {
        '@context': 'https://www.w3.org/ns/did/v1',
        id: did,
        verificationMethod: [
          {
            id: `${did}#keys-1`,
            type: 'EcdsaSecp256k1VerificationKey2019',
            controller: did,
            publicKeyBase58: publicKey,
          },
        ],
        authentication: [`${did}#keys-1`],
      };

      // Register the DID
      const tx = await this.sdk.registerDid(did, JSON.stringify(document), publicKey);

      await tx.wait();

      return {
        success: true,
        did,
        publicKey,
        document,
      };
    } catch (error) {
      console.error('Error creating DID:', error);
      return { success: false, error: error.message };
    }
  }

  async resolveDid(did: string) {
    try {
      // Resolve DID
      const didDocument = await this.sdk.resolveDid(did);

      // Parse the document string to JSON
      let parsedDocument;
      try {
        parsedDocument = JSON.parse(didDocument.document);
      } catch {
        parsedDocument = { unparseable: true };
      }

      return {
        did,
        controller: didDocument.subject,
        document: parsedDocument,
        publicKey: didDocument.publicKey,
        active: didDocument.active,
        lastUpdated: new Date(didDocument.lastUpdated * 1000),
      };
    } catch (error) {
      console.error('Error resolving DID:', error);
      return { success: false, error: error.message };
    }
  }

  async updateDocument(did: string, documentUpdates = {}) {
    try {
      // First get the current document
      const currentDocumentStr = await this.sdk.getDocument(did);
      const currentDocument = JSON.parse(currentDocumentStr);

      // Apply updates
      const updatedDocument = {
        ...currentDocument,
        ...documentUpdates,
        updated: new Date().toISOString(),
      };

      // Update the document
      const tx = await this.sdk.updateDidDocument(did, JSON.stringify(updatedDocument));

      await tx.wait();

      return {
        success: true,
        did,
        document: updatedDocument,
      };
    } catch (error) {
      console.error('Error updating DID document:', error);
      return { success: false, error: error.message };
    }
  }
}

// Usage example
async function main() {
  const didService = new DidService(didRegistrySDK);

  // Create a new DID
  const result = await didService.createDid('0x1234567890123456789012345678901234567890');
  console.log('DID creation result:', result);

  if (result.success) {
    // Resolve the DID
    const resolveResult = await didService.resolveDid(result.did);
    console.log('DID resolution result:', resolveResult);

    // Update the DID document
    const updateResult = await didService.updateDocument(result.did, {
      service: [
        {
          id: `${result.did}#service-1`,
          type: 'LinkedDomains',
          serviceEndpoint: 'https://example.com',
        },
      ],
    });
    console.log('DID update result:', updateResult);
  }
}

main().catch(console.error);
```

## Best Practices

1. **Validate DIDs Client-Side**: Perform basic validation before sending transactions
2. **Use Event Listeners**: Monitor DID events to keep your application in sync
3. **Implement Caching**: Cache DID documents to reduce blockchain calls
4. **Handle Errors Gracefully**: Implement proper error handling for all operations
5. **Check DID Status**: Always verify a DID is active before operations
6. **Parse Documents Safely**: Use try-catch when parsing DID document JSON
7. **Batch Operations**: Group related operations where possible to improve UX

## DID Format

The LEDUP platform uses a standard DID format:

```
did:ledup:<network>:<identifier>
```

This SDK automatically validates DIDs before sending them to the contract, ensuring they follow the correct format.

---

**© 2025 LEDUP - All rights reserved.**
