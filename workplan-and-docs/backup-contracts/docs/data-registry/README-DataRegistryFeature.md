# Data Registry Feature

This module provides Next.js server actions for interacting with the LED-UP Data Registry smart contract via the Azure Functions API. These server actions allow you to perform various operations on the blockchain from your Next.js application.

## Overview

The Data Registry smart contract manages health records with DID-based authentication and authorization. These server actions provide a convenient way to interact with the contract from your Next.js application.

## Usage

Import the server actions in your Next.js components:

```typescript
import { registerProducerRecord, getProducerRecords } from '@/features/data-registry';
```

### Form Submissions

Most of the server actions are designed to be used with Next.js form submissions:

```tsx
import { registerProducerRecord } from '@/features/data-registry';

export default function RegisterProducerForm() {
  return (
    <form action={registerProducerRecord}>
      <input type="text" name="ownerDid" placeholder="Owner DID" required />
      <input type="text" name="producer" placeholder="Producer Address" required />
      <select name="consent" required>
        <option value="0">Pending</option>
        <option value="1">Allowed</option>
        <option value="2">Denied</option>
      </select>
      <input
        type="hidden"
        name="data"
        value={JSON.stringify({
          id: 'record-123',
          resourceType: 'HealthRecord',
        })}
      />
      <button type="submit">Register Producer</button>
    </form>
  );
}
```

### Direct Calls

For read-only operations, you can call the server actions directly:

```tsx
import { getProducerRecords } from '@/features/data-registry';
import { useEffect, useState } from 'react';

export default function ProducerRecords({ producer }) {
  const [records, setRecords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRecords() {
      try {
        const records = await getProducerRecords(producer);
        setRecords(records);
      } catch (err) {
        setError(err.message || 'Failed to fetch records');
      } finally {
        setLoading(false);
      }
    }

    fetchRecords();
  }, [producer]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Producer Records</h2>
      {/* Render records here */}
    </div>
  );
}
```

## Available Server Actions

### Read Operations

- `getProducerRecord(producer, recordId)`: Get a producer record
- `getProducerRecords(producer)`: Get all producer records
- `getProducerRecordStatus(producer)`: Get a producer record's status
- `getProducerRecordInfo(producer)`: Get a producer record's information
- `getProducerRecordCount(producer)`: Get a producer record's count
- `getTotalRecordsCount()`: Get the total records count
- `getProviderMetadata()`: Get the provider metadata
- `getRecordSchema()`: Get the record schema
- `producerExists(producer)`: Check if a producer exists
- `getCompensationContractAddress()`: Get the compensation contract address
- `getPauseState()`: Get the pause state of the contract
- `getSharedRecord(recordId, requesterDid)`: Get a shared record
- `isConsumerAuthorized(recordId, consumerDid)`: Check if a consumer is authorized
- `getAddressFromDid(did)`: Get the address from a DID
- `getProducerDid(producer)`: Get the DID from a producer address

### Write Operations

- `registerProducerRecord(formData)`: Register a new producer record
- `updateProducerRecord(formData)`: Update an existing producer record
- `updateProducerRecordMetadata(formData)`: Update a producer record's metadata
- `updateProducerRecordStatus(formData)`: Update a producer record's status
- `updateProducerConsent(formData)`: Update a producer's consent status
- `updateProviderMetadata(formData)`: Update the provider's metadata
- `updateProviderRecordSchema(formData)`: Update the provider's record schema
- `shareData(formData)`: Share data with a consumer
- `verifyData(formData)`: Verify data
- `removeProducerRecord(formData)`: Remove a producer record
- `changePauseState(formData)`: Change the pause state of the contract
- `transferOwnership(formData)`: Transfer ownership of the contract
- `renounceOwnership()`: Renounce ownership of the contract

## Helper Functions

The module also provides helper functions for working with the data registry:

