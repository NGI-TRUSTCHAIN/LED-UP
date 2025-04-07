// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {DidIssuer} from "src/contracts/DidIssuer.sol";
import {DidRegistry} from "src/contracts/DidRegistry.sol";

contract DidIssuerTest is Test {
    DidIssuer public didIssuer;
    DidRegistry public didRegistry;

    // Test addresses
    address public owner;
    address public user1;
    address public user2;

    // Test DIDs
    string public ownerDid;
    string public user1Did;
    string public user2Did;
    string public inactiveDid;

    // Test credential data
    string public constant CREDENTIAL_TYPE = "HealthCredential";
    bytes32 public credentialId;
    bytes32 public anotherCredentialId;

    // Events to test
    event CredentialIssued(string credentialType, string subject, bytes32 credentialId, uint256 timestamp);

    function setUp() public {
        // Deploy the DidRegistry contract
        didRegistry = new DidRegistry();

        // Set up test addresses
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        // Create DIDs for testing
        ownerDid = string(abi.encodePacked("did:ala:mainnet:", toHexString(owner)));
        user1Did = string(abi.encodePacked("did:ala:mainnet:", toHexString(user1)));
        user2Did = string(abi.encodePacked("did:ala:mainnet:", toHexString(user2)));
        inactiveDid = string(abi.encodePacked("did:ala:mainnet:", toHexString(makeAddr("inactive"))));

        // Register DIDs
        string memory testDocument = '{"name":"Test Document"}';
        string memory testPublicKey =
            "0x04a5e76959860aee1a48e2fe1f4c975f2d4839b89b1d0c0ed88f5fa8a5c4c95c7c9e40f3b9d22ab6c7c6a7a25ab5a5d0a2a4a3a2a1a0a9a8a7a6a5a4a3a2a1a0";

        // Register owner DID
        didRegistry.registerDid(ownerDid, testDocument, testPublicKey);

        // Register user1 DID
        vm.prank(user1);
        didRegistry.registerDid(user1Did, testDocument, testPublicKey);

        // Register user2 DID
        vm.prank(user2);
        didRegistry.registerDid(user2Did, testDocument, testPublicKey);

        // Register inactive DID and then deactivate it
        address inactiveAddr = makeAddr("inactive");
        vm.prank(inactiveAddr);
        didRegistry.registerDid(inactiveDid, testDocument, testPublicKey);
        vm.prank(inactiveAddr);
        didRegistry.deactivateDid(inactiveDid);

        // Deploy the DidIssuer contract
        didIssuer = new DidIssuer(address(didRegistry));

        // Generate unique credential IDs
        credentialId = keccak256(abi.encodePacked("credential1", block.timestamp));
        anotherCredentialId = keccak256(abi.encodePacked("credential2", block.timestamp));
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

    /*================ ISSUE CREDENTIAL TESTS =================*/
    function testIssueCredential() public {
        vm.expectEmit(true, true, true, false);
        emit CredentialIssued(CREDENTIAL_TYPE, user1Did, credentialId, block.timestamp);

        didIssuer.issueCredential(CREDENTIAL_TYPE, user1Did, credentialId);

        // Verify credential was issued
        assertTrue(didIssuer.isCredentialValid(credentialId));
    }

    function testIssueMultipleCredentials() public {
        // Issue first credential
        didIssuer.issueCredential(CREDENTIAL_TYPE, user1Did, credentialId);

        // Issue second credential
        didIssuer.issueCredential("AnotherType", user2Did, anotherCredentialId);

        // Verify both credentials are valid
        assertTrue(didIssuer.isCredentialValid(credentialId));
        assertTrue(didIssuer.isCredentialValid(anotherCredentialId));
    }

    function testCannotIssueCredentialToInactiveSubject() public {
        vm.expectRevert(DidIssuer.DidIssuer__InvalidSubject.selector);
        didIssuer.issueCredential(CREDENTIAL_TYPE, inactiveDid, credentialId);
    }

    function testCannotIssueCredentialWithExistingId() public {
        // Issue a credential first
        didIssuer.issueCredential(CREDENTIAL_TYPE, user1Did, credentialId);

        // Try to issue another credential with the same ID
        vm.expectRevert(DidIssuer.DidIssuer__CredentialAlreadyIssued.selector);
        didIssuer.issueCredential("AnotherType", user2Did, credentialId);
    }

    function testCannotIssueCredentialToNonExistentDid() public {
        string memory nonExistentDid = "did:ala:mainnet:0xnonexistent";

        // The error is coming from DidRegistry, not DidIssuer directly
        // We need to use a more generic expectRevert without a specific selector
        vm.expectRevert();
        didIssuer.issueCredential(CREDENTIAL_TYPE, nonExistentDid, credentialId);
    }

    /*================ VERIFY CREDENTIAL TESTS =================*/
    function testIsCredentialValid() public {
        // Issue a credential first
        didIssuer.issueCredential(CREDENTIAL_TYPE, user1Did, credentialId);

        // Verify the credential is valid
        assertTrue(didIssuer.isCredentialValid(credentialId));
    }

    function testIsCredentialValidWithNonExistentCredential() public view {
        bytes32 nonExistentCredentialId = keccak256(abi.encodePacked("nonexistent", block.timestamp));

        // Verify the credential is not valid
        assertFalse(didIssuer.isCredentialValid(nonExistentCredentialId));
    }

    function testCredentialValidityAfterSubjectDeactivation() public {
        // Issue a credential first
        didIssuer.issueCredential(CREDENTIAL_TYPE, user1Did, credentialId);

        // Deactivate the subject's DID
        vm.prank(user1);
        didRegistry.deactivateDid(user1Did);

        // Credential should still be valid in the issuer's records
        assertTrue(didIssuer.isCredentialValid(credentialId));

        // But we can't issue new credentials to this subject
        bytes32 newCredentialId = keccak256(abi.encodePacked("new", block.timestamp));
        vm.expectRevert(DidIssuer.DidIssuer__InvalidSubject.selector);
        didIssuer.issueCredential(CREDENTIAL_TYPE, user1Did, newCredentialId);
    }

    function testIssueCredentialAsDifferentUser() public {
        vm.prank(user1);
        didIssuer.issueCredential(CREDENTIAL_TYPE, user2Did, credentialId);

        // Verify credential was issued
        assertTrue(didIssuer.isCredentialValid(credentialId));
    }

    function testIssueCredentialWithEmptyType() public {
        // Empty credential type should still be valid
        didIssuer.issueCredential("", user1Did, credentialId);

        // Verify credential was issued
        assertTrue(didIssuer.isCredentialValid(credentialId));
    }
}
