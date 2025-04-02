# LED-UP DID Registration and Authentication

This directory contains components, hooks, and utilities for managing decentralized identifiers (DIDs) in the LED-UP platform.

## Overview

The LED-UP platform uses DIDs to authenticate users and manage their roles and permissions. Each user has a unique DID that is linked to their wallet address and can be authenticated for different roles such as consumer or producer.

## Key Components

### DID Queries

The `didQueries.ts` file contains React Query hooks for interacting with the DID Registry and DID Auth smart contracts:

- `useDidExistsQuery`: Checks if a DID exists in the DID Registry
- `useRoleConstants`: Gets role constants from the DID Auth contract
- `useDidAuthentication`: Checks if a DID is authenticated for a specific role
- `useDidManager`: A comprehensive hook that combines all DID-related functionality

### DID Status Card

The `DidStatusCard.tsx` component displays the status of a user's DID, including:

- Whether the DID is registered
- Authentication status for different roles
- DID document and metadata
- Buttons for registering and authenticating the DID

### Blockchain Registration Hook

The `useBlockchainRegistration.ts` hook provides functions for interacting with the blockchain:

- `registerDid`: Registers a new DID in the DID Registry
- `checkDid`: Checks if a DID exists and is active
- `authenticateDid`: Authenticates a DID for a specific role
- `registerAsProducer`: Registers a DID as a producer in the Data Registry
- `grantRole`: Grants a role to a DID

## Usage Examples

### Using the DID Manager Hook

```tsx
import { useAccount } from 'wagmi';
import { useCallback } from 'react';
import { getContractAddresses } from '../../../lib/ethers';
import { useDidManager } from '../query/didQueries';

// Get contract addresses
const { DID_REGISTRY_ADDRESS, DID_AUTH_ADDRESS } = getContractAddresses();

// Convert string addresses to `0x${string}` format for Wagmi
const didRegistryAddress = DID_REGISTRY_ADDRESS as `0x${string}`;
const didAuthAddress = DID_AUTH_ADDRESS as `0x${string}`;

function MyComponent() {
  const { address } = useAccount();

  // Generate a DID for the connected wallet
  const generateDid = useCallback(() => {
    if (!address) {
      throw new Error('Wallet not connected');
    }
    const network = process.env.NEXT_PUBLIC_NETWORK_NAME || 'mainnet';
    return `did:ledup:${network}:${address.toLowerCase()}`;
  }, [address]);

  // Use the DID manager hook
  const { didExists, did, didDocument, consumerAuthenticated, producerAuthenticated, isLoading } = useDidManager(
    address,
    didRegistryAddress,
    didAuthAddress,
    generateDid
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>DID Status</h1>
      <p>DID: {did}</p>
      <p>Registered: {didExists ? 'Yes' : 'No'}</p>
      <p>Consumer Authenticated: {consumerAuthenticated ? 'Yes' : 'No'}</p>
      <p>Producer Authenticated: {producerAuthenticated ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

### Using the DID Status Card

```tsx
import { useBlockchainRegistration } from '../hooks/useBlockchainRegistration';
import { DidStatusCard } from '../components/DidStatusCard';
import { toast } from 'sonner';

function MyPage() {
  const { registerDid, authenticateDid } = useBlockchainRegistration();

  const handleRegister = async () => {
    try {
      const result = await registerDid();

      if (result.success) {
        toast.success('DID registered successfully');
      } else {
        toast.error(result.message || 'Failed to register DID');
      }
    } catch (error) {
      console.error('Error registering DID:', error);
      toast.error('An error occurred while registering DID');
    }
  };

  const handleAuthenticate = async (role: 'consumer' | 'producer') => {
    try {
      const result = await authenticateDid(role);

      if (result.success) {
        toast.success(`Authenticated as ${role} successfully`);
      } else {
        toast.error(result.message || `Failed to authenticate as ${role}`);
      }
    } catch (error) {
      console.error('Error authenticating DID:', error);
      toast.error('An error occurred while authenticating DID');
    }
  };

  return (
    <div>
      <h1>DID Status</h1>
      <DidStatusCard onRegister={handleRegister} onAuthenticate={handleAuthenticate} />
    </div>
  );
}
```

## Smart Contract Interactions

The DID queries interact with the following smart contracts:

- **DID Registry**: Manages DID registration and metadata
- **DID Auth**: Handles authentication and role management
- **DID Access Control**: Controls access to DID-related functions
- **Data Registry**: Stores data related to DIDs, such as producer information

## Error Handling

The DID queries include robust error handling for common issues:

- **DID not registered**: When trying to authenticate a DID that doesn't exist
- **Authentication errors**: When a DID is not authorized for a specific role
- **Network errors**: When there are issues connecting to the blockchain

## Development

To add new functionality to the DID queries:

1. Add new hooks to `didQueries.ts`
2. Update the `useDidManager` hook to include the new functionality
3. Create or update components to use the new hooks
4. Add tests for the new functionality

## Testing

To test the DID queries:

1. Ensure you have a local blockchain running (e.g., Hardhat node)
2. Deploy the DID Registry and DID Auth contracts
3. Set the contract addresses in your environment variables
4. Run the tests using Jest and React Testing Library
