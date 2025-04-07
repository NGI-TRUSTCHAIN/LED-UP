# LEDUP - DidAuth TypeScript SDK

**Version:** 1.0.0  
**Last Updated:** March 2025  
**Status:** Production

## Overview

The DidAuthSDK provides a TypeScript interface for interacting with the DidAuth smart contract in the LEDUP ecosystem. This SDK simplifies identity management, authentication, and role-based access control in applications built on the LEDUP platform.

## Core Features

### DID Management

The SDK enables applications to work with Decentralized Identifiers (DIDs):

```typescript
// Get DID from user's wallet address
const userDid = await didAuthSDK.getDidFromAddress(userWalletAddress);
console.log(`User DID: ${userDid}`);

// Get controller address for a DID
const controllerAddress = await didAuthSDK.resolveDid(userDid);
console.log(`DID Controller: ${controllerAddress}`);
```

### Authentication

The SDK provides methods for authenticating users with specific roles:

```typescript
// Check if user has producer role
const isProducer = await didAuthSDK.authenticate(userDid, didAuthSDK.roles.PRODUCER_ROLE);

if (isProducer) {
  console.log('User authenticated as producer');
  // Enable producer-specific functionality
} else {
  console.log('User does not have producer role');
  // Show limited functionality
}
```

### Role Management

The SDK allows authorized users to manage roles:

```typescript
// Grant producer role to a user
const tx = await didAuthSDK.grantDidRole(userDid, didAuthSDK.roles.PRODUCER_ROLE);
await tx.wait();
console.log('Producer role granted to user');

// Check if user has a specific role
const hasRole = await didAuthSDK.hasDidRole(userDid, didAuthSDK.roles.CONSUMER_ROLE);
console.log(`Has consumer role: ${hasRole}`);

// Get all user roles
const roles = await didAuthSDK.getUserRoles(userDid);
console.log('User roles:', roles);
```

### Credential Verification

The SDK provides methods for credential verification:

```typescript
// Verify a credential for a specific action
const isValid = await didAuthSDK.verifyCredentialForAction(userDid, 'ProducerCredential', credentialId);

if (isValid) {
  console.log('Credential verified successfully');
} else {
  console.log('Invalid or expired credential');
}
```

## Integration Patterns

### Authentication Integration

```typescript
// Example: Integrating authentication in a React component
function HealthDataViewer() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { account } = useWallet();

  useEffect(() => {
    async function checkAccess() {
      if (!account) return;

      try {
        const userDid = await didAuthSDK.getDidFromAddress(account);

        // Check if user has consumer role
        const hasConsumerRole = await didAuthSDK.authenticate(userDid, didAuthSDK.roles.CONSUMER_ROLE);

        setIsAuthorized(hasConsumerRole);
      } catch (error) {
        console.error('Authentication error:', error);
        setIsAuthorized(false);
      }
    }

    checkAccess();
  }, [account]);

  if (!isAuthorized) {
    return <AccessDeniedView />;
  }

  return <HealthDataContent />;
}
```

### Multi-Role Access Control

```typescript
// Check for multiple roles with corresponding credentials
async function checkMultipleRoles(did, credentialIds) {
  try {
    const hasRoles = await didAuthSDK.hasRequiredRolesAndCredentials(
      did,
      [didAuthSDK.roles.PROVIDER_ROLE, didAuthSDK.roles.VERIFIER_ROLE],
      credentialIds
    );

    return hasRoles;
  } catch (error) {
    console.error('Role verification error:', error);
    return false;
  }
}
```

## API Reference

### DidAuthSDK

