// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import {DataTypes} from "../library/DataTypes.sol";

interface IDataRegistry {
    /**************** EVENTS *****************/
    event RecordAdded(string recordId, bytes producerKey);
    event RecordUpated(string recordId, bytes producerKey);
    event RecordPaused(bool pause, bytes providerKey);
    event ProviderInfoUpdated(address provider, bytes providerKey);
    event NewProviderAddeed(address newProvider, bytes newProviderKey);
    event ProviderRemoved(address provider);

    /***************** EXTERNAL FUNCTIONS *****************/
    /**
     * @dev Registers a new record in the data registry.
     * @param _recordId The unique identifier for the record.
     * @param _producer The address of the data provider.
     * @param _signature The signature of the record.
     * @param _resourceType The type of the resource associated with the record.
     * @param _consent The consent status of the record.
     * @param _metadata The URL of the metadata associated with the record.
     */
    function registerProducerRecord(
        string memory _recordId,
        address _producer,
        bytes memory _signature,
        string memory _resourceType,
        DataTypes.ConsentStatus _consent,
        DataTypes.RecordMetadata memory _metadata
    ) external;

    /**
     * @dev Removes a record associated with the specified data provider.
     * @param _producer The address of the data provider.
     */
    function removeProducerRecord(address _producer) external;

    /**
     * @dev Shares data between a producer and a consumer. It verifies payment to the data provider for the data record,
     *  and checks the consent status. If all checks pass, it emits an event indicating that data has been shared:
     * - throwsRegistry__InvalidInputParam if the data consumer is invalid.
     * - throws Registry__ProducerNotFound if the data producer is not found.
     * - throws Registry__PaymentNotVerified if payment verification fails.
     * - throws Registry__ConsentNotAllowed if consent is not allowed.
     * - throws Registry__ProducerRecordNotFound if the data record is not found.
     * @param _producer The address of the data producer.
     * @param _consumer The address of the data consumer.
     * @param _recordId The ID of the data record to be shared.
     */
    function shareData(
        address _producer,
        address _consumer,
        string memory _recordId
    ) external;

    /**
     * @dev Updates a record in the data registry.
     * @param _recordId The unique identifier of the record.
     * @param _producer The address of the data provider.
     * @param _signature The signature of the record.
     * @param _resourceType The type of the resource.
     * @param _status The status of the record.
     * @param _consent The consent status of the record.
     * @param _metadata The URL of the metadata associated with the record.
     */
    function updateProducerRecord(
        string memory _recordId,
        address _producer,
        bytes memory _signature,
        string memory _resourceType,
        DataTypes.RecordStatus _status,
        DataTypes.ConsentStatus _consent,
        DataTypes.RecordMetadata memory _metadata
    ) external;

    /**
     * @dev Updates the metadata URL for a specific record owned by a data provider.
     * @param _producer The address of the data provider.
     * @param _recordId The ID of the record.
     * @param _metadata The new metadata URL for the record.
     */
    function updateProducerRecordMetadata(
        address _producer,
        string memory _recordId,
        DataTypes.RecordMetadata memory _metadata
    ) external;

    /**
     * @dev Updates the status of a record for a given data provider.
     * @param _producer The address of the data provider.
     * @param _status The new status of the record.
     */
    function updateProducerRecordStatus(
        address _producer,
        DataTypes.RecordStatus _status
    ) external;

    /**
     * @dev Updates the consent status of a data provider.
     * @param _producer The address of the data provider.
     * @param status The new consent status.
     */
    function updateProducerConsent(
        address _producer,
        DataTypes.ConsentStatus status
    ) external;

    /**
     * @dev Updates the provider metadata with the provided metadata URL.
     * @param _metadata The metadata URL to be updated.
     */
    function updateProviderMetadata(
        DataTypes.Metadata memory _metadata
    ) external;

    /**
     * @dev Updates the record schema for the data registry.
     * @param schemaRef The reference to the new schema.
     */
    function updateProviderRecordSchema(
        DataTypes.Schema memory schemaRef
    ) external;

    /**
     * @dev Changes the pause state of the data registry.
     * @param pause A boolean value indicating whether to pause or resume the data registry.
     */
    function changePauseState(bool pause) external;

    /****************** GETTER FUNCTIONS *****************/
    /**
     * @dev Retrieves information about a specific record owned by a data provider.
     * @param _producer The address of the data provider.
     * @return record The information about the record.
     */
    function getProducerRecordInfo(
        address _producer
    ) external view returns (DataTypes.RecordInfo memory);

    /**
     * @dev Retrieves the metadata URL associated with a specific data provider and record ID.
     * @param _producer The address of the data provider.
     * @param _recordId The ID of the record.
     * @return The metadata URL associated with the data provider and record ID.
     */
    function getProducerRecord(
        address _producer,
        string memory _recordId
    ) external view returns (DataTypes.Record memory);

    /**
     * @dev Retrieves the consent status for a given address.
     * @param _address The address for which to retrieve the consent status.
     * @return The consent status of the given address.
     */
    function getProducerConsent(
        address _address
    ) external view returns (DataTypes.ConsentStatus);

    /**
     * @dev Retrieves the count of producer records for a given record ID.
     * @param _producer The ID of the record to retrieve the count for.
     * @return The number of producer records associated with the given record ID.
     */
    function getProducerRecordCount(
        address _producer
    ) external view returns (uint256);

    /**
     * @dev Returns the total number of records in the data registry.
     * @return The total number of records.
     */
    function getTotalRecordsCount() external view returns (uint256);

    /**
     * @dev Retrieves the status of a producer record.
     * @param _producer The address of the producer.
     * @return The status of the producer record.
     */
    function getProducerRecordStatus(
        address _producer
    ) external view returns (DataTypes.RecordStatus);

    /**
     * @dev Retrieves the provider metadata.
     *
     */
    function getProviderMetadata()
        external
        view
        returns (DataTypes.Metadata memory);

    /**
     * @dev Retrieves the record schema from the data registry.
     * @return The record schema as a `DataTypes.SchemaRef` struct.
     */
    function getRecordSchema() external view returns (DataTypes.Schema memory);

    /**
     *  @dev Checks if a producer exists in the data registry.
     * @param _producer The address of the data provider or producer.
     */
    function producerExists(address _producer) external view returns (bool);
}
