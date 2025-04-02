# LED-UP Compensation API

## Overview

The LED-UP Compensation API provides a comprehensive set of endpoints for managing payments, fees, and compensation within the LED-UP ecosystem. These endpoints interact with the Compensation smart contract to process payments for data usage, manage service fees, handle token transfers, facilitate withdrawals, and manage producer/consumer relationships through DIDs (Decentralized Identifiers).

## Authentication

All endpoints that modify state (POST, PUT, DELETE) require authentication using an API key. Read-only endpoints (GET) are publicly accessible but may be rate-limited.

Authentication is handled via the `x-api-key` header:

```
x-api-key: your-api-key-here
```

## Base URL

```
https://api.ledup.io/compensation
```

## Endpoints

### Payment Management

#### Process Payment

Process a payment for data usage.

- **URL**: `/payment/process`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "producer": "0xProducerAddress",
    "recordId": "data-record-id",
    "dataSize": 10
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
        "paymentDetails": {
          "producer": "0xProducerAddress",
          "recordId": "data-record-id",
          "dataSize": 10,
          "unitPrice": "5",
          "amount": "50"
        }
      }
    }
    ```

#### Verify Payment

Verify if a payment has been processed for a specific record.

- **URL**: `/payment/verify/{recordId}`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "recordId": "data-record-id",
        "isPaid": true,
        "timestamp": "2023-06-01T12:00:00Z"
      }
    }
    ```

### Fee Management

#### Get Service Fee

Retrieve the current service fee.

- **URL**: `/fee/service`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "serviceFee": "250",
        "metadata": {
          "description": "The percentage fee charged by the service for each transaction",
          "unit": "basis points (1/100 of a percent)",
          "example": "A value of 250 represents a 2.5% fee"
        }
      }
    }
    ```

#### Change Service Fee

Update the service fee (admin only).

- **URL**: `/fee/service/update`
- **Method**: `POST`
- **Auth Required**: Yes (Admin)
- **Request Body**:
  ```json
  {
    "value": 300
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
        "serviceFee": {
          "previous": "250",
          "current": "300",
          "unit": "basis points (1/100 of a percent)"
        }
      }
    }
    ```

#### Get Service Fee Balance

Retrieve the current accumulated service fee balance.

- **URL**: `/fee/service/balance`
- **Method**: `GET`
- **Auth Required**: Yes (Admin)
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "balance": "5000000000000000000",
        "formattedBalance": "5.0",
        "token": {
          "address": "0xTokenAddress",
          "symbol": "LUP",
          "decimals": 18
        },
        "timestamp": "2023-06-01T12:00:00Z"
      }
    }
    ```

#### Withdraw Service Fee

Withdraw accumulated service fees (admin only).

- **URL**: `/fee/service/withdraw`
- **Method**: `POST`
- **Auth Required**: Yes (Admin)
- **Request Body**:
  ```json
  {
    "value": 1000
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
        "withdrawal": {
          "amount": "1000",
          "owner": "0xOwnerAddress",
          "timestamp": "2023-06-01T12:00:00Z"
        }
      }
    }
    ```

### Price Management

#### Get Unit Price

Retrieve the current unit price for data usage.

- **URL**: `/price/unit`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "unitPrice": "5",
        "metadata": {
          "description": "The price per unit of data consumed",
          "unit": "tokens per data unit",
          "timestamp": "2023-06-01T12:00:00Z"
        }
      }
    }
    ```

#### Change Unit Price

Update the unit price (admin only).

- **URL**: `/price/unit/update`
- **Method**: `POST`
- **Auth Required**: Yes (Admin)
- **Request Body**:
  ```json
  {
    "value": 6
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
        "unitPrice": {
          "previous": "5",
          "current": "6",
          "unit": "tokens per data unit",
          "percentChange": "20.00%"
        }
      }
    }
    ```

### Producer Management

#### Get Producer Balance

Retrieve a producer's current balance.

- **URL**: `/producer/balance?address=0xProducerAddress`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "producer": "0xProducerAddress",
        "balance": "1000",
        "formattedBalance": "1.0",
        "token": {
          "address": "0xTokenAddress",
          "symbol": "TKN",
          "decimals": 18
        },
        "timestamp": "2023-06-01T12:00:00Z"
      }
    }
    ```

#### Withdraw Producer Balance

Withdraw tokens from a producer's balance.

