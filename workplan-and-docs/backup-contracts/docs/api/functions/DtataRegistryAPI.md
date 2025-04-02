# LED-UP Data Registry API

## Overview

The LED-UP Data Registry API provides a comprehensive set of endpoints for managing health records and data sharing within the LED-UP ecosystem. These endpoints interact with the DataRegistry smart contract to register producers, manage health records, control data sharing permissions, and handle metadata for records and providers. The API leverages Decentralized Identifiers (DIDs) for secure authentication and authorization.

## Authentication

All endpoints that modify state (POST, PUT, DELETE) require authentication using an API key. Read-only endpoints (GET) are publicly accessible but may be rate-limited.

Authentication is handled via the `x-api-key` header:

```
x-api-key: your-api-key-here
```

## Base URL

```
https://api.ledup.io/data-registry
```

## Endpoints

### Record Management

#### Register Producer Record

Register a new health record for a producer.

- **URL**: `/producer/register`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "ownerDid": "did:ledup:producer:123456789",
    "recordId": "record-123",
    "producer": "0xProducerAddress",
    "resourceType": "HealthRecord",
    "consent": 1,
    "data": {
      "id": "record-123",
      "resourceType": "HealthRecord",
      "content": "Encrypted health data"
    }
  }
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "txhash": "0x...",
        "data": {
          "recordId": "record-123",
          "producer": "0xProducerAddress",
          "signature": "0x...",
          "resourceType": "HealthRecord",
          "consent": 1,
          "metadata": {
            "url": "https://ipfs.io/ipfs/Qm...",
            "cid": "Qm...",
            "hash": "0x..."
          }
        }
      }
    }
    ```

#### Update Producer Record

Update an existing health record for a producer.

- **URL**: `/producer/record/update`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "recordId": "record-123",
    "producer": "0xProducerAddress",
    "resourceType": "HealthRecord",
    "status": 1,
    "consent": 1,
    "data": {
      "id": "record-123",
      "resourceType": "HealthRecord",
      "content": "Updated encrypted health data"
    },
    "updaterDid": "did:ledup:producer:123456789"
  }
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "txhash": "0x...",
        "data": {
          "recordId": "record-123",
          "producer": "0xProducerAddress",
          "signature": "0x...",
          "resourceType": "HealthRecord",
          "status": 1,
          "consent": 1,
          "metadata": {
            "url": "https://ipfs.io/ipfs/Qm...",
            "cid": "Qm...",
            "hash": "0x..."
          }
        }
      }
    }
    ```

#### Update Producer Record Metadata

Update the metadata of an existing health record.

- **URL**: `/producer/record/metadata/update`
- **Method**: `POST`
- **Auth Required**: Yes (Admin)
- **Request Body**:
  ```json
  {
    "producer": "0xProducerAddress",
    "recordId": "record-123",
    "metadata": {
      "url": "https://ipfs.io/ipfs/Qm...",
      "cid": "Qm...",
      "hash": "0x..."
    }
  }
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "receipt": {
          "transactionHash": "0x...",
          "blockNumber": 12345,
          "events": [...]
        },
        "producer": "0xProducerAddress",
        "recordId": "record-123",
        "metadata": {
          "url": "https://ipfs.io/ipfs/Qm...",
          "cid": "Qm...",
          "hash": "0x..."
        }
      }
    }
    ```

#### Update Producer Record Status

Update the status of a producer's record.

- **URL**: `/producer/record/status/update`
- **Method**: `POST`
- **Auth Required**: Yes (Admin)
- **Request Body**:
  ```json
  {
    "producer": "0xProducerAddress",
    "status": 1
  }
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "receipt": {
          "transactionHash": "0x...",
          "blockNumber": 12345,
          "events": [...]
        },
        "producer": "0xProducerAddress",
        "status": 1
      }
    }
    ```

#### Update Producer Consent

Update the consent status of a producer.

- **URL**: `/producer/consent/update`
- **Method**: `POST`
- **Auth Required**: Yes (Admin)
- **Request Body**:
  ```json
  {
    "producer": "0xProducerAddress",
    "status": 1
  }
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "receipt": {
          "transactionHash": "0x...",
          "blockNumber": 12345,
          "events": [...]
        },
        "producer": "0xProducerAddress",
        "consent": 1
      }
    }
    ```

