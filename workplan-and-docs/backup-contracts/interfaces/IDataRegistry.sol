// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {StorageLib} from "../libraries/StorageLib.sol";

/**
 * @title IDataRegistry
 * @dev Interface for the Data Registry contract
 * @notice This interface defines the standard functions for data record management
 */
interface IDataRegistry {
    /*===================== ERRORS ======================*/
    error DataRegistry__ProducerNotFound(address producer);
    error DataRegistry__Unauthorized();
    error DataRegistry__RecordNotFound(string recordId);
    error DataRegistry__InvalidRecordId();
    error DataRegistry__InvalidMetadata();
    error DataRegistry__InvalidConsumer(address consumer);
    error DataRegistry__InvalidProducer(address producer);
    error DataRegistry__InvalidProvider(address provider);
    error DataRegistry__InvalidDid(string did);
    error DataRegistry__AlreadyRegistered(address producer);

    /*===================== EVENTS ======================*/
    /**
     * @dev Emitted when a producer is registered
     * @param producer The address of the producer
     * @param timestamp The timestamp of the registration
     */
    event ProducerRegistered(address indexed producer, uint256 timestamp);

    /**
     * @dev Emitted when a health record is created
     * @param recordId The ID of the record
     * @param producer The address of the producer
     * @param timestamp The timestamp of the creation
     */
    event HealthRecordCreated(string indexed recordId, address indexed producer, uint256 timestamp);

    /**
     * @dev Emitted when a health record is updated
     * @param recordId The ID of the record
     * @param producer The address of the producer
     * @param timestamp The timestamp of the update
     */
    event HealthRecordUpdated(string indexed recordId, address indexed producer, uint256 timestamp);

    /**
     * @dev Emitted when a health record is deleted
     * @param recordId The ID of the record
     * @param producer The address of the producer
     * @param timestamp The timestamp of the deletion
     */
    event HealthRecordDeleted(string indexed recordId, address indexed producer, uint256 timestamp);

    /**
     * @dev Emitted when a consumer is authorized to access a record
     * @param recordId The ID of the record
     * @param consumerDid The DID of the authorized consumer
     * @param producerDid The DID of the producer
     * @param timestamp The timestamp of the authorization
     */
    event ConsumerAuthorized(
        string indexed recordId, string indexed consumerDid, string producerDid, uint256 timestamp
    );

    /**
     * @dev Emitted when a consumer's authorization is revoked
     * @param recordId The ID of the record
     * @param consumerDid The DID of the consumer
     * @param producerDid The DID of the producer
     * @param timestamp The timestamp of the revocation
     */
    event ConsumerAuthorizationRevoked(
        string indexed recordId, string indexed consumerDid, string producerDid, uint256 timestamp
    );

    /*===================== FUNCTIONS ======================*/
    /**
     * @dev Registers a producer
     * @param _producer The address of the producer to register
     * @param _did The DID of the producer
     */
    function registerProducer(address _producer, string calldata _did) external;

    /**
     * @dev Creates a health record
     * @param _recordId The ID of the record
     * @param _metadata The metadata of the record
     */
    function createHealthRecord(string calldata _recordId, string calldata _metadata) external;

    /**
     * @dev Updates a health record
     * @param _recordId The ID of the record
     * @param _metadata The updated metadata of the record
     */
    function updateHealthRecord(string calldata _recordId, string calldata _metadata) external;

    /**
     * @dev Deletes a health record
     * @param _recordId The ID of the record
     */
    function deleteHealthRecord(string calldata _recordId) external;

    /**
     * @dev Authorizes a consumer to access a record
     * @param _recordId The ID of the record
     * @param _consumerDid The DID of the consumer to authorize
     */
    function authorizeConsumer(string calldata _recordId, string calldata _consumerDid) external;

    /**
     * @dev Revokes a consumer's authorization to access a record
     * @param _recordId The ID of the record
     * @param _consumerDid The DID of the consumer
     */
    function revokeConsumerAuthorization(string calldata _recordId, string calldata _consumerDid) external;

    /**
     * @dev Gets a health record
     * @param _producer The address of the producer
     * @param _recordId The ID of the record
     * @return The health record
     */
    function getHealthRecord(address _producer, string calldata _recordId)
        external
        view
        returns (StorageLib.HealthRecord memory);

    /**
     * @dev Gets all record IDs for a producer
     * @param _producer The address of the producer
     * @return An array of record IDs
     */
    function getProducerRecordIds(address _producer) external view returns (string[] memory);

    /**
     * @dev Checks if a consumer is authorized to access a record
     * @param _recordId The ID of the record
     * @param _consumerDid The DID of the consumer
     * @return True if the consumer is authorized, false otherwise
     */
    function isConsumerAuthorized(string calldata _recordId, string calldata _consumerDid)
        external
        view
        returns (bool);

    /**
     * @dev Sets the provider metadata
     * @param _name The name of the provider
     * @param _description The description of the provider
     * @param _schema The schema of the provider
     */
    function setProviderMetadata(string calldata _name, string calldata _description, string calldata _schema)
        external;

    /**
     * @dev Sets the record schema
     * @param _name The name of the schema
     * @param _description The description of the schema
     * @param _schema The schema definition
     */
    function setRecordSchema(string calldata _name, string calldata _description, string calldata _schema) external;

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
        returns (string memory name, string memory description, string memory schema, uint256 timestamp);

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
        returns (string memory name, string memory description, string memory schema, uint256 timestamp);
}
