# Compensation Feature

This feature provides React Query hooks for interacting with the Compensation smart contract. The Compensation contract manages payments between data producers and consumers in the LED-UP platform.

## Structure

The feature is organized as follows:

- `hooks/`: Contains React Query hooks for interacting with the Compensation contract.
  - `use-compensation.ts`: Implements all query and mutation hooks.
  - `index.ts`: Exports all hooks.
- `index.ts`: Exports all hooks, types, and components.

## Usage

### Example: Check if a producer exists

```tsx
import { useProducerExists } from '@/features/compensation';

function ProducerStatus({ producer }: { producer: `0x${string}` }) {
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
import { useRegisterProducer } from '@/features/compensation';
import { useAccount } from 'wagmi';

function RegisterProducerForm() {
  const { address } = useAccount();
  const { mutate, isPending, error } = useRegisterProducer();
  const [producer, setProducer] = useState<`0x${string}`>('0x');
  const [did, setDid] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    mutate({ producer, did, account: address });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={producer}
        onChange={(e) => setProducer(e.target.value as `0x${string}`)}
        placeholder="Producer Address"
      />
      <input type="text" value={did} onChange={(e) => setDid(e.target.value)} placeholder="Producer DID" />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Registering...' : 'Register Producer'}
      </button>
      {error && <div>Error: {error.message}</div>}
    </form>
  );
}
```

### Example: Get the producer wallet balance

```tsx
import { useProducerWalletBalance } from '@/features/compensation';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';

function ProducerBalance() {
  const { address } = useAccount();
  const { data: balance, isLoading, error } = useProducerWalletBalance(address);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!balance) return <div>No balance found</div>;

  return (
    <div>
      <h2>Your Producer Balance</h2>
      <p>{formatEther(balance)} ETH</p>
    </div>
  );
}
```

### Example: Process payment

```tsx
import { useProcessPayment } from '@/features/compensation';
import { useAccount } from 'wagmi';

function ProcessPaymentForm() {
  const { address } = useAccount();
  const { mutate, isPending, error } = useProcessPayment();
  const [producer, setProducer] = useState<`0x${string}`>('0x');
  const [recordId, setRecordId] = useState('');
  const [dataSize, setDataSize] = useState<bigint>(0n);
  const [consumerDid, setConsumerDid] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    mutate({
      producer,
      recordId,
      dataSize,
      consumerDid,
      account: address,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form inputs */}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Processing...' : 'Process Payment'}
      </button>
      {error && <div>Error: {error.message}</div>}
    </form>
  );
}
```

## Available Hooks

### Query Hooks

- `useDidAuth`: Get the DID Auth contract address.
- `useConsumerDid`: Get the consumer DID for a given address.
- `useLeveaWallet`: Get the Levea wallet address.
- `useMinimumWithdrawAmount`: Get the minimum withdraw amount.
- `useProducerDid`: Get the producer DID for a given address.
- `useProducerWalletBalance`: Get the producer wallet balance.
- `useServiceFee`: Get the service fee.
- `useUnitPrice`: Get the unit price.
- `useOwner`: Get the contract owner.
- `useIsPaused`: Check if the service is paused.
- `usePayment`: Get payment information for a record.
- `useProducerExists`: Check if a producer exists.
- `useServiceFeeBalance`: Get the service fee balance.
- `useToken`: Get the token address.
- `useVerifyPayment`: Verify payment for a record.

### Mutation Hooks

- `useChangeServiceFee`: Change the service fee.
- `useChangeTokenAddress`: Change the token address.
- `useChangeUnitPrice`: Change the unit price.
- `usePauseService`: Pause the service.
- `useProcessPayment`: Process payment for a record.
- `useRegisterConsumer`: Register a consumer.
- `useRegisterProducer`: Register a producer.
- `useRemoveProducer`: Remove a producer.
- `useRenounceOwnership`: Renounce ownership.
- `useSetMinimumWithdrawAmount`: Set the minimum withdraw amount.
- `useTransferOwnership`: Transfer ownership.
- `useUnpauseService`: Unpause the service.
- `useUpdateDidAuthAddress`: Update the DID Auth address.
- `useWithdrawProducerBalance`: Withdraw producer balance.
- `useWithdrawServiceFee`: Withdraw service fee.

## Integration with Other Features

The Compensation feature works with other features like the DID Registry and DID Auth to provide a complete payment system for the LED-UP platform. It allows for:

1. Registering producers and consumers with their DIDs
2. Processing payments for data records
3. Managing producer balances and service fees
4. Verifying payments for data access
