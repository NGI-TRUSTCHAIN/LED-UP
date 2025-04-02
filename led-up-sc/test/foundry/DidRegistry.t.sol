// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {DidRegistry} from "src/contracts/DidRegistry.sol";

contract DidRegistryTest is Test {
    DidRegistry public didRegistry;

    // Test addresses
    address public owner;
    address public user1;
    address public user2;
    address public user3;

    // Test DIDs
    string public ownerDid;
    string public user1Did;
    string public user2Did;
    string public invalidDid;

    // Test documents and public keys
    string public testDocument = '{"name":"Test Document","description":"This is a test document"}';
    string public updatedDocument = '{"name":"Updated Document","description":"This is an updated document"}';
    string public testPublicKey =
        "0x04a5e76959860aee1a48e2fe1f4c975f2d4839b89b1d0c0ed88f5fa8a5c4c95c7c9e40f3b9d22ab6c7c6a7a25ab5a5d0a2a4a3a2a1a0a9a8a7a6a5a4a3a2a1a0";
    string public updatedPublicKey =
        "0x04b5e76959860aee1a48e2fe1f4c975f2d4839b89b1d0c0ed88f5fa8a5c4c95c7c9e40f3b9d22ab6c7c6a7a25ab5a5d0a2a4a3a2a1a0a9a8a7a6a5a4a3a2a1a0";

    // Events to test
    event DIDRegistered(string did, address indexed controller);
    event DIDUpdated(string did, uint256 indexed timestamp);
    event DIDDeactivated(string did, uint256 indexed timestamp);

    function setUp() public {
        // Deploy the DidRegistry contract
        didRegistry = new DidRegistry();

        // Set up test addresses
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");

        // Create DIDs for testing
        ownerDid = string(abi.encodePacked("did:ala:mainnet:", toHexString(owner)));
        user1Did = string(abi.encodePacked("did:ala:mainnet:", toHexString(user1)));
        user2Did = string(abi.encodePacked("did:ala:mainnet:", toHexString(user2)));
        invalidDid = "did:ala:mainnet:0xInvalidAddress";
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

    /*================ REGISTER DID TESTS =================*/
    function testRegisterDid() public {
        vm.expectEmit(true, true, false, true);
        emit DIDRegistered(ownerDid, owner);

        didRegistry.registerDid(ownerDid, testDocument, testPublicKey);

        // Verify DID was registered correctly
        DidRegistry.DIDDocument memory doc = didRegistry.resolveDid(ownerDid);
        assertEq(doc.document, testDocument);
        assertEq(doc.publicKey, testPublicKey);
        assertEq(doc.subject, owner);
        assertTrue(doc.active);
        assertTrue(doc.lastUpdated > 0);

        // Verify address to DID mapping
        assertEq(didRegistry.addressToDID(owner), ownerDid);
    }

    function testRegisterDidAsUser() public {
        vm.startPrank(user1);

        vm.expectEmit(true, true, false, true);
        emit DIDRegistered(user1Did, user1);

        didRegistry.registerDid(user1Did, testDocument, testPublicKey);

        // Verify DID was registered correctly
        DidRegistry.DIDDocument memory doc = didRegistry.resolveDid(user1Did);
        assertEq(doc.document, testDocument);
        assertEq(doc.publicKey, testPublicKey);
        assertEq(doc.subject, user1);
        assertTrue(doc.active);

        vm.stopPrank();
    }

    function testCannotRegisterInvalidDid() public {
        // First register a DID for the owner
        didRegistry.registerDid(ownerDid, testDocument, testPublicKey);

        // Now try to register a different DID for the same owner (which should fail)
        string memory anotherDid = string(abi.encodePacked("did:ala:testnet:", toHexString(owner)));

        vm.expectRevert(DidRegistry.DidRegistry__Unauthorized.selector);
        didRegistry.registerDid(anotherDid, testDocument, testPublicKey);
    }

    function testCannotRegisterDuplicateDid() public {
        // Register a DID first
        didRegistry.registerDid(ownerDid, testDocument, testPublicKey);

        // Try to register the same DID again
        vm.expectRevert(DidRegistry.DidRegistry__DIDAlreadyRegistered.selector);
        didRegistry.registerDid(ownerDid, updatedDocument, testPublicKey);
    }

    function testCannotRegisterMultipleDids() public {
        // Register a DID first
        didRegistry.registerDid(ownerDid, testDocument, testPublicKey);

        // Create another DID for the same address (which should fail)
        string memory anotherDid = string(abi.encodePacked("did:ala:testnet:", toHexString(owner)));

        vm.expectRevert(DidRegistry.DidRegistry__Unauthorized.selector);
        didRegistry.registerDid(anotherDid, testDocument, testPublicKey);
    }

    /*================ UPDATE DID DOCUMENT TESTS =================*/
    function testUpdateDidDocument() public {
        // Register a DID first
        didRegistry.registerDid(ownerDid, testDocument, testPublicKey);

        // Update the document
        vm.expectEmit(true, true, false, true);
        emit DIDUpdated(ownerDid, block.timestamp);

        didRegistry.updateDidDocument(ownerDid, updatedDocument);

        // Verify document was updated
        assertEq(didRegistry.getDocument(ownerDid), updatedDocument);
    }

    function testCannotUpdateDidDocumentUnauthorized() public {
        // Register a DID first
        didRegistry.registerDid(ownerDid, testDocument, testPublicKey);

        // Try to update as unauthorized user
        vm.startPrank(user1);
        vm.expectRevert(DidRegistry.DidRegistry__Unauthorized.selector);
        didRegistry.updateDidDocument(ownerDid, updatedDocument);
        vm.stopPrank();
    }

    function testCannotUpdateNonExistentDid() public {
        vm.expectRevert(DidRegistry.DidRegistry__InvalidDID.selector);
        didRegistry.updateDidDocument(user1Did, updatedDocument);
    }

    function testCannotUpdateDeactivatedDid() public {
        // Register and deactivate a DID
        didRegistry.registerDid(ownerDid, testDocument, testPublicKey);
        didRegistry.deactivateDid(ownerDid);

        // Try to update the deactivated DID
        vm.expectRevert(DidRegistry.DidRegistry__DeactivatedDID.selector);
        didRegistry.updateDidDocument(ownerDid, updatedDocument);
    }

    /*================ UPDATE PUBLIC KEY TESTS =================*/
    function testUpdateDidPublicKey() public {
        // Register a DID first
        didRegistry.registerDid(ownerDid, testDocument, testPublicKey);

        // Update the public key
        vm.expectEmit(true, true, false, true);
        emit DIDUpdated(ownerDid, block.timestamp);

        didRegistry.updateDidPublicKey(ownerDid, updatedPublicKey);

        // Verify public key was updated
        assertEq(didRegistry.getPublicKey(ownerDid), updatedPublicKey);
    }

    function testCannotUpdateDidPublicKeyUnauthorized() public {
        // Register a DID first
        didRegistry.registerDid(ownerDid, testDocument, testPublicKey);

        // Try to update as unauthorized user
        vm.startPrank(user1);
        vm.expectRevert(DidRegistry.DidRegistry__Unauthorized.selector);
        didRegistry.updateDidPublicKey(ownerDid, updatedPublicKey);
        vm.stopPrank();
    }

    /*================ DEACTIVATE DID TESTS =================*/
    function testDeactivateDid() public {
        // Register a DID first
        didRegistry.registerDid(ownerDid, testDocument, testPublicKey);

        // Deactivate the DID
        vm.expectEmit(true, true, false, true);
        emit DIDDeactivated(ownerDid, block.timestamp);

        didRegistry.deactivateDid(ownerDid);

        // Verify DID was deactivated
        assertFalse(didRegistry.isActive(ownerDid));
    }

    function testCannotDeactivateDidUnauthorized() public {
        // Register a DID first
        didRegistry.registerDid(ownerDid, testDocument, testPublicKey);

        // Try to deactivate as unauthorized user
        vm.startPrank(user1);
        vm.expectRevert(DidRegistry.DidRegistry__Unauthorized.selector);
        didRegistry.deactivateDid(ownerDid);
        vm.stopPrank();
    }

    function testCannotDeactivateNonExistentDid() public {
        vm.expectRevert(DidRegistry.DidRegistry__InvalidDID.selector);
        didRegistry.deactivateDid(user1Did);
    }

    function testCannotDeactivateAlreadyDeactivatedDid() public {
        // Register and deactivate a DID
        didRegistry.registerDid(ownerDid, testDocument, testPublicKey);
        didRegistry.deactivateDid(ownerDid);

        // Try to deactivate again
        vm.expectRevert(DidRegistry.DidRegistry__DeactivatedDID.selector);
        didRegistry.deactivateDid(ownerDid);
    }

    /*================ RESOLVE DID TESTS =================*/
    function testResolveDid() public {
        // Register a DID first
        didRegistry.registerDid(ownerDid, testDocument, testPublicKey);

        // Resolve the DID
        DidRegistry.DIDDocument memory doc = didRegistry.resolveDid(ownerDid);

        // Verify resolved document
        assertEq(doc.document, testDocument);
        assertEq(doc.publicKey, testPublicKey);
        assertEq(doc.subject, owner);
        assertTrue(doc.active);
    }

    function testCannotResolveNonExistentDid() public {
        vm.expectRevert(DidRegistry.DidRegistry__InvalidDID.selector);
        didRegistry.resolveDid(user1Did);
    }

    /*================ ADDRESS TO DID TESTS =================*/
    function testAddressToDID() public {
        // Register a DID first
        didRegistry.registerDid(ownerDid, testDocument, testPublicKey);

        // Get DID from address
        string memory did = didRegistry.addressToDID(owner);

        // Verify DID
        assertEq(did, ownerDid);
    }

    function testAddressToDIDNonExistent() public view {
        // Get DID for address without a registered DID
        string memory did = didRegistry.addressToDID(user1);

        // Verify empty string is returned
        assertEq(did, "");
    }

    /*================ GETTER FUNCTION TESTS =================*/
    function testGetters() public {
        // Register a DID first
        didRegistry.registerDid(ownerDid, testDocument, testPublicKey);

        // Test all getter functions
        assertTrue(didRegistry.isActive(ownerDid));
        assertEq(didRegistry.getController(ownerDid), owner);
        assertEq(didRegistry.getDocument(ownerDid), testDocument);
        assertEq(didRegistry.getPublicKey(ownerDid), testPublicKey);
        assertEq(didRegistry.getSubject(ownerDid), owner);
        assertTrue(didRegistry.getLastUpdated(ownerDid) > 0);
    }

    function testGettersFailForNonExistentDid() public {
        vm.expectRevert(DidRegistry.DidRegistry__InvalidDID.selector);
        didRegistry.isActive(user1Did);

        vm.expectRevert(DidRegistry.DidRegistry__InvalidDID.selector);
        didRegistry.getController(user1Did);

        vm.expectRevert(DidRegistry.DidRegistry__InvalidDID.selector);
        didRegistry.getDocument(user1Did);

        vm.expectRevert(DidRegistry.DidRegistry__InvalidDID.selector);
        didRegistry.getPublicKey(user1Did);

        vm.expectRevert(DidRegistry.DidRegistry__InvalidDID.selector);
        didRegistry.getSubject(user1Did);

        vm.expectRevert(DidRegistry.DidRegistry__InvalidDID.selector);
        didRegistry.getLastUpdated(user1Did);
    }

    // Additional tests for document and public key
    function testDocumentRetrieval() public {
        didRegistry.registerDid(ownerDid, testDocument, testPublicKey);
        assertEq(didRegistry.getDocument(ownerDid), testDocument);
    }

    function testPublicKeyRetrieval() public {
        didRegistry.registerDid(ownerDid, testDocument, testPublicKey);
        assertEq(didRegistry.getPublicKey(ownerDid), testPublicKey);
    }
}
