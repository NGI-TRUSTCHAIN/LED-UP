// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {BaseContract} from "../base/BaseContract.sol";
import {IDataRegistry} from "../interfaces/IDataRegistry.sol";
import {StorageLib} from "../libraries/StorageLib.sol";
import {GasLib} from "../libraries/GasLib.sol";
import {StringLib} from "../libraries/StringLib.sol";
import {IDidAuth} from "../interfaces/IDidAuth.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title DataRegistryOptimized
 * @dev Gas-optimized version of the DataRegistry contract
 * @notice This contract manages data records with enhanced DID-based authentication and authorization
 */
contract DataRegistryOptimized is BaseContract, IDataRegistry {
    /*===================== CONSTANTS ======================*/
    // Flags for producer status
    uint8 private constant FLAG_REGISTERED = 0;
    uint8 private constant FLAG_ACTIVE = 1;
    uint8 private constant FLAG_VERIFIED = 2;

    /*===================== VARIABLES ======================*/
    IDidAuth public didAuth;
    IERC20 private token;
    address private compensationAddress;

    uint256 private recordCount = 0;
    StorageLib.Metadata private providerMetadata;
    StorageLib.Metadata private recordSchema;

    // Optimized storage using bytes32 hashes and packed data
    mapping(address => StorageLib.DataRecordCore) private records;
    mapping(address => bytes32[]) private recordIdHashes;
    mapping(address => mapping(bytes32 => StorageLib.HealthRecordOptimized)) private healthRecords;
    mapping(bytes32 => mapping(bytes32 => bool)) private authorizedConsumers;

    // DID to address mappings for reverse lookups
    mapping(bytes32 => address) private didHashToAddress;
    mapping(address => bytes32) private addressToDidHash;

    // Producer flags for gas-efficient status tracking
    mapping(address => uint256) private producerFlags;

    /*===================== MODIFIERS ======================*/

    /**
     * @dev Ensures the caller is the provider or the producer
     * @param _producer The address of the producer
     */
    modifier onlyProviderOrProducer(address _producer) {
        if (!GasLib.unpackBoolean(producerFlags[_producer], FLAG_REGISTERED)) {
            revert DataRegistry__ProducerNotFound(_producer);
        }

        if (msg.sender != owner() && msg.sender != _producer) {
            revert DataRegistry__Unauthorized();
        }
        _;
    }

    /**
     * @dev Ensures the producer is registered
     * @param _producer The address of the producer
     */
    modifier producerExists(address _producer) {
        if (!GasLib.unpackBoolean(producerFlags[_producer], FLAG_REGISTERED)) {
            revert DataRegistry__ProducerNotFound(_producer);
        }
        _;
    }

    /**
     * @dev Ensures the record exists
     * @param _producer The address of the producer
     * @param _recordIdHash The hash of the record ID
     */
    modifier recordExists(address _producer, bytes32 _recordIdHash) {
        if (healthRecords[_producer][_recordIdHash].producer == address(0)) {
            revert DataRegistry__RecordNotFound("Record not found");
        }
        _;
    }

    /*===================== CONSTRUCTOR ======================*/
    /**
     * @dev Constructor
     * @param _didAuthAddress The address of the DidAuth contract
     * @param _tokenAddress The address of the token contract
     * @param _compensationAddress The address of the Compensation contract
     */
    constructor(address _didAuthAddress, address _tokenAddress, address _compensationAddress)
        validAddress(_didAuthAddress)
        validAddress(_tokenAddress)
        validAddress(_compensationAddress)
    {
        didAuth = IDidAuth(_didAuthAddress);
        token = IERC20(_tokenAddress);
        compensationAddress = _compensationAddress;
    }

    /*===================== EXTERNAL FUNCTIONS ======================*/
    /**
     * @dev Registers a producer
     * @param _producer The address of the producer to register
     * @param _did The DID of the producer
     */
    function registerProducer(address _producer, string calldata _did)
        external
        override
        onlyProducer
        validAddress(_producer)
        nonEmptyString(_did)
        whenNotPausedWithCustomError
    {
        if (GasLib.unpackBoolean(producerFlags[_producer], FLAG_REGISTERED)) {
            revert DataRegistry__AlreadyRegistered(_producer);
        }

        bytes32 didHash = keccak256(bytes(_did));

        // Set producer as registered
        producerFlags[_producer] = GasLib.setFlag(producerFlags[_producer], FLAG_REGISTERED, true);
        producerFlags[_producer] = GasLib.setFlag(producerFlags[_producer], FLAG_ACTIVE, true);

        // Store producer record
        records[_producer] =
            StorageLib.DataRecordCore({producer: _producer, timestamp: block.timestamp, registered: true});

        // Store DID mappings
        didHashToAddress[didHash] = _producer;
        addressToDidHash[_producer] = didHash;

        emit ProducerRegistered(_producer, block.timestamp);
    }

    /**
     * @dev Creates a health record
     * @param _recordId The ID of the record
     * @param _metadata The metadata of the record
     */
    function createHealthRecord(string calldata _recordId, string calldata _metadata)
        external
        override
        whenNotPausedWithCustomError
        nonEmptyString(_recordId)
        nonEmptyString(_metadata)
    {
        if (!GasLib.unpackBoolean(producerFlags[msg.sender], FLAG_REGISTERED)) {
            revert DataRegistry__ProducerNotFound(msg.sender);
        }

        bytes32 recordIdHash = keccak256(bytes(_recordId));
        bytes32 metadataHash = keccak256(bytes(_metadata));

        if (healthRecords[msg.sender][recordIdHash].producer != address(0)) {
            revert DataRegistry__InvalidRecordId();
        }

        // Store optimized health record
        healthRecords[msg.sender][recordIdHash] = StorageLib.HealthRecordOptimized({
            idHash: recordIdHash,
            producer: msg.sender,
            metadataHash: metadataHash,
            timestamp: uint40(block.timestamp),
            active: true
        });

        // Store record ID hash
        recordIdHashes[msg.sender].push(recordIdHash);

        // Increment record count
        recordCount++;

        emit HealthRecordCreated(_recordId, msg.sender, block.timestamp);
    }

    /**
     * @dev Updates a health record
     * @param _recordId The ID of the record
     * @param _metadata The updated metadata of the record
     */
    function updateHealthRecord(string calldata _recordId, string calldata _metadata)
        external
        override
        whenNotPausedWithCustomError
        nonEmptyString(_recordId)
        nonEmptyString(_metadata)
    {
        bytes32 recordIdHash = keccak256(bytes(_recordId));
        bytes32 metadataHash = keccak256(bytes(_metadata));

        if (healthRecords[msg.sender][recordIdHash].producer == address(0)) {
            revert DataRegistry__RecordNotFound(_recordId);
        }

        // Update health record
        healthRecords[msg.sender][recordIdHash].metadataHash = metadataHash;
        healthRecords[msg.sender][recordIdHash].timestamp = uint40(block.timestamp);

        emit HealthRecordUpdated(_recordId, msg.sender, block.timestamp);
    }

    /**
     * @dev Deletes a health record
     * @param _recordId The ID of the record
     */
    function deleteHealthRecord(string calldata _recordId)
        external
        override
        whenNotPausedWithCustomError
        nonEmptyString(_recordId)
    {
        bytes32 recordIdHash = keccak256(bytes(_recordId));

        if (healthRecords[msg.sender][recordIdHash].producer == address(0)) {
            revert DataRegistry__RecordNotFound(_recordId);
        }

        // Mark record as inactive
        healthRecords[msg.sender][recordIdHash].active = false;

        emit HealthRecordDeleted(_recordId, msg.sender, block.timestamp);
    }

    /**
     * @dev Authorizes a consumer to access a record
     * @param _recordId The ID of the record
     * @param _consumerDid The DID of the consumer to authorize
     */
    function authorizeConsumer(string calldata _recordId, string calldata _consumerDid)
        external
        override
        whenNotPausedWithCustomError
        nonEmptyString(_recordId)
        nonEmptyString(_consumerDid)
    {
        bytes32 recordIdHash = keccak256(bytes(_recordId));
        bytes32 consumerDidHash = keccak256(bytes(_consumerDid));

        if (healthRecords[msg.sender][recordIdHash].producer == address(0)) {
            revert DataRegistry__RecordNotFound(_recordId);
        }

        // Authorize consumer
        authorizedConsumers[recordIdHash][consumerDidHash] = true;

        // Get producer DID
        bytes32 producerDidHash = addressToDidHash[msg.sender];

        string memory producerDid = didAuth.getDidByAddress(msg.sender);

        emit ConsumerAuthorized(_recordId, _consumerDid, producerDid, block.timestamp);
    }

    /**
     * @dev Revokes a consumer's authorization to access a record
     * @param _recordId The ID of the record
     * @param _consumerDid The DID of the consumer
     */
    function revokeConsumerAuthorization(string calldata _recordId, string calldata _consumerDid)
        external
        override
        whenNotPausedWithCustomError
        nonEmptyString(_recordId)
        nonEmptyString(_consumerDid)
    {
        bytes32 recordIdHash = keccak256(bytes(_recordId));
        bytes32 consumerDidHash = keccak256(bytes(_consumerDid));

        if (healthRecords[msg.sender][recordIdHash].producer == address(0)) {
            revert DataRegistry__RecordNotFound(_recordId);
        }

        // Revoke consumer authorization
        authorizedConsumers[recordIdHash][consumerDidHash] = false;

        // Get producer DID
        string memory producerDid = didAuth.getDidByAddress(msg.sender);

        emit ConsumerAuthorizationRevoked(_recordId, _consumerDid, producerDid, block.timestamp);
    }

    /**
     * @dev Sets the provider metadata
     * @param _name The name of the provider
     * @param _description The description of the provider
     * @param _schema The schema of the provider
     */
    function setProviderMetadata(string calldata _name, string calldata _description, string calldata _schema)
        external
        override
        onlyOwner
        whenNotPausedWithCustomError
        nonEmptyString(_name)
        nonEmptyString(_description)
        nonEmptyString(_schema)
    {
        providerMetadata =
            StorageLib.Metadata({name: _name, description: _description, schema: _schema, timestamp: block.timestamp});
    }

    /**
     * @dev Sets the record schema
     * @param _name The name of the schema
     * @param _description The description of the schema
     * @param _schema The schema definition
     */
    function setRecordSchema(string calldata _name, string calldata _description, string calldata _schema)
        external
        override
        onlyOwner
        whenNotPausedWithCustomError
        nonEmptyString(_name)
        nonEmptyString(_description)
        nonEmptyString(_schema)
    {
        recordSchema =
            StorageLib.Metadata({name: _name, description: _description, schema: _schema, timestamp: block.timestamp});
    }

    /*===================== VIEW FUNCTIONS ======================*/
    /**
     * @dev Gets a health record
     * @param _producer The address of the producer
     * @param _recordId The ID of the record
     * @return The health record
     */
    function getHealthRecord(address _producer, string calldata _recordId)
        external
        view
        override
        producerExists(_producer)
        returns (StorageLib.HealthRecord memory)
    {
        bytes32 recordIdHash = keccak256(bytes(_recordId));
        StorageLib.HealthRecordOptimized memory optimizedRecord = healthRecords[_producer][recordIdHash];

        if (optimizedRecord.producer == address(0)) {
            revert DataRegistry__RecordNotFound(_recordId);
        }

        // Convert optimized record to standard record for external interface
        return StorageLib.HealthRecord({
            id: _recordId,
            producer: optimizedRecord.producer,
            metadata: "", // Metadata is stored as a hash, so we return an empty string
            timestamp: optimizedRecord.timestamp,
            active: optimizedRecord.active
        });
    }

    /**
     * @dev Gets all record IDs for a producer
     * @param _producer The address of the producer
     * @return An array of record IDs
     */
    function getProducerRecordIds(address _producer)
        external
        view
        override
        producerExists(_producer)
        returns (string[] memory)
    {
        // This function is not optimized for gas efficiency since it's a view function
        // and needs to return the original record IDs which are not stored directly

        // For a production implementation, we would need to store the original record IDs
        // or implement a way to reverse the hash function

        // For now, we return an empty array as a placeholder
        string[] memory emptyArray = new string[](0);
        return emptyArray;
    }

    /**
     * @dev Checks if a consumer is authorized to access a record
     * @param _recordId The ID of the record
     * @param _consumerDid The DID of the consumer
     * @return True if the consumer is authorized, false otherwise
     */
    function isConsumerAuthorized(string calldata _recordId, string calldata _consumerDid)
        external
        view
        override
        returns (bool)
    {
        bytes32 recordIdHash = keccak256(bytes(_recordId));
        bytes32 consumerDidHash = keccak256(bytes(_consumerDid));

        return authorizedConsumers[recordIdHash][consumerDidHash];
    }

    /**
     * @dev Gets the provider metadata
     * @return name The name of the provider
     * @return description The description of the provider
     * @return schema The schema of the provider
     * @return timestamp The timestamp of the metadata
     */
    function getProviderMetadata()
        external
        view
        override
        returns (string memory name, string memory description, string memory schema, uint256 timestamp)
    {
        return
            (providerMetadata.name, providerMetadata.description, providerMetadata.schema, providerMetadata.timestamp);
    }

    /**
     * @dev Gets the record schema
     * @return name The name of the schema
     * @return description The description of the schema
     * @return schema The schema definition
     * @return timestamp The timestamp of the schema
     */
    function getRecordSchema()
        external
        view
        override
        returns (string memory name, string memory description, string memory schema, uint256 timestamp)
    {
        return (recordSchema.name, recordSchema.description, recordSchema.schema, recordSchema.timestamp);
    }
}
