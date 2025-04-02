// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {DataRegistryCore} from "../core/DataRegistryCore.sol";
import {ValidationLib} from "../libraries/ValidationLib.sol";
import {SecurityLib} from "../libraries/SecurityLib.sol";
import {StorageLib} from "../libraries/StorageLib.sol";

/**
 * @title DataRegistryExtended
 * @dev Extended implementation of the Data registry with additional features
 * @notice This contract extends the core Data registry with additional functionality
 */
contract DataRegistryExtended is DataRegistryCore {
    /*===================== ERRORS ======================*/
    error DataRegistryExtended__InvalidMetadata();
    error DataRegistryExtended__InvalidSignature();
    error DataRegistryExtended__InvalidTimestamp();
    error DataRegistryExtended__InvalidDataType();
    error DataRegistryExtended__InvalidDataSize();
    error DataRegistryExtended__DataAlreadyExists();
    error DataRegistryExtended__DataNotFound();
    error DataRegistryExtended__InvalidDataOwner();

    /*===================== STRUCTS ======================*/
    /**
     * @dev Metadata structure for data entries
     */
    struct DataMetadata {
        string name;
        string description;
        string dataType;
        string[] tags;
        uint256 timestamp;
        uint256 size;
        bool encrypted;
    }

    /**
     * @dev Data access structure
     */
    struct DataAccess {
        address accessor;
        uint256 validUntil;
        bool canRead;
        bool canUpdate;
        bool canDelete;
    }

    /*===================== VARIABLES ======================*/
    // Metadata storage
    mapping(bytes32 => DataMetadata) private dataMetadata;

    // Access control storage
    mapping(bytes32 => mapping(address => DataAccess)) private dataAccess;
    mapping(bytes32 => address[]) private dataAccessList;

    // Used nonces for replay protection
    mapping(bytes32 => bool) private usedNonces;

    /*===================== EVENTS ======================*/
    event DataMetadataUpdated(bytes32 indexed dataId, uint256 timestamp);
    event DataAccessGranted(bytes32 indexed dataId, address indexed accessor, uint256 validUntil);
    event DataAccessRevoked(bytes32 indexed dataId, address indexed accessor);
    event DataOperationSigned(bytes32 indexed dataId, string operation, uint256 timestamp);

    /*===================== CONSTRUCTOR ======================*/
    /**
     * @dev Constructor
     * @param _didRegistry The address of the DID registry
     */
    constructor(address _didRegistry) DataRegistryCore(_didRegistry) {}

    /*===================== EXTERNAL FUNCTIONS ======================*/
    /**
     * @dev Registers data with metadata
     * @param did The DID of the data owner
     * @param dataUri The URI of the data
     * @param dataHash The hash of the data
     * @param name The name of the data
     * @param description The description of the data
     * @param dataType The type of the data
     * @param tags The tags for the data
     * @param size The size of the data in bytes
     * @param encrypted Whether the data is encrypted
     * @return The ID of the registered data
     */
    function registerDataWithMetadata(
        string calldata did,
        string calldata dataUri,
        bytes32 dataHash,
        string calldata name,
        string calldata description,
        string calldata dataType,
        string[] calldata tags,
        uint256 size,
        bool encrypted
    ) external whenNotPausedWithCustomError returns (bytes32) {
        // Register the data
        bytes32 dataId = registerData(did, dataUri, dataHash);

        // Add metadata
        dataMetadata[dataId] = DataMetadata({
            name: name,
            description: description,
            dataType: dataType,
            tags: tags,
            timestamp: block.timestamp,
            size: size,
            encrypted: encrypted
        });

        emit DataMetadataUpdated(dataId, block.timestamp);

        return dataId;
    }

    /**
     * @dev Updates the metadata for data
     * @param dataId The ID of the data
     * @param name The updated name
     * @param description The updated description
     * @param dataType The updated data type
     * @param tags The updated tags
     * @param size The updated size
     * @param encrypted Whether the data is encrypted
     */
    function updateDataMetadata(
        bytes32 dataId,
        string calldata name,
        string calldata description,
        string calldata dataType,
        string[] calldata tags,
        uint256 size,
        bool encrypted
    ) external whenNotPausedWithCustomError dataExists(dataId) onlyDataOwner(dataId) {
        dataMetadata[dataId] = DataMetadata({
            name: name,
            description: description,
            dataType: dataType,
            tags: tags,
            timestamp: block.timestamp,
            size: size,
            encrypted: encrypted
        });

        emit DataMetadataUpdated(dataId, block.timestamp);
    }

    /**
     * @dev Grants access to data
     * @param dataId The ID of the data
     * @param accessor The address to grant access to
     * @param validUntil The timestamp until which the access is valid
     * @param canRead Whether the accessor can read the data
     * @param canUpdate Whether the accessor can update the data
     * @param canDelete Whether the accessor can delete the data
     */
    function grantDataAccess(
        bytes32 dataId,
        address accessor,
        uint256 validUntil,
        bool canRead,
        bool canUpdate,
        bool canDelete
    ) external whenNotPausedWithCustomError dataExists(dataId) onlyDataOwner(dataId) {
        if (accessor == address(0)) revert DataRegistryExtended__InvalidDataOwner();
        if (validUntil <= block.timestamp) revert DataRegistryExtended__InvalidTimestamp();

        // Add or update access
        dataAccess[dataId][accessor] = DataAccess({
            accessor: accessor,
            validUntil: validUntil,
            canRead: canRead,
            canUpdate: canUpdate,
            canDelete: canDelete
        });

        // Add to access list if not already there
        bool found = false;
        address[] storage accessors = dataAccessList[dataId];
        for (uint256 i = 0; i < accessors.length; i++) {
            if (accessors[i] == accessor) {
                found = true;
                break;
            }
        }

        if (!found) {
            dataAccessList[dataId].push(accessor);
        }

        emit DataAccessGranted(dataId, accessor, validUntil);
    }

    /**
     * @dev Revokes access to data
     * @param dataId The ID of the data
     * @param accessor The address to revoke access from
     */
    function revokeDataAccess(bytes32 dataId, address accessor)
        external
        whenNotPausedWithCustomError
        dataExists(dataId)
        onlyDataOwner(dataId)
    {
        // Remove access
        delete dataAccess[dataId][accessor];

        // Remove from access list
        address[] storage accessors = dataAccessList[dataId];
        for (uint256 i = 0; i < accessors.length; i++) {
            if (accessors[i] == accessor) {
                // Replace with the last element and pop
                accessors[i] = accessors[accessors.length - 1];
                accessors.pop();
                break;
            }
        }

        emit DataAccessRevoked(dataId, accessor);
    }

    /**
     * @dev Performs a signed data operation
     * @param dataId The ID of the data
     * @param operation The operation to perform
     * @param data The data for the operation
     * @param nonce A unique nonce
     * @param timestamp The timestamp of the operation
     * @param signature The signature of the operation
     */
    function performSignedDataOperation(
        bytes32 dataId,
        string calldata operation,
        bytes calldata data,
        bytes32 nonce,
        uint256 timestamp,
        bytes calldata signature
    ) external whenNotPausedWithCustomError dataExists(dataId) {
        // Validate signature
        bool isValid = _validateDataOperationSignature(dataId, operation, data, nonce, timestamp, signature);
        if (!isValid) revert DataRegistryExtended__InvalidSignature();

        // Perform operation based on the operation type
        if (keccak256(bytes(operation)) == keccak256(bytes("update"))) {
            // Parse data for update operation
            // This is a simplified implementation
            // In a real implementation, we would parse the data and call the appropriate function
        } else if (keccak256(bytes(operation)) == keccak256(bytes("delete"))) {
            // Delete the data
            deleteData(dataId);
        } else {
            // Unknown operation
            revert DataRegistryExtended__InvalidSignature();
        }

        emit DataOperationSigned(dataId, operation, timestamp);
    }

    /*===================== VIEW FUNCTIONS ======================*/
    /**
     * @dev Gets the metadata for data
     * @param dataId The ID of the data
     * @return name The name of the data
     * @return description The description of the data
     * @return dataType The type of the data
     * @return tags The tags for the data
     * @return timestamp The timestamp of the metadata
     * @return size The size of the data
     * @return encrypted Whether the data is encrypted
     */
    function getDataMetadata(bytes32 dataId)
        external
        view
        dataExists(dataId)
        returns (
            string memory name,
            string memory description,
            string memory dataType,
            string[] memory tags,
            uint256 timestamp,
            uint256 size,
            bool encrypted
        )
    {
        DataMetadata memory metadata = dataMetadata[dataId];

        return (
            metadata.name,
            metadata.description,
            metadata.dataType,
            metadata.tags,
            metadata.timestamp,
            metadata.size,
            metadata.encrypted
        );
    }

    /**
     * @dev Gets the access details for data
     * @param dataId The ID of the data
     * @param accessor The address to check access for
     * @return validUntil The timestamp until which the access is valid
     * @return canRead Whether the accessor can read the data
     * @return canUpdate Whether the accessor can update the data
     * @return canDelete Whether the accessor can delete the data
     */
    function getDataAccess(bytes32 dataId, address accessor)
        external
        view
        dataExists(dataId)
        returns (uint256 validUntil, bool canRead, bool canUpdate, bool canDelete)
    {
        DataAccess memory access = dataAccess[dataId][accessor];

        return (access.validUntil, access.canRead, access.canUpdate, access.canDelete);
    }

    /**
     * @dev Gets all accessors for data
     * @param dataId The ID of the data
     * @return The list of accessor addresses
     */
    function getDataAccessors(bytes32 dataId) external view dataExists(dataId) returns (address[] memory) {
        return dataAccessList[dataId];
    }

    /**
     * @dev Checks if an address has access to data
     * @param dataId The ID of the data
     * @param accessor The address to check
     * @param accessType The type of access to check (1 = read, 2 = update, 3 = delete)
     * @return True if the address has the specified access, false otherwise
     */
    function hasDataAccess(bytes32 dataId, address accessor, uint8 accessType)
        external
        view
        dataExists(dataId)
        returns (bool)
    {
        DataAccess memory access = dataAccess[dataId][accessor];

        // Check if access is valid
        if (access.accessor == address(0) || access.validUntil <= block.timestamp) {
            return false;
        }

        // Check access type
        if (accessType == 1) {
            return access.canRead;
        } else if (accessType == 2) {
            return access.canUpdate;
        } else if (accessType == 3) {
            return access.canDelete;
        }

        return false;
    }

    /*===================== INTERNAL FUNCTIONS ======================*/
    /**
     * @dev Gets the owner of a data record
     * @param dataId The ID of the data
     * @return The address of the data owner
     */
    function getDataOwner(bytes32 dataId) internal view returns (address) {
        // In a real implementation, this would retrieve the owner from the data record
        // For this example, we'll use a simplified approach
        StorageLib.HealthRecord memory record = getHealthRecord(address(0), bytes32ToString(dataId));
        return record.producer;
    }

    /**
     * @dev Converts a bytes32 to a string
     * @param _bytes32 The bytes32 to convert
     * @return The string representation
     */
    function bytes32ToString(bytes32 _bytes32) internal pure returns (string memory) {
        bytes memory bytesArray = new bytes(32);
        for (uint256 i = 0; i < 32; i++) {
            bytesArray[i] = _bytes32[i];
        }
        return string(bytesArray);
    }

    /**
     * @dev Validates a signed data operation
     * @param dataId The ID of the data
     * @param operation The operation to validate
     * @param data The data for the operation
     * @param nonce A unique nonce
     * @param timestamp The timestamp of the operation
     * @param signature The signature of the operation
     * @return True if the signature is valid, false otherwise
     */
    function _validateDataOperationSignature(
        bytes32 dataId,
        string calldata operation,
        bytes calldata data,
        bytes32 nonce,
        uint256 timestamp,
        bytes calldata signature
    ) internal returns (bool) {
        // Check if nonce has been used
        if (!SecurityLib.validateNonce(usedNonces, nonce)) {
            return false;
        }

        // Check if timestamp is valid (within 5 minutes)
        if (!SecurityLib.validateTimestamp(timestamp, 5 minutes)) {
            return false;
        }

        // Get the data owner
        address owner = getDataOwner(dataId);
        if (owner == address(0)) return false;

        // Create the message hash
        bytes32 messageHash = keccak256(abi.encodePacked(dataId, operation, keccak256(data), nonce, timestamp));

        // Verify the signature
        return SecurityLib.validateSignature(messageHash, signature, owner);
    }
}
