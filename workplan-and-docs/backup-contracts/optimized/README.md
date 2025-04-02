# LED-UP Optimized Smart Contracts

This directory contains gas-optimized versions of the LED-UP smart contracts. These contracts are designed to be more efficient in terms of gas usage while maintaining the same functionality as the original contracts.

## Overview

The optimized contracts use various gas optimization techniques:

1. **Packed Storage**: Using smaller data types and packing multiple values into a single storage slot
2. **Hashed Storage**: Storing hashes of large data instead of the data itself
3. **Bit Flags**: Using bit flags for boolean values to reduce storage costs
4. **Optimized Data Structures**: Using more efficient data structures for storage
5. **Reduced Storage Operations**: Minimizing the number of storage operations

## Contracts

### DidRegistryOptimized

A gas-optimized version of the DidRegistry contract. Key optimizations include:

- Storing hashes of DID documents and public keys instead of the full strings
- Using uint40 for timestamps instead of uint256
- Using bit flags for boolean values
- Optimized mappings for lookups

### DataRegistryOptimized

A gas-optimized version of the DataRegistry contract. Key optimizations include:

- Storing hashes of record IDs and metadata instead of the full strings
- Using uint40 for timestamps instead of uint256
- Using bit flags for producer status
- Optimized mappings for lookups

## Usage

To use these optimized contracts, deploy them instead of the original contracts. The interfaces remain the same, so existing applications should work without modification.

```solidity
// Deploy the optimized contract
DidRegistryOptimized didRegistry = new DidRegistryOptimized("did:ledupv2");

// Use it with the same interface as the original
didRegistry.registerDid("did:ledupv2:123", "document", "publicKey");
```

## Considerations

While these contracts are more gas-efficient, there are some trade-offs to consider:

1. **Data Retrieval**: Since some data is stored as hashes, retrieving the original data may require off-chain storage or event logs
2. **Complexity**: The optimized contracts are more complex, which may make them harder to understand and maintain
3. **Upgradability**: If the contracts need to be upgraded, the data migration may be more complex

## Testing

Comprehensive tests should be written for these optimized contracts to ensure they function correctly and provide the expected gas savings.

## License

All contracts in this directory are licensed under the MIT License.
