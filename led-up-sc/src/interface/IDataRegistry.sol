// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import {DataTypes} from "../library/DataTypes.sol";

interface IDataRegistry {
    /*====================== EVENTS ======================*/
    event RecordAdded(string recordId, bytes producerKey);
    event RecordUpated(string recordId, bytes producerKey);
    event RecordPaused(bool pause, bytes providerKey);
    event ProviderInfoUpdated(address provider, bytes providerKey);
    event NewProviderAddeed(address newProvider, bytes newProviderKey);
    event ProviderRemoved(address provider);

    /*====================== EXTERNAL FUNCTIONS ======================*/

    /**
     * @param _recordId The unique identifier for the medical resource record.
     * @param _producer The address of the producer (creator/owner of the record).
     * @param _signature A cryptographic signature to authenticate the medical resource.
     * @param _resourceType The type of medical resource being registered (e.g., report, document, etc.).
     * @param _consent The consent status for the record, defining the usage rights.
     * @param _metadata Metadata associated with the medical resource, including CID, URL, hash, etc.
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
     * @param _producer The address of the data provider.
     */
    function removeProducerRecord(address _producer) external;

    /**
     * @param _producer The address of the producer (data provider) of the medical record.
     * @param _consumer The address of the consumer (data recipient) requesting access to the record.
     * @param _recordId The unique identifier of the medical record to be shared.
     */
    function shareData(address _producer, address _consumer, string memory _recordId) external;

    /**
     * @param _recordId The unique identifier for the medical resource record.
     * @param _producer The address of the producer (owner of the record).
     * @param _signature A cryptographic signature to authenticate the updated medical resource.
     * @param _resourceType The type of medical resource being updated (e.g., report, document, etc.).
     * @param _status The new status of the record (e.g., active, inactive).
     * @param _consent The updated consent status for the record, defining the usage rights.
     * @param _metadata Updated metadata associated with the medical resource (e.g., CID, URL, hash).
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
     * @param _producer The address of the producer (owner of the record).
     * @param _recordId The unique identifier for the medical resource record.
     * @param _metadata The new metadata for the record, containing CID, URL, hash, etc.
     */
    function updateProducerRecordMetadata(
        address _producer,
        string memory _recordId,
        DataTypes.RecordMetadata memory _metadata
    ) external;

    /**
     * @param _producer The address of the producer (owner of the records).
     * @param _status The new status to assign to the producer's records.
     */
    function updateProducerRecordStatus(address _producer, DataTypes.RecordStatus _status) external;

    /**
     * @param _producer The address of the producer (owner of the records).
     * @param _status The new consent status to assign to the producer's records.
     */
    function updateProducerConsent(address _producer, DataTypes.ConsentStatus _status) external;

    /**
     * @param _metadata The new metadata for the provider, containing the URL and hash.
     */
    function updateProviderMetadata(DataTypes.Metadata memory _metadata) external;

    /**
     * @param _schemaRef The new schema reference for the provider, containing the URL and hash.
     */
    function updateProviderRecordSchema(DataTypes.Schema memory _schemaRef) external;

    /**
     * @param _pause A boolean indicating the desired state: true to pause, false to unpause.
     */
    function changePauseState(bool _pause) external;

    /**
     * @param _tokenAddress The new address of the ERC20 token contract.
     */
    function changeTokenAddress(address _tokenAddress) external;

    /*====================== VIEW FUNCTIONS ======================*/
    /**
     * @param _producer The address of the producer whose record information is to be retrieved.
     *
     * @return DataTypes.RecordInfo A struct containing the producer's address, status, consent status, and nonce.
     */
    function getProducerRecordInfo(address _producer) external view returns (DataTypes.RecordInfo memory);

    /**
     * @param _producer The address of the producer whose record is being retrieved.
     * @param _recordId The unique identifier of the medical record to retrieve.
     *
     * @return DataTypes.Record The medical record associated with the specified producer and record ID.
     */
    function getProducerRecord(address _producer, string memory _recordId)
        external
        view
        returns (DataTypes.Record memory);

    /**
     * @param _producer The address of the producer whose records are being retrieved.
     *
     * @return status The current status of the records associated with the specified producer.
     * @return consentStatus The current consent status of the records associated with the specified producer.
     * @return records An array of records associated with the specified producer.
     * @return recordIds An array of record IDs associated with the specified producer.
     * @return nonce The current count of records (nonce) associated with the specified producer.
     */
    function getProducerRecords(address _producer)
        external
        view
        returns (
            DataTypes.RecordStatus status,
            DataTypes.ConsentStatus consentStatus,
            DataTypes.Record[] memory records,
            string[] memory recordIds,
            uint256 nonce
        );

    /**
     * @param _address The address of the producer whose consent status is being retrieved.
     *
     * @return DataTypes.ConsentStatus The current consent status of the specified producer.
     */
    function getProducerConsent(address _address) external view returns (DataTypes.ConsentStatus);

    /**
     * @param _producer The address of the producer whose record count is being retrieved.
     *
     * @return uint256 The current count of records (nonce) associated with the specified producer.
     */
    function getProducerRecordCount(address _producer) external view returns (uint256);

    /**
     * @return uint256 The total count of records stored in the registry.
     */
    function getTotalRecordsCount() external view returns (uint256);

    /**
     * @param _producer The address of the producer whose record status is being retrieved.
     *
     * @return DataTypes.RecordStatus The current status of the records associated with the specified producer.
     */
    function getProducerRecordStatus(address _producer) external view returns (DataTypes.RecordStatus);

    /**
     * @return DataTypes.Metadata The metadata of the provider, containing the URL and hash.
     */
    function getProviderMetadata() external view returns (DataTypes.Metadata memory);

    /**
     * @return DataTypes.Schema The schema reference for the records, containing the URL and hash.
     */
    function getRecordSchema() external view returns (DataTypes.Schema memory);

    /**
     * @param _producer The address of the data provider or producer.
     */
    function producerExists(address _producer) external view returns (bool);
}
