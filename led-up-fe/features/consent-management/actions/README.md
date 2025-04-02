# Consent Management Actions

This directory contains server actions for interacting with the Consent Management smart contract. These actions provide a type-safe interface for managing consent between producers and providers.

## Structure

- `index.ts`: Exports all query and mutation functions
- `query.ts`: Contains read-only functions for checking consent validity and querying consent details
- `mutation.ts`: Contains state-changing functions for granting and revoking consent

## Usage

### Checking Consent Validity

```tsx
import { useHasValidConsent } from '@/features/consent-management/hooks/use-consent-management';

function ConsentStatus({ producerDid, providerDid }) {
  const { data: hasConsent, isLoading, error } = useHasValidConsent(producerDid, providerDid);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      Producer {producerDid} has {hasConsent ? 'given' : 'not given'} consent to provider {providerDid}
    </div>
  );
}
```

### Querying Consent Details

```tsx
import { useQueryConsent } from '@/features/consent-management/hooks/use-consent-management';

function ConsentDetails({ producerDid, providerDid }) {
  const { data, isLoading, error } = useQueryConsent(producerDid, providerDid);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h3>Consent Details</h3>
      <p>Status: {data.status}</p>
      <p>Timestamp: {new Date(Number(data.timestamp) * 1000).toLocaleString()}</p>
      <p>Purpose: {data.purpose}</p>
    </div>
  );
}
```

### Granting Consent

```tsx
import { useGrantConsent } from '@/features/consent-management/hooks/use-consent-management';

function GrantConsentForm() {
  const [providerDid, setProviderDid] = useState('');
  const [purpose, setPurpose] = useState('');
  const [expiryTime, setExpiryTime] = useState('');
  const [privateKey, setPrivateKey] = useState('');

  const { mutate, isPending, error } = useGrantConsent();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convert expiryTime to bigint (seconds since epoch)
    const expiryTimestamp = BigInt(Math.floor(new Date(expiryTime).getTime() / 1000));
    mutate({ providerDid, purpose, expiryTime: expiryTimestamp, privateKey });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Processing...' : 'Grant Consent'}
      </button>
      {error && <div>Error: {error.message}</div>}
    </form>
  );
}
```

### Revoking Consent

```tsx
import { useRevokeConsent } from '@/features/consent-management/hooks/use-consent-management';

function RevokeConsentForm() {
  const [providerDid, setProviderDid] = useState('');
  const [reason, setReason] = useState('');
  const [privateKey, setPrivateKey] = useState('');

  const { mutate, isPending, error } = useRevokeConsent();

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate({ providerDid, reason, privateKey });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Processing...' : 'Revoke Consent'}
      </button>
      {error && <div>Error: {error.message}</div>}
    </form>
  );
}
```

## Server Actions

### Query Actions

- `hasValidConsent(producerDid: string, providerDid: string): Promise<boolean>`

  - Checks if a producer has given valid consent to a provider
  - Parameters:
    - `producerDid`: The DID of the producer
    - `providerDid`: The DID of the provider
  - Returns: A boolean indicating if valid consent exists

- `queryConsent(producerDid: string, providerDid: string): Promise<{ status: number; timestamp: bigint; purpose: string }>`

  - Queries consent details between a producer and provider
  - Parameters:
    - `producerDid`: The DID of the producer
    - `providerDid`: The DID of the provider
  - Returns: An object with consent details including status, timestamp, and purpose

- `getAuthority(): Promise<string>`
  - Gets the authority address for the contract
  - Returns: The authority address

### Mutation Actions

- `grantConsent(providerDid: string, purpose: string, expiryTime: bigint, privateKey: string): Promise<TransactionResponse>`

  - Grants consent to a provider
  - Parameters:
    - `providerDid`: The DID of the provider
    - `purpose`: The purpose of the consent
    - `expiryTime`: The expiry time of the consent (Unix timestamp)
    - `privateKey`: The private key for signing transactions
  - Returns: A transaction response object

- `revokeConsent(providerDid: string, reason: string, privateKey: string): Promise<TransactionResponse>`

  - Revokes consent from a provider
  - Parameters:
    - `providerDid`: The DID of the provider
    - `reason`: The reason for revoking consent
    - `privateKey`: The private key for signing transactions
  - Returns: A transaction response object

- `setAuthority(newAuthority: string, privateKey: string): Promise<TransactionResponse>`
  - Sets the authority address for the contract
  - Parameters:
    - `newAuthority`: The new authority address
    - `privateKey`: The private key for signing transactions
  - Returns: A transaction response object

## React Query Hooks

### Query Hooks

- `useHasValidConsent(producerDid: string, providerDid: string)`

  - Hook for checking if a producer has given valid consent to a provider
  - Parameters:
    - `producerDid`: The DID of the producer
    - `providerDid`: The DID of the provider
  - Returns: A React Query result object with the consent validity

- `useQueryConsent(producerDid: string, providerDid: string)`

  - Hook for querying consent details between a producer and provider
  - Parameters:
    - `producerDid`: The DID of the producer
    - `providerDid`: The DID of the provider
  - Returns: A React Query result object with the consent details

