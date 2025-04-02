// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IDidVerifier
 * @dev Interface for the DID Verifier contract
 * @notice This interface defines the standard functions for verifying DID credentials
 */
interface IDidVerifier {
    /*===================== ERRORS ======================*/
    error DidVerifier__InvalidDID();
    error DidVerifier__InvalidCredential();
    error DidVerifier__CredentialRevoked();
    error DidVerifier__CredentialExpired();
    error DidVerifier__InvalidIssuer();
    error DidVerifier__InvalidSignature();

    /*===================== EVENTS ======================*/
    /**
     * @dev Emitted when a credential is verified
     * @param did The DID of the subject
     * @param credentialType The type of credential
     * @param credentialId The ID of the credential
     * @param issuerDid The DID of the issuer
     * @param timestamp The timestamp of verification
     * @param success Whether the verification was successful
     */
    event CredentialVerified(
        string indexed did,
        string credentialType,
        bytes32 indexed credentialId,
        string indexed issuerDid,
        uint256 timestamp,
        bool success
    );

    /*===================== FUNCTIONS ======================*/
    /**
     * @dev Verifies a credential
     * @param did The DID of the credential subject
     * @param credentialType The type of credential
     * @param credentialData The credential data
     * @param issuerDid The DID of the issuer
     * @return True if the credential is valid, false otherwise
     */
    function verifyCredential(
        string calldata did,
        string calldata credentialType,
        bytes calldata credentialData,
        string calldata issuerDid
    ) external returns (bool);

    /**
     * @dev Verifies a credential with a signature
     * @param did The DID of the credential subject
     * @param credentialType The type of credential
     * @param credentialData The credential data
     * @param issuerDid The DID of the issuer
     * @param signature The signature of the credential
     * @return True if the credential is valid, false otherwise
     */
    function verifyCredentialWithSignature(
        string calldata did,
        string calldata credentialType,
        bytes calldata credentialData,
        string calldata issuerDid,
        bytes calldata signature
    ) external returns (bool);

    /**
     * @dev Gets the DID registry address
     * @return The address of the DID registry
     */
    function getDidRegistryAddress() external view returns (address);

    /**
     * @dev Gets the DID issuer address
     * @return The address of the DID issuer
     */
    function getDidIssuerAddress() external view returns (address);
}
