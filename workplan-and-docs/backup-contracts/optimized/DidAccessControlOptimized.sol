// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {BaseContract} from "../base/BaseContract.sol";
import {IDidRegistry} from "../interfaces/IDidRegistry.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {GasLib} from "../libraries/GasLib.sol";

/**
 * @title DidAccessControlOptimized
 * @dev Gas-optimized implementation of DID-based access control
 * @notice This contract provides gas-efficient DID-based access control
 */
contract DidAccessControlOptimized is BaseContract, AccessControl {
    /*===================== ERRORS ======================*/
    error DidAccessControl__InvalidDID();
    error DidAccessControl__InvalidRole();
    error DidAccessControl__UnauthorizedDID();
    error DidAccessControl__MissingRequirement();

    /*===================== CONSTANTS ======================*/
    // Role flags
    uint8 private constant ROLE_ADMIN = 0;
    uint8 private constant ROLE_OPERATOR = 1;
    uint8 private constant ROLE_PRODUCER = 2;
    uint8 private constant ROLE_CONSUMER = 3;
    uint8 private constant ROLE_SERVICE_PROVIDER = 4;

    // Role definitions
    bytes32 public constant ADMIN = keccak256("ADMIN");
    bytes32 public constant OPERATOR = keccak256("OPERATOR");
    bytes32 public constant PRODUCER = keccak256("PRODUCER");
    bytes32 public constant CONSUMER = keccak256("CONSUMER");
    bytes32 public constant SERVICE_PROVIDER = keccak256("SERVICE_PROVIDER");

    /*===================== VARIABLES ======================*/
    IDidRegistry public didRegistry;

    // Role requirements - optimized using bytes32 for requirement hashes
    mapping(bytes32 => bytes32) private roleRequirements;

    // DID-based role assignments - optimized using bytes32 for DID hashes and uint256 for role flags
    mapping(bytes32 => uint256) private didRoleFlags;

    /*===================== EVENTS ======================*/
    event RoleRequirementSet(bytes32 indexed role, bytes32 requirementHash);
    event DidRoleGranted(bytes32 indexed didHash, bytes32 indexed role, address indexed grantor);
    event DidRoleRevoked(bytes32 indexed didHash, bytes32 indexed role, address indexed revoker);

    /*===================== CONSTRUCTOR ======================*/
    /**
     * @dev Constructor
     * @param _didRegistryAddress The address of the DID registry contract
     */
    constructor(address _didRegistryAddress) validAddress(_didRegistryAddress) {
        didRegistry = IDidRegistry(_didRegistryAddress);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN, msg.sender);
    }

    /*===================== EXTERNAL FUNCTIONS ======================*/
    /**
     * @dev Sets a requirement for a specific role
     * @param role The role to set requirements for
     * @param requirement The required DID attribute/credential
     */
    function setRoleRequirement(bytes32 role, string calldata requirement) external onlyRole(ADMIN) {
        if (role == bytes32(0)) revert DidAccessControl__InvalidRole();

        bytes32 requirementHash = keccak256(bytes(requirement));
        roleRequirements[role] = requirementHash;

        emit RoleRequirementSet(role, requirementHash);
    }

    /**
     * @dev Grants a role to a DID
     * @param did The DID to grant the role to
     * @param role The role to grant
     */
    function grantDidRole(string calldata did, bytes32 role) external onlyRole(ADMIN) {
        // Check if DID is valid and active
        if (!didRegistry.isActive(did)) {
            revert DidAccessControl__InvalidDID();
        }

        bytes32 didHash = keccak256(bytes(did));
        uint8 roleIndex = _getRoleIndex(role);

        // Grant role
        didRoleFlags[didHash] = GasLib.setFlag(didRoleFlags[didHash], roleIndex, true);

        emit DidRoleGranted(didHash, role, msg.sender);
    }

    /**
     * @dev Revokes a role from a DID
     * @param did The DID to revoke the role from
     * @param role The role to revoke
     */
    function revokeDidRole(string calldata did, bytes32 role) external onlyRole(ADMIN) {
        bytes32 didHash = keccak256(bytes(did));
        uint8 roleIndex = _getRoleIndex(role);

        // Revoke role
        didRoleFlags[didHash] = GasLib.setFlag(didRoleFlags[didHash], roleIndex, false);

        emit DidRoleRevoked(didHash, role, msg.sender);
    }

    /**
     * @dev Checks if a DID has a specific role
     * @param did The DID to check
     * @param role The role to check for
     * @return True if the DID has the role, false otherwise
     */
    function hasDidRole(string calldata did, bytes32 role) external view returns (bool) {
        bytes32 didHash = keccak256(bytes(did));
        uint8 roleIndex = _getRoleIndex(role);

        return GasLib.unpackBoolean(didRoleFlags[didHash], roleIndex);
    }

    /**
     * @dev Gets the requirement for a role
     * @param role The role to get the requirement for
     * @return The requirement hash
     */
    function getRoleRequirement(bytes32 role) external view returns (bytes32) {
        return roleRequirements[role];
    }

    /*===================== INTERNAL FUNCTIONS ======================*/
    /**
     * @dev Gets the role index for a role
     * @param _role The role to get the index for
     * @return The role index
     */
    function _getRoleIndex(bytes32 _role) internal pure returns (uint8) {
        if (_role == ADMIN) {
            return ROLE_ADMIN;
        } else if (_role == OPERATOR) {
            return ROLE_OPERATOR;
        } else if (_role == PRODUCER) {
            return ROLE_PRODUCER;
        } else if (_role == CONSUMER) {
            return ROLE_CONSUMER;
        } else if (_role == SERVICE_PROVIDER) {
            return ROLE_SERVICE_PROVIDER;
        } else {
            revert DidAccessControl__InvalidRole();
        }
    }

    /**
     * @dev Checks if a DID meets the requirements for a role
     * @param _didHash The hash of the DID to check
     * @param _role The role to check for
     * @return True if the DID meets the requirements, false otherwise
     */
    function _meetsRoleRequirements(bytes32 _didHash, bytes32 _role) internal view returns (bool) {
        bytes32 requirementHash = roleRequirements[_role];

        // If there's no requirement, return true
        if (requirementHash == bytes32(0)) {
            return true;
        }

        // In a real implementation, we would check if the DID has the required attribute/credential
        // For now, we'll just return true
        return true;
    }
}
