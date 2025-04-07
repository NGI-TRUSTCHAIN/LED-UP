# DID Auth Feature

This feature provides hooks and utilities for interacting with the DID Auth smart contract. It enables authentication and verification of DIDs and their associated credentials.

## Structure

- `hooks/` - React Query hooks for interacting with the DID Auth contract
- `index.ts` - Exports all hooks and components

## Usage

### Authenticating a DID for a Role

```tsx
import { useAuthenticate } from '@/features/did-auth';

function RoleAuthentication({ did, role }) {
  const { data: isAuthenticated, isLoading } = useAuthenticate(did, role);

  if (isLoading) return <div>Loading...</div>;

  return <div>{isAuthenticated ? 'Authenticated' : 'Not authenticated'}</div>;
}
```

### Getting a DID for an Address

```tsx
import { useGetDid } from '@/features/did-auth';

function DidDisplay({ address }) {
  const { data: did, isLoading } = useGetDid(address);

  if (isLoading) return <div>Loading...</div>;

  return <div>DID: {did}</div>;
}
```

### Checking Required Roles and Credentials

```tsx
import { useHasRequiredRolesAndCredentials } from '@/features/did-auth';

function RoleAndCredentialCheck({ did, roles, credentialIds }) {
  const { data: hasRequiredRolesAndCredentials, isLoading } = useHasRequiredRolesAndCredentials(
    did,
    roles,
    credentialIds
  );

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {hasRequiredRolesAndCredentials
        ? 'Has required roles and credentials'
        : 'Does not have required roles and credentials'}
    </div>
  );
}
```

### Verifying a Credential for an Action

```tsx
import { useVerifyCredentialForAction } from '@/features/did-auth';

function CredentialVerification({ did, credentialType, credentialId }) {
  const { data: isVerified, isLoading } = useVerifyCredentialForAction(did, credentialType, credentialId);

  if (isLoading) return <div>Loading...</div>;

  return <div>{isVerified ? 'Credential verified' : 'Credential not verified'}</div>;
}
```

## Available Hooks

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

## Integration with Other Features

The DID Auth feature can be integrated with other features such as the Data Registry to provide authentication and authorization for data operations. For example, you can use the `useAuthenticate` hook to check if a user has the required role before allowing them to perform certain actions.
