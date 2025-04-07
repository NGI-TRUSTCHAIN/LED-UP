// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IDidAccessControl
 * @dev Interface for the DID Access Control contract
 * @notice This interface defines the standard functions for DID-based access control
 */
interface IDidAccessControl {
    /*===================== ERRORS ======================*/
    error DidAccessControl__Unauthorized();
    error DidAccessControl__InvalidDID();
    error DidAccessControl__InvalidRole();
    error DidAccessControl__RoleAlreadyExists();
    error DidAccessControl__RoleNotFound();

    /*===================== EVENTS ======================*/
    /**
     * @dev Emitted when a role is created
     * @param role The role that was created
     * @param name The name of the role
     * @param timestamp The timestamp of the creation
     */
    event RoleCreated(bytes32 indexed role, string name, uint256 timestamp);

    /**
     * @dev Emitted when a role is granted to a DID
     * @param did The DID that was granted the role
     * @param role The role that was granted
     * @param timestamp The timestamp of the grant
     */
    event RoleGranted(string indexed did, bytes32 indexed role, uint256 timestamp);

    /**
     * @dev Emitted when a role is revoked from a DID
     * @param did The DID that had the role revoked
     * @param role The role that was revoked
     * @param timestamp The timestamp of the revocation
     */
    event RoleRevoked(string indexed did, bytes32 indexed role, uint256 timestamp);

    /*===================== FUNCTIONS ======================*/
    /**
     * @dev Creates a new role
     * @param role The role to create
     * @param name The name of the role
     * @param description The description of the role
     */
    function createRole(bytes32 role, string calldata name, string calldata description) external;

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
     * @dev Checks if a DID has a role
     * @param did The DID to check
     * @param role The role to check for
     * @return True if the DID has the role, false otherwise
     */
    function hasRole(string calldata did, bytes32 role) external view returns (bool);

    /**
     * @dev Gets the DID registry address
     * @return The address of the DID registry
     */
    function getDidRegistryAddress() external view returns (address);
}
