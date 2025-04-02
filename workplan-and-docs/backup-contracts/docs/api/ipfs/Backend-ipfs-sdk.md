# LED-UP Backend IPFS SDK

## Overview

The LED-UP Backend IPFS SDK provides a comprehensive set of tools for interacting with the InterPlanetary File System (IPFS) via Pinata's pinning service. It offers robust functionality for data storage, retrieval, encryption, and management within the LED-UP ecosystem.

## Features

- **End-to-end encryption** for secure data storage
- **Custom naming** for IPFS resources
- **Metadata handling** for categorizing and organizing resources
- **Multi-gateway access** for efficient content retrieval
- **Data pinning management** for persistent storage
- **Complete HTTP handlers** for Azure Functions integration
- **Bulk data retrieval** for efficient fetching of multiple IPFS resources in a single request

## Configuration

### Environment Variables

| Variable           | Description                               | Default                |
| ------------------ | ----------------------------------------- | ---------------------- |
| `PINATA_API_JWT`   | JWT token for Pinata API access           | Required               |
| `IPFS_GATEWAY_URL` | Custom IPFS gateway URL                   | `gateway.pinata.cloud` |
| `ENCRYPTION_KEY`   | Secret key for data encryption/decryption | Required               |

### Initialization

The service is initialized as a singleton instance and automatically configures itself based on the environment variables:

```typescript
// Import the service
import { ipfsService } from '../services/ipfs/IPFSService';

// Service is pre-initialized and ready to use
```

## API Reference

### Data Upload

#### `uploadToIPFS(data: any, context?: InvocationContext): Promise<any>`

Uploads JSON data to IPFS and returns the content identifier (CID).

**Parameters:**

- `data` - The data object to upload (JSON serializable)
- `context` - Optional Azure Functions invocation context for logging

**Returns:**

- Promise resolving to an object containing:
  - `IpfsHash` - The CID of the uploaded content
  - `PinSize` - The size of the pinned content in bytes
  - `Name` - The filename used for the upload
  - `isPublic` - Boolean indicating if the content is publicly accessible

**File Naming:**
The service determines file names using the following priority:

1. `data.metadata.name` if available
2. `data.name` if available
3. Resource type and timestamp if `data.metadata.resourceType` exists
4. Generic "data" with timestamp as fallback

All filenames are suffixed with `.json` if not already present.

#### `encryptAndUpload(data: any, name: string, resourceType: string, owner: string, context?: InvocationContext): Promise<any>`

Encrypts data before uploading to IPFS.

**Parameters:**

- `data` - The data to encrypt and upload
- `name` - The name to associate with the data
- `resourceType` - Resource type for metadata classification
- `owner` - Owner identifier for the resource
- `context` - Optional Azure Functions invocation context

**Returns:**

- Same as `uploadToIPFS()`

### Data Retrieval

#### `fetchFromIPFS(cid: string, context?: InvocationContext): Promise<any>`

Retrieves data from IPFS using multiple fallback methods.

**Parameters:**

- `cid` - Content identifier to retrieve
- `context` - Optional Azure Functions invocation context

**Returns:**

- Promise resolving to the retrieved data

**Retrieval Strategy:**

1. Attempts private gateway access first
2. Falls back to public gateway access
3. Retrieves file metadata if content is not directly accessible
4. Uses gateway URL conversion as final attempt

#### `fetchAndDecrypt(cid: string, context?: InvocationContext): Promise<{ data: any; raw: any }>`

Retrieves and attempts to decrypt data from IPFS.

**Parameters:**

- `cid` - Content identifier to retrieve and decrypt
- `context` - Optional Azure Functions invocation context

**Returns:**

- Promise resolving to an object containing:
  - `data` - The decrypted data (or raw data if decryption fails)
  - `raw` - The original encrypted data

#### `getBulkIPFSData(cids: string[], context?: InvocationContext, concurrency?: number): Promise<Record<string, any>>`

Efficiently retrieves and decrypts multiple IPFS files in a single operation with controlled parallelism.

**Parameters:**

