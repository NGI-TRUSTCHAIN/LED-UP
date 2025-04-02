// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {DidAccessControlCore} from "../core/DidAccessControlCore.sol";
import {ValidationLib} from "../libraries/ValidationLib.sol";
import {SecurityLib} from "../libraries/SecurityLib.sol";
import {IDidRegistry} from "../interfaces/IDidRegistry.sol";

/**
 * @title DidAccessControlExtended
 * @dev Extended implementation of the DID Access Control contract with additional features
 * @notice This contract extends the core DID Access Control contract with additional functionality
 */
contract DidAccessControlExtended is DidAccessControlCore {
    /*===================== ERRORS ======================*/
    error DidAccessControlExtended__InvalidSignature();
    error DidAccessControlExtended__InvalidTimestamp();
    error DidAccessControlExtended__InvalidNonce();
    error DidAccessControlExtended__InvalidGroup();
    error DidAccessControlExtended__GroupAlreadyExists();
    error DidAccessControlExtended__GroupNotFound();
    error DidAccessControlExtended__AlreadyMember();
    error DidAccessControlExtended__NotMember();

    /*===================== STRUCTS ======================*/
    /**
     * @dev Role group structure
     */
    struct RoleGroup {
        string groupId;
        string name;
        string description;
        bytes32[] roles;
        uint256 createdAt;
        bool active;
    }

    /**
     * @dev Group membership structure
     */
    struct GroupMembership {
        string did;
        string groupId;
        uint256 joinedAt;
        bool active;
    }

    /*===================== VARIABLES ======================*/
    // Role groups
    mapping(string => RoleGroup) private roleGroups;
    string[] private groupIds;

    // Group memberships
    // groupId => did => GroupMembership
    mapping(string => mapping(string => GroupMembership)) private groupMemberships;

    // Group members
    // groupId => did[]
    mapping(string => string[]) private groupMembers;

    // DID groups
    // did => groupId[]
    mapping(string => string[]) private didGroups;

    // Used nonces for replay protection
    mapping(bytes32 => bool) private usedNonces;

    // DID registry interface
    IDidRegistry private didRegistryInterface;

    /*===================== EVENTS ======================*/
    event RoleGroupCreated(string indexed groupId, string name, uint256 timestamp);
    event RoleGroupUpdated(string indexed groupId, uint256 timestamp);
    event RoleGroupDeactivated(string indexed groupId, uint256 timestamp);
    event MemberAddedToGroup(string indexed did, string indexed groupId, uint256 timestamp);
    event MemberRemovedFromGroup(string indexed did, string indexed groupId, uint256 timestamp);
    event RoleGrantedWithSignature(string indexed did, bytes32 indexed role, uint256 timestamp);

    /*===================== CONSTRUCTOR ======================*/
    /**
     * @dev Constructor
     * @param _didRegistry The address of the DID registry
     */
    constructor(address _didRegistry) DidAccessControlCore(_didRegistry) {
        didRegistryInterface = IDidRegistry(_didRegistry);
    }

    /*===================== EXTERNAL FUNCTIONS ======================*/
    /**
     * @dev Creates a role group
     * @param groupId The ID of the group
     * @param name The name of the group
     * @param description The description of the group
     * @param roles The roles in the group
     */
    function createRoleGroup(
        string calldata groupId,
        string calldata name,
        string calldata description,
        bytes32[] calldata roles
    ) external onlyOwner {
        if (bytes(groupId).length == 0) revert DidAccessControlExtended__InvalidGroup();
        if (bytes(roleGroups[groupId].groupId).length > 0) {
            revert DidAccessControlExtended__GroupAlreadyExists();
        }

        roleGroups[groupId] = RoleGroup({
            groupId: groupId,
            name: name,
            description: description,
            roles: roles,
            createdAt: block.timestamp,
            active: true
        });

        groupIds.push(groupId);

        emit RoleGroupCreated(groupId, name, block.timestamp);
    }

    /**
     * @dev Updates a role group
     * @param groupId The ID of the group
     * @param name The updated name
     * @param description The updated description
     * @param roles The updated roles
     */
    function updateRoleGroup(
        string calldata groupId,
        string calldata name,
        string calldata description,
        bytes32[] calldata roles
    ) external onlyOwner {
        if (bytes(roleGroups[groupId].groupId).length == 0) {
            revert DidAccessControlExtended__GroupNotFound();
        }

        RoleGroup storage group = roleGroups[groupId];
        group.name = name;
        group.description = description;
        group.roles = roles;

        emit RoleGroupUpdated(groupId, block.timestamp);
    }

    /**
     * @dev Deactivates a role group
     * @param groupId The ID of the group
     */
    function deactivateRoleGroup(string calldata groupId) external onlyOwner {
        if (bytes(roleGroups[groupId].groupId).length == 0) {
            revert DidAccessControlExtended__GroupNotFound();
        }

        roleGroups[groupId].active = false;

        emit RoleGroupDeactivated(groupId, block.timestamp);
    }

    /**
     * @dev Activates a role group
     * @param groupId The ID of the group
     */
    function activateRoleGroup(string calldata groupId) external onlyOwner {
        if (bytes(roleGroups[groupId].groupId).length == 0) {
            revert DidAccessControlExtended__GroupNotFound();
        }

        roleGroups[groupId].active = true;
    }

    /**
     * @dev Adds a member to a group
     * @param did The DID to add
     * @param groupId The ID of the group
     */
    function addMemberToGroup(string calldata did, string calldata groupId)
        external
        whenNotPausedWithCustomError
        didExists(did)
        onlyOwner
    {
        if (bytes(roleGroups[groupId].groupId).length == 0) {
            revert DidAccessControlExtended__GroupNotFound();
        }

        if (bytes(groupMemberships[groupId][did].did).length > 0) {
            revert DidAccessControlExtended__AlreadyMember();
        }

        // Add membership
        groupMemberships[groupId][did] =
            GroupMembership({did: did, groupId: groupId, joinedAt: block.timestamp, active: true});

        // Add to group members
        groupMembers[groupId].push(did);

        // Add to DID groups
        didGroups[did].push(groupId);

        // Grant all roles in the group
        bytes32[] memory roles = roleGroups[groupId].roles;
        for (uint256 i = 0; i < roles.length; i++) {
            grantRole(did, roles[i]);
        }

        emit MemberAddedToGroup(did, groupId, block.timestamp);
    }

    /**
     * @dev Removes a member from a group
     * @param did The DID to remove
     * @param groupId The ID of the group
     */
    function removeMemberFromGroup(string calldata did, string calldata groupId)
        external
        whenNotPausedWithCustomError
        didExists(did)
        onlyOwner
    {
        if (bytes(roleGroups[groupId].groupId).length == 0) {
            revert DidAccessControlExtended__GroupNotFound();
        }

        if (bytes(groupMemberships[groupId][did].did).length == 0) {
            revert DidAccessControlExtended__NotMember();
        }

        // Deactivate membership
        groupMemberships[groupId][did].active = false;

        // Remove from group members (not gas efficient but simple)
        string[] storage members = groupMembers[groupId];
        for (uint256 i = 0; i < members.length; i++) {
            if (keccak256(bytes(members[i])) == keccak256(bytes(did))) {
                // Replace with the last element and pop
                members[i] = members[members.length - 1];
                members.pop();
                break;
            }
        }

        // Remove from DID groups (not gas efficient but simple)
        string[] storage groups = didGroups[did];
        for (uint256 i = 0; i < groups.length; i++) {
            if (keccak256(bytes(groups[i])) == keccak256(bytes(groupId))) {
                // Replace with the last element and pop
                groups[i] = groups[groups.length - 1];
                groups.pop();
                break;
            }
        }

        // Revoke all roles in the group
        bytes32[] memory roles = roleGroups[groupId].roles;
        for (uint256 i = 0; i < roles.length; i++) {
            revokeRole(did, roles[i]);
        }

        emit MemberRemovedFromGroup(did, groupId, block.timestamp);
    }

    /**
     * @dev Grants a role with a signature
     * @param did The DID to grant the role to
     * @param role The role to grant
     * @param nonce A unique nonce
     * @param timestamp The timestamp of the grant
     * @param signature The signature of the grant data
     */
    function grantRoleWithSignature(
        string calldata did,
        bytes32 role,
        bytes32 nonce,
        uint256 timestamp,
        bytes calldata signature
    ) external whenNotPausedWithCustomError didExists(did) roleExists(role) {
        // Check if nonce has been used
        if (usedNonces[nonce]) revert DidAccessControlExtended__InvalidNonce();
        usedNonces[nonce] = true;

        // Check if timestamp is valid (within 5 minutes)
        if (!SecurityLib.validateTimestamp(timestamp, 5 minutes)) {
            revert DidAccessControlExtended__InvalidTimestamp();
        }

        // Create message hash
        bytes32 messageHash = keccak256(abi.encodePacked(did, role, nonce, timestamp));

        // Verify signature (must be signed by contract owner)
        if (!SecurityLib.validateSignature(messageHash, signature, owner())) {
            revert DidAccessControlExtended__InvalidSignature();
        }

        // Grant role
        grantRole(did, role);

        emit RoleGrantedWithSignature(did, role, block.timestamp);
    }

    /*===================== VIEW FUNCTIONS ======================*/
    /**
     * @dev Gets a role group
     * @param groupId The ID of the group
     * @return name The name of the group
     * @return description The description of the group
     * @return roles The roles in the group
     * @return createdAt The timestamp of creation
     * @return active Whether the group is active
     */
    function getRoleGroup(string calldata groupId)
        external
        view
        returns (string memory name, string memory description, bytes32[] memory roles, uint256 createdAt, bool active)
    {
        if (bytes(roleGroups[groupId].groupId).length == 0) {
            revert DidAccessControlExtended__GroupNotFound();
        }

        RoleGroup memory group = roleGroups[groupId];

        return (group.name, group.description, group.roles, group.createdAt, group.active);
    }

    /**
     * @dev Gets all group IDs
     * @return The list of group IDs
     */
    function getGroupIds() external view returns (string[] memory) {
        return groupIds;
    }

    /**
     * @dev Gets all members of a group
     * @param groupId The ID of the group
     * @return The list of member DIDs
     */
    function getGroupMembers(string calldata groupId) external view returns (string[] memory) {
        if (bytes(roleGroups[groupId].groupId).length == 0) {
            revert DidAccessControlExtended__GroupNotFound();
        }

        return groupMembers[groupId];
    }

    /**
     * @dev Gets all groups a DID is a member of
     * @param did The DID to check
     * @return The list of group IDs
     */
    function getDidGroups(string calldata did) external view didExists(did) returns (string[] memory) {
        return didGroups[did];
    }

    /**
     * @dev Checks if a DID is a member of a group
     * @param did The DID to check
     * @param groupId The ID of the group
     * @return True if the DID is a member, false otherwise
     */
    function isGroupMember(string calldata did, string calldata groupId) external view returns (bool) {
        return groupMemberships[groupId][did].active;
    }

    /**
     * @dev Checks if a DID has any role in a group
     * @param did The DID to check
     * @param groupId The ID of the group
     * @return True if the DID has any role in the group, false otherwise
     */
    function hasAnyRoleInGroup(string calldata did, string calldata groupId)
        external
        view
        didExists(did)
        returns (bool)
    {
        if (bytes(roleGroups[groupId].groupId).length == 0) {
            return false;
        }

        bytes32[] memory roles = roleGroups[groupId].roles;
        for (uint256 i = 0; i < roles.length; i++) {
            if (hasRole(did, roles[i])) {
                return true;
            }
        }

        return false;
    }
}
