// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {DidRegistry} from "./DidRegistry.sol";
/**
 * @title DidVerifier
 * @author @mengefeng
 * @notice This contract is used to verify credentials. The verifier uses the didRegistry to
 *         check if the subject is active and if the issuer is trusted.
 */

contract DidVerifier {
    /*================ ERRORS =================*/
    error DidVerifier__InvalidIssuer();
    error DidVerifier__UntrustedIssuer();
    error DidVerifier__InvalidCredential();

    /*================ STATE VARIABLES =================*/
    DidRegistry private didRegistry;

    mapping(string => mapping(address => bool)) private trustedIssuers;

    /*================ EVENTS =================*/
    event IssuerTrustStatusUpdated(string credentialType, address issuer, bool trusted);

    constructor(address _didRegistryAddress) {
        didRegistry = DidRegistry(_didRegistryAddress);
    }

    /**
     * @dev Add or remove a trusted issuer for a specific credential type
     * @param credentialType The type of credential (e.g., "HealthCareCredential")
     * @param issuer The DID or address of the issuer
     * @param trusted Boolean indicating if the issuer should be trusted
     */
    function setIssuerTrustStatus(string calldata credentialType, address issuer, bool trusted) external {
        if (issuer == address(0)) revert DidVerifier__InvalidIssuer();

        trustedIssuers[credentialType][issuer] = trusted;

        emit IssuerTrustStatusUpdated(credentialType, issuer, trusted);
    }

    /**
     * @dev Check if an issuer is trusted for a specific credential type
     * @param credentialType The type of credential
     * @param issuer The address of the issuer
     * @return bool indicating if the issuer is trusted
     */
    function isIssuerTrusted(string calldata credentialType, address issuer) public view returns (bool) {
        return trustedIssuers[credentialType][issuer];
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
        if (!didRegistry.isActive(subject)) revert DidVerifier__InvalidCredential();

        if (!isIssuerTrusted(credentialType, issuer)) revert DidVerifier__UntrustedIssuer();

        return true;
    }
}
