# Contract Error Handling and Event Parsing System

This directory contains a comprehensive error handling and event parsing system for smart contract interactions. The system is designed to be extensible, maintainable, and reusable across different contracts.

## Architecture

The system follows an object-oriented design with a factory pattern:

1. **Base Classes**:

   - `BaseErrorHandler`: Abstract base class for contract error handlers
   - `BaseEventParser`: Abstract base class for contract event parsers

2. **Contract-Specific Implementations**:

   - Each contract has its own error handler (e.g., `DataRegistryErrorHandler`)
   - Each contract has its own event parser (e.g., `DataRegistryEventParser`)

3. **Factory**:
   - `ContractHandlerFactory`: Creates appropriate error handlers and event parsers based on contract type

## Error Handling

The error handling system provides:

- Detailed parsing of contract errors
- User-friendly error messages
- Contract-specific error handling
- Error type checking

### Example Usage

```typescript
import { ContractHandlerFactory, ContractType } from '../helpers/ContractHandlerFactory';

// Create a contract instance
const contract = new Contract(address, abi, signer);

// Create an error handler
const errorHandler = ContractHandlerFactory.createErrorHandler(
  ContractType.DATA_REGISTRY,
  contract
);

try {
  // Call a contract method
  const tx = await contract.someMethod();
  const receipt = await tx.wait();
  return receipt;
} catch (error) {
  // Handle the error
  throw new Error(errorHandler.handleError(error));
}
```

## Event Parsing

The event parsing system provides:

- Detailed parsing of contract events
- Formatting of event data
- Contract-specific event processing
- Event listening capabilities

### Example Usage

```typescript
import { ContractHandlerFactory, ContractType } from '../helpers/ContractHandlerFactory';

// Create a contract instance
const contract = new Contract(address, abi, signer);

// Create an event parser
const eventParser = ContractHandlerFactory.createEventParser(ContractType.DATA_REGISTRY, contract);

// Parse events from a transaction receipt
const formattedReceipt = eventParser.formatTransactionReceipt(receipt);

// Listen for events
const removeListener = eventParser.listenForEvents('EventName', { filter: 'value' }, event => {
  console.log('Event received:', event);
});

// Later, remove the listener
removeListener();
```

## Adding Support for New Contracts

To add support for a new contract:

1. Create a new error handler class that extends `BaseErrorHandler`
2. Create a new event parser class that extends `BaseEventParser`
3. Add the contract type to the `ContractType` enum in `ContractHandlerFactory.ts`
4. Add the new handlers to the factory methods in `ContractHandlerFactory.ts`
5. Export the new handlers from the appropriate index files

## Legacy Support

The system maintains backward compatibility with the previous error handling and event parsing functions. These are exported with a `legacy` prefix:

```typescript
import { legacyParseContractError, legacyHandleContractError } from '../helpers';
```

However, it's recommended to use the new system for all new code.