```typescript
class DidAuthSDK {
  /**
   * Constructor for the DidAuthSDK
   */
  constructor(config: DidAuthSDKConfig);

  /**
   * Initialize the SDK
   */
  async initialize(): Promise<void>;

  /**
   * Authenticate a DID for a specific role
   */
  async authenticate(did: string, role: string | BytesLike): Promise<boolean>;

  /**
   * Get the DID associated with an address
   */
  async getDidFromAddress(address: string): Promise<string>;

  /**
   * Get the DID for the caller's address
   */
  async getCallerDid(): Promise<string>;

  /**
   * Grant a role to a DID
   */
  async grantDidRole(did: string, role: string | BytesLike): Promise<TransactionResponse>;

  /**
   * Revoke a role from a DID (admin only)
   */
  async revokeDidRole(did: string, role: string | BytesLike): Promise<TransactionResponse>;

  /**
   * Check if a DID has a specific role
   */
  async hasDidRole(did: string, role: string | BytesLike): Promise<boolean>;

  /**
   * Check if an address has a specific role
   */
  async hasRole(role: string | BytesLike, address: string): Promise<boolean>;

  /**
   * Resolve a DID to its controller address
   */
  async resolveDid(did: string): Promise<string>;

  /**
   * Set a trusted issuer for a credential type (admin only)
   */
  async setTrustedIssuer(credentialType: string, issuer: string, trusted: boolean): Promise<TransactionResponse>;

  /**
   * Check if an issuer is trusted for a credential type
   */
  async isTrustedIssuer(credentialType: string, issuer: string): Promise<boolean>;

  /**
   * Get the required credential type for a role
   */
  async getRequiredCredentialForRole(role: string | BytesLike): Promise<string>;

  /**
   * Set the credential requirement for a role (admin only)
   */
  async setRoleRequirement(role: string | BytesLike, requirement: string): Promise<TransactionResponse>;

  /**
   * Verify a credential for a specific action
   */
  async verifyCredentialForAction(
    did: string,
    credentialType: string,
    credentialId: string | BytesLike
  ): Promise<boolean>;

  /**
   * Issue a credential to a DID (admin only)
   */
  async issueCredential(
    credentialType: string,
    did: string,
    credentialId: string | BytesLike
  ): Promise<TransactionResponse>;

  /**
   * Check if a DID has multiple required roles and credentials
   */
  async hasRequiredRolesAndCredentials(
    did: string,
    roles: Array<string | BytesLike>,
    credentialIds: Array<string | BytesLike>
  ): Promise<boolean>;

  /**
   * Get all roles assigned to a DID
   */
  async getUserRoles(did: string): Promise<Array<string>>;

  /**
   * Get all roles assigned to an address
   */
  async getUserRolesByAddress(address: string): Promise<Array<string>>;

  /**
   * Get role constants
   */
  get roles(): {
    DEFAULT_ADMIN_ROLE: string;
    ADMIN_ROLE: string;
    OPERATOR_ROLE: string;
    PRODUCER_ROLE: string;
    CONSUMER_ROLE: string;
    PROVIDER_ROLE: string;
    ISSUER_ROLE: string;
    VERIFIER_ROLE: string;
  };

  /**
   * Get credential type constants
   */
  get credentialTypes(): {
    PRODUCER_CREDENTIAL: string;
    CONSUMER_CREDENTIAL: string;
    PROVIDER_CREDENTIAL: string;
  };
}
```

### Configuration

```typescript
interface DidAuthSDKConfig {
  /**
   * Provider for connecting to Ethereum
   */
  provider: Provider;

  /**
   * Wallet or signer for transactions
   */
  wallet?: Wallet | Signer;

  /**
   * Address of the DidAuth contract
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

## Event Handling

The SDK provides access to contract events:

```typescript
// Listen for role granted events
didAuthSDK.events.on('RoleGranted', (event) => {
  const { did, role, timestamp } = event.args;
  console.log(`Role granted: ${role} to ${did} at ${new Date(timestamp * 1000)}`);

  // Update application state
  updateUserPermissions(did, role, true);
});

// Listen for role revoked events
didAuthSDK.events.on('RoleRevoked', (event) => {
  const { did, role, timestamp } = event.args;
  console.log(`Role revoked: ${role} from ${did} at ${new Date(timestamp * 1000)}`);

  // Update application state
  updateUserPermissions(did, role, false);
});

// Start listening to events
await didAuthSDK.events.startListening();
```

## Error Handling

The SDK provides standardized error handling:

```typescript
import { DidAuthError, ErrorCode } from '@ledup/didauth-sdk';

