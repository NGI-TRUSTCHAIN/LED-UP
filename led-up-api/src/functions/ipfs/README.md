# IPFS Service Azure Functions

## Overview

This module provides Azure Functions for interacting with IPFS (InterPlanetary File System) for storing and retrieving decentralized data. The service includes functionality for pinning data to IPFS, retrieving data, encryption/decryption, and updating blockchain records with IPFS metadata.

## Functions

### 1. `pin.ts`

Uploads data to IPFS with encryption:

- Encrypts data before uploading
- Pins content to IPFS via Pinata
- Returns CID and content hash

### 2. `getData.ts`

Retrieves data from IPFS:

- Fetches content from IPFS via Pinata
- Decrypts the content
- Returns the decrypted data

### 3. `getIPFSData.ts`

Enhanced data retrieval with metadata:

- Retrieves both the data and its metadata
- Handles decryption automatically
- Returns structured data with metadata

### 4. `getBulkData.ts`

Efficiently retrieves multiple IPFS files in a single request:

- Accepts an array of CIDs
- Processes multiple IPFS files in parallel with rate limiting
- Returns a consolidated response with data for each CID
- Significantly reduces network overhead for batch operations

### 5. `updateBlockchain.ts`

Updates blockchain records with IPFS metadata:

- Takes record ID, CID, and content hash
- Updates the appropriate blockchain record
- Returns transaction confirmation

### 6. `ipfs.ts`

Direct IPFS content access:

- Retrieves raw content from IPFS
- Provides optional deletion endpoint

## Performance Considerations

### Single File Retrieval

- Optimized for individual file operations
- Uses direct Pinata SDK methods

### Bulk Data Retrieval

- Implemented parallel processing with rate limiting
- Significantly reduces network overhead when fetching multiple files
- Optimizes client-side performance by reducing number of HTTP requests
- Connection pooling and resource optimization for server efficiency

## Security Features

- End-to-end encryption for sensitive data
- Secure key management
- Content verification via hash comparison

## Usage

### Upload Data

```http
POST /api/pin
Content-Type: application/json

{
  "owner": "0x...",
  "data": { ... },
  "resourceType": 1
}
```

### Retrieve Data

```http
POST /api/getData
Content-Type: application/json

{
  "cid": "Qm..."
}
```

### Retrieve Multiple IPFS Files

```http
POST /api/getBulkData
Content-Type: application/json

{
  "cids": ["Qm...", "Qm...", ...]
}
```

### Update Blockchain

```http
POST /api/updateBlockchain
Content-Type: application/json

{
  "recordId": "0x...",
  "cid": "Qm...",
  "contentHash": "0x...",
  "resourceType": 1,
  "dataSize": 1024
}
```

## Error Handling

All functions include comprehensive error handling:

- Input validation
- IPFS connection issues
- Decryption failures
- Rate limit handling
- Blockchain transaction errors