#### Remove Producer Record

Remove a producer's record from the registry.

- **URL**: `/producer/record/remove`
- **Method**: `POST`
- **Auth Required**: Yes (Admin)
- **Request Body**:
  ```json
  {
    "producer": "0xProducerAddress"
  }
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "receipt": {
          "transactionHash": "0x...",
          "blockNumber": 12345,
          "events": [...]
        },
        "producer": "0xProducerAddress"
      }
    }
    ```

#### Share Data

Share a record with a consumer.

- **URL**: `/data/share`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "recordId": "record-123",
    "consumerDid": "did:ledup:consumer:987654321",
    "ownerDid": "did:ledup:producer:123456789"
  }
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "receipt": {
          "transactionHash": "0x...",
          "blockNumber": 12345,
          "events": [...]
        },
        "recordId": "record-123",
        "consumerDid": "did:ledup:consumer:987654321",
        "ownerDid": "did:ledup:producer:123456789"
      }
    }
    ```

#### Verify Data

Verify a record's data.

- **URL**: `/data/verify`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "recordId": "record-123",
    "verifierDid": "did:ledup:verifier:123456789"
  }
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "receipt": {
          "transactionHash": "0x...",
          "blockNumber": 12345,
          "events": [...]
        },
        "recordId": "record-123",
        "verifierDid": "did:ledup:verifier:123456789"
      }
    }
    ```

### Provider Management

#### Update Provider Metadata

Update the metadata of the provider.

- **URL**: `/provider/metadata/update`
- **Method**: `POST`
- **Auth Required**: Yes (Admin)
- **Request Body**:
  ```json
  {
    "metadata": {
      "url": "https://ipfs.io/ipfs/Qm...",
      "hash": "0x..."
    }
  }
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "receipt": {
          "transactionHash": "0x...",
          "blockNumber": 12345,
          "events": [...]
        },
        "metadata": {
          "url": "https://ipfs.io/ipfs/Qm...",
          "hash": "0x..."
        }
      }
    }
    ```

#### Update Provider Record Schema

Update the schema for provider records.

- **URL**: `/provider/schema/update`
- **Method**: `POST`
- **Auth Required**: Yes (Admin)
- **Request Body**:
  ```json
  {
    "schemaRef": {
      "url": "https://ipfs.io/ipfs/Qm...",
      "hash": "0x..."
    }
  }
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "receipt": {
          "transactionHash": "0x...",
          "blockNumber": 12345,
          "events": [...]
        },
        "schemaRef": {
          "url": "https://ipfs.io/ipfs/Qm...",
          "hash": "0x..."
        }
      }
    }
    ```

### Query Endpoints

#### Get Producer Record

Retrieve a specific record for a producer.

- **URL**: `/producer/record?producer=0xProducerAddress&recordId=record-123`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "record": {
          "signature": "0x...",
          "resourceType": "HealthRecord",
          "cid": "Qm...",
          "url": "https://ipfs.io/ipfs/Qm...",
          "hash": "0x...",
          "isVerified": false
        }
      }
    }
    ```

#### Get Producer Records

Retrieve all records for a producer.

- **URL**: `/producer/records?producer=0xProducerAddress`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "status": 1,
        "consent": 1,
        "records": [
          {
            "signature": "0x...",
            "resourceType": "HealthRecord",
            "cid": "Qm...",
            "url": "https://ipfs.io/ipfs/Qm...",
            "hash": "0x...",
            "isVerified": false
          }
        ],
        "recordIds": ["record-123"],
        "nonce": 1
      }
    }
    ```

#### Get Producer Record Status

Retrieve the status of a producer's records.

- **URL**: `/producer/record/status?producer=0xProducerAddress`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "status": 1
      }
    }
    ```

#### Get Producer Record Info

Retrieve information about a producer's record.

- **URL**: `/producer/record/info?producer=0xProducerAddress`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "ownerDid": "did:ledup:producer:123456789",
        "producer": "0xProducerAddress",
        "status": 1,
        "consent": 1,
        "nonce": 1,
        "isActive": true,
        "updatedAt": 1623456789
      }
    }
    ```

#### Get Producer Record Count

Retrieve the count of records for a producer.

