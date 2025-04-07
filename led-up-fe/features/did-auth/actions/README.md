# DID Auth Actions

This directory contains server actions for interacting with the DID Auth smart contract. These actions are designed to be used with React Query for efficient data fetching.

## Structure

- `index.ts` - Exports all query and mutation functions
- `query.ts` - Contains server actions for reading data from the contract
- `mutation.ts` - Contains a utility function for processing transactions (Note: The DID Auth contract doesn't have any state-changing functions in the ABI)

## Usage with React Query

The server actions are designed to be used with React Query hooks, which can be implemented in a `features/did-auth/hooks` directory. These hooks provide a seamless way to fetch data from the contract.

### Example: Authenticating a DID for a role

```tsx
import { useAuthenticate } from '@/features/did-auth/hooks';

function RoleAuthentication({ did, role }) {
  const { data: isAuthenticated, isLoading } = useAuthenticate(did, role);

  if (isLoading) return <div>Loading...</div>;

  return <div>{isAuthenticated ? 'Authenticated' : 'Not authenticated'}</div>;
}
```

## Server Actions

### Query Actions

- `authenticate(did: string, role: string): Promise<boolean>` - Authenticate a DID for a specific role
- `getDid(address: string): Promise<string>` - Get the DID for an address
- `getRequiredCredentialForRole(role: string): Promise<string>` - Get the required credential for a role
- `hasRequiredRolesAndCredentials(did: string, roles: string[], credentialIds: string[]): Promise<boolean>` - Check if a DID has the required roles and credentials
- `verifyCredentialForAction(did: string, credentialType: string, credentialId: string): Promise<boolean>` - Verify a credential for an action
- `getConsumerCredential(): Promise<string>` - Get the consumer credential type
- `getConsumerRole(): Promise<string>` - Get the consumer role
- `getProducerCredential(): Promise<string>` - Get the producer credential type
- `getProducerRole(): Promise<string>` - Get the producer role
- `getServiceProviderCredential(): Promise<string>` - Get the service provider credential type
- `getServiceProviderRole(): Promise<string>` - Get the service provider role
- `getAccessControlAddress(): Promise<string>` - Get the access control contract address
- `getDidIssuerAddress(): Promise<string>` - Get the DID issuer contract address
- `getDidRegistryAddress(): Promise<string>` - Get the DID registry contract address
- `getDidVerifierAddress(): Promise<string>` - Get the DID verifier contract address

### Utility Functions

- `processTransactionReceipt(hash: string, path?: string): Promise<{ success: boolean; error?: string }>` - Process a transaction receipt

## React Query Hooks (Implementation Example)

The React Query hooks can be implemented in a `features/did-auth/hooks` directory. These hooks provide a seamless way to fetch data from the contract.

### Query Hooks

- `useAuthenticate(did?: string, role?: string)` - Authenticate a DID for a specific role
- `useGetDid(address?: string)` - Get the DID for an address
- `useRequiredCredentialForRole(role?: string)` - Get the required credential for a role
- `useHasRequiredRolesAndCredentials(did?: string, roles?: string[], credentialIds?: string[])` - Check if a DID has the required roles and credentials
- `useVerifyCredentialForAction(did?: string, credentialType?: string, credentialId?: string)` - Verify a credential for an action
- `useConsumerCredential()` - Get the consumer credential type
- `useConsumerRole()` - Get the consumer role
- `useProducerCredential()` - Get the producer credential type
- `useProducerRole()` - Get the producer role
- `useServiceProviderCredential()` - Get the service provider credential type
- `useServiceProviderRole()` - Get the service provider role
- `useAccessControlAddress()` - Get the access control contract address
- `useDidIssuerAddress()` - Get the DID issuer contract address
- `useDidRegistryAddress()` - Get the DID registry contract address
- `useDidVerifierAddress()` - Get the DID verifier contract address

## Configuration

The server actions use environment variables for configuration:

- `DID_AUTH_CONTRACT_ADDRESS` - The address of the DID Auth contract
- `CHAIN_ID` - The ID of the blockchain network
- `RPC_URL` - The URL of the RPC endpoint

These can be set in your `.env` file or overridden in the code.
