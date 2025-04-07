# Data Registry Actions

This directory contains server actions for interacting with the Data Registry smart contract. These actions are designed to be used with React Query for efficient data fetching and mutations.

## Structure

- `index.ts` - Exports all query and mutation functions
- `query.ts` - Contains server actions for reading data from the contract
- `mutation.ts` - Contains server actions for writing data to the contract

## Usage with React Query

The server actions are designed to be used with React Query hooks, which are implemented in the `features/data-registry/hooks` directory. These hooks provide a seamless way to fetch and mutate data from the contract.

### Example: Checking if a producer exists

```tsx
import { useProducerExists } from '@/features/data-registry/hooks';

function ProducerStatus({ address }) {
  const { data: exists, isLoading } = useProducerExists(address);

  if (isLoading) return <div>Loading...</div>;

  return <div>{exists ? 'Producer exists' : 'Producer does not exist'}</div>;
}
```

### Example: Registering a producer

```tsx
import { useRegisterProducer } from '@/features/data-registry/hooks';
import { RecordStatus, ConsentStatus } from '@/features/data-registry/types';

function RegisterProducer() {
  const { mutate, isPending } = useRegisterProducer();

  const handleRegister = () => {
    mutate({
      status: RecordStatus.ACTIVE,
      consent: ConsentStatus.ALLOWED,
      privateKey: 'your-private-key', // In a real app, this would be securely managed
    });
  };

  return (
    <button onClick={handleRegister} disabled={isPending}>
      {isPending ? 'Registering...' : 'Register as Producer'}
    </button>
  );
}
```

## Server Actions

### Query Actions

- `producerExists(producer: string): Promise<boolean>` - Check if a producer exists
- `getProducerDid(producer: string): Promise<string>` - Get the DID of a producer
- `getProducerConsent(producer: string): Promise<ConsentStatus>` - Get the consent status of a producer
- `getProducerRecordStatus(producer: string): Promise<RecordStatus>` - Get the record status of a producer
- `getProducerRecordCount(producer: string): Promise<number>` - Get the number of records for a producer
- `getProducerRecordInfo(producer: string): Promise<DataRecordCore>` - Get the record info for a producer
- `getProducerRecord(producer: string, recordId: string): Promise<HealthRecord>` - Get a specific record for a producer
- `getProducerRecords(producer: string): Promise<ProducerRecordsResponse>` - Get all records for a producer
- `getProviderMetadata(): Promise<SchemaReference>` - Get the provider metadata
- `getRecordSchema(): Promise<RecordSchema>` - Get the record schema
- `getTotalRecordsCount(): Promise<number>` - Get the total number of records
- `isConsumerAuthorized(recordId: string, consumerDid: string): Promise<boolean>` - Check if a consumer is authorized to access a record
- `getAddressFromDid(did: string): Promise<string>` - Get the address from a DID
- `isPaused(): Promise<boolean>` - Check if the contract is paused

### Mutation Actions

- `registerProducer(status: RecordStatus, consent: ConsentStatus, privateKey: string): Promise<TransactionResponse>` - Register a producer
- `registerProducerRecord(params: ProducerRegistrationParam, privateKey: string): Promise<TransactionResponse>` - Register a producer record
- `updateProducerRecord(recordId: string, status: RecordStatus, consent: ConsentStatus, metadata: RecordMetadata, privateKey: string): Promise<TransactionResponse>` - Update a producer record
- `updateProviderMetadata(metadata: SchemaReference, privateKey: string): Promise<TransactionResponse>` - Update provider metadata
- `updateRecordSchema(schemaRef: SchemaReference, schemaType: string, privateKey: string): Promise<TransactionResponse>` - Update record schema
- `authorizeConsumer(recordId: string, consumerDid: string, privateKey: string): Promise<TransactionResponse>` - Authorize a consumer to access a record
- `revokeConsumerAuthorization(recordId: string, consumerDid: string, privateKey: string): Promise<TransactionResponse>` - Revoke consumer authorization for a record
- `pauseContract(privateKey: string): Promise<TransactionResponse>` - Pause the contract
- `unpauseContract(privateKey: string): Promise<TransactionResponse>` - Unpause the contract

## React Query Hooks

The React Query hooks are implemented in the `features/data-registry/hooks` directory. These hooks provide a seamless way to fetch and mutate data from the contract.

### Query Hooks

