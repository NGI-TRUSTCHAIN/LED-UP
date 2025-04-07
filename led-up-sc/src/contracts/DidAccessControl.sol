// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {DidRegistry} from "./DidRegistry.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title DidAccessControl
 * @dev Implements DID-based access control mechanism that can be inherited by other contracts
 */
contract DidAccessControl is AccessControl {
    /*================== ERRORS ==================*/
    error DidAccessControl__InvalidDID();
    error DidAccessControl__InvalidRole();
    error DidAccessControl__UnauthorizedDID();
    error DidAccessControl__MissingRequirement();

    /*================== STORAGE ==================*/
    DidRegistry public didRegistry;

    // Role definitions
    bytes32 public constant ADMIN = keccak256("ADMIN");
    bytes32 public constant OPERATOR = keccak256("OPERATOR");
    bytes32 public constant PRODUCER = keccak256("PRODUCER");
    bytes32 public constant CONSUMER = keccak256("CONSUMER");
    bytes32 public constant PROVIDER = keccak256("PROVIDER");
    bytes32 public constant VERIFIER = keccak256("VERIFIER");
    bytes32 public constant ISSUER = keccak256("ISSUER");

    // Mapping from role to required DID attributes
    mapping(bytes32 => string) private roleRequirements;

    // Mapping to track DID-based role assignments
    mapping(string => mapping(bytes32 => bool)) private didRoles;

    /*================== EVENTS ==================*/
    event RoleRequirementSet(bytes32 indexed role, string requirement);
    event DidRoleGranted(string indexed did, bytes32 indexed role, address indexed grantor);
    event DidRoleRevoked(string indexed did, bytes32 indexed role, address indexed revoker);

    constructor(address _didRegistryAddress) {
        didRegistry = DidRegistry(_didRegistryAddress);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN, msg.sender);
    }

    /**
     * @dev Set requirement for a specific role
     * @param role The role to set requirements for
     * @param requirement The required DID attribute/credential
     */
    function setRoleRequirement(bytes32 role, string calldata requirement) external onlyRole(ADMIN) {
        if (role == bytes32(0)) revert DidAccessControl__InvalidRole();

        roleRequirements[role] = requirement;

        emit RoleRequirementSet(role, requirement);
    }

    /**
     * @dev Grant a role to a DID
     * @param did The DID to grant the role to
     * @param role The role to grant
     */
    function grantDidRole(string calldata did, bytes32 role) external onlyRole(ADMIN) {
        if (!didRegistry.isActive(did)) revert DidAccessControl__InvalidDID();
        if (role == bytes32(0)) revert DidAccessControl__InvalidRole();

        // Check if there are requirements for this role
        if (bytes(roleRequirements[role]).length > 0) {
            // Here you would implement verification of DID attributes/credentials
            // This is a placeholder for actual verification logic
            if (!_verifyDidRequirements(did, role)) {
                revert DidAccessControl__MissingRequirement();
            }
        }

        didRoles[did][role] = true;

        emit DidRoleGranted(did, role, msg.sender);
    }

    /**
     * @dev Revoke a role from a DID
     * @param did The DID to revoke the role from
     * @param role The role to revoke
     */
    function revokeDidRole(string calldata did, bytes32 role) external onlyRole(ADMIN) {
        if (!didRegistry.isActive(did)) revert DidAccessControl__InvalidDID();
        if (role == bytes32(0)) revert DidAccessControl__InvalidRole();

        didRoles[did][role] = false;
        emit DidRoleRevoked(did, role, msg.sender);
    }

    /**
     * @dev Check if a DID has a specific role
     * @param did The DID to check
     * @param role The role to check for
     * @return bool indicating if the DID has the role
     */
    function hasDidRole(string calldata did, bytes32 role) public view returns (bool) {
        return didRoles[did][role];
    }

    /**
     * @dev Get the requirement for a specific role
     * @param role The role to get requirements for
     * @return string The requirement for the role
     */
    function getRoleRequirement(bytes32 role) external view returns (string memory) {
        return roleRequirements[role];
    }

    /**
     * @dev Modifier to restrict access to DIDs with a specific role
     * @param did The DID attempting to access
     * @param role The required role
     */
    modifier onlyDidWithRole(string calldata did, bytes32 role) {
        if (!didRegistry.isActive(did)) revert DidAccessControl__InvalidDID();
        if (!hasDidRole(did, role)) revert DidAccessControl__UnauthorizedDID();
        _;
    }

    /**
     * @dev Internal function to verify DID requirements for a role
     * @param did The DID to verify
     * @param role The role requirements to verify
     * @return bool indicating if the DID meets the requirements
     */
    function _verifyDidRequirements(string memory did, bytes32 role) internal view returns (bool) {
        // This is a placeholder for actual verification logic
        // In a real implementation, you would:
        // 1. Get the DID document
        // 2. Verify required credentials/attributes
        // 3. Check credential validity
        string memory requirement = roleRequirements[role];
        if (bytes(requirement).length == 0) {
            return true;
        }

        // For now, we'll just check if the DID is active
        return didRegistry.isActive(did);
    }
}
