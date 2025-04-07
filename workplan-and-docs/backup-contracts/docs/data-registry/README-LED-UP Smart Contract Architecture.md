# LED-UP Smart Contract Architecture

This directory contains the smart contracts for the LED-UP platform. The architecture is designed to be gas-efficient, modular, and maintainable.

## Architecture Overview

The LED-UP smart contract architecture consists of the following components:

1. **Core Contracts**: The main contracts that implement the core functionality of the platform
2. **Base Infrastructure**: Common utilities, libraries, and interfaces used across the contracts
3. **Optimized Contracts**: Gas-optimized versions of the core contracts
4. **Utility Contracts**: Helper contracts for batch operations and other utilities

## Directory Structure

- `base/`: Base contracts and utilities
- `libraries/`: Utility libraries
- `interfaces/`: Contract interfaces
- `optimized/`: Gas-optimized versions of the core contracts
- `utility/`: Utility contracts like BatchOperations
- `core/`: Core contract implementations
- `extension/`: Extension contracts that add functionality to the core contracts

## Core Contracts

- **DidRegistry**: Manages decentralized identifiers (DIDs) for users and entities
- **DataRegistry**: Manages health records and data sharing
- **DidAuth**: Handles authentication and authorization based on DIDs
- **Compensation**: Manages payments and compensation for data usage
- **Consent**: Manages consent for data sharing

## Gas Optimization Strategies

The following gas optimization strategies are implemented:

1. **Packed Storage**: Using smaller data types and packing multiple values into a single storage slot
2. **Hashed Storage**: Storing hashes of large data instead of the data itself
3. **Bit Flags**: Using bit flags for boolean values to reduce storage costs
4. **Batch Operations**: Providing functions for batch operations to reduce transaction costs
5. **Event-Based Storage**: Using events for data that doesn't need on-chain verification

## Deployment

When deploying the contracts, make sure to deploy them in the correct order:

1. Deploy the utility libraries
2. Deploy the DidRegistry contract
3. Deploy the DidAccessControl, DidVerifier, and DidIssuer contracts
4. Deploy the DidAuth contract
5. Deploy the Token contract
6. Deploy the DataRegistry contract
7. Deploy the Compensation contract
8. Deploy the Consent contract
9. Deploy the utility contracts

## Testing

Comprehensive tests should be written for all contracts to ensure proper functionality and gas efficiency.

## License

All contracts in this directory are licensed under the MIT License.
