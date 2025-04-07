# DID Verifier Actions

This directory contains server actions for interacting with the DID Verifier smart contract. These actions provide a type-safe interface for verifying credentials and managing issuer trust status.

## Structure

- `index.ts`: Exports all query and mutation functions
- `query.ts`: Contains read-only functions for checking issuer trust status and verifying credentials
- `mutation.ts`: Contains state-changing functions for setting issuer trust status

## Usage

### Checking if an Issuer is Trusted

```tsx
import { useIsIssuerTrusted } from '@/features/did-verifier/hooks/use-did-verifier';

function IssuerTrustStatus({ credentialType, issuer }) {
  const { data: isTrusted, isLoading, error } = useIsIssuerTrusted(credentialType, issuer);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      Issuer {issuer} is {isTrusted ? 'trusted' : 'not trusted'} for credential type {credentialType}
    </div>
  );
}
```

### Verifying a Credential

```tsx
import { useVerifyCredential } from '@/features/did-verifier/hooks/use-did-verifier';

function CredentialVerification({ credentialType, issuer, subject }) {
  const { data: isValid, isLoading, error } = useVerifyCredential(credentialType, issuer, subject);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>Credential is {isValid ? 'valid' : 'invalid'}</div>;
}
```

### Setting Issuer Trust Status

```tsx
import { useSetIssuerTrustStatus } from '@/features/did-verifier/hooks/use-did-verifier';

function TrustIssuerForm() {
  const [credentialType, setCredentialType] = useState('');
  const [issuer, setIssuer] = useState('');
  const [trusted, setTrusted] = useState(false);
  const [privateKey, setPrivateKey] = useState('');

  const { mutate, isPending, error } = useSetIssuerTrustStatus();

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate({ credentialType, issuer, trusted, privateKey });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Processing...' : 'Set Trust Status'}
      </button>
      {error && <div>Error: {error.message}</div>}
    </form>
  );
}
```

## Server Actions

### Query Actions

- `isIssuerTrusted(credentialType: string, issuer: string): Promise<boolean>`

  - Checks if an issuer is trusted for a specific credential type
  - Parameters:
    - `credentialType`: The type of credential
    - `issuer`: The issuer address
  - Returns: A boolean indicating if the issuer is trusted

- `verifyCredential(credentialType: string, issuer: string, subject: string): Promise<boolean>`
  - Verifies a credential
  - Parameters:
    - `credentialType`: The type of credential
    - `issuer`: The issuer address
    - `subject`: The subject of the credential
  - Returns: A boolean indicating if the credential is valid

### Mutation Actions

- `setIssuerTrustStatus(credentialType: string, issuer: string, trusted: boolean, privateKey: string): Promise<TransactionResponse>`
  - Sets the trust status of an issuer for a specific credential type
  - Parameters:
    - `credentialType`: The type of credential
    - `issuer`: The issuer address
    - `trusted`: Whether the issuer should be trusted
    - `privateKey`: The private key for signing transactions
  - Returns: A transaction response object

## React Query Hooks

### Query Hooks

- `useIsIssuerTrusted(credentialType: string, issuer: string)`

  - Hook for checking if an issuer is trusted for a specific credential type
  - Parameters:
    - `credentialType`: The type of credential
    - `issuer`: The issuer address
  - Returns: A React Query result object with the trust status

- `useVerifyCredential(credentialType: string, issuer: string, subject: string)`
  - Hook for verifying a credential
  - Parameters:
    - `credentialType`: The type of credential
    - `issuer`: The issuer address
    - `subject`: The subject of the credential
  - Returns: A React Query result object with the verification result

### Mutation Hooks

- `useSetIssuerTrustStatus()`
  - Hook for setting the trust status of an issuer for a specific credential type
  - Parameters (via mutate function):
    - `credentialType`: The type of credential
    - `issuer`: The issuer address
    - `trusted`: Whether the issuer should be trusted
    - `privateKey`: The private key for signing transactions
  - Returns: A React Query mutation result object

## Example Component

```tsx
import {
  useIsIssuerTrusted,
  useVerifyCredential,
  useSetIssuerTrustStatus,
} from '@/features/did-verifier/hooks/use-did-verifier';

function CredentialVerifierPanel() {
  const [credentialType, setCredentialType] = useState('identity');
  const [issuer, setIssuer] = useState('0x123...');
  const [subject, setSubject] = useState('0x456...');
  const [privateKey, setPrivateKey] = useState('');

  const { data: isTrusted, isLoading: isLoadingTrust } = useIsIssuerTrusted(credentialType, issuer);
  const { data: isValid, isLoading: isLoadingVerify } = useVerifyCredential(credentialType, issuer, subject);
  const { mutate: setTrustStatus, isPending } = useSetIssuerTrustStatus();

  const handleTrustIssuer = () => {
    setTrustStatus({ credentialType, issuer, trusted: true, privateKey });
  };

  const handleUntrustIssuer = () => {
    setTrustStatus({ credentialType, issuer, trusted: false, privateKey });
  };

  return (
    <div>
      <h2>Credential Verification</h2>

      <div>
        <h3>Issuer Trust Status</h3>
        {isLoadingTrust ? <p>Loading trust status...</p> : <p>Issuer is {isTrusted ? 'trusted' : 'not trusted'}</p>}

        <button onClick={handleTrustIssuer} disabled={isPending}>
          Trust Issuer
        </button>
        <button onClick={handleUntrustIssuer} disabled={isPending}>
          Untrust Issuer
        </button>
      </div>

      <div>
        <h3>Credential Verification</h3>
        {isLoadingVerify ? <p>Verifying credential...</p> : <p>Credential is {isValid ? 'valid' : 'invalid'}</p>}
      </div>
    </div>
  );
}
```

## Configuration

The DID Verifier actions require the following environment variables:

- `DID_VERIFIER_CONTRACT_ADDRESS`: The address of the DID Verifier contract
- `CHAIN_ID`: The ID of the blockchain network
- `RPC_URL`: The URL of the RPC endpoint

## Implementation Details

These actions use the [Viem](https://viem.sh/) library for interacting with the blockchain. Viem provides a type-safe interface for Ethereum interactions and is more lightweight than ethers.js.

The actions are implemented as server actions, which means they run on the server and can be called directly from React components. This approach provides better security and performance compared to client-side blockchain interactions.
