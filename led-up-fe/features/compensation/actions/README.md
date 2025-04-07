# Compensation Actions

This directory contains server actions for interacting with the Compensation smart contract. These actions are used to query and mutate data in the Compensation contract.

## Structure

- `index.ts` - Exports all query and mutation functions
- `query.ts` - Contains read-only functions for querying data from the Compensation contract
- `mutation.ts` - Contains functions for modifying data in the Compensation contract

## Usage with React Query

The server actions in this directory are designed to be used with React Query. The hooks for these actions are implemented in the `features/compensation/hooks/use-compensation.ts` file.

### Example: Check if a producer exists

```tsx
'use client';

import { useProducerExists } from '@/features/compensation/hooks/use-compensation';

export default function ProducerStatus({ producer }: { producer: `0x${string}` }) {
  const { data: exists, isLoading, error } = useProducerExists(producer);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      Producer {producer} {exists ? 'exists' : 'does not exist'}
    </div>
  );
}
```

### Example: Register a producer

```tsx
'use client';

import { useState } from 'react';
import { useRegisterProducer } from '@/features/compensation/hooks/use-compensation';

export default function RegisterProducer() {
  const [producer, setProducer] = useState<`0x${string}`>('0x0');
  const [did, setDid] = useState('');
  const [privateKey, setPrivateKey] = useState('');

  const { mutate, isPending, isError, error } = useRegisterProducer();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({ producer, did, privateKey });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Producer Address:
          <input type="text" value={producer} onChange={(e) => setProducer(e.target.value as `0x${string}`)} />
        </label>
      </div>
      <div>
        <label>
          DID:
          <input type="text" value={did} onChange={(e) => setDid(e.target.value)} />
        </label>
      </div>
      <div>
        <label>
          Private Key:
          <input type="password" value={privateKey} onChange={(e) => setPrivateKey(e.target.value)} />
        </label>
      </div>
      <button type="submit" disabled={isPending}>
        {isPending ? 'Registering...' : 'Register Producer'}
      </button>
      {isError && <div>Error: {error.message}</div>}
    </form>
  );
}
```

## Server Actions

### Query Actions

| Function                   | Parameters          | Return Type                                     | Description                           |
| -------------------------- | ------------------- | ----------------------------------------------- | ------------------------------------- |
| `getDidAuth`               | None                | `Promise<string>`                               | Get the DID Auth contract address     |
| `getConsumerDid`           | `consumer: string`  | `Promise<string>`                               | Get the DID for a consumer            |
| `getLeveaWallet`           | None                | `Promise<string>`                               | Get the Levea wallet address          |
| `getLeveaWalletBalance`    | None                | `Promise<bigint>`                               | Get the Levea wallet balance          |
| `getMinimumWithdrawAmount` | None                | `Promise<bigint>`                               | Get the minimum withdraw amount       |
| `getPaymentTokenAddress`   | None                | `Promise<string>`                               | Get the payment token address         |
| `getProducerDid`           | `producer: string`  | `Promise<string>`                               | Get the DID for a producer            |
| `getProducerWalletBalance` | `producer?: string` | `Promise<bigint>`                               | Get the wallet balance for a producer |
| `getServiceFee`            | None                | `Promise<bigint>`                               | Get the service fee                   |
| `getUnitPrice`             | None                | `Promise<bigint>`                               | Get the unit price                    |
| `getOwner`                 | None                | `Promise<string>`                               | Get the contract owner                |
| `isPaused`                 | None                | `Promise<boolean>`                              | Check if the service is paused        |
| `getPayment`               | `recordId: string`  | `Promise<{ amount: bigint; isPayed: boolean }>` | Get payment information for a record  |
| `producerExists`           | `producer: string`  | `Promise<boolean>`                              | Check if a producer exists            |
| `getServiceFeeBalance`     | None                | `Promise<bigint>`                               | Get the service fee balance           |
| `getToken`                 | None                | `Promise<string>`                               | Get the token address                 |
| `verifyPayment`            | `recordId: string`  | `Promise<boolean>`                              | Verify payment for a record           |

### Mutation Actions

| Function                     | Parameters                                                                                      | Return Type                                     | Description                                            |
| ---------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------ |
| `changeServiceFee`           | `fee: bigint, privateKey: string`                                                               | `Promise<TransactionResponse>`                  | Change the service fee                                 |
| `changeTokenAddress`         | `tokenAddress: string, privateKey: string`                                                      | `Promise<TransactionResponse>`                  | Change the token address                               |
| `changeUnitPrice`            | `price: bigint, privateKey: string`                                                             | `Promise<TransactionResponse>`                  | Change the unit price                                  |
| `pauseService`               | `privateKey: string`                                                                            | `Promise<TransactionResponse>`                  | Pause the service                                      |
| `processPayment`             | `producer: string, recordId: string, dataSize: bigint, consumerDid: string, privateKey: string` | `Promise<TransactionResponse>`                  | Process payment for a record                           |
| `registerConsumer`           | `consumer: string, did: string, privateKey: string`                                             | `Promise<TransactionResponse>`                  | Register a consumer                                    |
| `registerProducer`           | `producer: string, did: string, privateKey: string`                                             | `Promise<TransactionResponse>`                  | Register a producer                                    |
| `removeProducer`             | `producer: string, privateKey: string`                                                          | `Promise<TransactionResponse>`                  | Remove a producer                                      |
| `renounceOwnership`          | `privateKey: string`                                                                            | `Promise<TransactionResponse>`                  | Renounce ownership of the contract                     |
| `setMinimumWithdrawAmount`   | `amount: bigint, privateKey: string`                                                            | `Promise<TransactionResponse>`                  | Set the minimum withdraw amount                        |
| `transferOwnership`          | `newOwner: string, privateKey: string`                                                          | `Promise<TransactionResponse>`                  | Transfer ownership of the contract                     |
| `unpauseService`             | `privateKey: string`                                                                            | `Promise<TransactionResponse>`                  | Unpause the service                                    |
| `updateDidAuthAddress`       | `didAuthAddress: string, privateKey: string`                                                    | `Promise<TransactionResponse>`                  | Update the DID Auth address                            |
| `withdrawProducerBalance`    | `amount: bigint, privateKey: string`                                                            | `Promise<TransactionResponse>`                  | Withdraw producer balance                              |
| `withdrawServiceFee`         | `amount: bigint, privateKey: string`                                                            | `Promise<TransactionResponse>`                  | Withdraw service fee                                   |
| `processTransactionResponse` | `txHash: string, path?: string`                                                                 | `Promise<{ success: boolean; error?: string }>` | Process a transaction response and revalidate the path |

