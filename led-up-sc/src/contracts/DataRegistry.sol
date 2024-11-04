// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {DataTypes} from "../library/DataTypes.sol";
import {Compensation} from "./Compensation.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
// import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import {IDataRegistry} from "../interface/IDataRegistry.sol";

/**
 * @title Data Registry Contract
 * @notice This contract serves as a registry for medical resource records, allowing producers to register,
 *         update, and manage their records while ensuring compliance with consent and payment verification.
 * @dev The contract is designed to be owned by a provider, who has the authority to manage records,
 *      including adding, updating, and removing them. It also incorporates mechanisms to handle
 *      pauses in contract execution for maintenance or emergency situations.
 *
 *      Key functionalities include:
 *      - Registering new medical resource records tied to producers.
 *      - Sharing data between producers and consumers, subject to consent.
 *      - Updating record metadata, statuses, and consent.
 *      - Managing provider metadata and schemas for record management.
 *      - Tracking producer existence and providing read access to records.
 *      - Verifying payment for data sharing and managing token addresses for compensation.
 *
 * @custom:security The contract implements access control via the `onlyOwner` modifier, ensuring that
 *                   only the owner can perform sensitive operations. It also incorporates a paused state
 *                   to prevent contract execution during maintenance or emergencies.
 *
 * @custom:events
 * - ProducerRecordAdded: Emitted when a new producer record is successfully added.
 * - DataShared: Emitted when data is shared between a producer and a consumer.
 * - ProducerRecordRemoved: Emitted when a producer record is removed.
 * - ProducerRecordUpdated: Emitted when a producer record is updated.
 * - ProviderMetadataUpdated: Emitted when the provider's metadata is updated.
 * - ProviderSchemaUpdated: Emitted when the provider's record schema is updated.
 * - PauseStateUpdated: Emitted when the contract's pause state changes.
 * - TokenAddressUpdated: Emitted when the token address is updated.
 * - ProducerConsentUpdated: Emitted when a producer's consent status is updated.
 * - ProducerRecordStatusUpdated: Emitted when a producer's record status is updated.
 *
 * @custom:error
 * - Registry__ParseParamsError(string message): Thrown when there is an error parsing input parameters.
 * - Registry__ProducerRecordNotFound(string recordId): Thrown if the specified producer record does not exist.
 * - Registry__ProducerNotFound(address producer): Thrown if a specified producer does not exist.
 * - Registry__RecordAlreadyExists(string recordId): Thrown if a record with the same ID already exists.
 * - Registry__ProducerRecordAlreadyExists(string recordId): Thrown if a record for the producer already exists.
 * - Registry__NotAuthorized(): Thrown if an action is attempted without proper authorization.
 * - Registry__InvalidProvider(): Thrown if the specified provider is invalid.
 * - Registry__InvalidInputParam(): Thrown if an invalid parameter is provided.
 * - Registry__ServicePaused(): Thrown if an action is attempted while the service is paused.
 * - Registry__ConsentNotAllowed(DataTypes.ConsentStatus consent): Thrown if consent for a record is not allowed.
 * - Registry__PaymentNotVerified(): Thrown if payment verification fails.
 * - Registry__ConsentAlreadyGranted(): Thrown if consent has already been granted for a record.
 * - Registry__ConsentAlreadyRevoked(): Thrown if consent has already been revoked for a record.
 */