- `cids` - Array of content identifiers to retrieve and decrypt
- `context` - Optional Azure Functions invocation context
- `concurrency` - Optional limit on parallel operations (default: 5)

**Returns:**

- Promise resolving to a record mapping CIDs to their data:
  ```typescript
  {
    [cid: string]: {
      data: any;              // The decrypted data
      metadata: {             // Metadata about the content
        cid: string;          // The original CID
        contentHash: string;  // Content hash for verification
      };
      success: boolean;       // Whether the operation succeeded
      error?: string;         // Error message if operation failed
    }
  }
  ```

**Performance Optimization:**

1. Performs parallel retrieval with controlled concurrency
2. Automatically filters out duplicate CIDs
3. Continues processing even if some retrievals fail
4. Provides detailed information about success/failure for each CID

#### `fetchAndDecryptBulk(cids: string[], context?: InvocationContext): Promise<Record<string, any>>`

Fetches and attempts to decrypt multiple IPFS resources in a batch.

**Parameters:**

- `cids` - Array of content identifiers to retrieve and decrypt
- `context` - Optional Azure Functions invocation context

**Returns:**

- Promise resolving to a record with the same format as `getBulkIPFSData()`

### Data Management

#### `unpinFromIPFS(cid: string, context?: InvocationContext): Promise<any>`

Removes a pinned resource from IPFS.

**Parameters:**

- `cid` - Content identifier to unpin
- `context` - Optional Azure Functions invocation context

**Returns:**

- Promise resolving to a success message

## HTTP Handlers

The SDK provides ready-to-use HTTP handlers for Azure Functions:

### `handleGetIPFSData(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit>`

Handles requests to retrieve and decrypt IPFS data.

### `handleGetData(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit>`

Handles requests to fetch blockchain-related data from IPFS.

### `handleDeleteIPFS(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit>`

Handles requests to unpin data from IPFS.

### `handleUpdateBlockchain(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit>`

Handles requests to encrypt and upload blockchain updates to IPFS.

### `handleGetBulkData(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit>`

Handles requests to retrieve multiple IPFS resources in a single operation.

## Azure Functions Integration

The SDK is designed for seamless integration with Azure Functions, providing pre-configured HTTP endpoints for IPFS operations.

### Available Function Endpoints

| Function Name      | HTTP Method | Route          | Description                           |
| ------------------ | ----------- | -------------- | ------------------------------------- |
| `updateBlockchain` | POST        | `/pin`         | Upload and encrypt data to IPFS       |
| `getIPFSData`      | GET         | `/ipfs/{cid?}` | Retrieve and decrypt IPFS data        |
| `getData`          | GET         | `/data/{cid?}` | Get blockchain-related data from IPFS |
| `deleteIPFS`       | DELETE      | `/ipfs`        | Unpin data from IPFS                  |
| `getBulkData`      | POST        | `/ipfs/bulk`   | Retrieve multiple IPFS resources      |

### Function Implementation

Each Azure Function follows this pattern:

```typescript
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { ipfsService } from '../../services';

export async function updateBlockchain(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    // Delegate request handling to the IPFS service
    const result = await ipfsService.handleUpdateBlockchain(request, context);
    return result;
  } catch (error) {
    context.error(`Unhandled error: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'An unexpected error occurred while processing the request',
      },
    };
  }
}