- `useAuthority()`
  - Hook for getting the authority address for the contract
  - Returns: A React Query result object with the authority address

### Mutation Hooks

- `useGrantConsent()`

  - Hook for granting consent to a provider
  - Parameters (via mutate function):
    - `providerDid`: The DID of the provider
    - `purpose`: The purpose of the consent
    - `expiryTime`: The expiry time of the consent (Unix timestamp)
    - `privateKey`: The private key for signing transactions
  - Returns: A React Query mutation result object

- `useRevokeConsent()`

  - Hook for revoking consent from a provider
  - Parameters (via mutate function):
    - `providerDid`: The DID of the provider
    - `reason`: The reason for revoking consent
    - `privateKey`: The private key for signing transactions
  - Returns: A React Query mutation result object

- `useSetAuthority()`
  - Hook for setting the authority address for the contract
  - Parameters (via mutate function):
    - `newAuthority`: The new authority address
    - `privateKey`: The private key for signing transactions
  - Returns: A React Query mutation result object

## Example Component

```tsx
import {
  useHasValidConsent,
  useQueryConsent,
  useGrantConsent,
  useRevokeConsent,
} from '@/features/consent-management/hooks/use-consent-management';
import { useState } from 'react';

function ConsentManagementPanel() {
  const [producerDid, setProducerDid] = useState('did:ethr:0x123...');
  const [providerDid, setProviderDid] = useState('did:ethr:0x456...');
  const [purpose, setPurpose] = useState('Data sharing for research');
  const [expiryDate, setExpiryDate] = useState('');
  const [reason, setReason] = useState('');
  const [privateKey, setPrivateKey] = useState('');

  const { data: hasConsent, isLoading: isLoadingConsent } = useHasValidConsent(producerDid, providerDid);
  const { data: consentDetails, isLoading: isLoadingDetails } = useQueryConsent(producerDid, providerDid);

  const { mutate: grantConsent, isPending: isGrantPending } = useGrantConsent();
  const { mutate: revokeConsent, isPending: isRevokePending } = useRevokeConsent();

  const handleGrantConsent = () => {
    // Convert expiryDate to bigint (seconds since epoch)
    const expiryTimestamp = BigInt(Math.floor(new Date(expiryDate).getTime() / 1000));
    grantConsent({ providerDid, purpose, expiryTime: expiryTimestamp, privateKey });
  };

  const handleRevokeConsent = () => {
    revokeConsent({ providerDid, reason, privateKey });
  };

  return (
    <div>
      <h2>Consent Management</h2>

      <div>
        <h3>Consent Status</h3>
        {isLoadingConsent ? (
          <p>Loading consent status...</p>
        ) : (
          <p>Consent status: {hasConsent ? 'Valid' : 'Not valid'}</p>
        )}
      </div>

      {consentDetails && !isLoadingDetails && (
        <div>
          <h3>Consent Details</h3>
          <p>Status: {consentDetails.status}</p>
          <p>Timestamp: {new Date(Number(consentDetails.timestamp) * 1000).toLocaleString()}</p>
          <p>Purpose: {consentDetails.purpose}</p>
        </div>
      )}

      <div>
        <h3>Grant Consent</h3>
        <div>
          <label>
            Provider DID:
            <input value={providerDid} onChange={(e) => setProviderDid(e.target.value)} />
          </label>
        </div>
        <div>
          <label>
            Purpose:
            <input value={purpose} onChange={(e) => setPurpose(e.target.value)} />
          </label>
        </div>
        <div>
          <label>
            Expiry Date:
            <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
          </label>
        </div>
        <div>
          <label>
            Private Key:
            <input type="password" value={privateKey} onChange={(e) => setPrivateKey(e.target.value)} />
          </label>
        </div>
        <button onClick={handleGrantConsent} disabled={isGrantPending}>
          {isGrantPending ? 'Processing...' : 'Grant Consent'}
        </button>
      </div>

      <div>
        <h3>Revoke Consent</h3>
        <div>
          <label>
            Provider DID:
            <input value={providerDid} onChange={(e) => setProviderDid(e.target.value)} />
          </label>
        </div>
        <div>
          <label>
            Reason:
            <input value={reason} onChange={(e) => setReason(e.target.value)} />
          </label>
        </div>
        <div>
          <label>
            Private Key:
            <input type="password" value={privateKey} onChange={(e) => setPrivateKey(e.target.value)} />
          </label>
        </div>
        <button onClick={handleRevokeConsent} disabled={isRevokePending}>
          {isRevokePending ? 'Processing...' : 'Revoke Consent'}
        </button>
      </div>
    </div>
  );
}
```

## Configuration

The Consent Management actions require the following environment variables:

- `CONSENT_MANAGEMENT_CONTRACT_ADDRESS`: The address of the Consent Management contract
- `CHAIN_ID`: The ID of the blockchain network
- `RPC_URL`: The URL of the RPC endpoint

## Implementation Details

These actions use the [Viem](https://viem.sh/) library for interacting with the blockchain. Viem provides a type-safe interface for Ethereum interactions and is more lightweight than ethers.js.

The actions are implemented as server actions, which means they run on the server and can be called directly from React components. This approach provides better security and performance compared to client-side blockchain interactions.
