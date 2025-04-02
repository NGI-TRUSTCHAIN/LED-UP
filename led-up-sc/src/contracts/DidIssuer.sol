// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {DidRegistry} from "./DidRegistry.sol";

contract DidIssuer {
    /*================ ERRORS =================*/
    error DidIssuer__InvalidSubject();
    error DidIssuer__CredentialAlreadyIssued();

    /*================ STATE VARIABLES =================*/
    DidRegistry private didRegistry;

    // Mapping to store issued credentials
    // TODO: credentials should be stored in IPFS and the hash should be stored in the contract
    mapping(bytes32 => bool) private issuedCredentials;

    /*================ EVENTS =================*/
    event CredentialIssued(string credentialType, string subject, bytes32 credentialId, uint256 timestamp);

    constructor(address _didRegistryAddress) {
        didRegistry = DidRegistry(_didRegistryAddress);
    }

    /*================ FUNCTIONS =================*/
    /**
     * @notice issue a new credential. The subject must be active and the credential must not already exist.
     * @notice Upon successful issuance, it emits a CredentialIssued event with the credential type, subject, credential ID, and timestamp
     * @param credentialType The type of credential being issued
     * @param subject The DID of the subject
     * @param credentialId Unique identifier for the credential
     */
    function issueCredential(string calldata credentialType, string calldata subject, bytes32 credentialId) external {
        if (!didRegistry.isActive(subject)) revert DidIssuer__InvalidSubject();
        if (issuedCredentials[credentialId]) revert DidIssuer__CredentialAlreadyIssued();

        issuedCredentials[credentialId] = true;

        emit CredentialIssued(credentialType, subject, credentialId, block.timestamp);
    }

    /**
     * @notice Check if a credential has been issued. The credential must be valid and the subject must be active.
     * @notice Upon successful check, it emits a CredentialIssued event with the credential type, subject, credential ID, and timestamp     *
     * @param credentialId The unique identifier of the credential
     * @return bool indicating if the credential exists
     */
    function isCredentialValid(bytes32 credentialId) external view returns (bool) {
        return issuedCredentials[credentialId];
    }
}
