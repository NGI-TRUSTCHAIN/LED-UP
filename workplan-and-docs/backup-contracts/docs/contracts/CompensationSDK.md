# LEDUP - Compensation TypeScript SDK

**Version:** 1.0.0  
**Last Updated:** March 2025  
**Status:** Production

## Overview

The CompensationSDK provides a TypeScript interface for interacting with the Compensation smart contract in the LEDUP ecosystem. This SDK enables developers to integrate payment processing, balance management, and fee calculations into applications that utilize the LEDUP data sharing platform.

## Core Features

### Payment Processing

The SDK provides methods for consumers to pay producers for access to health records:

```typescript
// Process payment for data access
const tx = await compensationSDK.processPayment({
  producer: '0x1234...', // Producer address
  recordId: 'record-123', // Record identifier
  dataSize: 1024, // Size of data in bytes
});
await tx.wait();
```

### Balance Management

The SDK allows producers to view and withdraw their earned balances:

```typescript
// Check producer balance
const balance = await compensationSDK.getProducerBalance();
console.log(`Current balance: ${ethers.utils.formatEther(balance)} tokens`);

// Withdraw available funds
const tx = await compensationSDK.withdrawProducerBalance(
  ethers.utils.parseEther('10') // Withdraw 10 tokens
);
await tx.wait();
```

### Payment Verification

The SDK provides methods for verifying payment status, particularly useful for integration with the DataRegistry contract:

```typescript
// Verify if payment has been made for a record
const isPaid = await compensationSDK.verifyPayment('record-123');
if (isPaid) {
  console.log('Payment confirmed for record-123');
} else {
  console.log('Payment required for record-123');
}
```

### Administrative Operations

For platform administrators, the SDK provides functions to manage the compensation system:

```typescript
// Update service fee percentage (owner only)
await compensationSDK.changeServiceFee(500); // 5% fee (represented as 500 basis points)

// Change unit pricing (owner only)
await compensationSDK.changeUnitPrice(ethers.utils.parseEther('0.5')); // 0.5 tokens per unit
```

## Integration Patterns

### With DataRegistry

The Compensation SDK is designed to work seamlessly with the DataRegistry SDK:

```typescript
// Complete payment flow with data access
// 1. Process payment
await compensationSDK.processPayment({
  producer: recordOwner,
  recordId: 'record-123',
  dataSize: 1024,
});

// 2. Access data through DataRegistry
await dataRegistrySDK.access.triggerAccess('record-123');
```

### With User Wallets

The SDK integrates with user wallets for token approvals and payments:

```typescript
// Approve tokens for spending (required before processing payment)
const requiredAmount = await compensationSDK.calculateRequiredAmount(1024); // For 1KB data
const tokenAddress = await compensationSDK.getTokenAddress();
const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

await tokenContract.approve(compensationSDK.getAddress(), requiredAmount);

// Now process the payment
await compensationSDK.processPayment({
  producer: recordOwner,
  recordId: 'record-123',
  dataSize: 1024,
});
```

## API Reference

### CompensationSDK

```typescript
class CompensationSDK {
  /**
   * Constructor for the CompensationSDK
   */
  constructor(config: CompensationSDKConfig);

  /**
   * Initialize the SDK
   */
  async initialize(): Promise<void>;

  /**
   * Process payment for accessing a health record
   */
  async processPayment(params: PaymentParams): Promise<TransactionResponse>;

  /**
   * Check if payment has been processed for a specific record
   */
  async verifyPayment(recordId: string): Promise<boolean>;

  /**
   * Withdraw available balance (for producers)
   */
  async withdrawProducerBalance(amount: BigNumber): Promise<TransactionResponse>;

  /**
   * Get the current balance of the calling producer
   */
  async getProducerBalance(): Promise<BigNumber>;

  /**
   * Get balance of a specific producer (admin only)
   */
  async getProducerBalance(producer: string): Promise<BigNumber>;

  /**
   * Get the current service fee percentage
   */
  async getServiceFee(): Promise<number>;

  /**
   * Change the service fee percentage (admin only)
   */
  async changeServiceFee(newServiceFee: number): Promise<TransactionResponse>;

  /**
   * Get the current unit price
   */
  async getUnitPrice(): Promise<BigNumber>;

  /**
   * Change the unit price (admin only)
   */
  async changeUnitPrice(newUnitPrice: BigNumber): Promise<TransactionResponse>;

  /**
   * Get the token contract address
   */
  async getTokenAddress(): Promise<string>;

  /**
   * Calculate amount required for payment based on data size
   */
  async calculateRequiredAmount(dataSize: number): Promise<BigNumber>;

  /**
   * Pause the compensation service (admin only)
   */
  async pauseService(): Promise<TransactionResponse>;

  /**
   * Unpause the compensation service (admin only)
   */
  async unpauseService(): Promise<TransactionResponse>;

  /**
   * Get the address of the compensation contract
   */
  getAddress(): string;
}
```

### Configuration

```typescript
interface CompensationSDKConfig {
  /**
   * Provider for connecting to Ethereum
   */
  provider: Provider;

  /**
   * Wallet or signer for transactions
   */
  wallet?: Wallet | Signer;

  /**
   * Address of the Compensation contract
   */
  contractAddress: string;

  /**
   * Optional gas settings
   */
  gasSettings?: {
    gasLimit?: number;
    gasPrice?: BigNumber;
  };
}
```

