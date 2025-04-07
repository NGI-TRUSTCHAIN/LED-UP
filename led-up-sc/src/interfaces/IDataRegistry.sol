// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import {DataTypes} from "../library/DataTypes.sol";

interface IDataRegistry {
    /*===================== ERRORS ======================*/
    error DataRegistry__Unauthorized();
    error DataRegistry__InvalidRecord();
    error DataRegistry__RecordNotFound(string recordId);
    error DataRegistry__ProducerNotFound(address producer);
    error DataRegistry__RecordAlreadyExists();
    error DataRegistry__RecordNotActive();
    error DataRegistry__InvalidDID();

    error DataRegistry__InvalidInputParam();
    error DataRegistry__ServicePaused();
    // error DataRegistry__ConsentNotAllowed(ConsentStatus consent);
    error DataRegistry__PaymentNotVerified();
    error DataRegistry__ConsentAlreadyGranted();
    error DataRegistry__ConsentAlreadyRevoked();
    error DataRegistry__ConsentNotAllowed(string recordId, address producer);

    error DataRegistry__UnauthorizedConsumer();
    error DataRegistry__UnauthorizedProducer();
    error DataRegistry__UnauthorizedServiceProvider();
    error DataRegistry__UnauthorizedVerifier();

    /*===================== VARIABLES ======================*/
    struct Metadata {
        string url;
        bytes32 hash;
    }

    struct Schema {
        Metadata schemaRef;
    }

    struct RecordMetadata {
        string cid;
        string url;
        bytes32 hash;
    }

    enum RecordStatus {
        Active,
        Deactivated,
        Suspended,
        Error,
        Unknown
    }

    enum ConsentStatus {
        Allowed,
        Denied,
        Pending
    }

    // Core record data - main properties
    struct DataRecordCore {
        string ownerDid;
        address producer;
        RecordStatus status;
        ConsentStatus consent;
        bool isActive;
        uint256 updatedAt;
        uint256 nonce;
    }

    // Health record data
    struct HealthRecord {
        bytes signature;
        string resourceType;
        string cid;
        string url;
        bytes32 hash;
        bool isVerified;
    }

    /*===================== EVENTS ======================*/
    event DataRegistered(string indexed recordId, string ownerDid, string cid, bytes32 hash);
    event DataUpdated(address indexed producer, string indexed recordId, string cid, bytes32 hash);
    event DataRemoved(address indexed producer, string indexed recordId);
    event DataDeactivated(string indexed recordId, uint256 timestamp);
    event ConsumerAuthorized(string indexed recordId, string indexed ownerDid, string indexed consumerDid);
    event ConsumerDeauthorized(string indexed recordId, string consumerDid);
    event DataVerified(string indexed recordId, string verifierDid);
    event MetadataUpdated(string indexed url, bytes32 hash);
    event ProviderSchemaUpdated(string indexed url, bytes32 hash);
    event ProviderMetadataUpdated(string indexed url, bytes32 hash);
    event DataShared(address indexed producer, address indexed consumer, string recordId, string cid);
    event TokenUpdated(address indexed oldAddress, address indexed newAddress);
    event AccessNotAllowed(string indexed recordId, string indexed consumerDid);
    event SharingNotAllowed(string indexed recordId, string indexed producerDid);
    event TokenAddressUpdated(address indexed newAddress);
    event PauseStateUpdated(address indexed contractAddress, address indexed caller, bool isPaused);
    event ProducerConsentUpdated(address indexed producer, ConsentStatus status);
    event ProducerRecordStatusUpdated(address indexed producer, RecordStatus status);
    event ProducerRecordUpdated(address indexed producer, string indexed recordId, string cid, bytes32 hash);
    event ProducerRecordRemoved(address indexed producer);
    event ProducerRegistered(address indexed producer, string indexed ownerDid);

    /*====================== EXTERNAL FUNCTIONS ======================*/

    /**
     * @notice Registers a medical resource record for a producer and ensures it does not already exist.
     * @dev This function adds a new record for the specified producer. It checks if the producer already
     *      has an entry and if the provided resource type for the record doesn't already exist. The function
     *      reverts if the record already exists for the producer. The record is tied to the producer,
     *      and a signature is required to authenticate the resource.
     *
     * @param _ownerDid DID of the data owner
     * @param _recordId Unique identifier for the record
     * @param _producer Address of the producer
     * @param _signature Signature of the producer
     * @param _resourceType Resource type of the health record
     * @param _consent Consent status of the health record
     * @param _metadata Additional metadata about the health record
     */
    function registerProducerRecord(
        string calldata _ownerDid,
        string calldata _recordId,
        address _producer,
        bytes memory _signature,
        string calldata _resourceType,
        ConsentStatus _consent,
        RecordMetadata memory _metadata
    ) external;

