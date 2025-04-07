# DID Issuer Actions

This directory contains server actions for interacting with the DID Issuer smart contract. These actions are used to query and mutate data in the DID Issuer contract.

## Structure

- `index.ts` - Exports all query and mutation functions
- `query.ts` - Contains read-only functions for querying data from the DID Issuer contract
- `mutation.ts` - Contains functions for modifying data in the DID Issuer contract

## Usage with React Query

The server actions in this directory are designed to be used with React Query. The hooks for these actions are implemented in the `features/did-issuer/hooks/use-did-issuer.ts` file.

### Example: Check if a credential is valid

```tsx
'use client';

import { useIsCredentialValid } from '@/features/did-issuer/hooks/use-did-issuer';

export default function CredentialStatus({ credentialId }: { credentialId: string }) {
  const { data: isValid, isLoading, error } = useIsCredentialValid(credentialId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      Credential {credentialId} is {isValid ? 'valid' : 'invalid'}
    </div>
  );
}
```

### Example: Issue a credential

```tsx
'use client';

import { useState } from 'react';
import { useIssueCredential } from '@/features/did-issuer/hooks/use-did-issuer';

export default function IssueCredential() {
  const [credentialType, setCredentialType] = useState('');
  const [subject, setSubject] = useState('');
  const [credentialId, setCredentialId] = useState('');
  const [privateKey, setPrivateKey] = useState('');

  const { mutate, isPending, isError, error } = useIssueCredential();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({ credentialType, subject, credentialId, privateKey });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Credential Type:
          <input type="text" value={credentialType} onChange={(e) => setCredentialType(e.target.value)} />
        </label>
      </div>
      <div>
        <label>
          Subject:
          <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </label>
      </div>
      <div>
        <label>
          Credential ID:
          <input type="text" value={credentialId} onChange={(e) => setCredentialId(e.target.value)} />
        </label>
      </div>
      <div>
        <label>
          Private Key:
          <input type="password" value={privateKey} onChange={(e) => setPrivateKey(e.target.value)} />
        </label>
      </div>
      <button type="submit" disabled={isPending}>
        {isPending ? 'Issuing...' : 'Issue Credential'}
      </button>
      {isError && <div>Error: {error.message}</div>}
    </form>
  );
}
```

## Server Actions

### Query Actions

| Function            | Parameters             | Return Type        | Description                    |
| ------------------- | ---------------------- | ------------------ | ------------------------------ |
| `isCredentialValid` | `credentialId: string` | `Promise<boolean>` | Check if a credential is valid |

### Mutation Actions

| Function                     | Parameters                                                                          | Return Type                                     | Description                                            |
| ---------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------ |
| `issueCredential`            | `credentialType: string, subject: string, credentialId: string, privateKey: string` | `Promise<TransactionResponse>`                  | Issue a credential                                     |
| `processTransactionResponse` | `txHash: string, path?: string`                                                     | `Promise<{ success: boolean; error?: string }>` | Process a transaction response and revalidate the path |

## React Query Hooks

### Query Hooks

| Hook                   | Parameters              | Description                    |
| ---------------------- | ----------------------- | ------------------------------ |
| `useIsCredentialValid` | `credentialId?: string` | Check if a credential is valid |

### Mutation Hooks

| Hook                 | Description        |
| -------------------- | ------------------ |
| `useIssueCredential` | Issue a credential |

## Example Component

```tsx
'use client';

import { useState } from 'react';
import { useIsCredentialValid, useIssueCredential } from '@/features/did-issuer/hooks/use-did-issuer';

export default function CredentialManagement() {
  const [credentialType, setCredentialType] = useState('');
  const [subject, setSubject] = useState('');
  const [credentialId, setCredentialId] = useState('');
  const [privateKey, setPrivateKey] = useState('');

  const { data: isValid, isLoading } = useIsCredentialValid(credentialId);
  const { mutate, isPending, isError, error } = useIssueCredential();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({ credentialType, subject, credentialId, privateKey });
  };

  return (
    <div>
      <h1>Credential Management</h1>
      <div>
        <label>
          Credential ID:
          <input type="text" value={credentialId} onChange={(e) => setCredentialId(e.target.value)} />
        </label>
      </div>
      {credentialId && (
        <div>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div>
              Credential {credentialId} is {isValid ? 'valid' : 'invalid'}
            </div>
          )}
        </div>
      )}
      <h2>Issue New Credential</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Credential Type:
            <input type="text" value={credentialType} onChange={(e) => setCredentialType(e.target.value)} />
          </label>
        </div>
        <div>
          <label>
            Subject:
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </label>
        </div>
        <div>
          <label>
            Private Key:
            <input type="password" value={privateKey} onChange={(e) => setPrivateKey(e.target.value)} />
          </label>
        </div>
        <button type="submit" disabled={isPending}>
          {isPending ? 'Issuing...' : 'Issue Credential'}
        </button>
        {isError && <div>Error: {error.message}</div>}
      </form>
    </div>
  );
}
```

## Configuration

The DID Issuer actions require the following environment variables:

- `DID_ISSUER_CONTRACT_ADDRESS`: The address of the DID Issuer contract
- `CHAIN_ID`: The chain ID of the network
- `RPC_URL`: The RPC URL of the network

## Implementation Details

The DID Issuer actions use [Viem](https://viem.sh/) for blockchain interactions. The key functions are:

- `getPublicClient`: Creates a public client for reading from the blockchain
- `getWalletClient`: Creates a wallet client for sending transactions
- `processTransactionReceipt`: Processes a transaction receipt and returns a standardized response

The mutation functions use the wallet client to send transactions to the blockchain, while the query functions use the public client to read data from the blockchain.
