# LED-UP Smart Contract Base Infrastructure

This directory contains the base infrastructure for the LED-UP smart contracts. The goal of this infrastructure is to provide a foundation for gas-efficient, modular, and maintainable smart contracts.

## Overview

The base infrastructure consists of:

1. **BaseContract**: A base contract with common functionality, errors, and modifiers
2. **Libraries**: Utility libraries for gas optimization, string manipulation, and storage
3. **Interfaces**: Clear interfaces for each contract to ensure proper separation of concerns
4. **Optimized Contracts**: Gas-optimized versions of the core contracts

## Gas Optimization Strategies

The following gas optimization strategies are implemented:

1. **Packed Storage**: Using smaller data types and packing multiple values into a single storage slot
2. **Hashed Storage**: Storing hashes of large data instead of the data itself
3. **Bit Flags**: Using bit flags for boolean values to reduce storage costs
4. **Batch Operations**: Providing functions for batch operations to reduce transaction costs
5. **Event-Based Storage**: Using events for data that doesn't need on-chain verification

## Directory Structure

- `base/`: Base contracts and utilities
- `libraries/`: Utility libraries
- `interfaces/`: Contract interfaces
- `optimized/`: Gas-optimized versions of the core contracts
- `utility/`: Utility contracts like BatchOperations

## Usage

To use the base infrastructure, inherit from the appropriate base contract and use the provided libraries and utilities:

```solidity
import {BaseContract} from "../base/BaseContract.sol";
import {StorageLib} from "../libraries/StorageLib.sol";
import {GasLib} from "../libraries/GasLib.sol";

contract MyContract is BaseContract {
    // Use the base contract functionality and libraries
}
```

## Deployment

When deploying contracts that use this infrastructure, make sure to deploy the dependencies in the correct order:

1. Deploy the utility libraries
2. Deploy the core contracts
3. Deploy the utility contracts

## Testing

Comprehensive tests should be written for all contracts that use this infrastructure to ensure proper functionality and gas efficiency.

## License

All contracts in this directory are licensed under the MIT License.