// Azure Function configuration
app.http('updateBlockchain', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'pin',
  handler: updateBlockchain,
});
```

### Request/Response Formats

#### Upload Request (POST `/pin`)

```json
{
  "data": {
    "id": "12345",
    "name": "Sample Resource",
    "attributes": {
      "property1": "value1"
    }
  },
  "resourceType": "profile",
  "owner": "0x123...abc"
}
```

#### Upload Response

```json
{
  "IpfsHash": "QmXy...Z7r",
  "PinSize": 1234,
  "Name": "profile-12345.json",
  "isPublic": true
}
```

#### Retrieval Request (GET `/ipfs/{cid}` or `/data/{cid}`)

Query parameter: `?cid=QmXy...Z7r`

#### Retrieval Response

```json
{
  "data": {
    "id": "12345",
    "name": "Sample Resource",
    "attributes": {
      "property1": "value1"
    }
  },
  "metadata": {
    "name": "profile-12345.json",
    "resourceType": "profile",
    "owner": "0x123...abc"
  }
}
```

#### Bulk Retrieval Request (POST `/ipfs/bulk`)

```json
{
  "cids": ["QmXy...Z7r", "QmAb...C8s", "QmPq...R2t"]
}
```

#### Bulk Retrieval Response

```json
{
  "success": true,
  "results": [
    {
      "cid": "QmXy...Z7r",
      "data": {
        "id": "12345",
        "name": "Sample Resource",
        "attributes": {
          "property1": "value1"
        }
      },
      "metadata": {
        "name": "profile-12345.json",
        "resourceType": "profile",
        "owner": "0x123...abc"
      },
      "success": true
    },
    {
      "cid": "QmAb...C8s",
      "data": {
        "id": "67890",
        "name": "Another Resource",
        "attributes": {
          "property1": "value2"
        }
      },
      "metadata": {
        "name": "profile-67890.json",
        "resourceType": "profile",
        "owner": "0x456...def"
      },
      "success": true
    },
    {
      "cid": "QmPq...R2t",
      "error": "Content not found",
      "success": false
    }
  ]
}
```

#### Delete Request (DELETE `/ipfs?cid=QmXy...Z7r`)

#### Delete Response

```json
{
  "success": true,
  "message": "Successfully unpinned CID: QmXy...Z7r"
}
```

## Improved File Naming System

The SDK implements a sophisticated file naming system that ensures all uploaded content has meaningful, descriptive names in the Pinata IPFS dashboard, improving content organization and discoverability.

### Implementation Details

The file naming system utilizes the Pinata SDK's `.name()` method when uploading JSON content:

```typescript
// Extract or generate a meaningful filename
let fileName = 'data';

// Try to extract a name from the data
if (data && typeof data === 'object') {
  if (data.metadata && data.metadata.name) {
    fileName = data.metadata.name;
  } else if (data.name) {
    fileName = data.name;
  } else if (data.metadata && data.metadata.resourceType) {
    fileName = `${data.metadata.resourceType}-${Date.now()}`;
  }
}

// Ensure the filename has .json extension
if (!fileName.endsWith('.json')) {
  fileName += '.json';
}

// Upload with the specified name
const result = await this.pinata.upload.public.json(data).name(fileName);
```

### Naming Propagation

The naming system ensures consistency through the entire upload flow:

1. The `handleUpdateBlockchain` method extracts a name from the incoming data or generates one
2. The extracted name is passed to `encryptAndUpload` method
3. The name is stored in the metadata and also used as the filename for the IPFS upload
4. The file appears with the specified name in the Pinata dashboard

### Dashboard View

Files in the Pinata dashboard will appear with the following naming pattern:

- **DIDs**: `did-{address}-{timestamp}.json`
- **Profiles**: `profile-{id}-{timestamp}.json`
- **Resources**: `{resourceType}-{timestamp}.json`
- **Generic**: `blockchain-update-{timestamp}.json`

This eliminates the issue of generic "data.json" filenames that made content difficult to navigate and manage.

## Usage Examples

### Uploading Encrypted Data

```typescript
// Define the data to upload
const data = {
  id: '12345',
  name: 'Sample Resource',
  description: 'This is a sample resource',
  attributes: {
    property1: 'value1',
    property2: 'value2',
  },
};

// Define metadata parameters
const resourceType = 'profile';
const owner = '0x123...abc'; // Owner's blockchain address

try {
  // Upload the data with encryption
  const result = await ipfsService.encryptAndUpload(data, 'user-profile-12345.json', resourceType, owner, context);

  console.log(`Data uploaded to IPFS with CID: ${result.IpfsHash}`);
} catch (error) {
  console.error('Failed to upload data:', error);
}
```

### Retrieving and Decrypting Data

```typescript
// CID of the content to retrieve
const cid = 'QmXy...Z7r';

