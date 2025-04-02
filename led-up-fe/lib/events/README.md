# Event Parser System

A robust and type-safe event parsing system for Ethereum smart contracts using viem.

## Features

- Real-time event listening with automatic reconnection
- Historical event querying
- Type-safe event parsing
- Modular and reusable design
- Built-in error handling
- Support for multiple contracts
- Automatic timestamp fetching
- Clean unsubscription handling

## Installation

```bash
npm install viem
# or
yarn add viem
```

## Usage Example

```typescript
import { ContractEvents } from './contractEvents';

// Initialize the event system
const events = new ContractEvents('YOUR_RPC_URL');

// Register the DataRegistry contract
const contractId = events.createDataRegistryConfig('CONTRACT_ADDRESS');

// Listen to RecordRegistered events
await events.listenToRecordRegistered(contractId, (event) => {
  console.log('New record registered:', {
    recordId: event.args.recordId,
    did: event.args.did,
    cid: event.args.cid,
    provider: event.args.provider,
    timestamp: event.timestamp,
  });
});

// Query historical events
const historicalEvents = await events.queryRecordRegisteredEvents(
  contractId,
  10000n, // fromBlock
  'latest' // toBlock
);

// Clean up when done
events.unsubscribe(contractId);
```

## Advanced Usage

### Custom Event Filtering

```typescript
import { EventParser } from './EventParser';
import { DataRegistryABI } from './abi/data-registry.abi';

const parser = new EventParser('YOUR_RPC_URL');

const config = {
  abi: DataRegistryABI,
  address: 'CONTRACT_ADDRESS',
  eventName: 'RecordRegistered', // Optional: filter specific event
  listener: {
    pollingInterval: 1000, // Optional: custom polling interval
    onError: (error) => {
      console.error('Event error:', error);
    },
  },
};

const contractId = parser.registerContract(config);

// Listen with custom type
type MyEventType = {
  recordId: string;
  metadata: {
    cid: string;
    contentHash: string;
  };
};

await parser.listenToEvents<MyEventType>(contractId, (event) => {
  console.log('Event received:', event);
});
```

### Error Handling

```typescript
const config = {
  // ... other config
  listener: {
    onError: (error) => {
      // Handle errors (e.g., reconnection logic)
      console.error('Event error:', error);
      // Implement retry logic if needed
    },
  },
};
```

### Multiple Contracts

```typescript
// Register multiple contracts
const dataRegistryId = events.createDataRegistryConfig('DATA_REGISTRY_ADDRESS');
const otherContractId = events.createDataRegistryConfig('OTHER_CONTRACT_ADDRESS');

// Listen to events from both contracts
await events.listenToRecordRegistered(dataRegistryId, callback1);
await events.listenToAccessGranted(otherContractId, callback2);

// Clean up specific contract
events.unsubscribe(dataRegistryId);

// Or clean up all
events.unsubscribeAll();
```

## Best Practices

1. Always handle unsubscription to prevent memory leaks
2. Implement proper error handling
3. Use type-safe event definitions
4. Consider implementing retry logic for failed connections
5. Use appropriate polling intervals based on your needs
6. Handle event parsing errors gracefully
7. Consider implementing rate limiting for historical queries
8. Use appropriate block ranges for historical queries to prevent timeout

## Type Safety

The system is built with TypeScript and provides type safety for event arguments. Define your event types to get full type checking:

```typescript
type MyEvent = {
  param1: string;
  param2: number;
  param3: Address;
};

await events.listenToEvents<MyEvent>(contractId, (event) => {
  // event.args is fully typed
  const { param1, param2, param3 } = event.args;
});
```
