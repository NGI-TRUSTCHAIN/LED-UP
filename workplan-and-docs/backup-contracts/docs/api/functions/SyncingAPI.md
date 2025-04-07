# Blockchain Sync Service

This module provides functionality for syncing and tracking blockchain events from multiple smart contracts. It includes Azure Functions for periodic syncing, HTTP endpoints for manual operations, and a comprehensive service for managing the sync process.

## Overview

The Blockchain Sync Service is designed to:

1. Track the current block number synced for different smart contracts
2. Store blockchain events in a parsed format for easy frontend consumption
3. Provide APIs for querying and managing the sync process
4. Handle errors and retries gracefully
5. Support multiple contract types using the event-parser system

## Components

### Services

- **BlockchainSyncService**: Class-based service for syncing and querying blockchain events
  - Located in: `src/services/BlockchainSyncService.ts`
  - Documentation: `docs/BlockchainSyncService.md`
  - Supports multiple contract types using the event-parser system

### Azure Functions

- **blockchainSyncTimer**: Timer-triggered function that runs periodically to sync blockchain events

  - Schedule: Every 5 minutes by default (configurable via environment variables)
  - File: `blockchainSyncTimer.ts`
  - Can be configured to sync multiple contract types

- **blockchainSyncApi**: HTTP endpoints for manually triggering syncs and querying sync status
  - Endpoints:
    - `GET /blockchain/sync/status`: Get the current sync status
    - `POST /blockchain/sync/trigger`: Trigger a sync operation
    - `POST /blockchain/sync/reset`: Reset the sync state to a specific block
    - `GET /blockchain/events/latest`: Get the latest blockchain events
    - `GET /blockchain/events/{eventName}`: Get events by name
  - File: `blockchainSyncApi.ts`
  - Supports specifying contract type and address in requests

### Database Services

- **blockchainEventService**: Database service for storing and retrieving blockchain events
  - Located in: `src/db/blockchainEventService.ts`
  - Provides functions for:
    - Storing events in Azure Table Storage and SQL Database
    - Querying events by various criteria
    - Managing sync state

### Event Parsers

- **Event Parser System**: System for parsing and formatting blockchain events
  - Located in: `src/helpers/event-parser/`
  - Includes parsers for different contract types:
    - `DataRegistryEventParser`
    - `DidRegistryEventParser`
    - `DidAccessControlEventParser`
    - `DidAuthEventParser`
    - `DidIssuerEventParser`
    - `DidVerifierEventParser`
    - `CompensationEventParser`
    - `ConsentEventParser`
    - `TokenEventParser`
    - `ZKPEventParser`

## Usage

### Using the BlockchainSyncService with Different Contract Types

```typescript
import { BlockchainSyncService } from '../../services';
import { ContractType } from '../../helpers/ContractHandlerFactory';

// Create sync services for different contracts
const dataRegistrySyncService = new BlockchainSyncService(
  ContractType.DATA_REGISTRY,
  DATA_REGISTRY_CONTRACT_ADDRESS
);

const didRegistrySyncService = new BlockchainSyncService(
  ContractType.DID_REGISTRY,
  DID_REGISTRY_CONTRACT_ADDRESS
);

// Initialize the services
await dataRegistrySyncService.initialize();
await didRegistrySyncService.initialize();

// Sync events for each contract
const dataRegistrySyncResult = await dataRegistrySyncService.syncEvents(context);
const didRegistrySyncResult = await didRegistrySyncService.syncEvents(context);

// Get the latest events from each contract
const dataRegistryEvents = await dataRegistrySyncService.getLatestEvents(10);
const didRegistryEvents = await didRegistrySyncService.getLatestEvents(10);
```

### HTTP API Examples

#### Get Sync Status for a Specific Contract

```bash
curl -X GET "https://your-function-app.azurewebsites.net/api/blockchain/sync/status?contractType=DidRegistry&contractAddress=0x123..."
```

#### Trigger Sync for a Specific Contract

```bash
curl -X POST https://your-function-app.azurewebsites.net/api/blockchain/sync/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "contractType": "DidRegistry",
    "contractAddress": "0x123...",
    "startBlock": 1000000
  }'
```

#### Reset Sync State for a Specific Contract