- `useProducerExists(producer?: string)` - Check if a producer exists
- `useProducerDid(producer?: string)` - Get the DID of a producer
- `useProducerConsent(producer?: string)` - Get the consent status of a producer
- `useProducerRecordStatus(producer?: string)` - Get the record status of a producer
- `useProducerRecordCount(producer?: string)` - Get the number of records for a producer
- `useProducerRecordInfo(producer?: string)` - Get the record info for a producer
- `useProducerRecord(producer?: string, recordId?: string)` - Get a specific record for a producer
- `useProducerRecords(producer?: string)` - Get all records for a producer
- `useProviderMetadata()` - Get the provider metadata
- `useRecordSchema()` - Get the record schema
- `useTotalRecordsCount()` - Get the total number of records
- `useIsConsumerAuthorized(recordId?: string, consumerDid?: string)` - Check if a consumer is authorized to access a record
- `useAddressFromDid(did?: string)` - Get the address from a DID
- `useIsPaused()` - Check if the contract is paused

### Mutation Hooks

- `useRegisterProducer()` - Register a producer
- `useRegisterProducerRecord()` - Register a producer record
- `useUpdateProducerRecord()` - Update a producer record
- `useAuthorizeConsumer()` - Authorize a consumer to access a record
- `useRevokeConsumerAuthorization()` - Revoke consumer authorization for a record
- `useUpdateProviderMetadata()` - Update provider metadata
- `useUpdateRecordSchema()` - Update record schema
- `usePauseContract()` - Pause the contract
- `useUnpauseContract()` - Unpause the contract

## Example Component

An example component is provided in `features/data-registry/components/ProducerRecordsExample.tsx` to demonstrate how to use these hooks in a real-world scenario.

## Configuration

The server actions use environment variables for configuration:

- `DATA_REGISTRY_CONTRACT_ADDRESS` - The address of the Data Registry contract
- `CHAIN_ID` - The ID of the blockchain network
- `RPC_URL` - The URL of the RPC endpoint

These can be set in your `.env` file or overridden in the code.

## Implementation Details

The server actions use Viem for interacting with the blockchain, which provides a more modern and type-safe API compared to ethers.js. The key components are:

- `getPublicClient` - Creates a public client for reading from the blockchain
- `getWalletClient` - Creates a wallet client for writing to the blockchain
- `processTransactionReceipt` - Processes a transaction receipt and returns a standardized response

These functions are used internally by the server actions to provide a consistent interface for interacting with the Data Registry contract.

## Error Handling and Event Parsing

The DataRegistry actions now include enhanced error handling and event parsing capabilities:

1. **Error Handling**: Contract errors are parsed and formatted into user-friendly messages using the `DataRegistryErrorHandler`.
2. **Event Parsing**: Contract events are parsed and formatted using the `DataRegistryEventParser`.

### Implementation Details

#### Mutation Functions

Mutation functions (in `mutation.ts`) now:

1. Use the `DataRegistryErrorHandler` to parse and format error messages
2. Use the `DataRegistryEventParser` to parse and format events from transaction receipts
3. Return both error messages and parsed events in the response

Example:

```typescript
try {
  // ... contract interaction
  const parsedEvents = eventParser.parseTransactionEvents(receipt);
  return {
    success: true,
    hash,
    events: parsedEvents,
  };
} catch (error) {
  const errorHandler = new DataRegistryErrorHandler(contract);
  const parsedError = errorHandler.parseError(error);
  return {
    success: false,
    error: parsedError.message,
    parsedError,
  };
}
```

#### Query Functions

Query functions (in `query.ts`) now:

1. Use a common `handleQueryError` helper function to handle errors consistently
2. Return user-friendly error messages

Example:

```typescript
try {
  // ... contract interaction
  return result;
} catch (error) {
  return handleQueryError(error, 'functionName');
}
```

## Usage in Hooks

The hooks in `use-data-registry.ts` have been updated to:

1. Handle errors from the server actions
2. Process and use the parsed events
3. Provide better error messages to the user

Example:

```typescript
return useMutation({
  mutationFn: async (params) => {
    // ... contract interaction
    const response = await processTransactionResponse(hash, '/data-registry');
    if (!response.success) {
      throw new Error(response.error || 'Transaction failed');
    }
    return { hash, events: response.events };
  },
  onSuccess: () => {
    // ... invalidate queries
  },
  onError: (error) => {
    console.error('Error:', error);
    // ... handle error
  },
});
```

## Next Steps

To complete the implementation for all contracts:

1. Apply the same pattern to the remaining contracts:

   - DidRegistry
   - DidAccessControl
   - DidAuth
   - DidIssuer
   - DidVerifier
   - Compensation
   - Consent
   - Token

2. Update the corresponding hooks to handle errors and events consistently

3. Consider adding a UI component to display parsed events to the user after successful transactions
