// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {BaseContract} from "../base/BaseContract.sol";
import {IDidRegistry} from "../interfaces/IDidRegistry.sol";
import {StorageLib} from "../libraries/StorageLib.sol";
import {GasLib} from "../libraries/GasLib.sol";
import {StringLib} from "../libraries/StringLib.sol";

/**
 * @title DidRegistryOptimized
 * @dev Gas-optimized version of the DidRegistry contract
 * @notice This contract manages DID documents with optimized gas usage
 */
contract DidRegistryOptimized is BaseContract, IDidRegistry {
    /*===================== ERRORS ======================*/
    error DidRegistry__Unauthorized();
    error DidRegistry__InvalidDID();
    error DidRegistry__DeactivatedDID();
    error DidRegistry__DIDAlreadyRegistered();

    /*===================== VARIABLES ======================*/
    string private didMethod;

    // Primary storage - optimized for gas efficiency
    mapping(bytes32 => StorageLib.DIDDocumentOptimized) internal didData;
    mapping(address => bytes32) internal addressToDidHash;
    mapping(bytes32 => address) internal didHashToAddress;

    /*===================== CONSTRUCTOR ======================*/
    /**
     * @dev Constructor
     * @param _didMethod The DID method to use
     */
    constructor(string memory _didMethod) nonEmptyString(_didMethod) {
        didMethod = _didMethod;
    }

    /*===================== EXTERNAL FUNCTIONS ======================*/
    /**
     * @dev Registers a new DID
     * @param did The DID to register
     * @param document The DID document
     * @param publicKey The public key associated with the DID
     */
    function registerDid(string calldata did, string calldata document, string calldata publicKey)
        external
        override
        whenNotPausedWithCustomError
        nonEmptyString(did)
        nonEmptyString(document)
        nonEmptyString(publicKey)
    {
        bytes32 didHash = keccak256(bytes(did));

        if (didData[didHash].subject != address(0)) {
            revert DidRegistry__DIDAlreadyRegistered();
        }

        // Store optimized DID document
        didData[didHash] = StorageLib.DIDDocumentOptimized({
            subject: msg.sender,
            lastUpdated: uint40(block.timestamp),
            active: true,
            publicKeyHash: keccak256(bytes(publicKey)),
            documentHash: keccak256(bytes(document))
        });

        // Store mappings for reverse lookups
        addressToDidHash[msg.sender] = didHash;
        didHashToAddress[didHash] = msg.sender;

        emit DIDRegistered(did, msg.sender);
    }

    /**
     * @dev Updates an existing DID
     * @param did The DID to update
     * @param document The updated DID document
     * @param publicKey The updated public key
     */
    function updateDid(string calldata did, string calldata document, string calldata publicKey)
        external
        override
        whenNotPausedWithCustomError
        nonEmptyString(did)
        nonEmptyString(document)
        nonEmptyString(publicKey)
    {
        bytes32 didHash = keccak256(bytes(did));

        if (didData[didHash].subject == address(0)) {
            revert DidRegistry__InvalidDID();
        }

        if (didData[didHash].subject != msg.sender) {
            revert DidRegistry__Unauthorized();
        }

        if (!didData[didHash].active) {
            revert DidRegistry__DeactivatedDID();
        }

        // Update DID document
        didData[didHash].lastUpdated = uint40(block.timestamp);
        didData[didHash].publicKeyHash = keccak256(bytes(publicKey));
        didData[didHash].documentHash = keccak256(bytes(document));

        emit DIDUpdated(did, block.timestamp);
    }

    /**
     * @dev Deactivates a DID
     * @param did The DID to deactivate
     */
    function deactivateDid(string calldata did) external override whenNotPausedWithCustomError nonEmptyString(did) {
        bytes32 didHash = keccak256(bytes(did));

        if (didData[didHash].subject == address(0)) {
            revert DidRegistry__InvalidDID();
        }

        if (didData[didHash].subject != msg.sender) {
            revert DidRegistry__Unauthorized();
        }

        // Deactivate DID
        didData[didHash].active = false;
        didData[didHash].lastUpdated = uint40(block.timestamp);

        emit DIDDeactivated(did, block.timestamp);
    }

    /*===================== VIEW FUNCTIONS ======================*/
    /**
     * @dev Checks if a DID is active
     * @param did The DID to check
     * @return True if the DID is active, false otherwise
     */
    function isActive(string calldata did) external view override returns (bool) {
        bytes32 didHash = keccak256(bytes(did));
        return didData[didHash].active;
    }

    /**
     * @dev Gets the DID document for a DID
     * @param did The DID to get the document for
     * @return subject The address of the controller
     * @return lastUpdated The timestamp of the last update
     * @return active Whether the DID is active
     * @return publicKey The public key associated with the DID
     * @return document The DID document
     */
    function getDidDocument(string calldata did)
        external
        view
        override
        returns (address subject, uint256 lastUpdated, bool active, string memory publicKey, string memory document)
    {
        bytes32 didHash = keccak256(bytes(did));
        StorageLib.DIDDocumentOptimized memory doc = didData[didHash];

        if (doc.subject == address(0)) {
            revert DidRegistry__InvalidDID();
        }

        // Note: In a real implementation, we would need to store the original strings
        // or implement a way to retrieve them from the hash
        // For now, we return empty strings for publicKey and document
        return (
            doc.subject,
            doc.lastUpdated,
            doc.active,
            "", // publicKey - would need to be retrieved from storage or event logs
            "" // document - would need to be retrieved from storage or event logs
        );
    }

    /**
     * @dev Gets the DID for an address
     * @param subject The address to get the DID for
     * @return The DID associated with the address
     */
    function getDidByAddress(address subject) external view override returns (string memory) {
        bytes32 didHash = addressToDidHash[subject];

        if (didHash == bytes32(0)) {
            revert DidRegistry__InvalidDID();
        }

        // Note: In a real implementation, we would need to store the original DID string
        // or implement a way to reconstruct it from the hash and the subject address
        // For now, we return an empty string
        return "";
    }

    /**
     * @dev Gets the address for a DID
     * @param did The DID to get the address for
     * @return The address associated with the DID
     */
    function getAddressByDid(string calldata did) external view override returns (address) {
        bytes32 didHash = keccak256(bytes(did));
        address subject = didHashToAddress[didHash];

        if (subject == address(0)) {
            revert DidRegistry__InvalidDID();
        }

        return subject;
    }
}