- **URL**: `/producer/record/count?producer=0xProducerAddress`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "count": 1
      }
    }
    ```

#### Get Total Records Count

Retrieve the total count of records in the registry.

- **URL**: `/records/count`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "count": 100
      }
    }
    ```

#### Get Record CID

Retrieve the CID of a record for an authorized consumer.

- **URL**: `/record/cid?recordId=record-123&requesterDid=did:ledup:consumer:987654321`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "cid": "Qm..."
      }
    }
    ```

#### Get Provider Metadata

Retrieve the metadata of the provider.

- **URL**: `/provider/metadata`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "url": "https://ipfs.io/ipfs/Qm...",
        "hash": "0x..."
      }
    }
    ```

#### Get Record Schema

Retrieve the schema for records.

- **URL**: `/record/schema`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "schemaRef": {
          "url": "https://ipfs.io/ipfs/Qm...",
          "hash": "0x..."
        }
      }
    }
    ```

#### Get Producer Consent

Retrieve the consent status of a producer.

- **URL**: `/producer/consent?producer=0xProducerAddress`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "consent": 1
      }
    }
    ```

#### Check Producer Exists

Check if a producer exists in the registry.

- **URL**: `/producer/exists?producer=0xProducerAddress`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "exists": true
      }
    }
    ```

#### Check Consumer Authorization

Check if a consumer is authorized for a record.

- **URL**: `/consumer/authorized?recordId=record-123&consumerDid=did:ledup:consumer:987654321`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "authorized": true
      }
    }
    ```

#### Get Address From DID

Retrieve the address associated with a DID.

- **URL**: `/did/address?did=did:ledup:producer:123456789`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "address": "0xProducerAddress"
      }
    }
    ```

#### Get Producer DID

Retrieve the DID associated with a producer address.

- **URL**: `/producer/did?producer=0xProducerAddress`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "did": "did:ledup:producer:123456789"
      }
    }
    ```

#### Get Compensation Contract Address

Retrieve the address of the compensation contract.

- **URL**: `/compensation/address`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "address": "0xCompensationContractAddress"
      }
    }
    ```

### Contract Management

#### Change Pause State

Change the pause state of the contract.

- **URL**: `/contract/pause`
- **Method**: `POST`
- **Auth Required**: Yes (Admin)
- **Request Body**:
  ```json
  {
    "pause": true
  }
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "receipt": {
          "transactionHash": "0x...",
          "blockNumber": 12345,
          "events": [...]
        },
        "paused": true
      }
    }
    ```

#### Get Pause State

Retrieve the pause state of the contract.

- **URL**: `/contract/pause/state`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "paused": false
      }
    }
    ```

#### Update DidAuth Address

Update the DidAuth contract address.

- **URL**: `/contract/didauth/update`
- **Method**: `POST`
- **Auth Required**: Yes (Admin)
- **Request Body**:
  ```json
  {
    "address": "0xDidAuthContractAddress"
  }
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "receipt": {
          "transactionHash": "0x...",
          "blockNumber": 12345,
          "events": [...]
        },
        "address": "0xDidAuthContractAddress"
      }
    }
    ```

#### Change Token Address

Update the token address used by the contract.

- **URL**: `/contract/token/update`
- **Method**: `POST`
- **Auth Required**: Yes (Admin)
- **Request Body**:
  ```json
  {
    "address": "0xTokenContractAddress"
  }
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "receipt": {
          "transactionHash": "0x...",
          "blockNumber": 12345,
          "events": [...]
        },
        "address": "0xTokenContractAddress"
      }
    }
    ```

#### Transfer Ownership

Transfer ownership of the contract to a new owner.

- **URL**: `/contract/ownership/transfer`
- **Method**: `POST`
- **Auth Required**: Yes (Admin)
- **Request Body**:
  ```json
  {
    "newOwner": "0xNewOwnerAddress"
  }
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "receipt": {
          "transactionHash": "0x...",
          "blockNumber": 12345,
          "events": [...]
        },
        "previousOwner": "0xCurrentOwnerAddress",
        "newOwner": "0xNewOwnerAddress"
      }
    }
    ```

#### Renounce Ownership

Renounce ownership of the contract.

