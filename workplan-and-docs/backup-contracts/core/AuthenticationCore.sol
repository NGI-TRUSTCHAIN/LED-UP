// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {BaseContract} from "../base/BaseContract.sol";
import {IDidAuth} from "../interfaces/IDidAuth.sol";
import {IDidRegistry} from "../interfaces/IDidRegistry.sol";
import {ValidationLib} from "../libraries/ValidationLib.sol";
import {SecurityLib} from "../libraries/SecurityLib.sol";

/**
 * @title AuthenticationCore
 * @dev Core implementation of the DID authentication
 * @notice This contract provides the core functionality for DID-based authentication
 */
contract AuthenticationCore is BaseContract, IDidAuth {
    /*===================== VARIABLES ======================*/
    IDidRegistry public didRegistry;

    // Role assignments
    mapping(string => mapping(bytes32 => bool)) private didRoles;

    // Role requirements
    mapping(bytes32 => string) private roleRequirements;

    // Verified credentials
    mapping(string => mapping(string => mapping(bytes32 => bool))) private verifiedCredentials;

    /*===================== CONSTRUCTOR ======================*/
    /**
     * @dev Constructor
     * @param _didRegistryAddress The address of the DID registry contract
     */
    constructor(address _didRegistryAddress) validAddress(_didRegistryAddress) {
        didRegistry = IDidRegistry(_didRegistryAddress);
    }

    /*===================== MODIFIERS ======================*/
    /**
     * @dev Ensures the DID is active
     * @param _did The DID to check
     */
    modifier onlyActiveDID(string memory _did) {
        if (!didRegistry.isActive(_did)) {
            revert DidAuth__InvalidDID();
        }
        _;
    }

    /**
     * @dev Ensures the caller is authorized for the DID
     * @param _did The DID to check
     */
    modifier onlyAuthorized(string memory _did) {
        address didController = didRegistry.getAddressByDid(_did);
        if (didController != msg.sender) {
            revert DidAuth__Unauthorized();
        }
        _;
    }

    /*===================== EXTERNAL FUNCTIONS ======================*/
    /**
     * @dev Authenticates a DID for a specific role
     * @param did The DID to authenticate
     * @param role The role to authenticate for
     * @return True if authentication is successful, false otherwise
     */
    function authenticate(string calldata did, bytes32 role)
        external
        override
        whenNotPausedWithCustomError
        onlyActiveDID(did)
        returns (bool)
    {
        bool isRoleAvailable = didRoles[did][role];

        if (isRoleAvailable) {
            emit AuthenticationSuccessful(did, role, block.timestamp);
        } else {
            emit AuthenticationFailed(did, role, block.timestamp);
        }

        return isRoleAvailable;
    }

    /**
     * @dev Verifies a credential for a DID
     * @param did The DID to verify the credential for
     * @param credentialType The type of credential to verify
     * @param credentialId The ID of the credential
     * @return True if verification is successful, false otherwise
     */
    function verifyCredential(string calldata did, string calldata credentialType, bytes32 credentialId)
        external
        override
        whenNotPausedWithCustomError
        onlyActiveDID(did)
        returns (bool)
    {
        // Check if credential is already verified
        if (verifiedCredentials[did][credentialType][credentialId]) {
            emit CredentialVerified(did, credentialType, block.timestamp);
            return true;
        }

        // In a real implementation, we would verify the credential with an external verifier
        // For now, we'll just return false
        return false;
    }

    /**
     * @dev Checks if a DID has a specific role
     * @param did The DID to check
     * @param role The role to check for
     * @return True if the DID has the role, false otherwise
     */
    function hasRole(string calldata did, bytes32 role) external view override returns (bool) {
        return didRoles[did][role];
    }

    /**
     * @dev Grants a role to a DID
     * @param did The DID to grant the role to
     * @param role The role to grant
     */
    function grantRole(string calldata did, bytes32 role)
        external
        override
        whenNotPausedWithCustomError
        onlyOwner
        onlyActiveDID(did)
    {
        didRoles[did][role] = true;
    }

    /**
     * @dev Revokes a role from a DID
     * @param did The DID to revoke the role from
     * @param role The role to revoke
     */
    function revokeRole(string calldata did, bytes32 role) external override whenNotPausedWithCustomError onlyOwner {
        didRoles[did][role] = false;
    }

    /**
     * @dev Gets the address of the DidRegistry contract
     * @return The address of the DidRegistry contract
     */
    function getDidRegistryAddress() external view override returns (address) {
        return address(didRegistry);
    }

    /**
     * @dev Gets the address of the DidAccessControl contract
     * @return The address of the DidAccessControl contract
     */
    function getDidAccessControlAddress() external view override returns (address) {
        // In this implementation, we don't have a separate DidAccessControl contract
        return address(0);
    }

    /**
     * @dev Gets the address of the DidVerifier contract
     * @return The address of the DidVerifier contract
     */
    function getDidVerifierAddress() external view override returns (address) {
        // In this implementation, we don't have a separate DidVerifier contract
        return address(0);
    }

    /**
     * @dev Gets the address of the DidIssuer contract
     * @return The address of the DidIssuer contract
     */
    function getDidIssuerAddress() external view override returns (address) {
        // In this implementation, we don't have a separate DidIssuer contract
        return address(0);
    }

    /*===================== INTERNAL FUNCTIONS ======================*/
    /**
     * @dev Sets a role requirement
     * @param _role The role to set the requirement for
     * @param _requirement The required credential type
     */
    function _setRoleRequirement(bytes32 _role, string memory _requirement) internal {
        roleRequirements[_role] = _requirement;
    }

    /**
     * @dev Checks if a DID meets the requirements for a role
     * @param _did The DID to check
     * @param _role The role to check for
     * @return True if the DID meets the requirements, false otherwise
     */
    function _meetsRoleRequirements(string memory _did, bytes32 _role) internal view returns (bool) {
        string memory requirement = roleRequirements[_role];

        // If there's no requirement, return true
        if (bytes(requirement).length == 0) {
            return true;
        }

        // Check if the DID has any verified credentials of the required type
        // In a real implementation, we would check if the DID has a specific credential
        // For now, we'll just return false
        return false;
    }
}
