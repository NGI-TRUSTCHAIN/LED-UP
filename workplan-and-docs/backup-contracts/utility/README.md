# LED-UP Smart Contract Utilities

This directory contains utility contracts for the LED-UP platform. These contracts provide helper functions and batch operations to improve gas efficiency and user experience.

## Contracts

### BatchOperations

The `BatchOperations` contract provides functions for performing batch operations on various contracts to reduce gas costs for multiple transactions.

Key features:

- Batch DID operations (register, update, deactivate)
- Batch data registry operations (create, update, delete records)
- Batch consumer authorization operations
- Batch DID auth operations (grant, revoke roles)

## Usage

To use the batch operations contract, deploy it with the addresses of the core contracts:

```solidity
// Deploy the batch operations contract
BatchOperations batchOperations = new BatchOperations(
    didRegistryAddress,
    dataRegistryAddress,
    didAuthAddress
);

// Grant ownership to the appropriate address
batchOperations.transferOwnership(ownerAddress);
```

Then, you can use the batch operations contract to perform multiple operations in a single transaction:

```solidity
// Batch register DIDs
string[] memory dids = new string[](3);
string[] memory documents = new string[](3);
string[] memory publicKeys = new string[](3);

dids[0] = "did:ledupv2:123";
dids[1] = "did:ledupv2:456";
dids[2] = "did:ledupv2:789";

documents[0] = "document1";
documents[1] = "document2";
documents[2] = "document3";

publicKeys[0] = "publicKey1";
publicKeys[1] = "publicKey2";
publicKeys[2] = "publicKey3";

batchOperations.batchRegisterDids(dids, documents, publicKeys);
```

## Gas Savings

Using batch operations can significantly reduce gas costs when performing multiple similar operations. For example:

- Registering 10 DIDs individually: ~1,000,000 gas
- Registering 10 DIDs in a batch: ~500,000 gas (50% savings)

The exact gas savings depend on the specific operations being performed and the number of operations in the batch.

## Security Considerations

When using batch operations, be aware of the following security considerations:

1. **Transaction Size Limits**: Ethereum has a block gas limit, so there's a limit to how many operations you can include in a single batch. If you exceed this limit, the transaction will fail.

2. **Atomic Operations**: All operations in a batch are atomic, meaning they either all succeed or all fail. If one operation fails, the entire batch will be reverted.

3. **Access Control**: The batch operations contract has the same access control as the underlying contracts. Make sure to properly secure the batch operations contract to prevent unauthorized access.

## License

All contracts in this directory are licensed under the MIT License.