try {
  const isAuthenticated = await didAuthSDK.authenticate(userDid, didAuthSDK.roles.PRODUCER_ROLE);
} catch (error) {
  if (error instanceof DidAuthError) {
    switch (error.code) {
      case ErrorCode.INVALID_DID:
        console.error('The DID is invalid or does not exist');
        break;
      case ErrorCode.DEACTIVATED_DID:
        console.error('The DID has been deactivated');
        break;
      case ErrorCode.UNAUTHORIZED:
        console.error('Not authorized to perform this action');
        break;
      case ErrorCode.INVALID_CREDENTIAL:
        console.error('The credential is invalid or expired');
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

Here's a complete example of implementing the DidAuth SDK in a TypeScript application:

```typescript
import { DidAuthSDK } from '@ledup/didauth-sdk';
import { ethers } from 'ethers';

// Initialize provider and wallet
const provider = new ethers.providers.JsonRpcProvider('https://rpc-url.example.com');
const wallet = new ethers.Wallet('PRIVATE_KEY', provider);

// Initialize the SDK
const didAuthSDK = new DidAuthSDK({
  provider,
  wallet,
  contractAddress: '0xDidAuthContractAddress',
});
await didAuthSDK.initialize();

// Implementation of an identity service
class IdentityService {
  constructor(private sdk: DidAuthSDK) {}

  async getUserIdentity(address: string) {
    try {
      // Get user's DID
      const did = await this.sdk.getDidFromAddress(address);
      if (!did) {
        return { registered: false };
      }

      // Get user's roles
      const roles = await this.sdk.getUserRoles(did);

      // Check common roles
      const isProducer = roles.includes(this.sdk.roles.PRODUCER_ROLE);
      const isConsumer = roles.includes(this.sdk.roles.CONSUMER_ROLE);
      const isProvider = roles.includes(this.sdk.roles.PROVIDER_ROLE);

      return {
        registered: true,
        did,
        roles,
        isProducer,
        isConsumer,
        isProvider,
      };
    } catch (error) {
      console.error('Error fetching identity:', error);
      return { registered: false, error: error.message };
    }
  }

  async registerUserAsProducer(address: string) {
    try {
      // Get user's DID
      const did = await this.sdk.getDidFromAddress(address);
      if (!did) {
        throw new Error('User does not have a registered DID');
      }

      // Grant producer role
      const tx = await this.sdk.grantDidRole(did, this.sdk.roles.PRODUCER_ROLE);
      await tx.wait();

      // Issue producer credential
      const credentialId = ethers.utils.id(`producer-${did}-${Date.now()}`);
      await this.sdk.issueCredential(this.sdk.credentialTypes.PRODUCER_CREDENTIAL, did, credentialId);

      return {
        success: true,
        did,
        role: 'PRODUCER',
        credentialId,
      };
    } catch (error) {
      console.error('Error registering producer:', error);
      return { success: false, error: error.message };
    }
  }

  async verifyUserAccess(address: string, requiredRole: string) {
    try {
      // Get user's DID
      const did = await this.sdk.getDidFromAddress(address);
      if (!did) {
        return false;
      }

      // Check if user has the required role
      return await this.sdk.authenticate(did, requiredRole);
    } catch (error) {
      console.error('Error verifying access:', error);
      return false;
    }
  }
}

// Usage example
async function main() {
  const identityService = new IdentityService(didAuthSDK);

  // Get user identity
  const userIdentity = await identityService.getUserIdentity('0xUserAddress');
  console.log('User identity:', userIdentity);

  // Register user as producer (requires admin role)
  if (!userIdentity.isProducer) {
    const result = await identityService.registerUserAsProducer('0xUserAddress');
    console.log('Registration result:', result);
  }

  // Verify access for specific role
  const hasAccess = await identityService.verifyUserAccess('0xUserAddress', didAuthSDK.roles.PRODUCER_ROLE);
  console.log('Has producer access:', hasAccess);
}

main().catch(console.error);
```

## Best Practices

1. **Cache DID Information**: Minimize blockchain calls by caching DID and role information
2. **Use Role Constants**: Utilize the SDK's role constants instead of hardcoding role values
3. **Implement Proper Error Handling**: Catch and handle authentication errors gracefully
4. **Monitor Role Events**: Subscribe to role events to keep application state updated
5. **Verify Before Actions**: Always verify authentication before allowing sensitive operations
6. **Check Both Roles and Credentials**: For high-security operations, verify both role assignment and credential validity
7. **Implement Role-Based UI**: Adapt your user interface based on the user's authenticated roles

---

**© 2025 LEDUP - All rights reserved.**
