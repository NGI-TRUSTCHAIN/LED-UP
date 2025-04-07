// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {AgeVerifier} from "src/contracts/zkp/AgeVerifier.sol";
import {MockZKPVerifier} from "src/contracts/mocks/MockZKPVerifier.sol";

contract AgeVerifierTest is Test {
    AgeVerifier public ageVerifier;
    MockZKPVerifier public mockVerifier;

    address public owner;
    address public user;

    // Dummy proof data for testing
    uint256[2] public a;
    uint256[2][2] public b;
    uint256[2] public c;

    function setUp() public {
        // Set up addresses
        owner = address(this);
        user = makeAddr("user");

        // Deploy a mock ZoKrates verifier for testing
        mockVerifier = new MockZKPVerifier();

        // Deploy the AgeVerifier contract
        ageVerifier = new AgeVerifier(address(mockVerifier));

        // Set up dummy proof data
        a = [uint256(1), uint256(2)];
        b = [[uint256(3), uint256(4)], [uint256(5), uint256(6)]];
        c = [uint256(7), uint256(8)];
    }

    function testDeployment() public view {
        // The verifier address is private, so we can't check it directly
        // Instead, we'll verify that the contract can call the verifier

        // Create a dummy input
        uint256[] memory input = new uint256[](1);
        input[0] = 25; // Age threshold

        // Call the verify function
        ageVerifier.verify(a, b, c, input);

        // If we got here without reverting, the verifier address is correct
        assertTrue(true, "Verifier address should be correct");
    }

    function testVerifyAgeWithValidProof() public {
        // Set the mock verifier to return true
        mockVerifier.setReturnValue(true);

        // Verify the age
        uint256 threshold = 18;
        bool result = ageVerifier.verifyAge(a, b, c, threshold);

        // Check the result
        assertTrue(result, "Age verification should succeed with valid proof");
    }

    function testVerifyAgeWithInvalidProof() public {
        // Set the mock verifier to return false
        mockVerifier.setReturnValue(false);

        // Verify the age
        uint256 threshold = 18;
        bool result = ageVerifier.verifyAge(a, b, c, threshold);

        // Check the result
        assertFalse(result, "Age verification should fail with invalid proof");
    }

    function testVerifyAgeEmitsEvent() public {
        // Set the mock verifier to return true
        mockVerifier.setReturnValue(true);

        // Verify the age
        uint256 threshold = 18;

        // Expect the event to be emitted
        vm.expectEmit(true, true, true, true);
        emit AgeVerified(user, threshold, true);

        // Call the function as the user
        vm.prank(user);
        ageVerifier.verifyAge(a, b, c, threshold);
    }

    function testVerifyWithInvalidInputLength() public {
        // Create an input with invalid length
        uint256[] memory input = new uint256[](0); // Empty input

        // Try to verify with an invalid input length
        vm.expectRevert("AgeVerifier: Invalid input length");
        ageVerifier.verify(a, b, c, input);
    }

    function testVerifyWithDifferentThresholds() public {
        // Set the mock verifier to return true
        mockVerifier.setReturnValue(true);

        // Test with different age thresholds
        uint256[] memory thresholds = new uint256[](3);
        thresholds[0] = 18; // Adult age
        thresholds[1] = 21; // Legal drinking age in some countries
        thresholds[2] = 65; // Retirement age

        for (uint256 i = 0; i < thresholds.length; i++) {
            bool result = ageVerifier.verifyAge(a, b, c, thresholds[i]);
            assertTrue(result, "Age verification should succeed with valid proof");
        }
    }

    function testVerifyAgeWithMultipleUsers() public {
        // Set the mock verifier to return true
        mockVerifier.setReturnValue(true);

        // Create multiple users
        address user1 = makeAddr("user1");
        address user2 = makeAddr("user2");
        address user3 = makeAddr("user3");

        // Verify age for each user
        uint256 threshold = 18;

        // User 1
        vm.prank(user1);
        bool result1 = ageVerifier.verifyAge(a, b, c, threshold);
        assertTrue(result1, "Age verification should succeed for user1");

        // User 2
        vm.prank(user2);
        bool result2 = ageVerifier.verifyAge(a, b, c, threshold);
        assertTrue(result2, "Age verification should succeed for user2");

        // User 3
        vm.prank(user3);
        bool result3 = ageVerifier.verifyAge(a, b, c, threshold);
        assertTrue(result3, "Age verification should succeed for user3");
    }

    // Event definition
    event AgeVerified(address indexed user, uint256 threshold, bool result);
}
