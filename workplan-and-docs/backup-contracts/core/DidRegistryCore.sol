// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {BaseContract} from "../base/BaseContract.sol";
import {IDidRegistry} from "../interfaces/IDidRegistry.sol";
import {StorageLib} from "../libraries/StorageLib.sol";
import {ValidationLib} from "../libraries/ValidationLib.sol";
import {SecurityLib} from "../libraries/SecurityLib.sol";

/**
 * @title DidRegistryCore
 * @dev Core implementation of the DID registry
 * @notice This contract provides the core functionality for managing DIDs
 */
contract DidRegistryCore is BaseContract, IDidRegistry {
    /*===================== ERRORS ======================*/
    error DidRegistry__Unauthorized();
    error DidRegistry__InvalidDID();
    error DidRegistry__DeactivatedDID();
    error DidRegistry__DIDAlreadyRegistered();
    error DidRegistry__InvalidMethod();
    error DidRegistry__InvalidFormat();

    /*===================== VARIABLES ======================*/
    string private didMethod;

    // Primary storage
    mapping(bytes32 => StorageLib.DIDDocument) internal didData;
    mapping(address => bytes32) internal addressToDidHash;
    mapping(string => bytes32) internal didToHash;
    mapping(bytes32 => string) internal hashToDid;

    // Used nonces for replay protection
    mapping(bytes32 => bool) private usedNonces;

    /*===================== CONSTRUCTOR ======================*/
    /**
     * @dev Constructor
     * @param _didMethod The DID method to use (e.g., "ledupv2")
     */
    constructor(string memory _didMethod) {
        if (!ValidationLib.validateString(_didMethod)) {
            revert DidRegistry__InvalidMethod();
        }

        didMethod = _didMethod;
    }

    /*===================== MODIFIERS ======================*/
    /**
     * @dev Ensures the DID exists
     * @param _did The DID to check
     */
    modifier didExists(string calldata _did) {
        bytes32 didHash = keccak256(bytes(_did));
        if (didData[didHash].subject == address(0)) {
            revert DidRegistry__InvalidDID();
        }
        _;
    }

    /**
     * @dev Ensures the DID is active
     * @param _did The DID to check
     */
    modifier didActive(string calldata _did) {
        bytes32 didHash = keccak256(bytes(_did));
        if (!didData[didHash].active) {
            revert DidRegistry__DeactivatedDID();
        }
        _;
    }

    /**
     * @dev Ensures the caller is the controller of the DID
     * @param _did The DID to check
     */
    modifier onlyController(string calldata _did) {
        bytes32 didHash = keccak256(bytes(_did));
        if (didData[didHash].subject != msg.sender) {
            revert DidRegistry__Unauthorized();
        }
        _;
    }

    /*===================== EXTERNAL FUNCTIONS ======================*/
    /**
     * @dev Registers a new DID
     * @param did The DID to register
     * @param document The DID document
     * @param publicKey The public key associated with the DID
     */
    function registerDid(string calldata did, string calldata document, string calldata publicKey)
        public
        override
        whenNotPausedWithCustomError
    {
        // Validate DID format
        if (!ValidationLib.validateDidFormat(did, didMethod)) {
            revert DidRegistry__InvalidFormat();
        }

        bytes32 didHash = keccak256(bytes(did));

        // Check if DID already exists
        if (didData[didHash].subject != address(0)) {
            revert DidRegistry__DIDAlreadyRegistered();
        }

        // Store DID document
        didData[didHash] = StorageLib.DIDDocument({
            subject: msg.sender,
            lastUpdated: uint40(block.timestamp),
            active: true,
            publicKey: publicKey,
            document: document
        });

        // Store mappings for lookups
        addressToDidHash[msg.sender] = didHash;
        didToHash[did] = didHash;
        hashToDid[didHash] = did;

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
        didExists(did)
        didActive(did)
        onlyController(did)
    {
        bytes32 didHash = keccak256(bytes(did));

        // Update DID document
        didData[didHash].document = document;
        didData[didHash].publicKey = publicKey;
        didData[didHash].lastUpdated = uint40(block.timestamp);

        emit DIDUpdated(did, block.timestamp);
    }

    /**
     * @dev Deactivates a DID
     * @param did The DID to deactivate
     */
    function deactivateDid(string calldata did)
        public
        override
        whenNotPausedWithCustomError
        didExists(did)
        onlyController(did)
    {
        bytes32 didHash = keccak256(bytes(did));

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
        didExists(did)
        returns (address subject, uint256 lastUpdated, bool active, string memory publicKey, string memory document)
    {
        bytes32 didHash = keccak256(bytes(did));
        StorageLib.DIDDocument memory doc = didData[didHash];

        return (doc.subject, doc.lastUpdated, doc.active, doc.publicKey, doc.document);
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

        return hashToDid[didHash];
    }

    /**
     * @dev Gets the address for a DID
     * @param did The DID to get the address for
     * @return The address associated with the DID
     */
    function getAddressByDid(string calldata did) external view override returns (address) {
        bytes32 didHash = keccak256(bytes(did));

        if (didData[didHash].subject == address(0)) {
            revert DidRegistry__InvalidDID();
        }

        return didData[didHash].subject;
    }

    /*===================== INTERNAL FUNCTIONS ======================*/
    /**
     * @dev Validates a DID operation signature
     * @param _did The DID being operated on
     * @param _operation The operation being performed
     * @param _data The data associated with the operation
     * @param _nonce A unique nonce
     * @param _timestamp The timestamp of the operation
     * @param _signature The signature of the operation
     * @return True if the signature is valid, false otherwise
     */
    function _validateDidOperationSignature(
        string memory _did,
        string memory _operation,
        bytes memory _data,
        bytes32 _nonce,
        uint256 _timestamp,
        bytes memory _signature
    ) internal returns (bool) {
        // Check if nonce has been used
        if (!SecurityLib.validateNonce(usedNonces, _nonce)) {
            return false;
        }

        // Check if timestamp is valid (within 5 minutes)
        if (!SecurityLib.validateTimestamp(_timestamp, 5 minutes)) {
            return false;
        }

        // Compute operation hash
        bytes32 operationHash = SecurityLib.computeDidOperationHash(_did, _operation, _data, _nonce, _timestamp);

        // Get the controller address
        bytes32 didHash = keccak256(bytes(_did));
        address controller = didData[didHash].subject;

        // Validate signature
        return SecurityLib.validateSignature(operationHash, _signature, controller);
    }
}
