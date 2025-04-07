// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {BaseContract} from "../base/BaseContract.sol";
import {IDataRegistry} from "../interfaces/IDataRegistry.sol";
import {StorageLib} from "../libraries/StorageLib.sol";
import {ValidationLib} from "../libraries/ValidationLib.sol";
import {SecurityLib} from "../libraries/SecurityLib.sol";
import {IDidRegistry} from "../interfaces/IDidRegistry.sol";

/**
 * @title DataRegistryCore
 * @dev Core implementation of the data registry
 * @notice This contract provides the core functionality for managing health records
 */
contract DataRegistryCore is BaseContract, IDataRegistry {
    /*===================== ERRORS ======================*/
    // Errors are already defined in the IDataRegistry interface

    /*===================== VARIABLES ======================*/
    IDidRegistry public didRegistry;

    uint256 private recordCount = 0;
    StorageLib.Metadata private providerMetadata;
    StorageLib.Metadata private recordSchema;

    // Primary storage
    mapping(address => StorageLib.DataRecordCore) private records;
    mapping(address => string[]) private ids;
    mapping(address => mapping(string => StorageLib.HealthRecord)) private healthRecords;
    mapping(string => mapping(string => bool)) private authorizedConsumers;

    // DID to address mappings for reverse lookups
    mapping(string => address) private didToAddress;

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
     * @dev Ensures the caller is either the provider or the producer
     * @param _producer The address of the producer
     */
    modifier onlyProviderOrProducer(address _producer) {
        if (records[_producer].producer == address(0)) {
            revert DataRegistry__ProducerNotFound(_producer);
        }

        if (msg.sender != owner() && msg.sender != _producer) {
            revert DataRegistry__Unauthorized();
        }
        _;
    }

    /**
     * @dev Ensures the producer exists
     * @param _producer The address of the producer
     */
    modifier producerExists(address _producer) {
        if (records[_producer].producer == address(0)) {
            revert DataRegistry__ProducerNotFound(_producer);
        }
        _;
    }

    /**
     * @dev Ensures the record exists
     * @param _producer The address of the producer
     * @param _recordId The ID of the record
     */
    modifier recordExists(address _producer, string calldata _recordId) {
        if (bytes(healthRecords[_producer][_recordId].id).length == 0) {
            revert DataRegistry__RecordNotFound(_recordId);
        }
        _;
    }

    /*===================== EXTERNAL FUNCTIONS ======================*/
    /**
     * @dev Registers a producer
     * @param _producer The address of the producer to register
     * @param _did The DID of the producer
     */
    function registerProducer(address _producer, string calldata _did)
        public
        override
        onlyOwner
        validAddress(_producer)
        whenNotPausedWithCustomError
    {
        // Check if producer is already registered
        if (records[_producer].producer != address(0)) {
            revert DataRegistry__AlreadyRegistered(_producer);
        }

        // Check if DID is valid and active
        if (!didRegistry.isActive(_did)) {
            revert DataRegistry__InvalidDid(_did);
        }

        // Store producer record
        records[_producer] =
            StorageLib.DataRecordCore({producer: _producer, timestamp: block.timestamp, registered: true});

        // Store DID mapping
        didToAddress[_did] = _producer;

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
    {
        // Check if producer is registered
        if (records[msg.sender].producer == address(0)) {
            revert DataRegistry__ProducerNotFound(msg.sender);
        }

        // Check if record ID is valid
        if (!ValidationLib.validateRecordId(_recordId)) {
            revert DataRegistry__InvalidRecordId();
        }

        // Check if metadata is valid
        if (!ValidationLib.validateMetadata(_metadata)) {
            revert DataRegistry__InvalidMetadata();
        }

        // Check if record already exists
        if (bytes(healthRecords[msg.sender][_recordId].id).length > 0) {
            revert DataRegistry__InvalidRecordId();
        }

        // Store health record
        healthRecords[msg.sender][_recordId] = StorageLib.HealthRecord({
            id: _recordId,
            producer: msg.sender,
            metadata: _metadata,
            timestamp: block.timestamp,
            active: true
        });

        // Store record ID
        ids[msg.sender].push(_recordId);

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
        recordExists(msg.sender, _recordId)
    {
        // Check if metadata is valid
        if (!ValidationLib.validateMetadata(_metadata)) {
            revert DataRegistry__InvalidMetadata();
        }

        // Update health record
        healthRecords[msg.sender][_recordId].metadata = _metadata;
        healthRecords[msg.sender][_recordId].timestamp = block.timestamp;

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
        recordExists(msg.sender, _recordId)
    {
        // Mark record as inactive
        healthRecords[msg.sender][_recordId].active = false;

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
        recordExists(msg.sender, _recordId)
    {
        // Check if consumer DID is valid and active
        if (!didRegistry.isActive(_consumerDid)) {
            revert DataRegistry__InvalidDid(_consumerDid);
        }

        // Get producer DID
        string memory producerDid = didRegistry.getDidByAddress(msg.sender);

        // Authorize consumer
        authorizedConsumers[_recordId][_consumerDid] = true;

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
        recordExists(msg.sender, _recordId)
    {
        // Get producer DID
        string memory producerDid = didRegistry.getDidByAddress(msg.sender);

        // Revoke consumer authorization
        authorizedConsumers[_recordId][_consumerDid] = false;

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
        recordExists(_producer, _recordId)
        returns (StorageLib.HealthRecord memory)
    {
        return healthRecords[_producer][_recordId];
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
        return ids[_producer];
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
        return authorizedConsumers[_recordId][_consumerDid];
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
