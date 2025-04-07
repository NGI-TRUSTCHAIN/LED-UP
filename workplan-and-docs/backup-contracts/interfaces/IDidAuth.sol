// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IDidAuth
 * @dev Interface for the DID Authentication contract
 * @notice This interface defines the standard functions for DID-based authentication
 */
interface IDidAuth {
    /*===================== ERRORS ======================*/
    error DidAuth__Unauthorized();
    error DidAuth__InvalidDID();
    error DidAuth__DeactivatedDID();
    error DidAuth__InvalidCredential();
    error DidAuth__InvalidRole();

    /*===================== EVENTS ======================*/
    /**
     * @dev Emitted when authentication is successful
     * @param did The DID that was authenticated
     * @param role The role that was authenticated for
     * @param timestamp The timestamp of the authentication
     */
    event AuthenticationSuccessful(string did, bytes32 role, uint256 timestamp);

    /**
     * @dev Emitted when authentication fails
     * @param did The DID that failed authentication
     * @param role The role that was attempted
     * @param timestamp The timestamp of the failed authentication
     */
    event AuthenticationFailed(string did, bytes32 role, uint256 timestamp);

    /**
     * @dev Emitted when a credential is verified
     * @param did The DID associated with the credential
     * @param credentialType The type of credential
     * @param timestamp The timestamp of the verification
     */
    event CredentialVerified(string did, string credentialType, uint256 timestamp);

    /*===================== FUNCTIONS ======================*/
    /**
     * @dev Authenticates a DID for a specific role
     * @param did The DID to authenticate
     * @param role The role to authenticate for
     * @return True if authentication is successful, false otherwise
     */
    function authenticate(string calldata did, bytes32 role) external returns (bool);

    /**
     * @dev Verifies a credential for a DID
     * @param did The DID to verify the credential for
     * @param credentialType The type of credential to verify
     * @param credentialId The ID of the credential
     * @return True if verification is successful, false otherwise
     */
    function verifyCredential(string calldata did, string calldata credentialType, bytes32 credentialId)
        external
        returns (bool);

    /**
     * @dev Checks if a DID has a specific role
     * @param did The DID to check
     * @param role The role to check for
     * @return True if the DID has the role, false otherwise
     */
    function hasRole(string calldata did, bytes32 role) external view returns (bool);

    /**
     * @dev Grants a role to a DID
     * @param did The DID to grant the role to
     * @param role The role to grant
     */
    function grantRole(string calldata did, bytes32 role) external;

    /**
     * @dev Revokes a role from a DID
     * @param did The DID to revoke the role from
     * @param role The role to revoke
     */
    function revokeRole(string calldata did, bytes32 role) external;

    /**
     * @dev Gets the address of the DidRegistry contract
     * @return The address of the DidRegistry contract
     */
    function getDidRegistryAddress() external view returns (address);

    /**
     * @dev Gets the address of the DidAccessControl contract
     * @return The address of the DidAccessControl contract
     */
    function getDidAccessControlAddress() external view returns (address);

    /**
     * @dev Gets the address of the DidVerifier contract
     * @return The address of the DidVerifier contract
     */
    function getDidVerifierAddress() external view returns (address);

    /**
     * @dev Gets the address of the DidIssuer contract
     * @return The address of the DidIssuer contract
     */
    function getDidIssuerAddress() external view returns (address);
}