- **URL**: `/producer/balance/withdraw`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "value": 500
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
        "withdrawal": {
          "amount": "500",
          "previousBalance": "1000",
          "newBalance": "500",
          "producer": "0xProducerAddress"
        }
      }
    }
    ```

#### Register Producer

Register a producer with their DID (admin only).

- **URL**: `/producer/register`
- **Method**: `POST`
- **Auth Required**: Yes (Admin)
- **Request Body**:
  ```json
  {
    "address": "0xProducerAddress",
    "did": "did:ledup:producer:123456789"
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
        "producer": {
          "address": "0xProducerAddress",
          "did": "did:ledup:producer:123456789"
        }
      }
    }
    ```

#### Get Producer DID

Retrieve a producer's DID.

- **URL**: `/producer/did?address=0xProducerAddress`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "producer": "0xProducerAddress",
        "did": "did:ledup:producer:123456789",
        "timestamp": "2023-06-01T12:00:00Z"
      }
    }
    ```

#### Remove Producer

Remove a producer (admin only).

- **URL**: `/producer/remove`
- **Method**: `POST`
- **Auth Required**: Yes (Admin)
- **Request Body**:
  ```json
  {
    "address": "0xProducerAddress"
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
        "timestamp": "2023-06-01T12:00:00Z"
      }
    }
    ```

### Consumer Management

#### Register Consumer

Register a consumer with their DID (admin only).

- **URL**: `/consumer/register`
- **Method**: `POST`
- **Auth Required**: Yes (Admin)
- **Request Body**:
  ```json
  {
    "address": "0xConsumerAddress",
    "did": "did:ledup:consumer:123456789"
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
        "consumer": {
          "address": "0xConsumerAddress",
          "did": "did:ledup:consumer:123456789"
        }
      }
    }
    ```

#### Get Consumer DID

Retrieve a consumer's DID.

- **URL**: `/consumer/did?address=0xConsumerAddress`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "consumer": "0xConsumerAddress",
        "did": "did:ledup:consumer:123456789",
        "timestamp": "2023-06-01T12:00:00Z"
      }
    }
    ```

### Token Management

#### Get Payment Token Address

Retrieve the payment token address and details.

- **URL**: `/token/address`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "address": "0xTokenAddress",
        "name": "LED-UP Token",
        "symbol": "LUP",
        "decimals": 18,
        "totalSupply": "1000000000000000000000000",
        "network": "mainnet",
        "timestamp": "2023-06-01T12:00:00Z"
      }
    }
    ```

#### Change Token Address

Update the payment token address (admin only).

- **URL**: `/token/address/update`
- **Method**: `POST`
- **Auth Required**: Yes (Admin)
- **Request Body**:
  ```json
  {
    "address": "0xNewTokenAddress"
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
        "token": {
          "previous": "0xOldTokenAddress",
          "current": "0xNewTokenAddress"
        },
        "timestamp": "2023-06-01T12:00:00Z"
      }
    }
    ```

#### Get Minimum Withdraw Amount

Retrieve the minimum amount that can be withdrawn.

- **URL**: `/withdraw/minimum`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "minimumWithdrawAmount": "100000000000000000",
        "formattedAmount": "0.1",
        "token": {
          "address": "0xTokenAddress",
          "symbol": "LUP",
          "decimals": 18
        },
        "timestamp": "2023-06-01T12:00:00Z"
      }
    }
    ```

#### Set Minimum Withdraw Amount

Update the minimum withdrawal amount (admin only).

- **URL**: `/withdraw/minimum/update`
- **Method**: `POST`
- **Auth Required**: Yes (Admin)
- **Request Body**:
  ```json
  {
    "value": "200000000000000000"
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
        "minimumWithdrawAmount": {
          "previous": "100000000000000000",
          "current": "200000000000000000",
          "formattedCurrent": "0.2"
        },
        "timestamp": "2023-06-01T12:00:00Z"
      }
    }
    ```

### Provider Management

#### Get Provider Wallet

Retrieve the provider wallet address.

- **URL**: `/provider/wallet`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "wallet": "0xProviderWalletAddress",
        "paymentToken": "0xTokenAddress",
        "network": "mainnet",
        "timestamp": "2023-06-01T12:00:00Z"
      }
    }
    ```

#### Get Provider Wallet Balance

Retrieve the provider wallet balance.

- **URL**: `/provider/wallet/balance`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "wallet": "0xProviderWalletAddress",
        "balance": "5000000000000000000000",
        "formattedBalance": "5000.0",
        "token": {
          "address": "0xTokenAddress",
          "symbol": "LUP",
          "decimals": 18
        },
        "timestamp": "2023-06-01T12:00:00Z"
      }
    }
    ```

### Service Management

#### Get Service Status

Retrieve the current status of the compensation service.

- **URL**: `/service/status`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "status": "active", // or "paused"
        "timestamp": "2023-06-01T12:00:00Z"
      }
    }
    ```

#### Pause Compensation Service

Pause the compensation service (admin only).

