# LED-UP Smart Contract Interfaces

This directory contains interfaces for the LED-UP smart contracts. These interfaces define the standard functions and events for each contract, ensuring proper separation of concerns and consistent API design.

## Interfaces

### IDidRegistry

The `IDidRegistry` interface defines the standard functions for DID management.

Key functions:

- `registerDid`: Registers a new DID
- `updateDid`: Updates an existing DID
- `deactivateDid`: Deactivates a DID
- `isActive`: Checks if a DID is active
- `getDidDocument`: Gets the DID document for a DID
- `getDidByAddress`: Gets the DID for an address
- `getAddressByDid`: Gets the address for a DID

### IDataRegistry

The `IDataRegistry` interface defines the standard functions for data record management.

Key functions:

- `registerProducer`: Registers a producer
- `createHealthRecord`: Creates a health record
- `updateHealthRecord`: Updates a health record
- `deleteHealthRecord`: Deletes a health record
- `authorizeConsumer`: Authorizes a consumer to access a record
- `revokeConsumerAuthorization`: Revokes a consumer's authorization
- `getHealthRecord`: Gets a health record
- `getProducerRecordIds`: Gets all record IDs for a producer
- `isConsumerAuthorized`: Checks if a consumer is authorized to access a record

### IDidAuth

The `IDidAuth` interface defines the standard functions for DID-based authentication.

Key functions:

- `authenticate`: Authenticates a DID for a specific role
- `verifyCredential`: Verifies a credential for a DID
- `hasRole`: Checks if a DID has a specific role
- `grantRole`: Grants a role to a DID
- `revokeRole`: Revokes a role from a DID

### ICompensation

The `ICompensation` interface defines the standard functions for compensation management.

Key functions:

- `processPayment`: Processes a payment for a record
- `withdrawProducerBalance`: Withdraws a producer's balance
- `withdrawServiceFees`: Withdraws service fees
- `setServiceFeePercent`: Sets the service fee percentage
- `setUnitPrice`: Sets the unit price
- `setMinimumWithdrawAmount`: Sets the minimum withdraw amount
- `getPayment`: Gets a payment
- `getProducerBalance`: Gets a producer's balance
- `getServiceFeeBalance`: Gets the service fee balance

### IConsent

The `IConsent` interface defines the standard functions for consent management.

Key functions:

- `grantConsent`: Grants consent from a producer to a provider
- `revokeConsent`: Revokes consent from a producer to a provider
- `checkConsent`: Checks if consent has been granted
- `getConsent`: Gets the full consent record
- `isConsentValid`: Checks if consent is valid

## Usage

To use these interfaces, import them in your contract:

```solidity
import {IDidRegistry} from "../interfaces/IDidRegistry.sol";
import {IDataRegistry} from "../interfaces/IDataRegistry.sol";
import {IDidAuth} from "../interfaces/IDidAuth.sol";
import {ICompensation} from "../interfaces/ICompensation.sol";
import {IConsent} from "../interfaces/IConsent.sol";

contract MyContract {
    IDidRegistry public didRegistry;
    IDataRegistry public dataRegistry;
    IDidAuth public didAuth;
    ICompensation public compensation;
    IConsent public consent;

    constructor(
        address _didRegistryAddress,
        address _dataRegistryAddress,
        address _didAuthAddress,
        address _compensationAddress,
        address _consentAddress
    ) {
        didRegistry = IDidRegistry(_didRegistryAddress);
        dataRegistry = IDataRegistry(_dataRegistryAddress);
        didAuth = IDidAuth(_didAuthAddress);
        compensation = ICompensation(_compensationAddress);
        consent = IConsent(_consentAddress);
    }

    // Use the interface functions
    function myFunction(string calldata did) external {
        bool isActive = didRegistry.isActive(did);
        // ...
    }
}
```

## License

All interfaces in this directory are licensed under the MIT License.
