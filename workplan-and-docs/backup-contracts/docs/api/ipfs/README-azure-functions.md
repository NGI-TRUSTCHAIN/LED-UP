# IPFS Backend Integration

This module provides secure encrypted data storage on IPFS (InterPlanetary File System) with blockchain integration capabilities. It handles data encryption, storage, retrieval, and deletion while maintaining security and data integrity.

## Overview

The IPFS integration consists of several Azure Functions that interact with Pinata, a pinning service for IPFS:

1. **Upload Data** (`updateBlockchain.ts`): Encrypts and pins data to IPFS
2. **Get IPFS Data** (`getIPFSData.ts`): Fetches and decrypts data from IPFS
3. **Delete IPFS Data** (`deleteIPFS.ts`): Unpins data from IPFS
4. **Get Raw Data** (`getData.ts`): Fetches raw data or provides service info

All functions use the `IPFSService` class, which handles the core operations (encryption, decryption, API calls to Pinata).

## Endpoints

| Endpoint       | Method    | Description                               | Parameters                                                      |
| -------------- | --------- | ----------------------------------------- | --------------------------------------------------------------- |
| `/pin`         | POST      | Encrypts and uploads data to IPFS         | JSON body: `{ data, name, recordId }` or FormData with file     |
| `/ipfs/{cid?}` | GET, POST | Fetches and decrypts data from IPFS       | Path param: `cid` or query param: `cid` or JSON body: `{ cid }` |
| `/ipfs/{cid}`  | DELETE    | Unpins data from IPFS                     | Path param: `cid`                                               |
| `/getData`     | GET, POST | Fetches raw data or provides service info | Optional query param: `cid` or JSON body: `{ cid }`             |

## Security

### Data Encryption

- All data is encrypted on the server before uploading to IPFS
- AES-256 encryption is used with a server-side encryption key
- The encryption key is never exposed to clients or stored on IPFS
- Only encrypted data is stored on IPFS, protecting sensitive information

### Configuration

The following environment variables are required:

- `PINATA_JWT`: JWT for Pinata API authentication
- `IPFS_GATEWAY_URL`: IPFS gateway URL (default: `https://gateway.pinata.cloud/ipfs`)
- `ENCRYPTION_KEY`: Server-side key for data encryption/decryption
- `PINATA_API_URL`: Pinata API URL (default: `https://api.pinata.cloud`)

## Data Flow

### Upload Flow

1. Client sends data to the server
2. Server encrypts the data using the encryption key
3. Server uploads encrypted data to IPFS via Pinata
4. Server returns the IPFS CID to the client

### Retrieval Flow

1. Client requests data using a CID
2. Server fetches encrypted data from IPFS
3. Server decrypts the data using the encryption key
4. Server returns the decrypted data to the client

## Example Usage

### Upload Data (JSON)

```typescript
// Client-side code
const response = await fetch('/pin', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    data: { example: 'secure data' },
    name: 'example-document',
  }),
});

const result = await response.json();
console.log('Uploaded to IPFS with CID:', result.cid);
```

### Upload Data (FormData/File)

```typescript
// Client-side code
const formData = new FormData();
formData.append('file', file);
formData.append('metadata', JSON.stringify({ name: 'example-file' }));

const response = await fetch('/pin', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
console.log('Uploaded to IPFS with CID:', result.cid);
```

### Retrieve Data

```typescript
// Client-side code
const response = await fetch(`/ipfs/${cid}`);
const result = await response.json();
console.log('Decrypted data:', result.data);
```

### Delete Data

```typescript
// Client-side code
const response = await fetch(`/ipfs/${cid}`, {
  method: 'DELETE',
});
const result = await response.json();
console.log('Deletion result:', result);
```

## Error Handling

All endpoints include robust error handling with descriptive error messages:

- 400 Bad Request: Missing or invalid parameters
- 500 Internal Server Error: Server-side processing errors

Errors include both an `error` field with the specific error message and a `message` field with a user-friendly description.

## Performance Considerations

- Timeout for IPFS gateway requests is 30 seconds
- Large file handling is supported with proper content length settings
- Content hash verification ensures data integrity

## Testing

For testing without affecting the production environment, you can:

1. Use a different Pinata JWT for testing
2. Set up a local IPFS node for development
3. Create a mock implementation of the IPFSService for unit tests

## Limitations

- Maximum file size is limited by Azure Functions (default 100MB)
- Pinata free tier has storage limitations

## Next Steps and Future Improvements

- Add rate limiting to prevent abuse
- Implement caching for frequently accessed data
- Add support for user-specific encryption keys
- Integrate with Azure Key Vault for key management
- Implement lifecycle policies for data retention
