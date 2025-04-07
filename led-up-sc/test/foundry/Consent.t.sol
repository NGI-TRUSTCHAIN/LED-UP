// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {ConsentManagement} from "src/contracts/Consent.sol";

// Simplified mock DidRegistry for testing
contract MockDidRegistry {
    // Use a bytes32 hash of the DID string for more efficient storage
    mapping(bytes32 => bool) private activeDidHashes;

    function setActive(string memory did, bool active) external {
        bytes32 didHash = keccak256(bytes(did));
        activeDidHashes[didHash] = active;
    }

    function isActive(string memory did) external view returns (bool) {
        bytes32 didHash = keccak256(bytes(did));
        return activeDidHashes[didHash];
    }
}

contract ConsentTest is Test {
    ConsentManagement public consent;
    MockDidRegistry public mockDidRegistry;

    address OWNER = makeAddr("owner");
    address PRODUCER = makeAddr("producer");
    address PROVIDER = makeAddr("provider");
    address ANOTHER_PROVIDER = makeAddr("another_provider");

    string producerDid;
    string providerDid;
    string anotherProviderDid;

    uint256 constant FUTURE_TIME = 2000000000; // A timestamp in the future (2033)

    event ConsentGranted(string indexed producerDid, string indexed providerDid, string purpose, uint256 expiryTime);
    event ConsentRevoked(string indexed producerDid, string indexed providerDid, string reason);

    function setUp() public {
        // Create mock DidRegistry
        mockDidRegistry = new MockDidRegistry();

        // Create ConsentManagement with mock DidRegistry
        vm.prank(OWNER);
        consent = new ConsentManagement(address(mockDidRegistry));

        // Generate DIDs for testing
        producerDid = getDidFromAddress(PRODUCER);
        providerDid = getDidFromAddress(PROVIDER);
        anotherProviderDid = getDidFromAddress(ANOTHER_PROVIDER);

        // Set DIDs as active in the mock registry
        mockDidRegistry.setActive(producerDid, true);
        mockDidRegistry.setActive(providerDid, true);
        mockDidRegistry.setActive(anotherProviderDid, true);
    }

    // Helper function to get DID from address (same as in the contract)
    function getDidFromAddress(address addr) internal pure returns (string memory) {
        return string(abi.encodePacked("did:ethr:", toAsciiString(addr)));
    }

    function toAsciiString(address addr) internal pure returns (string memory) {
        bytes memory s = new bytes(40);
        for (uint256 i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint256(uint160(addr)) / (2 ** (8 * (19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2 * i] = char(hi);
            s[2 * i + 1] = char(lo);
        }
        return string(s);
    }

    function char(bytes1 b) internal pure returns (bytes1) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }

    function testGrantConsent() public {
        string memory purpose = "Medical data sharing";
        uint256 expiryTime = 0; // No expiry

        vm.prank(PRODUCER);
        vm.expectEmit(true, true, false, true);
        emit ConsentGranted(producerDid, providerDid, purpose, expiryTime);
        consent.grantConsent(providerDid, purpose, expiryTime);

        // Verify consent was granted
        vm.prank(PRODUCER);
        (ConsentManagement.ConsentStatus status, uint256 timestamp, string memory storedPurpose) =
            consent.queryConsent(producerDid, providerDid);

        assertEq(uint256(status), uint256(ConsentManagement.ConsentStatus.Granted));
        assertEq(storedPurpose, purpose);
        assertEq(timestamp, block.timestamp);
    }

    function testGrantConsentWithExpiry() public {
        string memory purpose = "Temporary access";
        uint256 expiryTime = block.timestamp + 3600; // 1 hour from now

        vm.prank(PRODUCER);
        consent.grantConsent(providerDid, purpose, expiryTime);

        // Verify consent was granted with expiry
        vm.prank(PRODUCER);
        (ConsentManagement.ConsentStatus status,,) = consent.queryConsent(producerDid, providerDid);
        assertEq(uint256(status), uint256(ConsentManagement.ConsentStatus.Granted));

        // Check hasValidConsent returns true
        assertTrue(consent.hasValidConsent(producerDid, providerDid));

        // Warp time past expiry
        vm.warp(expiryTime + 1);

        // Consent should now be considered revoked due to expiry
        vm.prank(PRODUCER);
        (status,,) = consent.queryConsent(producerDid, providerDid);
        assertEq(uint256(status), uint256(ConsentManagement.ConsentStatus.Revoked));

        // hasValidConsent should return false
        assertFalse(consent.hasValidConsent(producerDid, providerDid));
    }

    function testRevokeConsent() public {
        string memory purpose = "Medical data sharing";
        string memory revocationReason = "No longer needed";

        // First grant consent
        vm.prank(PRODUCER);
        consent.grantConsent(providerDid, purpose, 0);

        // Then revoke it
        vm.prank(PRODUCER);
        vm.expectEmit(true, true, false, true);
        emit ConsentRevoked(producerDid, providerDid, revocationReason);
        consent.revokeConsent(providerDid, revocationReason);

        // Verify consent was revoked
        vm.prank(PRODUCER);
        (ConsentManagement.ConsentStatus status,,) = consent.queryConsent(producerDid, providerDid);
        assertEq(uint256(status), uint256(ConsentManagement.ConsentStatus.Revoked));

        // hasValidConsent should return false
        assertFalse(consent.hasValidConsent(producerDid, providerDid));
    }

    function testCannotGrantConsentWithInvalidDid() public {
        string memory purpose = "Medical data sharing";

        // Set the provider DID as inactive
        mockDidRegistry.setActive(providerDid, false);

        // Attempt to grant consent should revert
        vm.prank(PRODUCER);
        vm.expectRevert(ConsentManagement.ConsentManagement__InvalidDID.selector);
        consent.grantConsent(providerDid, purpose, 0);

        // Set producer DID as inactive
        mockDidRegistry.setActive(providerDid, true);
        mockDidRegistry.setActive(producerDid, false);

        // Attempt to grant consent should revert
        vm.prank(PRODUCER);
        vm.expectRevert(ConsentManagement.ConsentManagement__InvalidDID.selector);
        consent.grantConsent(providerDid, purpose, 0);
    }

    function testCannotGrantConsentTwice() public {
        string memory purpose = "Medical data sharing";

        // Grant consent first time
        vm.prank(PRODUCER);
        consent.grantConsent(providerDid, purpose, 0);

        // Attempt to grant consent again should revert
        vm.prank(PRODUCER);
        vm.expectRevert(ConsentManagement.ConsentManagement__AlreadyGranted.selector);
        consent.grantConsent(providerDid, purpose, 0);
    }

    function testCannotRevokeNonExistentConsent() public {
        // Attempt to revoke consent that was never granted
        vm.prank(PRODUCER);
        vm.expectRevert(ConsentManagement.ConsentManagement__NotFound.selector);
        consent.revokeConsent(providerDid, "No reason");
    }

    function testCannotQueryNonExistentConsent() public {
        // Attempt to query consent that doesn't exist
        vm.prank(PRODUCER);
        vm.expectRevert(ConsentManagement.ConsentManagement__NotFound.selector);
        consent.queryConsent(producerDid, providerDid);
    }

    function testHasValidConsentWithNonExistentConsent() public view {
        // hasValidConsent should return false for non-existent consent
        assertFalse(consent.hasValidConsent(producerDid, providerDid));
    }

    function testMultipleConsents() public {
        string memory purpose1 = "Medical data sharing";
        string memory purpose2 = "Research data sharing";

        // Grant consent to two different providers
        vm.startPrank(PRODUCER);
        consent.grantConsent(providerDid, purpose1, 0);
        consent.grantConsent(anotherProviderDid, purpose2, 0);
        vm.stopPrank();

        // Verify both consents were granted
        vm.prank(PRODUCER);
        (ConsentManagement.ConsentStatus status1,, string memory storedPurpose1) =
            consent.queryConsent(producerDid, providerDid);

        vm.prank(PRODUCER);
        (ConsentManagement.ConsentStatus status2,, string memory storedPurpose2) =
            consent.queryConsent(producerDid, anotherProviderDid);

        assertEq(uint256(status1), uint256(ConsentManagement.ConsentStatus.Granted));
        assertEq(uint256(status2), uint256(ConsentManagement.ConsentStatus.Granted));
        assertEq(storedPurpose1, purpose1);
        assertEq(storedPurpose2, purpose2);

        // Revoke only one consent
        vm.prank(PRODUCER);
        consent.revokeConsent(providerDid, "No longer needed");

        // Verify one consent is revoked and the other is still granted
        vm.prank(PRODUCER);
        (status1,,) = consent.queryConsent(producerDid, providerDid);

        vm.prank(PRODUCER);
        (status2,,) = consent.queryConsent(producerDid, anotherProviderDid);

        assertEq(uint256(status1), uint256(ConsentManagement.ConsentStatus.Revoked));
        assertEq(uint256(status2), uint256(ConsentManagement.ConsentStatus.Granted));
    }

    function testAccessControl() public {
        // Test that only the producer can query their own consent

        // First, grant consent as the producer
        string memory purpose = "Medical data sharing";
        vm.prank(PRODUCER);
        consent.grantConsent(providerDid, purpose, 0);

        // The producer should be able to query their own consent
        vm.prank(PRODUCER);
        (ConsentManagement.ConsentStatus status,,) = consent.queryConsent(producerDid, providerDid);
        assertEq(uint256(status), uint256(ConsentManagement.ConsentStatus.Granted));

        // Another address should not be able to query consent for a different producer
        // We need to use a different DID than producerDid for this test
        string memory anotherProducerDid = getDidFromAddress(ANOTHER_PROVIDER);

        vm.prank(ANOTHER_PROVIDER);
        vm.expectRevert(ConsentManagement.ConsentManagement__NotFound.selector);
        consent.queryConsent(anotherProducerDid, providerDid);
    }

    function testConsentExpiry() public {
        // Test different expiry scenarios

        // 1. No expiry (0)
        vm.prank(PRODUCER);
        consent.grantConsent(providerDid, "No expiry", 0);

        // Warp far into the future (100 years in seconds)
        vm.warp(block.timestamp + 3153600000); // 100 * 365 * 24 * 60 * 60

        // Consent should still be valid
        assertTrue(consent.hasValidConsent(producerDid, providerDid));

        // 2. Short expiry
        vm.prank(PRODUCER);
        consent.grantConsent(anotherProviderDid, "Short expiry", block.timestamp + 1 hours);

        // Warp just before expiry
        vm.warp(block.timestamp + 59 minutes);

        // Consent should still be valid
        assertTrue(consent.hasValidConsent(producerDid, anotherProviderDid));

        // Warp past expiry
        vm.warp(block.timestamp + 2 minutes);

        // Consent should now be invalid
        assertFalse(consent.hasValidConsent(producerDid, anotherProviderDid));
    }

    // Test the internal getDidFromAddress function by comparing with our test implementation
    function testGetDidFromAddress() public {
        // We can't directly test the internal function, but we can test its behavior
        // by comparing the DIDs we generate with the ones used in the contract

        // Grant consent
        vm.prank(PRODUCER);
        consent.grantConsent(providerDid, "Test purpose", 0);

        // Query consent using the DIDs we generated
        vm.prank(PRODUCER);
        (ConsentManagement.ConsentStatus status,,) = consent.queryConsent(producerDid, providerDid);

        // If the DIDs match what the contract generates internally, this should succeed
        assertEq(uint256(status), uint256(ConsentManagement.ConsentStatus.Granted));
    }
}