## React Query Hooks

### Query Hooks

| Hook                       | Parameters          | Description                           |
| -------------------------- | ------------------- | ------------------------------------- |
| `useDidAuth`               | None                | Get the DID Auth contract address     |
| `useConsumerDid`           | `consumer?: string` | Get the DID for a consumer            |
| `useLeveaWallet`           | None                | Get the Levea wallet address          |
| `useMinimumWithdrawAmount` | None                | Get the minimum withdraw amount       |
| `useProducerDid`           | `producer?: string` | Get the DID for a producer            |
| `useProducerWalletBalance` | `producer?: string` | Get the wallet balance for a producer |
| `useServiceFee`            | None                | Get the service fee                   |
| `useUnitPrice`             | None                | Get the unit price                    |
| `useOwner`                 | None                | Get the contract owner                |
| `useIsPaused`              | None                | Check if the service is paused        |
| `usePayment`               | `recordId?: string` | Get payment information for a record  |
| `useProducerExists`        | `producer?: string` | Check if a producer exists            |
| `useServiceFeeBalance`     | None                | Get the service fee balance           |
| `useToken`                 | None                | Get the token address                 |
| `useVerifyPayment`         | `recordId?: string` | Verify payment for a record           |

### Mutation Hooks

| Hook                          | Description                        |
| ----------------------------- | ---------------------------------- |
| `useChangeServiceFee`         | Change the service fee             |
| `useChangeTokenAddress`       | Change the token address           |
| `useChangeUnitPrice`          | Change the unit price              |
| `usePauseService`             | Pause the service                  |
| `useProcessPayment`           | Process payment for a record       |
| `useRegisterConsumer`         | Register a consumer                |
| `useRegisterProducer`         | Register a producer                |
| `useRemoveProducer`           | Remove a producer                  |
| `useRenounceOwnership`        | Renounce ownership of the contract |
| `useSetMinimumWithdrawAmount` | Set the minimum withdraw amount    |
| `useTransferOwnership`        | Transfer ownership of the contract |
| `useUnpauseService`           | Unpause the service                |
| `useUpdateDidAuthAddress`     | Update the DID Auth address        |
| `useWithdrawProducerBalance`  | Withdraw producer balance          |
| `useWithdrawServiceFee`       | Withdraw service fee               |

## Example Component

```tsx
'use client';

import { useState } from 'react';
import { useProducerExists, useRegisterProducer } from '@/features/compensation/hooks/use-compensation';

export default function ProducerManagement() {
  const [producer, setProducer] = useState<`0x${string}`>('0x0');
  const [did, setDid] = useState('');
  const [privateKey, setPrivateKey] = useState('');

  const { data: exists, isLoading } = useProducerExists(producer);
  const { mutate, isPending, isError, error } = useRegisterProducer();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exists) {
      mutate({ producer, did, privateKey });
    }
  };

  return (
    <div>
      <h1>Producer Management</h1>
      <div>
        <label>
          Producer Address:
          <input type="text" value={producer} onChange={(e) => setProducer(e.target.value as `0x${string}`)} />
        </label>
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          Producer {producer} {exists ? 'exists' : 'does not exist'}
        </div>
      )}
      {!exists && (
        <form onSubmit={handleSubmit}>
          <div>
            <label>
              DID:
              <input type="text" value={did} onChange={(e) => setDid(e.target.value)} />
            </label>
          </div>
          <div>
            <label>
              Private Key:
              <input type="password" value={privateKey} onChange={(e) => setPrivateKey(e.target.value)} />
            </label>
          </div>
          <button type="submit" disabled={isPending}>
            {isPending ? 'Registering...' : 'Register Producer'}
          </button>
          {isError && <div>Error: {error.message}</div>}
        </form>
      )}
    </div>
  );
}
```

## Configuration

The Compensation actions require the following environment variables:

- `COMPENSATION_CONTRACT_ADDRESS`: The address of the Compensation contract
- `CHAIN_ID`: The chain ID of the network
- `RPC_URL`: The RPC URL of the network

## Implementation Details

The Compensation actions use [Viem](https://viem.sh/) for blockchain interactions. The key functions are:

- `getPublicClient`: Creates a public client for reading from the blockchain
- `getWalletClient`: Creates a wallet client for sending transactions
- `processTransactionReceipt`: Processes a transaction receipt and returns a standardized response

The mutation functions use the wallet client to send transactions to the blockchain, while the query functions use the public client to read data from the blockchain.
