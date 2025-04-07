// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {BaseContract} from "../base/BaseContract.sol";
import {IDidIssuer} from "../interfaces/IDidIssuer.sol";
import {IDidRegistry} from "../interfaces/IDidRegistry.sol";
import {ValidationLib} from "../libraries/ValidationLib.sol";
import {SecurityLib} from "../libraries/SecurityLib.sol";

/**
 * @title DidIssuerCore
 * @dev Core implementation of the DID Issuer contract
 * @notice This contract provides the core functionality for issuing DID credentials
 */
abstract contract DidIssuerCore is BaseContract, IDidIssuer {
    /*===================== STRUCTS ======================*/
    /**
     * @dev Credential structure
     */
    struct Credential {
        bytes32 id;
        string did;
        string credentialType;
        bytes data;
        string issuerDid;
        uint256 issuedAt;
        uint256 expiresAt;
        bool revoked;
    }

    /*===================== VARIABLES ======================*/
    // DID registry contract address
    address private didRegistry;

    // Credential storage
    // did => credentialId => Credential
    mapping(string => mapping(bytes32 => Credential)) private credentials;

    // Credential IDs by DID
    mapping(string => bytes32[]) private credentialIds;

    // Credential types
    mapping(string => bool) private validCredentialTypes;
    string[] private credentialTypesList;

    /*===================== CONSTRUCTOR ======================*/
    /**
     * @dev Constructor
     * @param _didRegistry The address of the DID registry
     */
    constructor(address _didRegistry) {
        if (_didRegistry == address(0)) revert DidIssuer__InvalidDID();
        didRegistry = _didRegistry;
    }

    /*===================== MODIFIERS ======================*/
    /**
     * @dev Ensures the DID exists
     * @param _did The DID to check
     */
    modifier didExists(string calldata _did) {
        if (!_didExists(_did)) {
            revert DidIssuer__InvalidDID();
        }
        _;
    }

    /**
     * @dev Ensures the caller is authorized for the DID
     * @param _did The DID to check
     */
    modifier onlyAuthorized(string calldata _did) {
        address didController = IDidRegistry(didRegistry).getAddressByDid(_did);
        if (didController != msg.sender) {
            revert DidIssuer__Unauthorized();
        }
        _;
    }

    /*===================== EXTERNAL FUNCTIONS ======================*/
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
    ) public virtual override whenNotPausedWithCustomError didExists(did) returns (bytes32 credentialId) {
        // Validate inputs
        if (!validCredentialTypes[credentialType]) {
            revert DidIssuer__InvalidCredential();
        }

        if (expirationDate <= block.timestamp) {
            revert DidIssuer__InvalidCredential();
        }

        // Generate credential ID
        credentialId = keccak256(abi.encodePacked(did, credentialType, credentialData, block.timestamp));

        // Check if credential already exists
        if (credentials[did][credentialId].id != bytes32(0)) {
            revert DidIssuer__CredentialAlreadyExists();
        }

        // Get issuer DID (the contract owner's DID)
        string memory issuerDid = _getIssuerDid();

        // Store credential
        credentials[did][credentialId] = Credential({
            id: credentialId,
            did: did,
            credentialType: credentialType,
            data: credentialData,
            issuerDid: issuerDid,
            issuedAt: block.timestamp,
            expiresAt: expirationDate,
            revoked: false
        });

        // Add to credential IDs
        credentialIds[did].push(credentialId);

        emit CredentialIssued(did, credentialType, credentialId, issuerDid, block.timestamp);

        return credentialId;
    }

    /**
     * @dev Revokes a credential
     * @param did The DID of the credential subject
     * @param credentialId The ID of the credential to revoke
     */
    function revokeCredential(string calldata did, bytes32 credentialId)
        external
        virtual
        override
        whenNotPausedWithCustomError
        onlyOwner
    {
        Credential storage credential = credentials[did][credentialId];

        if (credential.id == bytes32(0)) {
            revert DidIssuer__InvalidCredential();
        }

        if (credential.revoked) {
            revert DidIssuer__CredentialRevoked();
        }

        // Revoke credential
        credential.revoked = true;

        emit CredentialRevoked(did, credentialId, block.timestamp);
    }

    /**
     * @dev Adds a valid credential type
     * @param credentialType The credential type to add
     */
    function addCredentialType(string calldata credentialType) public onlyOwner {
        if (validCredentialTypes[credentialType]) {
            return; // Already exists
        }

        validCredentialTypes[credentialType] = true;
        credentialTypesList.push(credentialType);
    }

    /**
     * @dev Removes a valid credential type
     * @param credentialType The credential type to remove
     */
    function removeCredentialType(string calldata credentialType) external onlyOwner {
        if (!validCredentialTypes[credentialType]) {
            return; // Doesn't exist
        }

        validCredentialTypes[credentialType] = false;

        // Remove from list (not gas efficient but simple)
        for (uint256 i = 0; i < credentialTypesList.length; i++) {
            if (keccak256(bytes(credentialTypesList[i])) == keccak256(bytes(credentialType))) {
                // Replace with the last element and pop
                credentialTypesList[i] = credentialTypesList[credentialTypesList.length - 1];
                credentialTypesList.pop();
                break;
            }
        }
    }

    /*===================== VIEW FUNCTIONS ======================*/
    /**
     * @dev Checks if a credential is valid
     * @param did The DID of the credential subject
     * @param credentialId The ID of the credential
     * @return True if the credential is valid, false otherwise
     */
    function isCredentialValid(string calldata did, bytes32 credentialId)
        external
        view
        virtual
        override
        returns (bool)
    {
        Credential memory credential = credentials[did][credentialId];

        if (credential.id == bytes32(0)) {
            return false;
        }

        return (!credential.revoked && credential.expiresAt > block.timestamp);
    }

    /**
     * @dev Gets a credential
     * @param did The DID of the credential subject
     * @param credentialId The ID of the credential
     * @return id The ID of the credential
     * @return credentialType The type of credential
     * @return issuerDid The DID of the issuer
     * @return issuedAt The timestamp of issuance
     * @return expiresAt The expiration timestamp
     * @return revoked Whether the credential is revoked
     */
    function getCredential(string calldata did, bytes32 credentialId)
        external
        view
        returns (
            bytes32 id,
            string memory credentialType,
            string memory issuerDid,
            uint256 issuedAt,
            uint256 expiresAt,
            bool revoked
        )
    {
        Credential memory credential = credentials[did][credentialId];

        if (credential.id == bytes32(0)) {
            revert DidIssuer__InvalidCredential();
        }

        return (
            credential.id,
            credential.credentialType,
            credential.issuerDid,
            credential.issuedAt,
            credential.expiresAt,
            credential.revoked
        );
    }

    /**
     * @dev Gets all credential IDs for a DID
     * @param did The DID to get credentials for
     * @return The list of credential IDs
     */
    function getCredentialIds(string calldata did) external view returns (bytes32[] memory) {
        return credentialIds[did];
    }

    /**
     * @dev Gets all valid credential types
     * @return The list of valid credential types
     */
    function getCredentialTypes() external view returns (string[] memory) {
        return credentialTypesList;
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

    /**
     * @dev Gets the issuer DID
     * @return The DID of the issuer
     */
    function _getIssuerDid() internal view virtual returns (string memory) {
        try IDidRegistry(didRegistry).getDidByAddress(owner()) returns (string memory did) {
            return did;
        } catch {
            return "";
        }
    }
}
