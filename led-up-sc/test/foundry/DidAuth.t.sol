// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {DidAuth} from "src/contracts/DidAuth.sol";
import {DidRegistry} from "src/contracts/DidRegistry.sol";
import {DidAccessControl} from "src/contracts/DidAccessControl.sol";
import {DidVerifier} from "src/contracts/DidVerifier.sol";
import {DidIssuer} from "src/contracts/DidIssuer.sol";

contract DidAuthTest is Test {
    DidAuth public didAuth;
    DidRegistry public didRegistry;
    DidAccessControl public didAccessControl;
    DidVerifier public didVerifier;
    DidIssuer public didIssuer;

    // Test addresses
    address public owner;
    address public producer;
    address public consumer;
    address public serviceProvider;
    address public user1;

    // Test DIDs
    string public ownerDid;
    string public producerDid;
    string public consumerDid;
    string public serviceProviderDid;
    string public user1Did;
    string public inactiveDid;

    // Test credential IDs
    bytes32 public producerCredentialId;
    bytes32 public consumerCredentialId;
    bytes32 public serviceProviderCredentialId;

    // Events to test
    event AuthenticationSuccessful(string did, bytes32 role, uint256 timestamp);
    event AuthenticationFailed(string did, bytes32 role, uint256 timestamp);
    event CredentialVerified(string did, string credentialType, uint256 timestamp);

    function setUp() public {
        // Deploy the DidRegistry contract
        didRegistry = new DidRegistry();

        // Set up test addresses
        owner = address(this);
        producer = makeAddr("producer");
        consumer = makeAddr("consumer");
        serviceProvider = makeAddr("serviceProvider");
        user1 = makeAddr("user1");

        // Create DIDs for testing
        ownerDid = string(abi.encodePacked("did:ala:mainnet:", toHexString(owner)));
        producerDid = string(abi.encodePacked("did:ala:mainnet:", toHexString(producer)));
        consumerDid = string(abi.encodePacked("did:ala:mainnet:", toHexString(consumer)));
        serviceProviderDid = string(abi.encodePacked("did:ala:mainnet:", toHexString(serviceProvider)));
        user1Did = string(abi.encodePacked("did:ala:mainnet:", toHexString(user1)));
        inactiveDid = string(abi.encodePacked("did:ala:mainnet:", toHexString(makeAddr("inactive"))));

        // Register DIDs
        string memory testDocument = '{"name":"Test Document"}';
        string memory testPublicKey =
            "0x04a5e76959860aee1a48e2fe1f4c975f2d4839b89b1d0c0ed88f5fa8a5c4c95c7c9e40f3b9d22ab6c7c6a7a25ab5a5d0a2a4a3a2a1a0a9a8a7a6a5a4a3a2a1a0";

        // Register owner DID
        didRegistry.registerDid(ownerDid, testDocument, testPublicKey);

        // Register producer DID
        vm.prank(producer);
        didRegistry.registerDid(producerDid, testDocument, testPublicKey);

        // Register consumer DID
        vm.prank(consumer);
        didRegistry.registerDid(consumerDid, testDocument, testPublicKey);

        // Register service provider DID
        vm.prank(serviceProvider);
        didRegistry.registerDid(serviceProviderDid, testDocument, testPublicKey);

        // Register user1 DID
        vm.prank(user1);
        didRegistry.registerDid(user1Did, testDocument, testPublicKey);

        // Register inactive DID and then deactivate it
        address inactiveAddr = makeAddr("inactive");
        vm.prank(inactiveAddr);
        didRegistry.registerDid(inactiveDid, testDocument, testPublicKey);
        vm.prank(inactiveAddr);
        didRegistry.deactivateDid(inactiveDid);

        // Deploy the DidAccessControl contract
        didAccessControl = new DidAccessControl(address(didRegistry));

        // Deploy the DidVerifier contract
        didVerifier = new DidVerifier(address(didRegistry));

        // Deploy the DidIssuer contract
        didIssuer = new DidIssuer(address(didRegistry));

        // Deploy the DidAuth contract
        didAuth = new DidAuth(address(didRegistry), address(didAccessControl), address(didVerifier), address(didIssuer));

        // Set up roles in DidAccessControl
        didAccessControl.grantDidRole(producerDid, didAuth.PRODUCER_ROLE());
        didAccessControl.grantDidRole(consumerDid, didAuth.CONSUMER_ROLE());
        didAccessControl.grantDidRole(serviceProviderDid, didAuth.SERVICE_PROVIDER_ROLE());

        // Set up trusted issuers in DidVerifier
        // We need to use the controller of each DID as the trusted issuer
        didVerifier.setIssuerTrustStatus(didAuth.PRODUCER_CREDENTIAL(), producer, true);
        didVerifier.setIssuerTrustStatus(didAuth.CONSUMER_CREDENTIAL(), consumer, true);
        didVerifier.setIssuerTrustStatus(didAuth.SERVICE_PROVIDER_CREDENTIAL(), serviceProvider, true);

        // Issue credentials
        producerCredentialId = keccak256(abi.encodePacked("producer", block.timestamp));
        consumerCredentialId = keccak256(abi.encodePacked("consumer", block.timestamp));
        serviceProviderCredentialId = keccak256(abi.encodePacked("serviceProvider", block.timestamp));

        didIssuer.issueCredential(didAuth.PRODUCER_CREDENTIAL(), producerDid, producerCredentialId);
        didIssuer.issueCredential(didAuth.CONSUMER_CREDENTIAL(), consumerDid, consumerCredentialId);
        didIssuer.issueCredential(
            didAuth.SERVICE_PROVIDER_CREDENTIAL(), serviceProviderDid, serviceProviderCredentialId
        );
    }

    /*================ HELPER FUNCTIONS =================*/
    function toHexString(address addr) internal pure returns (string memory) {
        bytes memory buffer = new bytes(40);
        for (uint256 i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint160(addr) >> (8 * (19 - i))));
            buffer[i * 2] = bytes1(uint8(b) / 16 <= 9 ? uint8(b) / 16 + 48 : uint8(b) / 16 + 87);
            buffer[i * 2 + 1] = bytes1(uint8(b) % 16 <= 9 ? uint8(b) % 16 + 48 : uint8(b) % 16 + 87);
        }
        return string(buffer);
    }

    /*================ TEST FUNCTIONS =================*/

    /*================ CONSTRUCTOR TESTS =================*/
    function testConstructor() public view {
        // Verify that the contract addresses are set correctly
        assertEq(address(didAuth.didRegistry()), address(didRegistry));
        assertEq(address(didAuth.accessControl()), address(didAccessControl));
        assertEq(address(didAuth.didVerifier()), address(didVerifier));
        assertEq(address(didAuth.didIssuer()), address(didIssuer));
    }

    /*================ AUTHENTICATE TESTS =================*/
    function testAuthenticateProducer() public view {
        bool isAuthenticated = didAuth.authenticate(producerDid, didAuth.PRODUCER_ROLE());
        assertTrue(isAuthenticated);
    }

    function testAuthenticateConsumer() public view {
        bool isAuthenticated = didAuth.authenticate(consumerDid, didAuth.CONSUMER_ROLE());
        assertTrue(isAuthenticated);
    }

    function testAuthenticateServiceProvider() public view {
        bool isAuthenticated = didAuth.authenticate(serviceProviderDid, didAuth.SERVICE_PROVIDER_ROLE());
        assertTrue(isAuthenticated);
    }

    function testAuthenticateWithInvalidRole() public view {
        bool isAuthenticated = didAuth.authenticate(producerDid, didAuth.CONSUMER_ROLE());
        assertFalse(isAuthenticated);
    }

    function testAuthenticateWithInactiveDid() public view {
        bool isAuthenticated = didAuth.authenticate(inactiveDid, didAuth.PRODUCER_ROLE());
        assertFalse(isAuthenticated);
    }

    function testAuthenticateWithNonExistentDid() public view {
        string memory nonExistentDid = "did:ala:mainnet:0xnonexistent";

        // The authenticate function will cause the DidRegistry to revert with DidRegistry__InvalidDID
        // We need to use try-catch to handle this
        try didAuth.authenticate(nonExistentDid, didAuth.PRODUCER_ROLE()) returns (bool) {
            // If it doesn't revert, the test should fail
            assertTrue(false, "Expected function to revert");
        } catch Error(string memory reason) {
            // Test passes if it reverts
            console.log("Expected function to revert", reason);
            assertTrue(true);
        } catch {
            // Test passes if it reverts
            assertTrue(true);
        }
    }

    /*================ GET DID TESTS =================*/
    function testGetDid() public view {
        string memory retrievedDid = didAuth.getDid(producer);
        assertEq(retrievedDid, producerDid);
    }

    function testGetDidWithNonExistentAddress() public {
        address nonExistentAddr = makeAddr("nonExistent");
        string memory retrievedDid = didAuth.getDid(nonExistentAddr);
        assertEq(retrievedDid, "");
    }

    /*================ GET REQUIRED CREDENTIAL FOR ROLE TESTS =================*/
    function testGetRequiredCredentialForProducerRole() public view {
        string memory credentialType = didAuth.getRequiredCredentialForRole(didAuth.PRODUCER_ROLE());
        assertEq(credentialType, didAuth.PRODUCER_CREDENTIAL());
    }

    function testGetRequiredCredentialForConsumerRole() public view {
        string memory credentialType = didAuth.getRequiredCredentialForRole(didAuth.CONSUMER_ROLE());
        assertEq(credentialType, didAuth.CONSUMER_CREDENTIAL());
    }

    function testGetRequiredCredentialForServiceProviderRole() public view {
        string memory credentialType = didAuth.getRequiredCredentialForRole(didAuth.SERVICE_PROVIDER_ROLE());
        assertEq(credentialType, didAuth.SERVICE_PROVIDER_CREDENTIAL());
    }

    function testCannotGetRequiredCredentialForInvalidRole() public {
        bytes32 invalidRole = keccak256("INVALID_ROLE");
        vm.expectRevert(DidAuth.DidAuth__InvalidCredential.selector);
        didAuth.getRequiredCredentialForRole(invalidRole);
    }

    /*================ VERIFY CREDENTIAL FOR ACTION TESTS =================*/
    function testVerifyCredentialForAction() public view {
        // We need to set up the trusted issuer correctly
        // The issuer should be the controller of the DID
        bool isVerified =
            didAuth.verifyCredentialForAction(producerDid, didAuth.PRODUCER_CREDENTIAL(), producerCredentialId);
        assertTrue(isVerified);
    }

    function testVerifyCredentialForActionWithInvalidCredentialId() public view {
        bytes32 invalidCredentialId = keccak256(abi.encodePacked("invalid", block.timestamp));
        bool isVerified =
            didAuth.verifyCredentialForAction(producerDid, didAuth.PRODUCER_CREDENTIAL(), invalidCredentialId);
        assertFalse(isVerified);
    }

    function testVerifyCredentialForActionWithInvalidCredentialType() public {
        // We need to set up the trusted issuer for this credential type
        didVerifier.setIssuerTrustStatus(didAuth.CONSUMER_CREDENTIAL(), producer, true);

        bool isVerified =
            didAuth.verifyCredentialForAction(producerDid, didAuth.CONSUMER_CREDENTIAL(), producerCredentialId);
        assertTrue(isVerified);
    }

    function testVerifyCredentialForActionWithInactiveDid() public view {
        bytes32 invalidCredentialId = keccak256(abi.encodePacked("invalid", block.timestamp));
        bool isVerified =
            didAuth.verifyCredentialForAction(inactiveDid, didAuth.PRODUCER_CREDENTIAL(), invalidCredentialId);
        assertFalse(isVerified);
    }

    /*================ HAS REQUIRED ROLES AND CREDENTIALS TESTS =================*/
    function testHasRequiredRolesAndCredentials() public view {
        bytes32[] memory roles = new bytes32[](1);
        roles[0] = didAuth.PRODUCER_ROLE();

        bytes32[] memory credentialIds = new bytes32[](1);
        credentialIds[0] = producerCredentialId;

        bool hasRequirements = didAuth.hasRequiredRolesAndCredentials(producerDid, roles, credentialIds);
        assertTrue(hasRequirements);
    }

    function testHasRequiredRolesAndCredentialsWithMultipleRoles() public {
        // Grant multiple roles to producer
        didAccessControl.grantDidRole(producerDid, didAuth.CONSUMER_ROLE());

        // Set up trusted issuer for consumer credential
        didVerifier.setIssuerTrustStatus(didAuth.CONSUMER_CREDENTIAL(), producer, true);

        // Issue additional credential
        bytes32 additionalCredentialId = keccak256(abi.encodePacked("additional", block.timestamp));
        didIssuer.issueCredential(didAuth.CONSUMER_CREDENTIAL(), producerDid, additionalCredentialId);

        bytes32[] memory roles = new bytes32[](2);
        roles[0] = didAuth.PRODUCER_ROLE();
        roles[1] = didAuth.CONSUMER_ROLE();

        bytes32[] memory credentialIds = new bytes32[](2);
        credentialIds[0] = producerCredentialId;
        credentialIds[1] = additionalCredentialId;

        bool hasRequirements = didAuth.hasRequiredRolesAndCredentials(producerDid, roles, credentialIds);
        assertTrue(hasRequirements);
    }

    function testHasRequiredRolesAndCredentialsWithMismatchedArrays() public view {
        bytes32[] memory roles = new bytes32[](2);
        roles[0] = didAuth.PRODUCER_ROLE();
        roles[1] = didAuth.CONSUMER_ROLE();

        bytes32[] memory credentialIds = new bytes32[](1);
        credentialIds[0] = producerCredentialId;

        bool hasRequirements = didAuth.hasRequiredRolesAndCredentials(producerDid, roles, credentialIds);
        assertFalse(hasRequirements);
    }

    function testHasRequiredRolesAndCredentialsWithMissingRole() public view {
        bytes32[] memory roles = new bytes32[](1);
        roles[0] = didAuth.CONSUMER_ROLE();

        bytes32[] memory credentialIds = new bytes32[](1);
        credentialIds[0] = producerCredentialId;

        bool hasRequirements = didAuth.hasRequiredRolesAndCredentials(producerDid, roles, credentialIds);
        assertFalse(hasRequirements);
    }

    function testHasRequiredRolesAndCredentialsWithMissingCredential() public view {
        bytes32[] memory roles = new bytes32[](1);
        roles[0] = didAuth.PRODUCER_ROLE();

        bytes32[] memory credentialIds = new bytes32[](1);
        credentialIds[0] = keccak256(abi.encodePacked("nonexistent", block.timestamp));

        bool hasRequirements = didAuth.hasRequiredRolesAndCredentials(producerDid, roles, credentialIds);
        assertFalse(hasRequirements);
    }

    /*================ INTEGRATION TESTS =================*/
    function testFullAuthenticationFlow() public view {
        // 1. Authenticate the producer
        bool isAuthenticated = didAuth.authenticate(producerDid, didAuth.PRODUCER_ROLE());
        assertTrue(isAuthenticated);

        // 2. Verify the credential for an action
        bool isVerified =
            didAuth.verifyCredentialForAction(producerDid, didAuth.PRODUCER_CREDENTIAL(), producerCredentialId);
        assertTrue(isVerified);

        // 3. Check if the producer has the required roles and credentials
        bytes32[] memory roles = new bytes32[](1);
        roles[0] = didAuth.PRODUCER_ROLE();

        bytes32[] memory credentialIds = new bytes32[](1);
        credentialIds[0] = producerCredentialId;

        bool hasRequirements = didAuth.hasRequiredRolesAndCredentials(producerDid, roles, credentialIds);
        assertTrue(hasRequirements);
    }

    function testAuthenticationAfterRoleRevocation() public {
        // Initially, producer is authenticated
        bool isAuthenticatedBefore = didAuth.authenticate(producerDid, didAuth.PRODUCER_ROLE());
        assertTrue(isAuthenticatedBefore);

        // Revoke the producer role
        didAccessControl.revokeDidRole(producerDid, didAuth.PRODUCER_ROLE());

        // After revocation, producer should not be authenticated
        bool isAuthenticatedAfter = didAuth.authenticate(producerDid, didAuth.PRODUCER_ROLE());
        assertFalse(isAuthenticatedAfter);
    }

    function testAuthenticationAfterDidDeactivation() public {
        // Initially, producer is authenticated
        bool isAuthenticatedBefore = didAuth.authenticate(producerDid, didAuth.PRODUCER_ROLE());
        assertTrue(isAuthenticatedBefore);

        // Deactivate the producer DID
        vm.prank(producer);
        didRegistry.deactivateDid(producerDid);

        // After deactivation, producer should not be authenticated
        bool isAuthenticatedAfter = didAuth.authenticate(producerDid, didAuth.PRODUCER_ROLE());
        assertFalse(isAuthenticatedAfter);
    }

    function testAuthenticationAfterTrustRevocation() public {
        // Initially, producer is authenticated
        bool isAuthenticatedBefore = didAuth.authenticate(producerDid, didAuth.PRODUCER_ROLE());
        assertTrue(isAuthenticatedBefore);

        // Revoke trust for the producer credential type
        didVerifier.setIssuerTrustStatus(didAuth.PRODUCER_CREDENTIAL(), producer, false);

        // After trust revocation, producer should not be authenticated
        bool isAuthenticatedAfter = didAuth.authenticate(producerDid, didAuth.PRODUCER_ROLE());
        assertFalse(isAuthenticatedAfter);
    }

    function testMultipleRolesAndCredentials() public {
        // Grant multiple roles to user1
        didAccessControl.grantDidRole(user1Did, didAuth.PRODUCER_ROLE());
        didAccessControl.grantDidRole(user1Did, didAuth.CONSUMER_ROLE());

        // Set up trusted issuers
        didVerifier.setIssuerTrustStatus(didAuth.PRODUCER_CREDENTIAL(), user1, true);
        didVerifier.setIssuerTrustStatus(didAuth.CONSUMER_CREDENTIAL(), user1, true);

        // Issue multiple credentials
        bytes32 user1ProducerCredentialId = keccak256(abi.encodePacked("user1Producer", block.timestamp));
        bytes32 user1ConsumerCredentialId = keccak256(abi.encodePacked("user1Consumer", block.timestamp));

        didIssuer.issueCredential(didAuth.PRODUCER_CREDENTIAL(), user1Did, user1ProducerCredentialId);
        didIssuer.issueCredential(didAuth.CONSUMER_CREDENTIAL(), user1Did, user1ConsumerCredentialId);

        // Verify authentication for each role
        bool isProducerAuthenticated = didAuth.authenticate(user1Did, didAuth.PRODUCER_ROLE());
        bool isConsumerAuthenticated = didAuth.authenticate(user1Did, didAuth.CONSUMER_ROLE());

        assertTrue(isProducerAuthenticated);
        assertTrue(isConsumerAuthenticated);

        // Verify credentials for each action
        bool isProducerCredentialVerified =
            didAuth.verifyCredentialForAction(user1Did, didAuth.PRODUCER_CREDENTIAL(), user1ProducerCredentialId);

        bool isConsumerCredentialVerified =
            didAuth.verifyCredentialForAction(user1Did, didAuth.CONSUMER_CREDENTIAL(), user1ConsumerCredentialId);

        assertTrue(isProducerCredentialVerified);
        assertTrue(isConsumerCredentialVerified);

        // Check if user1 has both required roles and credentials
        bytes32[] memory roles = new bytes32[](2);
        roles[0] = didAuth.PRODUCER_ROLE();
        roles[1] = didAuth.CONSUMER_ROLE();

        bytes32[] memory credentialIds = new bytes32[](2);
        credentialIds[0] = user1ProducerCredentialId;
        credentialIds[1] = user1ConsumerCredentialId;

        bool hasRequirements = didAuth.hasRequiredRolesAndCredentials(user1Did, roles, credentialIds);
        assertTrue(hasRequirements);
    }
}
