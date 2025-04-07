# LED-UP Smart Contract Documentation

## Compensation Contract Enhancements

### Overview

The Compensation contract has been enhanced with DID-based authentication to improve security and access control. This document outlines the changes made to the contract, deployment script, and tests.

### Files Modified

1. `led-up-sc/src/contracts/Compensation.sol`
2. `led-up-sc/script/Compensation.s.sol`
3. `led-up-sc/test/Compensation.t.sol`

## Detailed Changes

### 1. Compensation.sol

#### Key Enhancements

- **DID Authentication Integration**: The contract now integrates with the `DidAuth` contract to verify the identity and roles of producers and consumers.
- **Producer and Consumer DID Mappings**: Added mappings to associate producer and consumer addresses with their DIDs.
- **Role-Based Access Control**: Payment processing and withdrawals now require valid DIDs with appropriate roles.
- **Enhanced Security Checks**: Added checks to ensure DIDs are valid and have the correct roles before allowing operations.

#### New Functions

- `registerProducer(address _producer, string memory _did)`: Registers a producer with their DID.
- `registerConsumer(address _consumer, string memory _did)`: Registers a consumer with their DID.
- `getProducerDid(address _producer)`: Returns the DID of a producer.
- `getConsumerDid(address _consumer)`: Returns the DID of a consumer.
- `updateDidAuthAddress(address _didAuthAddress)`: Updates the DidAuth contract address.

#### Modified Functions

- `processPayment`: Now requires a valid consumer DID and verifies that the producer has a valid DID with the PRODUCER_ROLE.
- `withdrawProducerBalance`: Now verifies that the caller has a valid producer DID with the PRODUCER_ROLE.
- `removeProducer`: Now also removes the producer's DID mapping.
- `producerExist`: Now checks both the balance and the existence of a DID for the producer.

### 2. Compensation.s.sol

#### Key Enhancements

- **Updated Constructor Call**: Modified the deployment script to include the DidAuth contract address in the Compensation constructor.
- **Improved Readability**: Formatted the constructor parameters for better readability.

### 3. Compensation.t.sol

#### Key Enhancements

- **DidAuth Mock**: Added a mock implementation of the DidAuth contract for testing purposes.
- **DID Registration Tests**: Added tests for producer and consumer DID registration.
- **Authentication Tests**: Added tests for authentication failures with invalid DIDs.
- **Updated Existing Tests**: Modified existing tests to work with the new DID authentication system.

#### New Tests

- `testDidAuthIsSet`: Verifies that the DidAuth contract is correctly set.
- `testProducerDidRegistration`: Verifies that producer DIDs are correctly registered.
- `testConsumerDidRegistration`: Verifies that consumer DIDs are correctly registered.
- `testProcessPaymentWithValidDids`: Tests payment processing with valid DIDs.
- `testProcessPaymentWithInvalidConsumerDid`: Tests payment processing with an invalid consumer DID.
- `testProcessPaymentWithInvalidProducerDid`: Tests payment processing with an invalid producer DID.
- `testUpdateDidAuthAddress`: Tests updating the DidAuth contract address.
- `testCannotUpdateDidAuthAddressToZero`: Tests that the DidAuth address cannot be set to zero.
- `testRegisterProducerWithInvalidDid`: Tests that a producer cannot be registered with an invalid DID.
- `testRegisterConsumerWithInvalidDid`: Tests that a consumer cannot be registered with an invalid DID.

## Security Considerations

1. **DID Validation**: The contract now validates DIDs before allowing operations, enhancing security.
2. **Role-Based Access**: Only addresses with valid DIDs and appropriate roles can perform specific actions.
3. **Error Handling**: Improved error handling with specific error messages for different failure scenarios.

## Integration Guide

To integrate with the updated Compensation contract:

1. Deploy the DidAuth contract and related contracts (DidRegistry, DidAccessControl, DidVerifier, DidIssuer).
2. Deploy the Compensation contract with the DidAuth contract address.
3. Register producers and consumers with their DIDs using the `registerProducer` and `registerConsumer` functions.
4. When processing payments, provide the consumer's DID along with other parameters.

## Testing

The contract has been thoroughly tested with unit tests covering all the new functionality and edge cases. The tests ensure that:

1. Only valid DIDs with appropriate roles can perform actions.
2. Invalid DIDs are rejected.
3. All functions work correctly with the new authentication system.

## Conclusion

The enhanced Compensation contract provides improved security and access control through DID-based authentication. This ensures that only authorized parties can process payments and withdraw funds, reducing the risk of unauthorized access and fraud.