```bash
curl -X POST https://your-function-app.azurewebsites.net/api/blockchain/sync/reset \
  -H "Content-Type: application/json" \
  -d '{
    "contractType": "DidRegistry",
    "contractAddress": "0x123...",
    "blockNumber": 1000000
  }'
```

#### Get Latest Events for a Specific Contract

```bash
curl -X GET "https://your-function-app.azurewebsites.net/api/blockchain/events/latest?limit=20&parsed=true&contractType=DidRegistry&contractAddress=0x123..."
```

#### Get Events by Name for a Specific Contract

```bash
curl -X GET "https://your-function-app.azurewebsites.net/api/blockchain/events/DidRegistered?limit=20&contractType=DidRegistry&contractAddress=0x123..."
```

## Configuration

The service can be configured using environment variables:

- `BLOCKCHAIN_SYNC_SCHEDULE`: Cron expression for the sync timer (default: `0 */5 * * * *`)
- `MAX_BLOCKS_PER_SYNC`: Maximum number of blocks to process in a single sync (default: `100`)
- `MAX_RETRY_ATTEMPTS`: Maximum number of retry attempts for failed operations (default: `3`)
- `RETRY_DELAY_MS`: Delay in milliseconds between retry attempts (default: `2000`)
- `BLOCKCHAIN_EVENTS_TABLE`: Azure Table Storage table name for blockchain events (default: `BlockchainEvents`)
- `SYNC_STATE_TABLE`: Azure Table Storage table name for sync state (default: `BlockchainSyncState`)
- `DEFAULT_PARTITION_KEY`: Default partition key for Azure Table Storage (default: `BlockchainSync`)
- `SYNC_STATE_ROW_KEY`: Row key for the sync state entity (default: `CurrentState`)

## Data Models

### BlockchainSyncState

```typescript
interface BlockchainSyncState {
  partitionKey: string;
  rowKey: string;
  lastProcessedBlock: string;
  lastProcessedBlockHash: string;
  lastProcessedTimestamp: string;
  lastSyncedEventName?: string;
  lastSyncedTransactionHash?: string;
  syncStatus: 'SYNCING' | 'SYNCED' | 'ERROR';
  errorMessage?: string;
  totalEventsProcessed: number;
}
```

### BlockchainRecordType

```typescript
interface BlockchainRecordType {
  partitionKey: string;
  rowKey: string;
  id?: string;
  blockNumber: string;
  blockHash: string;
  transactionHash: string;
  transactionIndex: string;
  eAddress: string;
  eData: string;
  topics: string;
  args: string;
  eSignature: string;
  eName: string;
  eTopic: string;
  eTimestamp: string;
}
```

## Supported Contract Types

```typescript
enum ContractType {
  DATA_REGISTRY = 'DataRegistry',
  COMPENSATION = 'Compensation',
  CONSENT = 'Consent',
  DID_ACCESS_CONTROL = 'DidAccessControl',
  DID_AUTH = 'DidAuth',
  DID_ISSUER = 'DidIssuer',
  DID_REGISTRY = 'DidRegistry',
  DID_VERIFIER = 'DidVerifier',
  TOKEN = 'Token',
  ZKP = 'ZKP',
}
```

## For More Information

See the comprehensive SDK documentation in `docs/BlockchainSyncService.md`.

## Blockchain Sync Error Handling

### NaN Block Number Handling

The blockchain sync process has been updated to handle cases where the last processed block number is `NaN` (Not a Number). This can happen if the sync state in the database is corrupted or initialized incorrectly.

The following improvements have been made:

1. The `getLastProcessedBlockNumber` function now checks if the parsed block number is `NaN` and returns `0` as a default value.
2. The `syncEvents` method in `BlockchainSyncService` validates the last processed block number and resets it to `0` if it's `NaN`.
3. The `getLogsWithRetry` method validates the block range parameters to prevent passing `NaN` values to the blockchain provider.
4. The `initializeBlockchainEventTables` function checks if the existing sync state has a valid `lastProcessedBlock` value and resets it if necessary.

A new API endpoint has been added to manually reset the sync state:

```
POST /blockchain/sync/reset
{
  "blockNumber": 0
}
```

This endpoint can be used to reset the sync state to a specific block number if the sync process encounters errors.
