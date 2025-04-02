# Data Registry Utilities

This directory contains utility functions for working with the DataRegistry smart contract.

## Structure

- `index.ts` - Main exports and basic utility functions
- `contract-helpers.ts` - Utilities for contract interactions
- `ipfs-helpers.ts` - Utilities for IPFS data handling
- `query-helpers.ts` - Utilities for query caching and filtering

## Core Functions

### Data Transformation

- `safeConvertBigIntToNumber()` - Safely converts BigInt to number
- `convertToEnum()` - Converts numeric values to TypeScript enums
- `normalizeProducerMetadata()` - Normalizes producer metadata responses
- `normalizeRecordInfo()` - Normalizes record info responses
- `normalizeCheckAccess()` - Normalizes access check responses

### Formatting and Display

- `formatRecordId()` - Formats record IDs for display
- `getResourceTypeName()` - Gets readable names for resource types
- `getRecordStatusName()` - Gets readable names for record status values
- `getConsentStatusName()` - Gets readable names for consent status values
- `getAccessLevelName()` - Gets readable names for access levels
- `formatTimestamp()` - Formats Unix timestamps to human-readable dates
- `formatDataSize()` - Formats byte sizes to human-readable values

### Contract Interaction Helpers

- `computeRecordIdHash()` - Computes keccak256 hash for record IDs
- `computeContentHash()` - Computes keccak256 hash for content
- `isValidRecordId()` - Validates record ID strings
- `isValidContentHash()` - Validates content hash values
- `isValidCid()` - Validates IPFS CID strings
- `prepareRegisterRecordParams()` - Prepares parameters for record registration
- `prepareUpdateRecordParams()` - Prepares parameters for record updates
- `prepareShareDataParams()` - Prepares parameters for data sharing
- Validation functions for enum values: `isValidRecordStatus()`, `isValidConsentStatus()`, etc.

### IPFS Helpers

- `createRecordMetadata()` - Creates standard metadata for IPFS storage
- `getIpfsUrl()` - Gets gateway URLs for IPFS resources
- `formatCid()` - Formats CIDs for display
- `isValidCidFormat()` - Validates CID format
- `extractCid()` - Extracts CIDs from various URL formats
- `createIpfsUrl()` - Creates standardized IPFS URLs

### Query and Caching

- `CACHE_KEYS` - Constants for cache key generation
- `DataRegistryQueryId` - Enum of available query operations
- `DataRegistryMutationId` - Enum of available mutation operations
- `getProducerCacheKey()`, `getRecordCacheKey()`, etc. - Functions for generating cache keys
- `getInvalidationKeysForMutation()` - Determines which caches to invalidate
- `applyFilters()` - Client-side filtering for record data

## Usage Examples

### Data Transformation

```typescript
import { normalizeProducerMetadata, convertToEnum } from '../utils';

// Normalize contract responses
const normalizedMetadata = normalizeProducerMetadata(rawContractResponse);

// Convert numeric enum values
const statusEnum = convertToEnum(2, RecordStatus);
```

### Contract Interaction

```typescript
import { prepareRegisterRecordParams, computeContentHash } from '../utils';

// Prepare parameters for contract call
const params = prepareRegisterRecordParams(
  'patient-record-123',
  'QmAbC123...',
  JSON.stringify(recordData),
  ResourceType.Patient,
  1024
);

// Compute hashes for contract calls
const contentHash = computeContentHash(JSON.stringify(data));
```

### IPFS Operations

```typescript
import { createRecordMetadata, getIpfsUrl } from '../utils';

// Create standard metadata
const metadata = createRecordMetadata('Patient Record', ResourceType.Patient, '0x123...', 'QmAbC123...', {
  description: 'Patient health record',
  format: 'json',
});

// Get gateway URL for IPFS content
const url = getIpfsUrl('QmAbC123...');
```

### Query Caching

```typescript
import { getInvalidationKeysForMutation, DataRegistryMutationId } from '../utils';

// Get cache keys to invalidate after a mutation
const keysToInvalidate = getInvalidationKeysForMutation(DataRegistryMutationId.RegisterRecord, {
  recordId: 'patient-record-123',
  address: '0x123...',
});
```

### Data Filtering

```typescript
import { applyFilters } from '../utils';

// Filter records client-side
const filteredRecords = applyFilters(records, {
  resourceType: ResourceType.Patient,
  recordStatus: RecordStatus.Active,
  verified: true,
  sortBy: 'updatedAt',
  sortDirection: 'desc',
});
```