- **URL**: `/contract/ownership/renounce`
- **Method**: `POST`
- **Auth Required**: Yes (Admin)
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "receipt": {
          "transactionHash": "0x...",
          "blockNumber": 12345,
          "events": [...]
        },
        "previousOwner": "0xCurrentOwnerAddress",
        "newOwner": "0x0000000000000000000000000000000000000000"
      }
    }
    ```

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": "Brief error message",
  "details": "Detailed error information"
}
```

Common HTTP status codes:

- `400 Bad Request`: Invalid input parameters
- `401 Unauthorized`: Missing or invalid API key
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

## Rate Limiting

Public endpoints are rate-limited to 100 requests per minute per IP address.
Authenticated endpoints have higher limits based on the API key tier.

## Webhook Notifications

The API supports webhook notifications for data registry events. Configure your webhook URL in the developer dashboard to receive real-time notifications for:

- Record registration
- Record updates
- Data sharing
- Data verification
- Provider metadata updates
- Schema updates
- Ownership changes

## SDK Integration

### JavaScript/TypeScript

```typescript
import { LedUpDataRegistryClient } from '@ledup/sdk';

// Initialize client
const client = new LedUpDataRegistryClient({
  apiKey: 'your-api-key',
  environment: 'production', // or 'staging'
});

// Register a producer record
const registration = await client.registerProducerRecord({
  ownerDid: 'did:ledup:producer:123456789',
  recordId: 'record-123',
  producer: '0xProducerAddress',
  resourceType: 'HealthRecord',
  consent: 1,
  data: {
    id: 'record-123',
    resourceType: 'HealthRecord',
    content: 'Encrypted health data',
  },
});

// Update a producer record
const update = await client.updateProducerRecord({
  recordId: 'record-123',
  producer: '0xProducerAddress',
  resourceType: 'HealthRecord',
  status: 1,
  consent: 1,
  data: {
    id: 'record-123',
    resourceType: 'HealthRecord',
    content: 'Updated encrypted health data',
  },
  updaterDid: 'did:ledup:producer:123456789',
});

// Share data with a consumer
const sharing = await client.shareData(
  'record-123',
  'did:ledup:consumer:987654321',
  'did:ledup:producer:123456789'
);

// Get a producer's records
const records = await client.getProducerRecords('0xProducerAddress');

// Check if a producer exists
const exists = await client.producerExists('0xProducerAddress');

// Change the pause state of the contract
const pauseState = await client.changePauseState(true);
```

### Python

```python
from ledup_sdk import DataRegistryClient

# Initialize client
client = DataRegistryClient(
    api_key='your-api-key',
    environment='production'  # or 'staging'
)

# Register a producer record
registration = client.register_producer_record(
    owner_did='did:ledup:producer:123456789',
    record_id='record-123',
    producer='0xProducerAddress',
    resource_type='HealthRecord',
    consent=1,
    data={
        'id': 'record-123',
        'resourceType': 'HealthRecord',
        'content': 'Encrypted health data'
    }
)

# Update a producer record
update = client.update_producer_record(
    record_id='record-123',
    producer='0xProducerAddress',
    resource_type='HealthRecord',
    status=1,
    consent=1,
    data={
        'id': 'record-123',
        'resourceType': 'HealthRecord',
        'content': 'Updated encrypted health data'
    },
    updater_did='did:ledup:producer:123456789'
)

# Share data with a consumer
sharing = client.share_data(
    record_id='record-123',
    consumer_did='did:ledup:consumer:987654321',
    owner_did='did:ledup:producer:123456789'
)

# Get a producer's records
records = client.get_producer_records('0xProducerAddress')

# Check if a producer exists
exists = client.producer_exists('0xProducerAddress')

# Change the pause state of the contract
pause_state = client.change_pause_state(True)
```

## Event Listening

The SDK also provides methods to listen for events from the data registry contract:

```typescript
// Listen for data registration events
const unsubscribe = client.listenForEvents('DataRegistered', {}, event => {
  console.log('Data registered:', event);
});

// Later, unsubscribe from events
unsubscribe();
```

## Development and Testing

For local development and testing, you can use the staging environment:

```
https://api-staging.ledup.io/data-registry
```

Test API keys are available in the developer dashboard.

## Support

For API support, please contact:

- Email: api-support@ledup.io
- Developer Portal: https://developers.ledup.io
- Documentation: https://docs.ledup.io/api/data-registry
