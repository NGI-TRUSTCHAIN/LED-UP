// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {DidVerifier} from "src/contracts/DidVerifier.sol";
import {DidRegistry} from "src/contracts/DidRegistry.sol";

contract DidVerifierTest is Test {
    DidVerifier public didVerifier;
    DidRegistry public didRegistry;

    // Test addresses
    address public owner;
    address public issuer1;
    address public issuer2;
    address public user1;
    address public user2;

    // Test DIDs
    string public ownerDid;
    string public issuer1Did;
    string public issuer2Did;
    string public user1Did;
    string public user2Did;
    string public inactiveDid;

    // Test credential types
    string public constant HEALTH_CREDENTIAL = "HealthCredential";
    string public constant EDUCATION_CREDENTIAL = "EducationCredential";
    string public constant IDENTITY_CREDENTIAL = "IdentityCredential";

    // Events to test
    event IssuerTrustStatusUpdated(string credentialType, address issuer, bool trusted);

    function setUp() public {
        // Deploy the DidRegistry contract
        didRegistry = new DidRegistry();

        // Set up test addresses
        owner = address(this);
        issuer1 = makeAddr("issuer1");
        issuer2 = makeAddr("issuer2");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        // Create DIDs for testing
        ownerDid = string(abi.encodePacked("did:ala:mainnet:", toHexString(owner)));
        issuer1Did = string(abi.encodePacked("did:ala:mainnet:", toHexString(issuer1)));
        issuer2Did = string(abi.encodePacked("did:ala:mainnet:", toHexString(issuer2)));
        user1Did = string(abi.encodePacked("did:ala:mainnet:", toHexString(user1)));
        user2Did = string(abi.encodePacked("did:ala:mainnet:", toHexString(user2)));
        inactiveDid = string(abi.encodePacked("did:ala:mainnet:", toHexString(makeAddr("inactive"))));

        // Register DIDs
        string memory testDocument = '{"name":"Test Document"}';
        string memory testPublicKey =
            "0x04a5e76959860aee1a48e2fe1f4c975f2d4839b89b1d0c0ed88f5fa8a5c4c95c7c9e40f3b9d22ab6c7c6a7a25ab5a5d0a2a4a3a2a1a0a9a8a7a6a5a4a3a2a1a0";

        // Register owner DID
        didRegistry.registerDid(ownerDid, testDocument, testPublicKey);

        // Register issuer1 DID
        vm.prank(issuer1);
        didRegistry.registerDid(issuer1Did, testDocument, testPublicKey);

        // Register issuer2 DID
        vm.prank(issuer2);
        didRegistry.registerDid(issuer2Did, testDocument, testPublicKey);

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

        // Deploy the DidVerifier contract
        didVerifier = new DidVerifier(address(didRegistry));
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

    /*================ SET ISSUER TRUST STATUS TESTS =================*/
    function testSetIssuerTrustStatus() public {
        vm.expectEmit(true, true, true, true);
        emit IssuerTrustStatusUpdated(HEALTH_CREDENTIAL, issuer1, true);

        didVerifier.setIssuerTrustStatus(HEALTH_CREDENTIAL, issuer1, true);

        // Verify issuer trust status was set
        assertTrue(didVerifier.isIssuerTrusted(HEALTH_CREDENTIAL, issuer1));
    }

    function testSetMultipleIssuerTrustStatuses() public {
        // Set trust status for issuer1 with HEALTH_CREDENTIAL
        didVerifier.setIssuerTrustStatus(HEALTH_CREDENTIAL, issuer1, true);

        // Set trust status for issuer2 with EDUCATION_CREDENTIAL
        didVerifier.setIssuerTrustStatus(EDUCATION_CREDENTIAL, issuer2, true);

        // Set trust status for issuer1 with IDENTITY_CREDENTIAL
        didVerifier.setIssuerTrustStatus(IDENTITY_CREDENTIAL, issuer1, true);

        // Verify all trust statuses were set correctly
        assertTrue(didVerifier.isIssuerTrusted(HEALTH_CREDENTIAL, issuer1));
        assertTrue(didVerifier.isIssuerTrusted(EDUCATION_CREDENTIAL, issuer2));
        assertTrue(didVerifier.isIssuerTrusted(IDENTITY_CREDENTIAL, issuer1));

        // Verify other combinations are not trusted
        assertFalse(didVerifier.isIssuerTrusted(HEALTH_CREDENTIAL, issuer2));
        assertFalse(didVerifier.isIssuerTrusted(EDUCATION_CREDENTIAL, issuer1));
    }

    function testUpdateIssuerTrustStatus() public {
        // Set trust status to true
        didVerifier.setIssuerTrustStatus(HEALTH_CREDENTIAL, issuer1, true);
        assertTrue(didVerifier.isIssuerTrusted(HEALTH_CREDENTIAL, issuer1));

        // Update trust status to false
        vm.expectEmit(true, true, true, true);
        emit IssuerTrustStatusUpdated(HEALTH_CREDENTIAL, issuer1, false);

        didVerifier.setIssuerTrustStatus(HEALTH_CREDENTIAL, issuer1, false);
        assertFalse(didVerifier.isIssuerTrusted(HEALTH_CREDENTIAL, issuer1));
    }

    function testCannotSetIssuerTrustStatusWithZeroAddress() public {
        vm.expectRevert(DidVerifier.DidVerifier__InvalidIssuer.selector);
        didVerifier.setIssuerTrustStatus(HEALTH_CREDENTIAL, address(0), true);
    }

    function testSetIssuerTrustStatusAsDifferentUser() public {
        vm.prank(user1);
        didVerifier.setIssuerTrustStatus(HEALTH_CREDENTIAL, issuer1, true);

        // Verify issuer trust status was set
        assertTrue(didVerifier.isIssuerTrusted(HEALTH_CREDENTIAL, issuer1));
    }

    /*================ IS ISSUER TRUSTED TESTS =================*/
    function testIsIssuerTrustedWithUntrustedIssuer() public view {
        // Issuer should not be trusted by default
        assertFalse(didVerifier.isIssuerTrusted(HEALTH_CREDENTIAL, issuer1));
    }

    function testIsIssuerTrustedWithTrustedIssuer() public {
        // Set trust status to true
        didVerifier.setIssuerTrustStatus(HEALTH_CREDENTIAL, issuer1, true);

        // Verify issuer is trusted
        assertTrue(didVerifier.isIssuerTrusted(HEALTH_CREDENTIAL, issuer1));
    }

    function testIsIssuerTrustedWithDifferentCredentialType() public {
        // Set trust status for HEALTH_CREDENTIAL
        didVerifier.setIssuerTrustStatus(HEALTH_CREDENTIAL, issuer1, true);

        // Issuer should not be trusted for EDUCATION_CREDENTIAL
        assertFalse(didVerifier.isIssuerTrusted(EDUCATION_CREDENTIAL, issuer1));
    }

    /*================ VERIFY CREDENTIAL TESTS =================*/
    function testVerifyCredentialWithTrustedIssuer() public {
        // Set trust status to true
        didVerifier.setIssuerTrustStatus(HEALTH_CREDENTIAL, issuer1, true);

        // Verify credential
        bool isValid = didVerifier.verifyCredential(HEALTH_CREDENTIAL, issuer1, user1Did);

        // Credential should be valid
        assertTrue(isValid);
    }

    function testCannotVerifyCredentialWithUntrustedIssuer() public {
        // Issuer is not trusted
        vm.expectRevert(DidVerifier.DidVerifier__UntrustedIssuer.selector);
        didVerifier.verifyCredential(HEALTH_CREDENTIAL, issuer1, user1Did);
    }

    function testCannotVerifyCredentialWithInactiveSubject() public {
        // Set trust status to true
        didVerifier.setIssuerTrustStatus(HEALTH_CREDENTIAL, issuer1, true);

        // Try to verify credential for inactive subject
        vm.expectRevert(DidVerifier.DidVerifier__InvalidCredential.selector);
        didVerifier.verifyCredential(HEALTH_CREDENTIAL, issuer1, inactiveDid);
    }

    function testCannotVerifyCredentialWithNonExistentSubject() public {
        // Set trust status to true
        didVerifier.setIssuerTrustStatus(HEALTH_CREDENTIAL, issuer1, true);

        // Try to verify credential for non-existent subject
        string memory nonExistentDid = "did:ala:mainnet:0xnonexistent";

        // The error is coming from DidRegistry, not DidVerifier directly
        // We need to use a more generic expectRevert without a specific selector
        vm.expectRevert();
        didVerifier.verifyCredential(HEALTH_CREDENTIAL, issuer1, nonExistentDid);
    }

    function testVerifyCredentialWithMultipleCredentialTypes() public {
        // Set trust status for multiple credential types
        didVerifier.setIssuerTrustStatus(HEALTH_CREDENTIAL, issuer1, true);
        didVerifier.setIssuerTrustStatus(EDUCATION_CREDENTIAL, issuer1, true);

        // Verify credentials
        bool isHealthValid = didVerifier.verifyCredential(HEALTH_CREDENTIAL, issuer1, user1Did);
        bool isEducationValid = didVerifier.verifyCredential(EDUCATION_CREDENTIAL, issuer1, user1Did);

        // Both credentials should be valid
        assertTrue(isHealthValid);
        assertTrue(isEducationValid);
    }

    function testVerifyCredentialWithMultipleIssuers() public {
        // Set trust status for multiple issuers
        didVerifier.setIssuerTrustStatus(HEALTH_CREDENTIAL, issuer1, true);
        didVerifier.setIssuerTrustStatus(HEALTH_CREDENTIAL, issuer2, true);

        // Verify credentials
        bool isIssuer1Valid = didVerifier.verifyCredential(HEALTH_CREDENTIAL, issuer1, user1Did);
        bool isIssuer2Valid = didVerifier.verifyCredential(HEALTH_CREDENTIAL, issuer2, user1Did);

        // Both credentials should be valid
        assertTrue(isIssuer1Valid);
        assertTrue(isIssuer2Valid);
    }

    function testVerifyCredentialAfterRevokingTrust() public {
        // Set trust status to true
        didVerifier.setIssuerTrustStatus(HEALTH_CREDENTIAL, issuer1, true);

        // Verify credential is valid
        bool isValidBefore = didVerifier.verifyCredential(HEALTH_CREDENTIAL, issuer1, user1Did);
        assertTrue(isValidBefore);

        // Revoke trust
        didVerifier.setIssuerTrustStatus(HEALTH_CREDENTIAL, issuer1, false);

        // Verify credential is no longer valid
        vm.expectRevert(DidVerifier.DidVerifier__UntrustedIssuer.selector);
        didVerifier.verifyCredential(HEALTH_CREDENTIAL, issuer1, user1Did);
    }
}
