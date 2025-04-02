// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {BaseContract} from "../base/BaseContract.sol";
import {IDidAccessControl} from "../interfaces/IDidAccessControl.sol";
import {IDidRegistry} from "../interfaces/IDidRegistry.sol";
import {ValidationLib} from "../libraries/ValidationLib.sol";

/**
 * @title DidAccessControlCore
 * @dev Core implementation of the DID Access Control contract
 * @notice This contract provides the core functionality for DID-based access control
 */
abstract contract DidAccessControlCore is BaseContract, IDidAccessControl {
    /*===================== STRUCTS ======================*/
    /**
     * @dev Role structure
     */
    struct Role {
        bytes32 id;
        string name;
        string description;
        uint256 createdAt;
        bool active;
    }

    /*===================== VARIABLES ======================*/
    // DID registry contract address
    address private didRegistry;

    // Role storage
    mapping(bytes32 => Role) private roles;
    bytes32[] private roleIds;

    // Role assignments
    // did => role => bool
    mapping(string => mapping(bytes32 => bool)) private didRoles;

    // Role assignments by DID
    mapping(string => bytes32[]) private didRolesList;

    // Role assignments by role
    mapping(bytes32 => string[]) private roleDids;

    /*===================== CONSTRUCTOR ======================*/
    /**
     * @dev Constructor
     * @param _didRegistry The address of the DID registry
     */
    constructor(address _didRegistry) {
        if (_didRegistry == address(0)) revert DidAccessControl__InvalidDID();
        didRegistry = _didRegistry;
    }

    /*===================== MODIFIERS ======================*/
    /**
     * @dev Ensures the DID exists
     * @param _did The DID to check
     */
    modifier didExists(string calldata _did) {
        if (!_didExists(_did)) {
            revert DidAccessControl__InvalidDID();
        }
        _;
    }

    /**
     * @dev Ensures the role exists
     * @param _role The role to check
     */
    modifier roleExists(bytes32 _role) {
        if (roles[_role].id == bytes32(0)) {
            revert DidAccessControl__RoleNotFound();
        }
        _;
    }

    /*===================== EXTERNAL FUNCTIONS ======================*/
    /**
     * @dev Creates a new role
     * @param role The role to create
     * @param name The name of the role
     * @param description The description of the role
     */
    function createRole(bytes32 role, string calldata name, string calldata description)
        external
        virtual
        override
        onlyOwner
    {
        if (role == bytes32(0)) revert DidAccessControl__InvalidRole();
        if (roles[role].id != bytes32(0)) revert DidAccessControl__RoleAlreadyExists();

        roles[role] = Role({id: role, name: name, description: description, createdAt: block.timestamp, active: true});

        roleIds.push(role);

        emit RoleCreated(role, name, block.timestamp);
    }

    /**
     * @dev Grants a role to a DID
     * @param did The DID to grant the role to
     * @param role The role to grant
     */
    function grantRole(string calldata did, bytes32 role)
        public
        virtual
        override
        whenNotPausedWithCustomError
        didExists(did)
        roleExists(role)
        onlyOwner
    {
        if (didRoles[did][role]) {
            return; // Already has role
        }

        didRoles[did][role] = true;
        didRolesList[did].push(role);
        roleDids[role].push(did);

        emit RoleGranted(did, role, block.timestamp);
    }

    /**
     * @dev Revokes a role from a DID
     * @param did The DID to revoke the role from
     * @param role The role to revoke
     */
    function revokeRole(string calldata did, bytes32 role)
        public
        virtual
        override
        whenNotPausedWithCustomError
        didExists(did)
        roleExists(role)
        onlyOwner
    {
        if (!didRoles[did][role]) {
            return; // Doesn't have role
        }

        didRoles[did][role] = false;

        // Remove from didRolesList (not gas efficient but simple)
        for (uint256 i = 0; i < didRolesList[did].length; i++) {
            if (didRolesList[did][i] == role) {
                // Replace with the last element and pop
                didRolesList[did][i] = didRolesList[did][didRolesList[did].length - 1];
                didRolesList[did].pop();
                break;
            }
        }

        // Remove from roleDids (not gas efficient but simple)
        for (uint256 i = 0; i < roleDids[role].length; i++) {
            if (keccak256(bytes(roleDids[role][i])) == keccak256(bytes(did))) {
                // Replace with the last element and pop
                roleDids[role][i] = roleDids[role][roleDids[role].length - 1];
                roleDids[role].pop();
                break;
            }
        }

        emit RoleRevoked(did, role, block.timestamp);
    }

    /**
     * @dev Deactivates a role
     * @param role The role to deactivate
     */
    function deactivateRole(bytes32 role) external onlyOwner roleExists(role) {
        roles[role].active = false;
    }

    /**
     * @dev Activates a role
     * @param role The role to activate
     */
    function activateRole(bytes32 role) external onlyOwner roleExists(role) {
        roles[role].active = true;
    }

    /*===================== VIEW FUNCTIONS ======================*/
    /**
     * @dev Checks if a DID has a role
     * @param did The DID to check
     * @param role The role to check for
     * @return True if the DID has the role, false otherwise
     */
    function hasRole(string calldata did, bytes32 role)
        public
        view
        virtual
        override
        didExists(did)
        roleExists(role)
        returns (bool)
    {
        return didRoles[did][role] && roles[role].active;
    }

    /**
     * @dev Gets a role
     * @param role The role to get
     * @return id The ID of the role
     * @return name The name of the role
     * @return description The description of the role
     * @return createdAt The timestamp of creation
     * @return active Whether the role is active
     */
    function getRole(bytes32 role)
        external
        view
        roleExists(role)
        returns (bytes32 id, string memory name, string memory description, uint256 createdAt, bool active)
    {
        Role memory roleData = roles[role];
        return (roleData.id, roleData.name, roleData.description, roleData.createdAt, roleData.active);
    }

    /**
     * @dev Gets all roles
     * @return The list of role IDs
     */
    function getRoles() external view returns (bytes32[] memory) {
        return roleIds;
    }

    /**
     * @dev Gets all roles for a DID
     * @param did The DID to get roles for
     * @return The list of role IDs
     */
    function getRolesForDid(string calldata did) external view didExists(did) returns (bytes32[] memory) {
        return didRolesList[did];
    }

    /**
     * @dev Gets all DIDs with a role
     * @param role The role to get DIDs for
     * @return The list of DIDs
     */
    function getDidsWithRole(bytes32 role) external view roleExists(role) returns (string[] memory) {
        return roleDids[role];
    }

    /**
     * @dev Gets the DID registry address
     * @return The address of the DID registry
     */
    function getDidRegistryAddress() external view override returns (address) {
        return didRegistry;
    }

    /*===================== INTERNAL FUNCTIONS ======================*/
    /**
     * @dev Checks if a DID exists
     * @param _did The DID to check
     * @return True if the DID exists, false otherwise
     */
    function _didExists(string calldata _did) internal view returns (bool) {
        try IDidRegistry(didRegistry).getAddressByDid(_did) returns (address controller) {
            return controller != address(0);
        } catch {
            return false;
        }
    }
}
