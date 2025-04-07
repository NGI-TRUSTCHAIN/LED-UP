# LED-UP Core Smart Contracts

This directory contains the core implementations of the LED-UP smart contracts. These contracts provide the fundamental functionality for the platform.

## Contracts

### DidRegistryCore

The `DidRegistryCore` contract provides the core functionality for managing DIDs (Decentralized Identifiers). It implements the `IDidRegistry` interface.

Key features:

- DID registration, update, and deactivation
- DID document storage and retrieval
- DID-to-address and address-to-DID mappings
- Signature validation for DID operations

### DataRegistryCore

The `DataRegistryCore` contract provides the core functionality for managing health records. It implements the `IDataRegistry` interface.

Key features:

- Producer registration
- Health record creation, update, and deletion
- Consumer authorization management
- Provider and record schema management

### AuthenticationCore

The `AuthenticationCore` contract provides the core functionality for DID-based authentication. It implements the `IDidAuth` interface.

Key features:

- DID authentication for specific roles
- Credential verification
- Role management (grant, revoke, check)
- Role requirement management

## Usage

These core contracts are designed to be used as the foundation for the LED-UP platform. They can be used directly or extended with additional functionality.

```solidity
// Deploy the core contracts
DidRegistryCore didRegistry = new DidRegistryCore("ledupv2");
DataRegistryCore dataRegistry = new DataRegistryCore(address(didRegistry));
AuthenticationCore authCore = new AuthenticationCore(address(didRegistry));

// Use the core contracts
didRegistry.registerDid("did:ledupv2:123", "document", "publicKey");
dataRegistry.registerProducer(producer, "did:ledupv2:123");
authCore.grantRole("did:ledupv2:123", keccak256("PRODUCER_ROLE"));
```

## Extension

The core contracts are designed to be extended with additional functionality. This can be done by inheriting from the core contracts and adding new features.

```solidity
import {DidRegistryCore} from "../core/DidRegistryCore.sol";

contract DidRegistryExtended is DidRegistryCore {
    // Add new functionality
    function registerDidWithMetadata(
        string calldata did,
        string calldata document,
        string calldata publicKey,
        string calldata metadata
    ) external {
        // Register the DID
        registerDid(did, document, publicKey);

        // Add metadata
        // ...
    }
}
```

## License

All contracts in this directory are licensed under the MIT License.
