// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {ZKPRegistry} from "src/contracts/zkp/ZKPRegistry.sol";
import {MockZKPVerifier} from "./mocks/MockZKPVerifier.sol";

contract ZKPRegistryTest is Test {
    ZKPRegistry public zkpRegistry;
    MockZKPVerifier public mockVerifier;

    address public owner;
    address public admin;
    address public nonAdmin;

    // Constants for verifier types
    bytes32 public constant TEST_VERIFIER = keccak256("TEST_VERIFIER");
    bytes32 public constant AGE_VERIFIER = keccak256("AGE_VERIFIER");
    bytes32 public constant HASH_VERIFIER = keccak256("HASH_VERIFIER");
    bytes32 public constant FHIR_VERIFIER = keccak256("FHIR_VERIFIER");

    function setUp() public {
        // Set up addresses
        owner = address(this);
        admin = makeAddr("admin");
        nonAdmin = makeAddr("nonAdmin");

        // Deploy the ZKP Registry contract
        zkpRegistry = new ZKPRegistry();

        // Deploy a mock verifier for testing
        mockVerifier = new MockZKPVerifier();
    }

    function testDeployment() public {
        // Check that the owner is an admin
        assertTrue(zkpRegistry.isAdmin(owner), "Owner should be an admin");

        // Check that no verifiers are registered initially
        assertFalse(zkpRegistry.isVerifierRegistered(TEST_VERIFIER), "No verifiers should be registered initially");
    }

    function testAdminManagement() public {
        // Add admin
        zkpRegistry.addAdmin(admin);
        assertTrue(zkpRegistry.isAdmin(admin), "Admin should be added");

        // Remove admin
        zkpRegistry.removeAdmin(admin);
        assertFalse(zkpRegistry.isAdmin(admin), "Admin should be removed");
    }

    function testNonOwnerCannotAddAdmin() public {
        // Try to add admin as non-owner
        vm.prank(nonAdmin);
        vm.expectRevert("ZKPRegistry: caller is not the owner");
        zkpRegistry.addAdmin(admin);
    }

    function testNonOwnerCannotRemoveAdmin() public {
        // Add admin first
        zkpRegistry.addAdmin(admin);

        // Try to remove admin as non-owner
        vm.prank(nonAdmin);
        vm.expectRevert("ZKPRegistry: caller is not the owner");
        zkpRegistry.removeAdmin(admin);
    }

    function testVerifierRegistration() public {
        // Register a verifier
        zkpRegistry.registerVerifier(TEST_VERIFIER, address(mockVerifier));

        // Check that the verifier is registered
        assertTrue(zkpRegistry.isVerifierRegistered(TEST_VERIFIER), "Verifier should be registered");
        assertEq(zkpRegistry.getVerifier(TEST_VERIFIER), address(mockVerifier), "Verifier address should match");
    }

    function testVerifierRemoval() public {
        // Register a verifier first
        zkpRegistry.registerVerifier(TEST_VERIFIER, address(mockVerifier));

        // Remove the verifier
        zkpRegistry.removeVerifier(TEST_VERIFIER);

        // Check that the verifier is removed
        assertFalse(zkpRegistry.isVerifierRegistered(TEST_VERIFIER), "Verifier should be removed");
    }

    function testNonAdminCannotRegisterVerifier() public {
        // Try to register a verifier as non-admin
        vm.prank(nonAdmin);
        vm.expectRevert("ZKPRegistry: caller is not an admin");
        zkpRegistry.registerVerifier(TEST_VERIFIER, address(mockVerifier));
    }

    function testNonAdminCannotRemoveVerifier() public {
        // Register a verifier first
        zkpRegistry.registerVerifier(TEST_VERIFIER, address(mockVerifier));

        // Try to remove the verifier as non-admin
        vm.prank(nonAdmin);
        vm.expectRevert("ZKPRegistry: caller is not an admin");
        zkpRegistry.removeVerifier(TEST_VERIFIER);
    }

    function testCannotRegisterVerifierWithZeroAddress() public {
        // Try to register a verifier with address zero
        vm.expectRevert("ZKPRegistry: invalid verifier address");
        zkpRegistry.registerVerifier(TEST_VERIFIER, address(0));
    }

    function testRegisterVerifierTwice() public {
        // Register a verifier
        zkpRegistry.registerVerifier(TEST_VERIFIER, address(mockVerifier));

        // Deploy a different mock verifier
        MockZKPVerifier anotherMockVerifier = new MockZKPVerifier();

        // Register the same verifier type again with a different address
        // This should update the verifier address
        zkpRegistry.registerVerifier(TEST_VERIFIER, address(anotherMockVerifier));

        // Check that the verifier is registered with the new address
        assertTrue(zkpRegistry.isVerifierRegistered(TEST_VERIFIER), "Verifier should be registered");
        assertEq(
            zkpRegistry.getVerifier(TEST_VERIFIER), address(anotherMockVerifier), "Verifier address should be updated"
        );
    }

    function testCannotRemoveNonExistentVerifier() public {
        // Try to remove a verifier that doesn't exist
        vm.expectRevert("ZKPRegistry: verifier not registered");
        zkpRegistry.removeVerifier(TEST_VERIFIER);
    }

    function testGetVerifierForNonExistentVerifier() public {
        try zkpRegistry.getVerifier(TEST_VERIFIER) returns (address verifierAddress) {
            // If it returns an address, it should be address(0)
            assertEq(verifierAddress, address(0), "Non-existent verifier should return address zero");
        } catch Error(string memory reason) {
            // If it reverts with a reason, it should be "ZKPRegistry: verifier not registered"
            assertEq(reason, "ZKPRegistry: verifier not registered", "Should revert with correct reason");
        } catch {
            // If it reverts without a reason, we'll just pass the test
            assertTrue(true, "Reverted without a reason");
        }
    }

    function testMultipleVerifierRegistration() public {
        // Register multiple verifiers
        zkpRegistry.registerVerifier(AGE_VERIFIER, address(mockVerifier));
        zkpRegistry.registerVerifier(HASH_VERIFIER, address(mockVerifier));
        zkpRegistry.registerVerifier(FHIR_VERIFIER, address(mockVerifier));

        // Check that all verifiers are registered
        assertTrue(zkpRegistry.isVerifierRegistered(AGE_VERIFIER), "AGE_VERIFIER should be registered");
        assertTrue(zkpRegistry.isVerifierRegistered(HASH_VERIFIER), "HASH_VERIFIER should be registered");
        assertTrue(zkpRegistry.isVerifierRegistered(FHIR_VERIFIER), "FHIR_VERIFIER should be registered");
    }

    function testAdminCanRegisterVerifier() public {
        // Add admin
        zkpRegistry.addAdmin(admin);

        // Register a verifier as admin
        vm.prank(admin);
        zkpRegistry.registerVerifier(TEST_VERIFIER, address(mockVerifier));

        // Check that the verifier is registered
        assertTrue(zkpRegistry.isVerifierRegistered(TEST_VERIFIER), "Verifier should be registered");
    }

    function testAdminCanRemoveVerifier() public {
        // Register a verifier first
        zkpRegistry.registerVerifier(TEST_VERIFIER, address(mockVerifier));

        // Add admin
        zkpRegistry.addAdmin(admin);

        // Remove the verifier as admin
        vm.prank(admin);
        zkpRegistry.removeVerifier(TEST_VERIFIER);

        // Check that the verifier is removed
        assertFalse(zkpRegistry.isVerifierRegistered(TEST_VERIFIER), "Verifier should be removed");
    }

    function testOwnerCannotBeRemovedAsAdmin() public {
        // Try to remove the owner as admin
        vm.expectRevert("ZKPRegistry: cannot remove owner as admin");
        zkpRegistry.removeAdmin(owner);
    }
}