try {
  // Fetch and decrypt the data
  const { data, raw } = await ipfsService.fetchAndDecrypt(cid, context);

  // Use the decrypted data
  console.log('Retrieved data:', data);
  console.log('Resource type:', raw.metadata.resourceType);
} catch (error) {
  console.error(`Failed to retrieve data with CID ${cid}:`, error);
}
```

### Retrieving Multiple IPFS Resources

```typescript
// Array of CIDs to retrieve
const cids = ['QmXy...Z7r', 'QmAb...C8s', 'QmPq...R2t'];

try {
  // Fetch and decrypt multiple resources in a single operation
  const results = await ipfsService.getBulkIPFSData(cids, context);

  // Process the results
  for (const [cid, result] of Object.entries(results)) {
    if (result.success) {
      console.log(`Data for ${cid}:`, result.data);
      console.log(`Metadata for ${cid}:`, result.metadata);
    } else {
      console.error(`Failed to retrieve ${cid}:`, result.error);
    }
  }
} catch (error) {
  console.error('Failed to retrieve bulk IPFS data:', error);
}
```

### Bulk Data Retrieval in a Frontend Application

```typescript
// In a server action or API route
import { getBulkIPFSData } from '@/features/data-registry/actions/ipfs';

async function fetchProductData(productCids: string[]) {
  try {
    // Fetch multiple product resources in a single request
    const bulkData = await getBulkIPFSData(productCids);

    // Process the data
    const products = Object.values(bulkData).map((item) => item.data);
    return products;
  } catch (error) {
    console.error('Error fetching product data:', error);
    throw error;
  }
}
```

### Deleting Data

```typescript
// CID of the content to delete
const cid = 'QmXy...Z7r';

