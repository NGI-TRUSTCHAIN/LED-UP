// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IDidIssuer
 * @dev Interface for the DID Issuer contract
 * @notice This interface defines the standard functions for issuing DID credentials
 */
interface IDidIssuer {
    /*===================== ERRORS ======================*/
    error DidIssuer__Unauthorized();
    error DidIssuer__InvalidDID();
    error DidIssuer__InvalidCredential();
    error DidIssuer__CredentialAlreadyExists();
    error DidIssuer__CredentialRevoked();

    /*===================== EVENTS ======================*/
    /**
     * @dev Emitted when a credential is issued
     * @param did The DID of the subject
     * @param credentialType The type of credential
     * @param credentialId The ID of the credential
     * @param issuerDid The DID of the issuer
     * @param timestamp The timestamp of issuance
     */
    event CredentialIssued(
        string indexed did,
        string credentialType,
        bytes32 indexed credentialId,
        string indexed issuerDid,
        uint256 timestamp
    );

    /**
     * @dev Emitted when a credential is revoked
     * @param did The DID of the subject
     * @param credentialId The ID of the credential
     * @param timestamp The timestamp of revocation
     */
    event CredentialRevoked(string indexed did, bytes32 indexed credentialId, uint256 timestamp);

    /*===================== FUNCTIONS ======================*/
    /**
     * @dev Issues a credential to a DID
     * @param did The DID to issue the credential to
     * @param credentialType The type of credential
     * @param credentialData The credential data
     * @param expirationDate The expiration date of the credential
     * @return credentialId The ID of the issued credential
     */
    function issueCredential(
        string calldata did,
        string calldata credentialType,
        bytes calldata credentialData,
        uint256 expirationDate
    ) external returns (bytes32 credentialId);

    /**
     * @dev Revokes a credential
     * @param did The DID of the credential subject
     * @param credentialId The ID of the credential to revoke
     */
    function revokeCredential(string calldata did, bytes32 credentialId) external;

    /**
     * @dev Checks if a credential is valid
     * @param did The DID of the credential subject
     * @param credentialId The ID of the credential
     * @return True if the credential is valid, false otherwise
     */
    function isCredentialValid(string calldata did, bytes32 credentialId) external view returns (bool);

    /**
     * @dev Gets the DID registry address
     * @return The address of the DID registry
     */
    function getDidRegistryAddress() external view returns (address);
}