### Input Types

```typescript
interface PaymentParams {
  /**
   * Address of the producer/data owner
   */
  producer: string;

  /**
   * Unique identifier of the record being accessed
   */
  recordId: string;

  /**
   * Size of the data in bytes
   */
  dataSize: number;

  /**
   * Optional DID of the consumer (defaults to caller's DID)
   */
  consumerDid?: string;
}
```

## Error Handling

The SDK provides standardized error handling for compensation-related operations:

```typescript
import { CompensationError, ErrorCode } from '@ledup/compensation-sdk';

try {
  await compensationSDK.withdrawProducerBalance(
    ethers.utils.parseEther('100') // Attempt to withdraw 100 tokens
  );
} catch (error) {
  if (error instanceof CompensationError) {
    switch (error.code) {
      case ErrorCode.INSUFFICIENT_BALANCE:
        console.error('Not enough balance to withdraw');
        break;
      case ErrorCode.MINIMUM_WITHDRAW_AMOUNT:
        console.error('Withdrawal amount below minimum threshold');
        break;
      case ErrorCode.INVALID_PRODUCER:
        console.error('Address not registered as a producer');
        break;
      case ErrorCode.TOKEN_TRANSFER_FAILED:
        console.error('Token transfer failed');
        break;
      default:
        console.error('Error:', error.message);
    }
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Events

The SDK allows subscribing to contract events for real-time updates:

```typescript
// Listen for payment events
compensationSDK.events.on('PaymentProcessed', (event) => {
  const { producer, consumer, amount, serviceFee } = event.args;
  console.log(`Payment processed: ${ethers.utils.formatEther(amount)} tokens`);
  console.log(`Producer: ${producer}, Consumer: ${consumer}`);
  console.log(`Service fee: ${ethers.utils.formatEther(serviceFee)} tokens`);

  // Update UI or trigger other business logic
});

// Start listening
await compensationSDK.events.startListening();
```

## Implementation Example

Here's a complete example of implementing the Compensation SDK in a TypeScript application:

```typescript
import { CompensationSDK } from '@ledup/compensation-sdk';
import { ethers } from 'ethers';
import { ERC20_ABI } from './abis';

// Initialize the provider and wallet
const provider = new ethers.providers.JsonRpcProvider('https://rpc-url.example.com');
const wallet = new ethers.Wallet('PRIVATE_KEY', provider);

// Initialize the SDK
const compensationSDK = new CompensationSDK({
  provider,
  wallet,
  contractAddress: '0xCompensationContractAddress',
});
await compensationSDK.initialize();

// Implementation of a payment service
class PaymentService {
  constructor(private sdk: CompensationSDK) {}

  async getTokenContract() {
    const tokenAddress = await this.sdk.getTokenAddress();
    return new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
  }

  async checkAndApproveTokens(amount: BigNumber) {
    const tokenContract = await this.getTokenContract();
    const allowance = await tokenContract.allowance(wallet.address, this.sdk.getAddress());

    if (allowance.lt(amount)) {
      const approveTx = await tokenContract.approve(this.sdk.getAddress(), amount);
      await approveTx.wait();
      console.log('Token approval confirmed');
    }
  }

  async payForAccess(producerAddress: string, recordId: string, dataSize: number) {
    try {
      // Calculate required amount
      const amount = await this.sdk.calculateRequiredAmount(dataSize);

      // Check and approve tokens if needed
      await this.checkAndApproveTokens(amount);

      // Process the payment
      const tx = await this.sdk.processPayment({
        producer: producerAddress,
        recordId,
        dataSize,
      });

      await tx.wait();
      console.log(`Payment completed for record ${recordId}`);
      return true;
    } catch (error) {
      console.error('Payment failed:', error);
      throw error;
    }
  }

  async withdrawEarnings(amount: BigNumber) {
    try {
      // Check balance
      const balance = await this.sdk.getProducerBalance();
      console.log(`Current balance: ${ethers.utils.formatEther(balance)} tokens`);

      if (balance.lt(amount)) {
        throw new Error('Insufficient balance for withdrawal');
      }

      // Process withdrawal
      const tx = await this.sdk.withdrawProducerBalance(amount);
      await tx.wait();

      console.log(`Successfully withdrew ${ethers.utils.formatEther(amount)} tokens`);
      return true;
    } catch (error) {
      console.error('Withdrawal failed:', error);
      throw error;
    }
  }
}

// Usage example
async function main() {
  const paymentService = new PaymentService(compensationSDK);

  // Pay for access to a record
  await paymentService.payForAccess(
    '0xProducerAddress',
    'health-record-123',
    2048 // 2KB data
  );

  // Withdraw earnings (if you're a producer)
  await paymentService.withdrawEarnings(
    ethers.utils.parseEther('5') // Withdraw 5 tokens
  );
}

main().catch(console.error);
```

## Best Practices

1. **Always verify token allowance** before attempting to process payments.
2. **Handle payment failures gracefully** and provide clear feedback to users.
3. **Monitor events** to keep the application state in sync with blockchain state.
4. **Implement proper error handling** with user-friendly error messages.
5. **Check producer balance** before attempting withdrawals to avoid failed transactions.
6. **Cache token addresses and prices** to reduce unnecessary blockchain calls.
7. **Use optimistic UI updates** while waiting for transaction confirmations.

---

**© 2025 LEDUP - All rights reserved.**