- **URL**: `/service/pause`
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
        "status": {
          "previous": "active",
          "current": "paused",
          "timestamp": "2023-06-01T12:00:00Z"
        }
      }
    }
    ```

#### Unpause Compensation Service

Unpause the compensation service (admin only).

- **URL**: `/service/unpause`
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
        "status": {
          "previous": "paused",
          "current": "active",
          "timestamp": "2023-06-01T12:00:00Z"
        }
      }
    }
    ```

### DID Management

#### Update DID Auth Address

Update the DID Authentication contract address (admin only).

- **URL**: `/did/auth/update`
- **Method**: `POST`
- **Auth Required**: Yes (Admin)
- **Request Body**:
  ```json
  {
    "address": "0xNewDidAuthAddress"
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
        "didAuth": {
          "previous": "0xOldDidAuthAddress",
          "current": "0xNewDidAuthAddress"
        },
        "timestamp": "2023-06-01T12:00:00Z"
      }
    }
    ```

### Ownership Management

#### Transfer Ownership

Transfer ownership of the compensation contract (admin only).

- **URL**: `/ownership/transfer`
- **Method**: `POST`
- **Auth Required**: Yes (Admin)
- **Request Body**:
  ```json
  {
    "address": "0xNewOwnerAddress"
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
        "ownership": {
          "previous": "0xOldOwnerAddress",
          "current": "0xNewOwnerAddress"
        },
        "timestamp": "2023-06-01T12:00:00Z"
      }
    }
    ```

#### Renounce Ownership

Renounce ownership of the compensation contract (admin only).

- **URL**: `/ownership/renounce`
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
        "ownership": {
          "previous": "0xOwnerAddress",
          "current": "0x0000000000000000000000000000000000000000"
        },
        "timestamp": "2023-06-01T12:00:00Z"
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
- `402 Payment Required`: Insufficient funds for payment
- `500 Internal Server Error`: Server-side error

## Rate Limiting

Public endpoints are rate-limited to 100 requests per minute per IP address.
Authenticated endpoints have higher limits based on the API key tier.

## Webhook Notifications

The API supports webhook notifications for payment events. Configure your webhook URL in the developer dashboard to receive real-time notifications for:

- Payment processed
- Withdrawal completed
- Fee changes
- Service status changes
- Producer/consumer registration
- Ownership changes

## SDK Integration

### JavaScript/TypeScript

```typescript
import { LedUpCompensationClient } from '@ledup/sdk';

// Initialize client
const client = new LedUpCompensationClient({
  apiKey: 'your-api-key',
  environment: 'production', // or 'staging'
});

// Process payment
const payment = await client.processPayment({
  producer: '0xProducerAddress',
  recordId: 'data-record-id',
  dataSize: 10,
});

// Get unit price
const unitPrice = await client.getUnitPrice();

// Withdraw producer balance
const withdrawal = await client.withdrawProducerBalance(500);

// Register a producer with DID
const registration = await client.registerProducer({
  address: '0xProducerAddress',
  did: 'did:ledup:producer:123456789',
});

// Change token address
const tokenUpdate = await client.changeTokenAddress('0xNewTokenAddress');

// Pause the service
const pauseResult = await client.pauseService();

// Get provider wallet balance
const providerBalance = await client.getProviderWalletBalance();
```

### Python

```python
from ledup_sdk import CompensationClient

# Initialize client
client = CompensationClient(
    api_key='your-api-key',
    environment='production'  # or 'staging'
)

# Process payment
payment = client.process_payment(
    producer='0xProducerAddress',
    record_id='data-record-id',
    data_size=10
)

# Get unit price
unit_price = client.get_unit_price()

# Withdraw producer balance
withdrawal = client.withdraw_producer_balance(500)

# Register a producer with DID
registration = client.register_producer(
    address='0xProducerAddress',
    did='did:ledup:producer:123456789'
)

# Change token address
token_update = client.change_token_address('0xNewTokenAddress')

# Pause the service
pause_result = client.pause_service()

# Get provider wallet balance
provider_balance = client.get_provider_wallet_balance()
```

## Event Listening

The SDK also provides methods to listen for events from the compensation contract:

```typescript
// Listen for payment events
const unsubscribe = client.listenForEvents('PaymentProcessed', {}, event => {
  console.log('Payment processed:', event);
});

// Later, unsubscribe from events
unsubscribe();
```

## Development and Testing

For local development and testing, you can use the staging environment:

```
https://api-staging.ledup.io/compensation
```

Test API keys are available in the developer dashboard.

## Support

For API support, please contact:

- Email: api-support@ledup.io
- Developer Portal: https://developers.ledup.io
- Documentation: https://docs.ledup.io/api/compensation
