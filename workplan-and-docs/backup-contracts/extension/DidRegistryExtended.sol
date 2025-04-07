// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {DidRegistryCore} from "../core/DidRegistryCore.sol";
import {ValidationLib} from "../libraries/ValidationLib.sol";
import {SecurityLib} from "../libraries/SecurityLib.sol";
import {StorageLib} from "../libraries/StorageLib.sol";

/**
 * @title DidRegistryExtended
 * @dev Extended implementation of the DID registry with additional features
 * @notice This contract extends the core DID registry with additional functionality
 */
contract DidRegistryExtended is DidRegistryCore {
    /*===================== ERRORS ======================*/
    error DidRegistryExtended__InvalidMetadata();
    error DidRegistryExtended__InvalidSignature();
    error DidRegistryExtended__InvalidDelegate();
    error DidRegistryExtended__DelegateAlreadyExists();
    error DidRegistryExtended__DelegateNotFound();
    error DidRegistryExtended__InvalidTimestamp();

    /*===================== STRUCTS ======================*/
    /**
     * @dev Metadata structure for DIDs
     */
    struct DIDMetadata {
        string name;
        string description;
        string imageUrl;
        string[] attributes;
        uint256 timestamp;
    }

    /**
     * @dev Delegate structure for DIDs
     */
    struct DIDDelegate {
        address delegate;
        string delegateType;
        uint256 validUntil;
    }

    /*===================== VARIABLES ======================*/
    // Metadata storage
    mapping(bytes32 => DIDMetadata) private didMetadata;

    // Delegate storage
    mapping(bytes32 => mapping(address => DIDDelegate)) private didDelegates;
    mapping(bytes32 => address[]) private didDelegatesList;

    // Used nonces for replay protection (in addition to the one in the core contract)
    mapping(bytes32 => bool) private extendedUsedNonces;

    /*===================== EVENTS ======================*/
    event DIDMetadataUpdated(string indexed did, uint256 timestamp);
    event DIDDelegateAdded(string indexed did, address indexed delegate, string delegateType, uint256 validUntil);
    event DIDDelegateRemoved(string indexed did, address indexed delegate);
    event DIDOperationSigned(string indexed did, string operation, uint256 timestamp);

    /*===================== CONSTRUCTOR ======================*/
    /**
     * @dev Constructor
     * @param _didMethod The DID method to use (e.g., "ledupv2")
     */
    constructor(string memory _didMethod) DidRegistryCore(_didMethod) {}

    /*===================== INTERNAL FUNCTIONS ======================*/
    /**
     * @dev Validates a signed DID operation
     * @param _did The DID to validate
     * @param _operation The operation to validate
     * @param _data The data for the operation
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
    ) internal override returns (bool) {
        // Check if nonce has been used
        if (extendedUsedNonces[_nonce]) return false;
        extendedUsedNonces[_nonce] = true;

        // Check if timestamp is valid (within 5 minutes)
        if (!SecurityLib.validateTimestamp(_timestamp, 5 minutes)) {
            return false;
        }

        // Get the controller address
        bytes32 didHash = keccak256(bytes(_did));
        address controller = didData[didHash].subject;
        if (controller == address(0)) return false;

        // Compute operation hash
        bytes32 operationHash = SecurityLib.computeDidOperationHash(_did, _operation, _data, _nonce, _timestamp);

        // Validate signature
        return SecurityLib.validateSignature(operationHash, _signature, controller);
    }

    /**
     * @dev Gets the controller address for a DID
     * @param _did The DID to get the controller for
     * @return The controller address
     */
    function getDidController(string calldata _did) internal view returns (address) {
        bytes32 didHash = keccak256(bytes(_did));
        return didData[didHash].subject;
    }

    /**
     * @dev Internal function to register a DID
     * @param did The DID to register
     * @param document The DID document
     * @param publicKey The public key associated with the DID
     */
    function _registerDid(string calldata did, string calldata document, string calldata publicKey) internal {
        // Call the parent contract's function
        super.registerDid(did, document, publicKey);
    }

    /**
     * @dev Internal function to deactivate a DID
     * @param did The DID to deactivate
     */
    function _deactivateDid(string calldata did) internal {
        // Call the parent contract's function
        super.deactivateDid(did);
    }

    /*===================== EXTERNAL FUNCTIONS ======================*/
    /**
     * @dev Registers a DID with metadata
     * @param did The DID to register
     * @param document The DID document
     * @param publicKey The public key associated with the DID
     * @param name The name for the DID
     * @param description The description for the DID
     * @param imageUrl The image URL for the DID
     * @param attributes The attributes for the DID
     */
    function registerDidWithMetadata(
        string calldata did,
        string calldata document,
        string calldata publicKey,
        string calldata name,
        string calldata description,
        string calldata imageUrl,
        string[] calldata attributes
    ) external whenNotPausedWithCustomError {
        // Register the DID directly
        _registerDid(did, document, publicKey);

        // Add metadata
        bytes32 didHash = keccak256(bytes(did));
        didMetadata[didHash] = DIDMetadata({
            name: name,
            description: description,
            imageUrl: imageUrl,
            attributes: attributes,
            timestamp: block.timestamp
        });

        emit DIDMetadataUpdated(did, block.timestamp);
    }

    /**
     * @dev Updates the metadata for a DID
     * @param did The DID to update
     * @param name The updated name
     * @param description The updated description
     * @param imageUrl The updated image URL
     * @param attributes The updated attributes
     */
    function updateDidMetadata(
        string calldata did,
        string calldata name,
        string calldata description,
        string calldata imageUrl,
        string[] calldata attributes
    ) external whenNotPausedWithCustomError didExists(did) didActive(did) onlyController(did) {
        bytes32 didHash = keccak256(bytes(did));

        didMetadata[didHash] = DIDMetadata({
            name: name,
            description: description,
            imageUrl: imageUrl,
            attributes: attributes,
            timestamp: block.timestamp
        });

        emit DIDMetadataUpdated(did, block.timestamp);
    }

    /**
     * @dev Adds a delegate to a DID
     * @param did The DID to add the delegate to
     * @param delegate The address of the delegate
     * @param delegateType The type of the delegate
     * @param validUntil The timestamp until which the delegate is valid
     */
    function addDidDelegate(string calldata did, address delegate, string calldata delegateType, uint256 validUntil)
        external
        whenNotPausedWithCustomError
        didExists(did)
        didActive(did)
        onlyController(did)
    {
        if (delegate == address(0)) revert DidRegistryExtended__InvalidDelegate();
        if (validUntil <= block.timestamp) revert DidRegistryExtended__InvalidTimestamp();

        bytes32 didHash = keccak256(bytes(did));

        // Check if delegate already exists
        if (didDelegates[didHash][delegate].delegate != address(0)) {
            revert DidRegistryExtended__DelegateAlreadyExists();
        }

        // Add delegate
        didDelegates[didHash][delegate] =
            DIDDelegate({delegate: delegate, delegateType: delegateType, validUntil: validUntil});

        // Add to delegates list
        didDelegatesList[didHash].push(delegate);

        emit DIDDelegateAdded(did, delegate, delegateType, validUntil);
    }

    /**
     * @dev Removes a delegate from a DID
     * @param did The DID to remove the delegate from
     * @param delegate The address of the delegate to remove
     */
    function removeDidDelegate(string calldata did, address delegate)
        external
        whenNotPausedWithCustomError
        didExists(did)
        didActive(did)
        onlyController(did)
    {
        bytes32 didHash = keccak256(bytes(did));

        // Check if delegate exists
        if (didDelegates[didHash][delegate].delegate == address(0)) {
            revert DidRegistryExtended__DelegateNotFound();
        }

        // Remove delegate
        delete didDelegates[didHash][delegate];

        // Remove from delegates list (this is not gas-efficient, but it's a simple implementation)
        address[] storage delegates = didDelegatesList[didHash];
        for (uint256 i = 0; i < delegates.length; i++) {
            if (delegates[i] == delegate) {
                // Replace with the last element and pop
                delegates[i] = delegates[delegates.length - 1];
                delegates.pop();
                break;
            }
        }

        emit DIDDelegateRemoved(did, delegate);
    }

    /**
     * @dev Performs a signed DID operation
     * @param did The DID to operate on
     * @param operation The operation to perform
     * @param data The data for the operation
     * @param nonce A unique nonce
     * @param timestamp The timestamp of the operation
     * @param signature The signature of the operation
     */
    function performSignedDidOperation(
        string calldata did,
        string calldata operation,
        bytes calldata data,
        bytes32 nonce,
        uint256 timestamp,
        bytes calldata signature
    ) external whenNotPausedWithCustomError didExists(did) didActive(did) {
        // Validate signature
        bool isValid = _validateDidOperationSignature(did, operation, data, nonce, timestamp, signature);
        if (!isValid) revert DidRegistryExtended__InvalidSignature();

        // Perform operation based on the operation type
        if (keccak256(bytes(operation)) == keccak256(bytes("update"))) {
            // Parse data for update operation
            // This is a simplified implementation
            // In a real implementation, we would parse the data and call the appropriate function
        } else if (keccak256(bytes(operation)) == keccak256(bytes("deactivate"))) {
            // Deactivate the DID directly
            _deactivateDid(did);
        } else {
            // Unknown operation
            revert DidRegistryExtended__InvalidSignature();
        }

        emit DIDOperationSigned(did, operation, block.timestamp);
    }

    /*===================== VIEW FUNCTIONS ======================*/
    /**
     * @dev Gets the metadata for a DID
     * @param did The DID to get the metadata for
     * @return name The name of the DID
     * @return description The description of the DID
     * @return imageUrl The image URL of the DID
     * @return attributes The attributes of the DID
     * @return timestamp The timestamp of the metadata
     */
    function getDidMetadata(string calldata did)
        external
        view
        didExists(did)
        returns (
            string memory name,
            string memory description,
            string memory imageUrl,
            string[] memory attributes,
            uint256 timestamp
        )
    {
        bytes32 didHash = keccak256(bytes(did));
        DIDMetadata memory metadata = didMetadata[didHash];

        return (metadata.name, metadata.description, metadata.imageUrl, metadata.attributes, metadata.timestamp);
    }

    /**
     * @dev Gets a delegate for a DID
     * @param did The DID to get the delegate for
     * @param delegate The address of the delegate
     * @return delegateType The type of the delegate
     * @return validUntil The timestamp until which the delegate is valid
     */
    function getDidDelegate(string calldata did, address delegate)
        external
        view
        didExists(did)
        returns (string memory delegateType, uint256 validUntil)
    {
        bytes32 didHash = keccak256(bytes(did));
        DIDDelegate memory didDelegate = didDelegates[didHash][delegate];

        if (didDelegate.delegate == address(0)) {
            revert DidRegistryExtended__DelegateNotFound();
        }

        return (didDelegate.delegateType, didDelegate.validUntil);
    }

    /**
     * @dev Gets all delegates for a DID
     * @param did The DID to get the delegates for
     * @return The list of delegate addresses
     */
    function getDidDelegates(string calldata did) external view didExists(did) returns (address[] memory) {
        bytes32 didHash = keccak256(bytes(did));
        return didDelegatesList[didHash];
    }

    /**
     * @dev Checks if a delegate is valid for a DID
     * @param did The DID to check
     * @param delegate The address of the delegate
     * @return True if the delegate is valid, false otherwise
     */
    function isValidDelegate(string calldata did, address delegate) external view returns (bool) {
        bytes32 didHash = keccak256(bytes(did));
        DIDDelegate memory didDelegate = didDelegates[didHash][delegate];

        return (didDelegate.delegate != address(0) && didDelegate.validUntil > block.timestamp);
    }
}
