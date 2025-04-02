// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {BaseContract} from "../base/BaseContract.sol";
import {IDidAuth} from "../interfaces/IDidAuth.sol";
import {IDidRegistry} from "../interfaces/IDidRegistry.sol";
import {ValidationLib} from "../libraries/ValidationLib.sol";
import {SecurityLib} from "../libraries/SecurityLib.sol";
import {GasLib} from "../libraries/GasLib.sol";

/**
 * @title DidAuthOptimized
 * @dev Gas-optimized implementation of the DID authentication
 * @notice This contract provides gas-efficient DID-based authentication
 */
contract DidAuthOptimized is BaseContract, IDidAuth {
    /*===================== CONSTANTS ======================*/
    // Role flags
    uint8 private constant ROLE_ADMIN = 0;
    uint8 private constant ROLE_OPERATOR = 1;
    uint8 private constant ROLE_PRODUCER = 2;
    uint8 private constant ROLE_CONSUMER = 3;
    uint8 private constant ROLE_SERVICE_PROVIDER = 4;

    /*===================== VARIABLES ======================*/
    IDidRegistry public didRegistry;

    // Role assignments - optimized using bytes32 for DID hashes and uint256 for role flags
    mapping(bytes32 => uint256) private didRoleFlags;

    // Role requirements - optimized using bytes32 for requirement hashes
    mapping(bytes32 => bytes32) private roleRequirements;

    // Verified credentials - optimized using bytes32 for DID and credential type hashes
    mapping(bytes32 => mapping(bytes32 => mapping(bytes32 => bool))) private verifiedCredentials;

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
        bytes32 didHash = keccak256(bytes(did));
        uint8 roleIndex = _getRoleIndex(role);

        bool isRoleAvailable = GasLib.unpackBoolean(didRoleFlags[didHash], roleIndex);

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
        bytes32 didHash = keccak256(bytes(did));
        bytes32 credentialTypeHash = keccak256(bytes(credentialType));

        // Check if credential is already verified
        if (verifiedCredentials[didHash][credentialTypeHash][credentialId]) {
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
        bytes32 didHash = keccak256(bytes(did));
        uint8 roleIndex = _getRoleIndex(role);

        return GasLib.unpackBoolean(didRoleFlags[didHash], roleIndex);
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
        bytes32 didHash = keccak256(bytes(did));
        uint8 roleIndex = _getRoleIndex(role);

        didRoleFlags[didHash] = GasLib.setFlag(didRoleFlags[didHash], roleIndex, true);
    }

    /**
     * @dev Revokes a role from a DID
     * @param did The DID to revoke the role from
     * @param role The role to revoke
     */
    function revokeRole(string calldata did, bytes32 role) external override whenNotPausedWithCustomError onlyOwner {
        bytes32 didHash = keccak256(bytes(did));
        uint8 roleIndex = _getRoleIndex(role);

        didRoleFlags[didHash] = GasLib.setFlag(didRoleFlags[didHash], roleIndex, false);
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
     * @dev Gets the role index for a role
     * @param _role The role to get the index for
     * @return The role index
     */
    function _getRoleIndex(bytes32 _role) internal pure returns (uint8) {
        if (_role == keccak256("ADMIN")) {
            return ROLE_ADMIN;
        } else if (_role == keccak256("OPERATOR")) {
            return ROLE_OPERATOR;
        } else if (_role == keccak256("PRODUCER")) {
            return ROLE_PRODUCER;
        } else if (_role == keccak256("CONSUMER")) {
            return ROLE_CONSUMER;
        } else if (_role == keccak256("SERVICE_PROVIDER")) {
            return ROLE_SERVICE_PROVIDER;
        } else {
            revert DidAuth__InvalidRole();
        }
    }

    /**
     * @dev Sets a role requirement
     * @param _role The role to set the requirement for
     * @param _requirement The required credential type
     */
    function _setRoleRequirement(bytes32 _role, string memory _requirement) internal {
        bytes32 requirementHash = keccak256(bytes(_requirement));
        roleRequirements[_role] = requirementHash;
    }

    /**
     * @dev Checks if a DID meets the requirements for a role
     * @param _did The DID to check
     * @param _role The role to check for
     * @return True if the DID meets the requirements, false otherwise
     */
    function _meetsRoleRequirements(string memory _did, bytes32 _role) internal view returns (bool) {
        bytes32 requirementHash = roleRequirements[_role];

        // If there's no requirement, return true
        if (requirementHash == bytes32(0)) {
            return true;
        }

        // Check if the DID has any verified credentials of the required type
        // In a real implementation, we would check if the DID has a specific credential
        // For now, we'll just return false
        return false;
    }
}
