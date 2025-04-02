# Data Registry IPFS Integration

This document provides information about the integration between the Data Registry and IPFS (InterPlanetary File System) with backend encryption for secure data storage.

## Overview

The Data Registry feature uses IPFS for decentralized storage of healthcare data, with encryption performed on the backend to ensure data security and privacy. This approach allows for:

- Secure storage of sensitive healthcare data
- Decentralized data accessibility
- Blockchain-verified data integrity
- Granular access control

## Architecture

```
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│               │      │               │      │               │
│   Frontend    │─────▶│    Backend    │─────▶│     IPFS      │
│               │      │               │      │               │
└───────────────┘      └───────────────┘      └───────────────┘
        │                     │                      │
        │                     │                      │
        ▼                     ▼                      ▼
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│               │      │               │      │               │
│   Blockchain  │◀─────│    Data       │◀─────│   Encrypted   │
│   Reference   │      │  Processing   │      │     Data      │
│               │      │               │      │               │
└───────────────┘      └───────────────┘      └───────────────┘
```

1. Frontend collects and sends plain data to backend
2. Backend encrypts data using AES-256-CCM
3. Encrypted data is uploaded to IPFS
4. IPFS returns a Content Identifier (CID)
5. Backend stores CID and metadata on the blockchain
6. Frontend can later retrieve and display data

## API Usage

### Uploading Data to IPFS

Use the `uploadToIPFS` server action to upload data to IPFS through the backend:

```typescript
import { uploadToIPFS } from '@/features/data-registry/actions/ipfs';

// Sample data to upload
const data = {
  title: 'Patient Record',
  content: 'Patient health information...',
  // Additional fields
};

// Optional metadata
const metadata = {
  resourceType: 1, // Patient
  createdAt: Date.now(),
};

// Upload to IPFS (backend handles encryption)
const result = await uploadToIPFS(
  data,
  'patient-record.json', // Optional filename
  metadata // Optional metadata
);

console.log('IPFS CID:', result.cid);
console.log('Content Hash:', result.contentHash);
console.log('Size:', result.size);
```

### Registering IPFS Data on Blockchain

After uploading data to IPFS, register it on the blockchain:

```typescript
import { updateBlockchain } from '@/features/data-registry/actions/ipfs';

// Register on blockchain
await updateBlockchain({
  recordId: 'record-123', // Unique record identifier
  cid: result.cid, // CID from IPFS upload
  contentHash: result.contentHash, // Content hash from IPFS upload
  resourceType: 1, // Resource type (e.g., 1 for Patient)
  dataSize: result.size, // Size of the uploaded data
});
```

### Retrieving Data from IPFS

To retrieve data from IPFS:

```typescript
import { getIPFSData } from '@/features/data-registry/actions/ipfs';

// Get data using CID
const { data, metadata } = await getIPFSData('Qm123456789abcdef');

// Use the decrypted data
console.log('Retrieved data:', data);
console.log('IPFS metadata:', metadata);
```

### Deleting Data from IPFS

To delete data from IPFS:

```typescript
import { deleteIPFSData } from '@/features/data-registry/actions/ipfs';

// Delete using CID
await deleteIPFSData('Qm123456789abcdef');
```

## Demo Component

The `IPFSUploadDemo` component provides a practical example of how to use the IPFS integration:

```typescript
import { IPFSUploadDemo } from '@/features/data-registry/components/IPFSUploadDemo';

// Use in your page or component
function YourPage() {
  return (
    <div>
      <h1>Data Registry IPFS Integration Demo</h1>
      <IPFSUploadDemo />
    </div>
  );
}
```

## Security Considerations

1. **Data Encryption**: All sensitive data is encrypted using AES-256-CCM before storage on IPFS
2. **Key Management**: Encryption keys are stored securely on the backend
3. **Access Control**: Data access is controlled via blockchain-based permissions
4. **Data Integrity**: Content hashes are stored on-chain to verify data integrity
5. **No Client-Side Encryption**: To maximize security, encryption is performed on the backend

## Implementation Notes

- The IPFS integration uses Pinata as the IPFS pinning service
- Encryption is performed using Node.js crypto library with AES-256-CCM
- Metadata about the encrypted data is stored on the blockchain for verification
- Access control is implemented at the smart contract level

## Testing

The integration includes comprehensive tests to ensure proper functionality:

```bash
# Run IPFS integration tests
npm test -- features/data-registry/tests/ipfs-integration.test.ts
```

## Future Enhancements

1. Client-side encryption option for highly sensitive data
2. Support for different encryption algorithms based on data sensitivity
3. Batch processing for multiple files
4. Data compression before encryption for large files
5. Enhanced IPFS pinning service integration for better persistence

## Troubleshooting

Common issues and solutions:

- **Connection Errors**: Ensure proper backend connectivity and that the IPFS service is running
- **Upload Failures**: Check file size limits and network connectivity
- **Retrieval Issues**: Verify the CID is correct and that the data is still pinned on IPFS
- **Encryption Errors**: Ensure the encryption key is properly configured on the backend