    /**
     * @notice Updates an existing medical resource record for a producer.
     * @dev This function updates the specified record of a producer. It modifies the record metadata, signature,
     *      resource type, status, and consent. The function also increments the nonce to track the update.
     *      Reverts if the producer is not found.
     *
     * @param _recordId The unique identifier for the medical resource record.
     * @param _producer The address of the producer (owner of the record).
     * @param signature A cryptographic signature to authenticate the updated medical resource.
     * @param resourceType The type of medical resource being updated (e.g., report, document, etc.).
     * @param _status The status of the health record
     * @param _consent The consent status of the health record
     * @param _recordMetadata The metadata of the health record
     * @param updaterDid The DID of the updater
     */
    function updateProducerRecord(
        string calldata _recordId,
        address _producer,
        bytes calldata signature,
        string calldata resourceType,
        RecordStatus _status,
        ConsentStatus _consent,
        RecordMetadata memory _recordMetadata,
        string calldata updaterDid
    ) external;

    /**
     * @notice Removes all records for a specific producer and updates the record count.
     * @dev This function deletes the entire record data for the given producer address. The function can only
     *      be executed by the contract owner and when the contract is not paused. Upon successful removal,
     *      the total record count is decreased.
     *
     * @param _producer The address of the producer whose records are to be deleted.
     *
     * @custom:modifier onlyOwner Ensures that only the owner of the contract can call this function.
     * @custom:modifier whenNotPaused Ensures that the function can only be called when the contract is not paused.
     *
     * @custom:event ProducerRecordRemoved Emitted when the records of a producer are successfully removed.
     */
    function removeProducerRecord(address _producer) external;

    /**
     * @notice Authorize a consumer to access data
     * @dev Authorize a consumer to access data
     * @param recordId The unique identifier for the medical resource record.
     * @param consumerDid The DID of the consumer initiating the payment.
     * @param ownerDid The DID of the owner of the record.
     *
     * @custom:modifier onlyProviderOrProducer Ensures that only the authorized provider or
     *        the producer themselves can call this function.
     * @custom:modifier whenNotPaused Ensures that the function can only be called when the contract is not paused.
     *
     * @custom:event ConsumerAuthorized Emitted when the consumer is authorized to access the data.
     */
    function shareData(string calldata recordId, string calldata consumerDid, string calldata ownerDid) external;

    /**
     * @notice Verify data record by service provider
     * @dev Verify data record by service provider
     * @param recordId The unique identifier for the medical resource record.
     * @param verifierDid The DID of the service provider verifying the data.
     *
     * @custom:modifier whenNotPaused Ensures that the function can only be called when the contract is not paused.
     *
     * @custom:event DataVerified Emitted when the data is verified by the service provider.
     */
    function verifyData(string calldata recordId, string calldata verifierDid) external;

    /**
     * @notice Updates the metadata of an existing medical resource record for a producer.
     * @dev This function updates only the metadata (such as CID, URL, and hash) of a producer's specific record.
     *      It does not modify the record's signature, status, or consent.
     *
     * @param _producer The address of the producer (owner of the record).
     * @param _recordId The unique identifier for the medical resource record.
     * @param _metadata The new metadata for the record, containing CID, URL, hash, etc.
     *
     * @custom:modifier onlyOwner Ensures that only the owner of the contract can call this function.
     * @custom:modifier whenNotPaused Ensures that the function can only be called when the contract is not paused.
     *
     * @custom:event ProducerRecordUpdated Emitted when a producer's record metadata is successfully updated.
     */
    function updateProducerRecordMetadata(address _producer, string memory _recordId, RecordMetadata memory _metadata)
        external;

    /**
     * @notice Updates the status of a producer's record.
     * @dev This function updates the overall status of the producer's record (e.g., active, inactive, etc.).
     *      It does not modify individual records, but the general status of the producer's records.
     *
     * @param _producer The address of the producer (owner of the records).
     * @param _status The new status to assign to the producer's records.
     *
     * @custom:modifier onlyOwner Ensures that only the owner of the contract can call this function.
     * @custom:modifier whenNotPaused Ensures that the function can only be called when the contract is not paused.
     *
     * @custom:event ProducerRecordStatusUpdated Emitted when the status of the producer's record is updated.
     */
    function updateProducerRecordStatus(address _producer, RecordStatus _status) external;

    /**
     * @notice Updates the consent status of a producer's record.
     * @dev This function updates the consent status, determining whether the producer's records can be accessed
     *      or shared based on the new consent value.
     *
     * @param _producer The address of the producer (owner of the records).
     * @param _status The new consent status to assign to the producer's records.
     *
     * @custom:modifier onlyOwner Ensures that only the owner of the contract can call this function.
     * @custom:modifier whenNotPaused Ensures that the function can only be called when the contract is not paused.
     *
     * @custom:event ProducerConsentUpdated Emitted when the consent status of the producer's records is updated.
     */
    function updateProducerConsent(address _producer, ConsentStatus _status) external;

    /**
     * @notice Updates the metadata for the provider.
     * @dev This function updates the provider's metadata URL and hash.
     *      It is typically used to modify the information associated with the provider,
     *      such as links to documentation or service descriptions.
     *
     * @param _metadata The new metadata for the provider, containing the URL and hash.
     *
     * @custom:modifier onlyOwner Ensures that only the owner of the contract can call this function.
     * @custom:modifier whenNotPaused Ensures that the function can only be called when the contract is not paused.
     *
     * @custom:event ProviderMetadataUpdated Emitted when the provider's metadata is successfully updated.
     */
    function updateProviderMetadata(Metadata memory _metadata) external;

