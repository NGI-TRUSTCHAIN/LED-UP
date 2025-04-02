# DataRegistry Error Handling and Event Parsing

This document provides an overview of the error handling and event parsing implementation for the DataRegistry smart contract, following best practices from Viem and Wagmi.

## Overview

The implementation consists of two main components:

1. **DataRegistryErrorHandler**: A class that decodes and formats error messages from the DataRegistry contract.
2. **DataRegistryEventParser**: A class that parses and formats event logs from the DataRegistry contract.

These components are designed to work with Viem and Wagmi, providing a seamless integration with React applications.

## Features

### DataRegistryErrorHandler

- Decodes contract errors using Viem's `decodeErrorResult` function
- Provides user-friendly error messages for all DataRegistry error types
- Handles BigInt values in error arguments
- Supports fallback error handling for non-contract errors

### DataRegistryEventParser

- Parses event logs from transaction receipts using Viem's `parseEventLogs` function
- Provides user-friendly descriptions for all DataRegistry event types
- Handles BigInt values in event arguments
- Supports filtering events by name

## Usage Examples

### Error Handling

```typescript
import { DataRegistryErrorHandler } from '../helpers/error-handler/DataRegistryErrorHandler';
import { dataRegistryAbi } from '../constants/abis';

// Initialize the error handler
const errorHandler = new DataRegistryErrorHandler(dataRegistryAbi);

// In a try-catch block
try {
  // Call a contract function
  await contract.write.registerProducer([RecordStatus.ACTIVE, ConsentStatus.GRANTED]);
} catch (error) {
  // Parse the error
  const parsedError = errorHandler.parseError(error);

  // Display a user-friendly error message
  console.error(parsedError.message);

  // Access error details
  console.log(`Error name: ${parsedError.errorName}`);
  console.log(`Error arguments:`, parsedError.args);
}
```

### Event Parsing

```typescript
import { DataRegistryEventParser } from '../helpers/event-parser/DataRegistryEventParser';
import { dataRegistryAbi } from '../constants/abis';

// Initialize the event parser
const eventParser = new DataRegistryEventParser(dataRegistryAbi);

// After a transaction is confirmed
const receipt = await publicClient.waitForTransactionReceipt({ hash });

// Get the block timestamp
const block = await publicClient.getBlock({ blockNumber: receipt.blockNumber });
const blockTimestamp = Number(block.timestamp);

// Parse all events from the receipt
const events = eventParser.parseEvents(receipt, blockTimestamp);

// Display event information
events.forEach((event) => {
  console.log(`Event: ${event.eventName}`);
  console.log(`Description: ${event.description}`);
  console.log(`Arguments:`, event.args);
  console.log(`Block number: ${event.blockNumber}`);
  console.log(`Timestamp: ${event.timestamp}`);
});

// Parse specific events
const dataRegisteredEvents = eventParser.parseEventsByName(receipt, 'DataRegistered', blockTimestamp);
```

### Integration with React Hooks

```typescript
import { useDataRegistry } from '../hooks/useDataRegistry';

function MyComponent() {
  const { registerProducer, registerRecord, error, events, isLoading } = useDataRegistry({
    contractAddress: '0x...',
  });

  const handleRegisterProducer = async () => {
    try {
      await registerProducer(RecordStatus.ACTIVE, ConsentStatus.GRANTED);
      // Success handling
    } catch (err) {
      // Additional error handling if needed
    }
  };

  return (
    <div>
      {isLoading && <p>Loading...</p>}

      {error && (
        <div className="error">
          <h3>Error</h3>
          <p>{error.message}</p>
        </div>
      )}

      {events.length > 0 && (
        <div className="events">
          <h3>Events</h3>
          <ul>
            {events.map((event, index) => (
              <li key={index}>
                <strong>{event.eventName}:</strong> {event.description}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button onClick={handleRegisterProducer} disabled={isLoading}>
        Register Producer
      </button>
    </div>
  );
}
```

## Error Types Handled

The `DataRegistryErrorHandler` handles the following error types:

- `DataRegistry__RecordNotFound`
- `DataRegistry__Unauthorized`
- `DataRegistry__ProducerNotFound`
- `DataRegistry__AlreadyRegistered`
- `DataRegistry__DidAuthNotInitialized`
- `DataRegistry__InvalidDidAuthAddress`
- `DataRegistry__InvalidRecord`
- `DataRegistry__RecordAlreadyExists`
- `DataRegistry__RecordNotActive`
- `DataRegistry__InvalidDID`
- `DataRegistry__InvalidInputParam`
- `DataRegistry__ServicePaused`
- `DataRegistry__PaymentNotVerified`
- `DataRegistry__ConsentAlreadyGranted`
- `DataRegistry__ConsentAlreadyRevoked`
- `DataRegistry__ConsentNotAllowed`
- `DataRegistry__UnauthorizedConsumer`
- `DataRegistry__UnauthorizedProducer`
- `DataRegistry__UnauthorizedServiceProvider`
- `DataRegistry__UnauthorizedVerifier`

## Event Types Handled

The `DataRegistryEventParser` handles the following event types:

- `DataRegistered`
- `DataUpdated`
- `DataRemoved`
- `DataDeactivated`
- `ConsumerAuthorized`
- `ConsumerDeauthorized`
- `DataVerified`
- `MetadataUpdated`
- `ProviderSchemaUpdated`
- `ProviderMetadataUpdated`
- `DataShared`
- `TokenUpdated`
- `AccessNotAllowed`
- `SharingNotAllowed`
- `TokenAddressUpdated`
- `PauseStateUpdated`
- `ProducerConsentUpdated`
- `ProducerRecordStatusUpdated`
- `ProducerRecordUpdated`
- `ProducerRecordRemoved`
- `ProducerRegistered`

## Best Practices

1. **Comprehensive Error Handling**: Always wrap contract interactions in try-catch blocks and use the error handler to provide meaningful error messages to users.

2. **Detailed Event Parsing**: Parse events from transaction receipts to provide feedback to users about the results of their actions.

3. **Type Safety**: Use TypeScript interfaces and types to ensure type safety throughout your application.

4. **Separation of Concerns**: Keep error handling and event parsing logic separate from your UI components.

5. **Reusability**: The error handler and event parser are designed to be reusable across different parts of your application.

6. **Extensibility**: The implementation can be easily extended to support additional error types and events as the contract evolves.

## Integration with Server Actions

When using server actions in a Next.js application, you can integrate the error handler and event parser as follows:

```typescript
// In a server action
'use server';

import { DataRegistryErrorHandler } from '../helpers/error-handler/DataRegistryErrorHandler';
import { dataRegistryAbi } from '../constants/abis';

export async function registerProducerAction(status: number, consent: number) {
  const errorHandler = new DataRegistryErrorHandler(dataRegistryAbi);

  try {
    // Call the contract using viem
    const hash = await writeContract({
      address: CONTRACT_ADDRESS,
      abi: dataRegistryAbi,
      functionName: 'registerProducer',
      args: [status, consent],
    });

    return { success: true, hash };
  } catch (error) {
    const parsedError = errorHandler.parseError(error);
    return { success: false, error: parsedError };
  }
}
```

## Conclusion

The DataRegistry error handler and event parser provide a robust solution for interacting with the DataRegistry smart contract. By using these tools, you can provide a better user experience by showing meaningful error messages and event descriptions instead of raw blockchain data.
