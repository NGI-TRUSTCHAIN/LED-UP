# Data Registry Types

This directory contains TypeScript types for working with the DataRegistry smart contract.

## Structure

- `index.ts` - Main type definitions and exports
- `contract/` - Contract-specific type definitions
  - `index.ts` - Exports all contract types and utility functions
  - `errors.ts` - Error handling types and functions
  - `events.ts` - Event handling types and functions
  - `utils.ts` - Utility functions for working with contract data

## Main Types

The type system is organized into several categories:

### Contract Interaction Types

- `ContractName` - Enum of available contracts
- `ContractInteractionOptions` - Options for interacting with contracts
- `TransactionResult` - Result of a contract transaction

### Data Registry Enums

- `ResourceType` - Types of resources that can be registered
- `RecordStatus` - Status values for records
- `ConsentStatus` - Status values for producer consent
- `AccessLevel` - Access levels for data sharing

### Data Registry Interfaces

- `ProducerMetadata` - Producer registration metadata
- `ResourceMetadata` - Resource metadata for records
- `AccessPermission` - Data for granting access to records

### Contract-Specific Types

- `RegisterProducerInputType` - Input for registering producers
- `RegisterRecordInputType` - Input for registering records
- `ShareDataInputType` - Input for sharing data with consumers
- `ProducerMetadataResponse` - Response from getProducerMetadata contract call
- `RecordInfoResponse` - Response from getRecordInfo contract call
- `CheckAccessResponse` - Response from checkAccess contract call

## Error Handling

The `errors.ts` file provides comprehensive error handling for all possible contract errors:

- `DataRegistryError` - Base interface for all errors
- Specific error types (e.g., `UnauthorizedError`, `RecordNotFoundError`)
- `parseDataRegistryError()` - Parses contract errors into typed error objects
- `getDataRegistryErrorMessage()` - Gets user-friendly error messages

## Event Handling

The `events.ts` file provides utilities for working with contract events:

- `DataRegistryEventName` - Enum of all event names
- `DataRegistryEvent` - Union type of all possible events
- `parseDataRegistryEvent()` - Parses transaction logs into typed events
- `getDataRegistryEvents()` - Gets events from the blockchain
- Helper functions for specific event types

## Utility Functions

The `utils.ts` file provides helper functions:

- `safeConvertBigIntToNumber()` - Safely converts BigInt to number
- `convertToEnum()` - Converts numeric values to typed enums
- `normalizeProducerMetadata()` - Normalizes producer metadata from contract
- `normalizeRecordInfo()` - Normalizes record info from contract
- `normalizeCheckAccess()` - Normalizes access check response
- `formatRecordId()` - Formats record IDs for display
- Helper functions for user-friendly display of enum values

## Usage Examples

### Importing Types

```typescript
import { ResourceType, RecordStatus, ProducerMetadata } from 'features/data-registry/types';

import {
  RegisterProducerInputType,
  parseDataRegistryError,
  getDataRegistryEvents,
} from 'features/data-registry/types/contract';
```

### Error Handling

```typescript
try {
  // Contract interaction
} catch (error) {
  const parsedError = parseDataRegistryError(error);
  if (parsedError) {
    const errorMessage = getDataRegistryErrorMessage(parsedError);
    // Handle the specific error
  }
}
```

### Event Parsing

```typescript
const events = await getDataRegistryEvents({
  address: contractAddress,
  eventName: DataRegistryEventName.RecordRegistered,
  fromBlock: 0n,
  toBlock: 'latest',
});

// Process events
events.forEach((event) => {
  if (event.eventName === DataRegistryEventName.RecordRegistered) {
    // Access typed event parameters
    const { recordId, producer } = event.args;
  }
});
```