contract DataRegistry is IDataRegistry, Ownable, Pausable {
    /*===================== ERRORS =====================*/
    error Registry__ParseParamsError(string message);
    error Registry__ProducerRecordNotFound(string recordId);
    error Registry__ProducerNotFound(address producer);
    error Registry__RecordAlreadyExists(string recordId);
    error Registry__ProducerRecordAlreadyExists(string recordId);
    error Registry__NotAuthorized();
    error Registry__InvalidProvider();
    error Registry__InvalidInputParam();
    error Registry__ServicePaused();
    error Registry__ConsentNotAllowed(DataTypes.ConsentStatus consent);
    error Registry__PaymentNotVerified();
    error Registry__ConsentAlreadyGranted();
    error Registry__ConsentAlreadyRevoked();

    /*===================== VARIABLES =====================*/
    string private providerMetadataUrl;
    bytes32 private providerMetadataHash;
    string private recordSchemaUrl;
    bytes32 private recordSchemaHash;
    uint256 private recordCount = 0;
    mapping(address => DataTypes.ProducerRecord) producerRecords;
    Compensation private compensation;
    IERC20 private token;

    /*===================== EVENTS =====================*/
    event ProducerRecordAdded(
        address indexed producer, string indexed recordId, string indexed cid, string url, bytes32 hash
    );
    event ProducerRecordRemoved(address indexed producer);
    event ProducerRecordUpdated(
        address indexed producer, string indexed recordId, string url, string cid, bytes32 hash
    );
    event ProducerRecordStatusUpdated(address indexed producer, DataTypes.RecordStatus indexed status);
    event ProducerConsentUpdated(address indexed producer, DataTypes.ConsentStatus indexed consent);
    event ProviderMetadataUpdated(address indexed provider, string url, bytes32 hash);
    event ProviderSchemaUpdated(address indexed provider, string url, bytes32 hash);
    event PauseStateUpdated(address indexed contractAddress, address indexed pausedBy, bool indexed pause);

    event DataShared(
        address indexed producer, address indexed dataConsumer, string recordId, string url, string cid, bytes32 hash
    );

    event TokenAddressUpdated(address indexed _tokenAddress);

    /*===================== MODIFIERS =====================*/
    modifier onlyProviderOrProducer(address _producer, string memory _recordId) {
        if (producerRecords[_producer].producer == address(0)) {
            revert Registry__ProducerNotFound(_producer);
        }
        if (owner() != msg.sender && msg.sender != _producer) {
            revert Registry__NotAuthorized();
        }
        _;
    }

    /**
     * @notice Initializes the contract with the specified parameters.
     * @dev This constructor sets up the contract with metadata, schema, provider
     *      address, token address, and compensation contract details. It also
     *      transfers ownership to the specified provider and initializes the
     *      compensation contract.
     *
     * @param _metadata Metadata associated with the provider, including URL and hash.
     * @param _schema Schema reference for the records, containing the schema URL and hash.
     * @param _provider The address of the provider (owner of the contract).
     * @param _tokenAddress The address of the token contract used for payments.
     * @param _leveaWallet The wallet address for receiving service fees.
     * @param _serviceFeePercent The percentage of service fees to be charged.
     */
    constructor(
        DataTypes.Metadata memory _metadata,
        DataTypes.Schema memory _schema,
        address _provider,
        address _tokenAddress,
        address payable _leveaWallet,
        uint256 _serviceFeePercent
    ) Ownable(_provider) Pausable() {
        transferOwnership(_provider);
        providerMetadataUrl = _metadata.url;
        providerMetadataHash = _metadata.hash;
        recordSchemaUrl = _schema.schemaRef.url;
        recordSchemaHash = _schema.schemaRef.hash;

        // token = new LedUpToken("LedUp Token", "LTK");
        token = IERC20(_tokenAddress);

        compensation = new Compensation(_provider, _tokenAddress, _leveaWallet, _serviceFeePercent, 1e18);
    }

    /*===================== EXTERNAL FUNCTIONS =====================*/
    /**
     * @notice Registers a medical resource record for a producer and ensures it does not already exist.
     * @dev This function adds a new record for the specified producer. It checks if the producer already
     *      has an entry and if the provided resource type for the record doesn't already exist. The function
     *      reverts if the record already exists for the producer. The record is tied to the producer,
     *      and a signature is required to authenticate the resource.
     *
     * @param _recordId The unique identifier for the medical resource record.
     * @param _producer The address of the producer (creator/owner of the record).
     * @param _signature A cryptographic signature to authenticate the medical resource.
     * @param _resourceType The type of medical resource being registered (e.g., report, document, etc.).
     * @param _consent The consent status for the record, defining the usage rights.
     * @param _metadata Metadata associated with the medical resource, including CID, URL, hash, etc.
     *
     * @custom:modifier onlyOwner Ensures that only the owner of the contract can call this function.
     * @custom:modifier whenNotPaused Ensures that the function can only be called when the contract is not paused.
     *
     * @custom:event ProducerRecordAdded Emitted when a new producer record is successfully added.
     * @custom:error Registry__RecordAlreadyExists Thrown if a record with the same `resourceType` already exists for the producer.
     */
    function registerProducerRecord(
        string memory _recordId,
        address _producer,
        bytes memory _signature,
        string memory _resourceType,
        DataTypes.ConsentStatus _consent,
        DataTypes.RecordMetadata memory _metadata
    ) external override onlyOwner whenNotPaused {
        DataTypes.Record memory medicalResource = DataTypes.Record(_signature, _resourceType, _metadata);

        DataTypes.ProducerRecord storage producerData = producerRecords[_producer];

        // If the producer record doesn't exist, initialize it
        if (producerData.producer == address(0)) {
            producerData.producer = _producer;
            producerData.status = DataTypes.RecordStatus.ACTIVE;
            producerData.consent = _consent;
            producerData.nonce = 0;
            recordCount = recordCount + 1;
        }

        // check wether the resourceType already exists, update the record
        if (
            keccak256(abi.encodePacked(_recordId))
                == keccak256(abi.encodePacked(producerData.records[_recordId].resourceType))
        ) {
            revert Registry__RecordAlreadyExists(_recordId);
        }

        // Add the record to the producer's records
        producerData.records[_recordId] = medicalResource;
        producerData.nonce = producerData.nonce + 1;

        emit ProducerRecordAdded(_producer, _recordId, _metadata.cid, _metadata.url, _metadata.hash);
        // _metadata.dataSize
    }

    /**
     * @notice Shares a medical record from a producer to a consumer, ensuring proper validation and consent.
     * @dev This function checks if the consumer is valid, verifies the producer and their consent status,
     *      and ensures payment for the data has been verified. If any conditions are not met, the function reverts.
     *
     * @param _producer The address of the data provider.
     * @param _consumer The address of the data consumer.
     * @param _recordId The unique identifier for the medical resource record.
     *
     * @custom:modifier onlyOwner Ensures that only the owner of the contract can call this function.     *
     * @custom:modifier whenNotPaused Ensures that the function can only be called when the contract is not paused.
     *
     * @custom:error Registry__InvalidInputParam Thrown if the consumer address is invalid (i.e., address(0)).
     * @custom:error Registry__ProducerNotFound Thrown if the producer's record does not exist.
     * @custom:error Registry__PaymentNotVerified Thrown if payment verification for the record fails.
     * @custom:error Registry__ConsentNotAllowed Thrown if the producer's consent status does not allow sharing the data.
     * @custom:error Registry__ProducerRecordNotFound Thrown if the specified record for the producer does not exist.
     *
     * @custom:event DataShared Emitted when the medical record is successfully shared from the producer to the consumer.
     */
    function shareData(address _producer, address _consumer, string memory _recordId) external override whenNotPaused {
        // check if the data provider and data consumer are valid
        if (_consumer == address(0)) {
            revert Registry__InvalidInputParam();
        }

        //check the existence of the data provider
        if (producerRecords[_producer].producer == address(0)) {
            revert Registry__ProducerNotFound(_producer);
        }

        // verify payment to _producer  for _recordId
        bool verify = compensation.verifyPayment(_recordId);

        if (!verify) {
            revert Registry__PaymentNotVerified();
        }

        // Read the producer record from smart contract storage
        DataTypes.ProducerRecord storage producerRecord = producerRecords[_producer];

        // check for consent status
        if (producerRecord.consent != DataTypes.ConsentStatus.Allowed) {
            revert Registry__ConsentNotAllowed(producerRecord.consent);
        }

        DataTypes.Record storage record = producerRecord.records[_recordId];

        // checking the existence of the record
        if (record.signature.length == 0) {
            revert Registry__ProducerRecordNotFound(_recordId);
        }

        // TODO: more data sharing logic here

        emit DataShared(_producer, _consumer, _recordId, record.metadata.cid, record.metadata.url, record.metadata.hash);
    }

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
    function removeProducerRecord(address _producer) external override onlyOwner whenNotPaused {
        delete producerRecords[_producer];

        // Reduce the record count
        recordCount = recordCount - 1;

        emit ProducerRecordRemoved(_producer);
    }

    /**
     * @notice Updates an existing medical resource record for a producer.
     * @dev This function updates the specified record of a producer. It modifies the record metadata, signature,
     *      resource type, status, and consent. The function also increments the nonce to track the update.
     *      Reverts if the producer is not found.
     *
     * @param _recordId The unique identifier for the medical resource record.
     * @param _producer The address of the producer (owner of the record).
     * @param _signature A cryptographic signature to authenticate the updated medical resource.
     * @param _resourceType The type of medical resource being updated (e.g., report, document, etc.).
     * @param _status The new status of the record (e.g., active, inactive).
     * @param _consent The updated consent status for the record, defining the usage rights.
     * @param _recordMetadata Updated metadata associated with the medical resource (e.g., CID, URL, hash).
     *
     * @custom:modifier onlyOwner Ensures that only the owner of the contract can call this function.
     * @custom:modifier whenNotPaused Ensures that the function can only be called when the contract is not paused.
     *
     * @custom:error Registry__ProducerNotFound Thrown if the specified producer does not exist.
     *
     * @custom:event ProducerRecordUpdated Emitted when a producer's record is successfully updated.
     */
    function updateProducerRecord(
        string memory _recordId,
        address _producer,
        bytes memory _signature,
        string memory _resourceType,
        DataTypes.RecordStatus _status,
        DataTypes.ConsentStatus _consent,
        DataTypes.RecordMetadata memory _recordMetadata
    ) external override onlyOwner whenNotPaused {
        if (producerRecords[_producer].producer == address(0)) {
            revert Registry__ProducerNotFound(_producer);
        }
        DataTypes.Record memory medicalResource = DataTypes.Record(_signature, _resourceType, _recordMetadata);

        producerRecords[_producer].records[_recordId] = medicalResource;
        producerRecords[_producer].status = _status;
        producerRecords[_producer].consent = _consent;
        producerRecords[_producer].nonce = producerRecords[_producer].nonce + 1;

        emit ProducerRecordUpdated(_producer, _recordId, _recordMetadata.cid, _recordMetadata.url, _recordMetadata.hash);
    }

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
    function updateProducerRecordMetadata(
        address _producer,
        string memory _recordId,
        DataTypes.RecordMetadata memory _metadata
    ) external override onlyOwner whenNotPaused {
        producerRecords[_producer].records[_recordId].metadata = _metadata;

        emit ProducerRecordUpdated(_producer, _recordId, _metadata.cid, _metadata.url, _metadata.hash);
    }

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
    function updateProducerRecordStatus(address _producer, DataTypes.RecordStatus _status)
        external
        override
        onlyOwner
        whenNotPaused
    {
        producerRecords[_producer].status = _status;

        emit ProducerRecordStatusUpdated(_producer, _status);
    }

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
    function updateProducerConsent(address _producer, DataTypes.ConsentStatus _status)
        external
        override
        onlyOwner
        whenNotPaused
    {
        producerRecords[_producer].consent = _status;

        emit ProducerConsentUpdated(_producer, _status);
    }

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
    function updateProviderMetadata(DataTypes.Metadata memory _metadata) external override onlyOwner whenNotPaused {
        providerMetadataUrl = _metadata.url;
        providerMetadataHash = _metadata.hash;

        emit ProviderMetadataUpdated(owner(), _metadata.url, _metadata.hash);
    }

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
    function updateProviderRecordSchema(DataTypes.Schema memory _schemaRef) external override onlyOwner whenNotPaused {
        recordSchemaUrl = _schemaRef.schemaRef.url;
        recordSchemaHash = _schemaRef.schemaRef.hash;

        emit ProviderSchemaUpdated(owner(), _schemaRef.schemaRef.url, _schemaRef.schemaRef.hash);
    }

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
    function changePauseState(bool _pause) external override onlyOwner {
        _pause ? _pauseContract() : _unpauseContract();

        emit PauseStateUpdated(address(this), msg.sender, _pause);
    }

    function _pauseContract() internal whenNotPaused {
        _pause();
    }

    function _unpauseContract() internal whenPaused {
        _unpause();
    }

    // function grantConsent(address _provider) external {
    //     if (
    //         producerRecords[msg.sender].consent ==
    //         DataTypes.ConsentStatus.Allowed
    //     ) {
    //         revert Registry__ConsentAlreadyGranted();
    //     }

    //     producerRecords[msg.sender].consent = DataTypes.ConsentStatus.Allowed;
    // }

    // function revokeConsent(address _provider) external {
    //     if (
    //         producerRecords[msg.sender].consent ==
    //         DataTypes.ConsentStatus.Denied
    //     ) {
    //         revert Registry__ConsentAlreadyRevoked();
    //     }

    //     producerRecords[msg.sender].consent = DataTypes.ConsentStatus.Denied;
    // }

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
    function changeTokenAddress(address _tokenAddress) external onlyOwner {
        if (_tokenAddress == address(0)) {
            revert Registry__InvalidInputParam();
        }

        token = IERC20(_tokenAddress);

        emit TokenAddressUpdated(_tokenAddress);
    }

    /*====================== VIEW FUNCTIONS ======================*/
    /**
     * @notice Retrieves information about a producer's record.
     * @dev This function allows the owner to access specific details about a producer's record,
     *      including the producer's address, record status, consent status, and nonce.
     *      It is useful for auditing or monitoring purposes.
     *
     * @param _address The address of the producer whose record information is to be retrieved.
     *
     * @return DataTypes.RecordInfo A struct containing the producer's address, status, consent status, and nonce.
     *
     * @custom:modifier onlyOwner Ensures that only the owner of the contract can call this function.
     */
    function getProducerRecordInfo(address _address)
        external
        view
        override
        onlyOwner
        returns (DataTypes.RecordInfo memory)
    {
        return DataTypes.RecordInfo(
            producerRecords[_address].producer,
            producerRecords[_address].status,
            producerRecords[_address].consent,
            producerRecords[_address].nonce
        );
    }

    /**
     * @notice Retrieves a specific producer's medical record.
     * @dev This function allows either the producer or an authorized provider to access
     *      the details of a specific medical record associated with a producer.
     *      It returns the full record information stored in the contract.
     *
     * @param _producer The address of the producer whose record is being retrieved.
     * @param _recordId The unique identifier of the medical record to retrieve.
     *
     * @return DataTypes.Record The medical record associated with the specified producer and record ID.
     *
     * @custom:modifier onlyProviderOrProducer Ensures that only the authorized provider or
     *        the producer themselves can call this function.
     */
    function getProducerRecord(address _producer, string memory _recordId)
        external
        view
        override
        onlyProviderOrProducer(_producer, _recordId)
        returns (DataTypes.Record memory)
    {
        return producerRecords[_producer].records[_recordId];
    }

    /**
     * @notice Retrieves the consent status of a producer.
     * @dev This function allows anyone to access the consent status of a specific producer.
     *      It is useful for checking whether a producer has allowed or restricted access
     *      to their medical records.
     *
     * @param _address The address of the producer whose consent status is being retrieved.
     *
     * @return DataTypes.ConsentStatus The current consent status of the specified producer.
     */
    function getProducerConsent(address _address) external view override returns (DataTypes.ConsentStatus) {
        return producerRecords[_address].consent;
    }

    /**
     * @notice Retrieves the count of records associated with a producer.
     * @dev This function returns the nonce value for the specified producer, which represents
     *      the number of records that have been added for that producer. It can be used to
     *      track the total number of records or to verify the existence of records.
     *
     * @param _producer The address of the producer whose record count is being retrieved.
     *
     * @return uint256 The current count of records (nonce) associated with the specified producer.
     */
    function getProducerRecordCount(address _producer) external view override returns (uint256) {
        return producerRecords[_producer].nonce; // need to check
    }

    /**
     * @notice Retrieves the total count of all records in the registry.
     * @dev This function returns the overall number of records that have been registered in
     *      the contract, regardless of the producer. It can be used for reporting or analytics purposes.
     *
     * @return uint256 The total count of records stored in the registry.
     */
    function getTotalRecordsCount() external view override returns (uint256) {
        return recordCount;
    }

    /**
     * @notice Retrieves the status of a producer's records.
     * @dev This function returns the current status of the records associated with the
     *      specified producer. It helps in determining whether the producer's records
     *      are active, inactive, or in any other state defined in the RecordStatus enum.
     *
     * @param _producer The address of the producer whose record status is being retrieved.
     *
     * @return DataTypes.RecordStatus The current status of the records associated with the specified producer.
     */
    function getProducerRecordStatus(address _producer) external view override returns (DataTypes.RecordStatus) {
        return producerRecords[_producer].status;
    }

    /**
     * @notice Retrieves the metadata of the provider.
     * @dev This function returns the metadata associated with the provider, including
     *      the URL and hash. This metadata can be used to reference the provider's
     *      information or specifications in external systems.
     *
     * @return DataTypes.Metadata The metadata of the provider, containing the URL and hash.
     */
    function getProviderMetadata() external view override returns (DataTypes.Metadata memory) {
        DataTypes.Metadata memory metadata = DataTypes.Metadata({url: providerMetadataUrl, hash: providerMetadataHash});

        return metadata;
    }

    /**
     * @notice Retrieves the schema of the records.
     * @dev This function returns the schema reference associated with the records,
     *      including the URL and hash. This schema information can be used to validate
     *      or understand the structure of the records in the system.
     *
     * @return DataTypes.Schema The schema reference for the records, containing the URL and hash.
     */
    function getRecordSchema() external view override returns (DataTypes.Schema memory) {
        DataTypes.Schema memory recordSchema =
            DataTypes.Schema({schemaRef: DataTypes.Metadata({url: recordSchemaUrl, hash: recordSchemaHash})});

        return recordSchema;
    }

    /**
     * @notice Checks if a producer exists in the registry.
     * @dev This function verifies the existence of a producer by checking if the
     *      producer's address is not the zero address. It is useful for confirming
     *      whether a producer has been registered in the system.
     *
     * @param _producer The address of the producer to check.
     * @return bool True if the producer exists, otherwise false.
     */
    function producerExists(address _producer) external view override returns (bool) {
        return producerRecords[_producer].producer != address(0);
    }

    /**
     * @notice Retrieves the address of the compensation contract.
     * @dev This function provides the address of the compensation contract used for
     *      verifying payments related to data sharing. It can be helpful for
     *      interacting with the compensation system externally.
     *
     * @return address The address of the compensation contract.
     */
    function getCompensationContractAddress() external view returns (address) {
        return address(compensation);
    }
}
