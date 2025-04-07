// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {BaseContract} from "../base/BaseContract.sol";
import {IDidRegistry} from "../interfaces/IDidRegistry.sol";
import {GasLib} from "../libraries/GasLib.sol";

/**
 * @title DidVerifierOptimized
 * @dev Gas-optimized implementation of DID verification
 * @notice This contract is used to verify credentials with optimized gas usage
 */
contract DidVerifierOptimized is BaseContract {
    /*===================== ERRORS ======================*/
    error DidVerifier__InvalidIssuer();
    error DidVerifier__UntrustedIssuer();
    error DidVerifier__InvalidCredential();

    /*===================== VARIABLES ======================*/
    IDidRegistry private didRegistry;

    // Trusted issuers - optimized using bytes32 for credential type hashes
    mapping(bytes32 => mapping(address => bool)) private trustedIssuers;

    /*===================== EVENTS ======================*/
    event IssuerTrustStatusUpdated(bytes32 indexed credentialTypeHash, address indexed issuer, bool trusted);

    /*===================== CONSTRUCTOR ======================*/
    /**
     * @dev Constructor
     * @param _didRegistryAddress The address of the DID registry contract
     */
    constructor(address _didRegistryAddress) validAddress(_didRegistryAddress) {
        didRegistry = IDidRegistry(_didRegistryAddress);
    }

    /*===================== EXTERNAL FUNCTIONS ======================*/
    /**
     * @dev Add or remove a trusted issuer for a specific credential type
     * @param credentialType The type of credential (e.g., "EducationCredential")
     * @param issuer The address of the issuer
     * @param trusted Boolean indicating if the issuer should be trusted
     */
    function setIssuerTrustStatus(string calldata credentialType, address issuer, bool trusted) external onlyOwner {
        if (issuer == address(0)) revert DidVerifier__InvalidIssuer();

        bytes32 credentialTypeHash = keccak256(bytes(credentialType));
        trustedIssuers[credentialTypeHash][issuer] = trusted;

        emit IssuerTrustStatusUpdated(credentialTypeHash, issuer, trusted);
    }

    /**
     * @dev Check if an issuer is trusted for a specific credential type
     * @param credentialType The type of credential
     * @param issuer The address of the issuer
     * @return bool indicating if the issuer is trusted
     */
    function isIssuerTrusted(string calldata credentialType, address issuer) public view returns (bool) {
        bytes32 credentialTypeHash = keccak256(bytes(credentialType));
        return trustedIssuers[credentialTypeHash][issuer];
    }

    /**
     * @dev Verify a credential by checking if it was issued by a trusted issuer
     * @param credentialType The type of credential
     * @param issuer The address of the issuer
     * @param subject The DID of the subject
     * @return bool indicating if the credential is valid
     */
    function verifyCredential(string calldata credentialType, address issuer, string calldata subject)
        external
        view
        returns (bool)
    {
        return _verifyCredential(credentialType, issuer, subject);
    }

    /**
     * @dev Batch verify credentials
     * @param credentialTypes Array of credential types
     * @param issuers Array of issuer addresses
     * @param subjects Array of subject DIDs
     * @return results Array of verification results
     */
    function batchVerifyCredentials(
        string[] calldata credentialTypes,
        address[] calldata issuers,
        string[] calldata subjects
    ) external view returns (bool[] memory results) {
        require(
            credentialTypes.length == issuers.length && credentialTypes.length == subjects.length,
            "Array lengths must match"
        );

        results = new bool[](credentialTypes.length);

        for (uint256 i = 0; i < credentialTypes.length; i++) {
            // Using try-catch with a simple expression
            bool success;
            try this.isIssuerTrusted(credentialTypes[i], issuers[i]) returns (bool trusted) {
                if (trusted && didRegistry.isActive(subjects[i])) {
                    success = true;
                }
            } catch {
                success = false;
            }
            results[i] = success;
        }

        return results;
    }

    /**
     * @dev Internal helper to verify a credential
     * @param credentialType The type of credential
     * @param issuer The address of the issuer
     * @param subject The DID of the subject
     * @return bool indicating if the credential is valid
     */
    function _verifyCredential(string calldata credentialType, address issuer, string calldata subject)
        private
        view
        returns (bool)
    {
        if (!didRegistry.isActive(subject)) revert DidVerifier__InvalidCredential();

        if (!isIssuerTrusted(credentialType, issuer)) revert DidVerifier__UntrustedIssuer();

        return true;
    }
}