- `getStatusLabel(status)`: Get a human-readable label for a record status
- `getConsentLabel(consent)`: Get a human-readable label for a consent status
- `getValidStatusTransitions(currentStatus)`: Get valid status transitions
- `getValidConsentTransitions(currentConsent)`: Get valid consent transitions
- `formatAddress(address)`: Format an Ethereum address for display
- `formatTimestamp(timestamp)`: Format a timestamp for display
- `isValidAddress(address)`: Validate an Ethereum address
- `isValidDid(did)`: Validate a DID
- `getRoleFromDid(did)`: Extract the role from a DID

## Error Handling

All server actions include error handling and will throw an `ApiError` if something goes wrong. You should always use try/catch blocks when calling these server actions.

## Revalidation

After successful write operations, the server actions will automatically revalidate the appropriate paths to ensure that your UI is updated with the latest data.

# FHIR Record Registration with Blockchain and IPFS

This feature enables healthcare professionals to register FHIR (Fast Healthcare Interoperability Resources) records securely using blockchain technology and IPFS storage.

## Overview

The FHIR Record Registration system provides a secure and decentralized way to store and manage healthcare records. It combines:

1. **Secure Encryption**: All health data is encrypted using AES-256-GCM symmetric encryption
2. **Decentralized Storage**: Encrypted data is stored on IPFS (InterPlanetary File System)
3. **Blockchain Registration**: Record metadata is registered on the blockchain for verification and access control
4. **Data Integrity**: Cryptographic hashing ensures data hasn't been tampered with

## How It Works

The registration process follows these steps:

1. Healthcare professional selects a FHIR resource type (Patient, Procedure, etc.)
2. They fill out the appropriate form with the health record data
3. Upon submission, the data is:
   - Encrypted using a secure encryption key
   - Uploaded to IPFS, which returns a Content Identifier (CID)
   - Hashed for verification purposes
   - Registered on the blockchain with metadata (CID, URL, hash)
4. The user receives confirmation and the encryption key for future access

## Components

### Record Registration Page

Located at `/app/(patient)/register-record/page.tsx`, this page provides:

- Resource type selection
- Dynamic form loading based on the selected resource type
- Registration status updates
- Success/error notifications

### Record Registration Service

Located at `/features/data-registry/services/record-registration-service.ts`, this service handles:

- Data encryption using SymmetricCryptoService
- IPFS uploads using IPFSService
- Hash calculation using HashingService
- Preparation of blockchain registration parameters

### FHIR Resource Forms

Located at `/features/data-registry/components/forms/`, these forms provide:

- Structured data entry for different FHIR resource types
- Validation using Zod schemas
- Consistent UI components

## Usage

To register a new health record:

1. Navigate to the Record Registration page
2. Select a FHIR resource type from the dropdown
3. Fill out the form with the required information
4. Submit the form
5. Wait for the registration process to complete
6. Save the encryption key for future access to the record

## Security Considerations

- **Encryption Key**: The encryption key is displayed only once after successful registration. It must be saved securely as it's required to decrypt the data.
- **Blockchain Privacy**: Only metadata is stored on the blockchain, not the actual health data.
- **Access Control**: The blockchain smart contract manages access control to the records.
- **Data Integrity**: The hash stored on the blockchain ensures the data hasn't been tampered with.

## Technical Details

### Encryption

We use AES-256-GCM symmetric encryption via the SymmetricCryptoService:

```typescript
const { encryptedData, key } = await encryptData(data);
```

### IPFS Storage

We use the IPFSService for decentralized storage:

```typescript
const ipfsResponse = await uploadToIPFS(encryptedData, resourceType);
const cid = ipfsResponse.IpfsHash;
```

### Blockchain Registration

We use the DataRegistry smart contract via the useRegisterProducerRecord hook:

```typescript
const result = await registerProducerRecord(registrationParams);
```

### Data Verification

We use the HashingService for data integrity:

```typescript
const hash = await calculateHash(encryptedData);
```

## Future Enhancements

- **Multi-signature support**: Require multiple signatures for sensitive records
- **Consent management**: Enhanced patient consent tracking
- **Record updates**: Support for updating existing records
- **Batch registration**: Register multiple records in a single transaction
- **Advanced search**: Search records by various criteria
- **Audit trail**: Track all access and modifications to records