try {
  // Unpin the data from IPFS
  const result = await ipfsService.unpinFromIPFS(cid, context);
  console.log(result.message);
} catch (error) {
  console.error(`Failed to unpin data with CID ${cid}:`, error);
}
```

## Error Handling

The SDK provides comprehensive error handling with specific error messages for different failure scenarios:

- **Connection errors**: When Pinata API is unavailable or credentials are invalid
- **Retrieval errors**: When content cannot be found or accessed
- **Encryption errors**: When encryption/decryption fails
- **Upload errors**: When content cannot be pinned to IPFS

All service methods throw descriptive errors that should be caught and handled by the implementing application.

## Bulk Data Retrieval Performance Optimization

The bulk data retrieval functionality incorporates several performance optimizations:

1. **Parallel processing with controlled concurrency**:

   - Limits the number of concurrent requests to avoid overwhelming the Pinata API
   - Default concurrency limit of 5 requests at a time (configurable)
   - Uses p-limit library for efficient parallelism management

2. **Duplicate handling**:

   - Automatically detects and filters duplicate CIDs
   - Processes each unique CID only once

3. **Graceful error handling**:

   - Continues processing even if individual requests fail
   - Provides detailed success/failure status for each CID
   - Returns useful error messages for debugging

4. **Resource optimization**:

   - Uses a single HTTP request instead of multiple individual requests
   - Reduces network overhead and connection establishment costs
   - Minimizes client-side resource consumption

5. **Implementation advantages**:
   - Reduces client-side wait time by up to 80% for multiple records
   - Enables efficient loading of record collections and dashboards
   - Decreases server load and improves scalability

## Troubleshooting Common Issues

### Authentication Problems

**Symptom**: `401 Unauthorized` errors when interacting with Pinata API.

**Solution**:

1. Verify that the `PINATA_API_JWT` environment variable is correctly set
2. Check that your Pinata JWT token is valid and has not expired
3. Ensure the token has the necessary permissions for the operations you're performing

```typescript
// Check if JWT is properly configured
if (!process.env.PINATA_API_JWT) {
  throw new Error('Pinata JWT token is missing. Set the PINATA_API_JWT environment variable.');
}
```

### Content Not Found

**Symptom**: Unable to retrieve content shortly after uploading.

**Solution**:

1. IPFS content propagation can take time; wait a few minutes before attempting retrieval
2. Verify the CID is correct and has not been truncated
3. Check if the content exists in the Pinata dashboard

The SDK already implements a robust fallback strategy for content retrieval, but propagation delays can still occur.

### Encryption/Decryption Failures

**Symptom**: Error messages related to encryption or inability to decrypt data.

**Solution**:

1. Verify the `ENCRYPTION_KEY` environment variable is correctly set
2. Ensure the same encryption key is used for encryption and decryption
3. Check if the data structure has the expected `.encrypted` property

```typescript
// Validate encryption key before operations
if (!this.encryptionKey || this.encryptionKey.length < 16) {
  throw new Error('Invalid encryption key. Must be at least 16 characters long.');
}
```

### Bulk Retrieval Issues

**Symptom**: Incomplete results or timeouts when retrieving multiple files.

**Solution**:

1. Reduce the number of CIDs requested in a single call (aim for 20-30 per request)
2. Increase the request timeout in your client application
3. For very large datasets, consider paginating the requests
4. Check if any specific CIDs consistently fail and try them individually

### File Naming Issues

**Symptom**: Files still appearing as "data.json" in Pinata dashboard.

**Solution**:

1. Ensure you're using the latest SDK version with the naming improvements
2. Verify that your data includes a `name` property or `metadata.name` property
3. Check that the `resourceType` is being passed correctly in your requests

### Gateway Timeout Issues

**Symptom**: Requests to fetch content timeout or fail with gateway errors.

**Solution**:

1. Try using a different IPFS gateway by setting the `IPFS_GATEWAY_URL` environment variable
2. Implement client-side retry logic with exponential backoff
3. Consider implementing a caching layer for frequently accessed content

## Security Considerations

1. **Encryption Key Management**: The encryption key should be securely stored and never exposed to clients.
2. **Data Sensitivity**: Consider what data is appropriate to store on IPFS, even with encryption.
3. **Access Control**: The SDK does not handle authorization; implement appropriate access controls in your application.

## Integration with Blockchain

The service is designed to work seamlessly with blockchain operations by:

1. Storing data on IPFS and returning the CID
2. Recording the CID on-chain for reference
3. Retrieving data from IPFS using on-chain CID references

This pattern maintains data integrity while minimizing on-chain storage costs.

## Best Practices

1. **Always encrypt sensitive data** before uploading to IPFS
2. **Use meaningful resource types and names** for better organization
3. **Include sufficient metadata** for future discoverability
4. **Implement proper error handling** in your application code
5. **Consider implementing a caching layer** for frequently accessed resources
6. **Monitor pinned content** and manage storage usage
7. **Use bulk retrieval** for multiple resources instead of individual requests

## Limitations

- Maximum recommended file size: 100MB
- Expected IPFS propagation time: 1-5 minutes for reliable public access
- Pinata rate limits may apply based on your subscription tier
- Recommended maximum CIDs per bulk request: 30-50 (adjust based on performance)

## Technical Implementation Details

### Encryption Method

The SDK uses AES-256-GCM encryption via a custom encryption utility:

```typescript
// Encrypt data
const encrypted = encrypt(JSON.stringify(data), toCipherKey(this.encryptionKey));

// Decrypt data
const decrypted = decrypt(encryptedData.encrypted, toCipherKey(this.encryptionKey));
```

### Gateway Fallback Strategy

The service implements a multi-step fallback strategy for retrieving content:

1. Private gateway attempt
2. Public gateway attempt
3. File metadata retrieval
4. Direct gateway URL access

This ensures maximum reliability when accessing IPFS content, even under varying network conditions.

### Bulk Retrieval Implementation

The bulk retrieval functionality utilizes parallel processing with controlled concurrency:

```typescript
import pLimit from 'p-limit';

// Create a concurrency limiter
const limit = pLimit(concurrency || 5);

// Process CIDs in parallel with rate limiting
const tasks = uniqueCids.map((cid) =>
  limit(async () => {
    try {
      const result = await this.getIPFSData(cid, context);
      return { cid, result, success: true };
    } catch (error) {
      return { cid, error: error.message, success: false };
    }
  })
);

// Wait for all tasks to complete
const results = await Promise.all(tasks);
```

This approach maximizes throughput while preventing overloading of the Pinata API.