    /**
     * @notice Updates the schema reference for the provider's records.
     * @dev This function updates the URL and hash of the schema used for the provider's records.
     *      It allows the owner to specify a new schema definition, which can be useful for maintaining
     *      compatibility with updated data standards or formats.
     *
     * @param _schemaRef The new schema reference for the provider, containing the URL and hash.
     *
     * @custom:modifier onlyOwner Ensures that only the owner of the contract can call this function.
     * @custom:modifier whenNotPaused Ensures that the function can only be called when the contract is not paused.
     *
     * @custom:event ProviderSchemaUpdated Emitted when the provider's record schema is successfully updated.
     */
    function updateProviderRecordSchema(Schema memory _schemaRef) external;

    /**
     * @notice Changes the pause state of the contract.
     * @dev This function allows the owner to pause or unpause the contract,
     *      which can be useful for temporarily halting operations in case of emergencies
     *      or maintenance. When the contract is paused, certain functions may be restricted
     *      to prevent state changes.
     *
     * @param _pause A boolean indicating the desired state: true to pause, false to unpause.
     *
     * @custom:modifier onlyOwner Ensures that only the owner of the contract can call this function.
     *
     * @custom:event PauseStateUpdated Emitted when the pause state of the contract is changed.
     */
    function changePauseState(bool _pause) external;

    /**
     * @notice Changes the address of the token contract used by the registry.
     * @dev This function allows the owner to update the address of the ERC20 token
     *      contract that the registry interacts with. The new token address cannot be
     *      the zero address. This is useful for changing to a different token if needed.
     *
     * @param _tokenAddress The new address of the ERC20 token contract.
     *
     * @custom:modifier onlyOwner Ensures that only the owner of the contract can call this function.
     *
     * @custom:error Registry__InvalidInputParam Thrown if the provided token address is the zero address.
     *
     * @custom:event TokenAddressUpdated Emitted when the token address is successfully updated.
     */
    function changeTokenAddress(address _tokenAddress) external;

    /**
     * @notice Retrieves the CID of a specific producer's medical record.
     * @dev Share record with consumer - this will revoke access after one time access
     * @param recordId The unique identifier of the medical record to retrieve.
     * @param requesterDid The DID of the requester.
     * @return cid The CID of the medical record.
     *
     * @custom:modifier onlyProviderOrProducer Ensures that only the authorized provider or
     *        the producer themselves can call this function.
     */
    function getRecordCid(string calldata recordId, string calldata requesterDid)
        external
        returns (string memory cid);

    /*====================== VIEW FUNCTIONS ======================*/

    /**
     * @notice Retrieves information about a producer's record.
     * @dev This function allows the owner to access specific details about a producer's record,
     *      including the producer's address, record status, consent status, and nonce.
     *      It is useful for auditing or monitoring purposes.
     *
     * @param _producer The address of the producer whose record information is to be retrieved.
     *
     * @return DataRecordCore A struct containing the producer's address, status, consent status, and nonce, and isActive, and others.
     *
     * @custom:modifier onlyProviderOrProducer Ensures that only the authorized provider or
     *        the producer themselves can call this function.
     */
    function getProducerRecordInfo(address _producer) external returns (DataRecordCore memory);

    /**
     * @param _producer The address of the producer whose record is being retrieved.
     * @param _recordId The unique identifier of the medical record to retrieve.
     *
     * @return Record The medical record associated with the specified producer and record ID.
     */
    function getProducerRecord(address _producer, string memory _recordId)
        external
        view
        returns (HealthRecord memory);

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
            RecordStatus status,
            ConsentStatus consentStatus,
            HealthRecord[] memory records,
            string[] memory recordIds,
            uint256 nonce
        );

    /**
     * @param _address The address of the producer whose consent status is being retrieved.
     *
     * @return ConsentStatus The current consent status of the specified producer.
     */
    function getProducerConsent(address _address) external view returns (ConsentStatus);

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
     * @return RecordStatus The current status of the records associated with the specified producer.
     */
    function getProducerRecordStatus(address _producer) external view returns (RecordStatus);

    /**
     * @return Metadata The metadata of the provider, containing the URL and hash.
     */
    function getProviderMetadata() external view returns (Metadata memory);

    /**
     * @return Schema The schema reference for the records, containing the URL and hash.
     */
    function getRecordSchema() external view returns (Schema memory);

    /**
     * @param _producer The address of the data provider or producer.
     */
    function producerExists(address _producer) external view returns (bool);

    /**
     * @return address The address of the compensation contract.
     */
    function getCompensationContractAddress() external view returns (address);

    /**
     * @return bool True if the consumer is authorized, false otherwise.
     */
    function isConsumerAuthorized(string calldata recordId, string calldata consumerDid) external view returns (bool);

    /**
     * @return address The address of the producer.
     */
    function getAddressFromDid(string calldata did) external view returns (address);

    /**
     * @return string The DID of the producer.
     */
    function getProducerDid(address _producer) external view returns (string memory);
}
