// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {DidAuth} from "./DidAuth.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {Compensation} from "./Compensation.sol";
import {IDataRegistry} from "../interfaces/IDataRegistry.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title DataRegistry
 * @dev Manages data records with enhanced DID-based authentication and authorization
 * @notice This contract provides a secure way to register, update, and share health records
 *         with proper authentication and authorization through DidAuth integration.
 */
contract DataRegistry is IDataRegistry, Ownable, Pausable {
    /*===================== ERRORS ======================*/
    error DataRegistry__DidAuthNotInitialized();
    error DataRegistry__InvalidDidAuthAddress();
    error DataRegistry__AlreadyRegistered(address _producer);

    /*===================== VARIABLES ======================*/
    DidAuth public didAuth;
    Compensation private compensation;
    IERC20 private token;

    uint256 private recordCount = 0;
    Metadata private providerMetadata;
    Metadata private recordSchema;

    mapping(address => DataRecordCore) private records;
    mapping(address => string[]) private ids;
    mapping(address => mapping(string => HealthRecord)) private healthRecords;
    mapping(string => mapping(string => bool)) private authorizedConsumers;
    // DID to address mappings for reverse lookups
    mapping(string => address) private didToAddress;

    /*===================== MODIFIERS ======================*/
    modifier onlyProviderOrProducer(address _producer) {
        if (records[_producer].producer == address(0)) {
            revert DataRegistry__ProducerNotFound(_producer);
        }

        if (msg.sender != owner() && msg.sender != _producer) {
            revert DataRegistry__Unauthorized();
        }
        _;
    }

    modifier didAuthInitialized() {
        if (address(didAuth) == address(0)) {
            revert DataRegistry__DidAuthNotInitialized();
        }
        _;
    }

    /**
     * @notice Initializes the DataRegistry contract with the specified parameters.
     * @param _token The address of the token
     * @param _provider The address of the provider
     * @param _serviceFee The service fee
     * @param _didAuth The address of the DID Auth contract
     */
    constructor(address _token, address payable _provider, uint256 _serviceFee, address _didAuth) Ownable(msg.sender) {
        if (_didAuth == address(0)) {
            revert DataRegistry__InvalidDidAuthAddress();
        }

        didAuth = DidAuth(_didAuth);
        compensation = new Compensation(_provider, _token, _provider, _serviceFee, 1e18, _didAuth);
        token = IERC20(_token);
    }

    /**
     * @notice Register a user with a role
     * @dev The frontend should register producer or consumer first - this can be called by any user after wallet connection     *
     */
    function registerProducer(RecordStatus _status, ConsentStatus _consent) external whenNotPaused {
        string memory ownerDid = didAuth.getDid(msg.sender);

        // no valid role and did
        // if (!didAuth.authenticate(ownerDid, didAuth.PRODUCER_ROLE())) {
        //     revert DataRegistry__Unauthorized();
        // }

        // already registered
        if (records[msg.sender].producer != address(0)) {
            revert DataRegistry__AlreadyRegistered(msg.sender);
        }

        // the frontend should register producer or consumer first
        records[msg.sender].producer = msg.sender;
        records[msg.sender].ownerDid = ownerDid;
        records[msg.sender].status = _status;
        records[msg.sender].consent = _consent;
        records[msg.sender].nonce = 0;

        emit ProducerRegistered(msg.sender, ownerDid);
    }

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
    ) external override whenNotPaused didAuthInitialized {
        // Check for empty record ID
        if (bytes(_recordId).length == 0) {
            revert DataRegistry__InvalidInputParam();
        }

        // Check for zero address
        if (_producer == address(0)) {
            revert DataRegistry__InvalidInputParam();
        }

        // Verify producer role and credentials with enhanced validation
        // if (!didAuth.authenticate(_ownerDid, didAuth.PRODUCER_ROLE())) {
        //     revert DataRegistry__UnauthorizedProducer();
        // }

        // Store DID to address mapping for future lookups
        didToAddress[_ownerDid] = _producer;

        DataRecordCore storage record = records[_producer];

        if (record.producer == address(0)) {
            record.ownerDid = _ownerDid;
            record.producer = _producer;
            record.status = RecordStatus.Active;
            record.consent = _consent;
            record.nonce = 0;
            record.isActive = true;
            record.updatedAt = block.timestamp;
            recordCount = recordCount + 1;
        } else {
            // Verify that the existing record belongs to the same DID
            if (keccak256(bytes(record.ownerDid)) != keccak256(bytes(_ownerDid))) {
                revert DataRegistry__Unauthorized();
            }
        }

        // check if the recordId already exists
        if (healthRecords[_producer][_recordId].signature.length != 0) {
            revert DataRegistry__RecordAlreadyExists();
        }

        // add the recordId to the record
        ids[_producer].push(_recordId);
        record.nonce = record.nonce + 1;
        healthRecords[_producer][_recordId] =
            HealthRecord(_signature, _resourceType, _metadata.cid, _metadata.url, _metadata.hash, false);
        record.updatedAt = block.timestamp;

        emit DataRegistered(_recordId, _ownerDid, _metadata.cid, _metadata.hash);
    }

    /**
     * @notice Updates an existing medical resource record for a producer.
     * @dev This function updates the specified record of a producer. It modifies the record metadata, signature,
     *      resource type, status, and consent. The function also increments the nonce to track the update.
     *      Reverts if the producer is not found.
     *
     * @param _recordId The unique identifier for the medical resource.
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
    ) external whenNotPaused onlyProviderOrProducer(_producer) didAuthInitialized {
        DataRecordCore storage producerRecords = records[_producer];
        HealthRecord storage healthRecord = healthRecords[_producer][_recordId];

        if (producerRecords.producer == address(0)) {
            revert DataRegistry__ProducerNotFound(_producer);
        }

        if (!producerRecords.isActive) revert DataRegistry__RecordNotActive();

        if (healthRecord.signature.length == 0) {
            revert DataRegistry__RecordNotFound(_recordId);
        }

        // Enhanced authorization check with credential verification
        bool isAuthorized = keccak256(bytes(producerRecords.ownerDid)) == keccak256(bytes(updaterDid))
            || didAuth.authenticate(updaterDid, didAuth.SERVICE_PROVIDER_ROLE())
            || didAuth.authenticate(updaterDid, didAuth.PRODUCER_ROLE());

        if (!isAuthorized) revert DataRegistry__Unauthorized();

        healthRecord.signature = signature;
        healthRecord.resourceType = resourceType;
        producerRecords.status = _status;
        producerRecords.consent = _consent;
        healthRecord.cid = _recordMetadata.cid;
        healthRecord.url = _recordMetadata.url;
        healthRecord.hash = _recordMetadata.hash;
        healthRecord.isVerified = false;
        producerRecords.updatedAt = block.timestamp;
        producerRecords.nonce = producerRecords.nonce + 1;

        emit DataUpdated(_producer, _recordId, _recordMetadata.cid, _recordMetadata.hash);
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
        // Remove DID to address mapping
        string memory producerDid = records[_producer].ownerDid;

        if (bytes(producerDid).length > 0) {
            delete didToAddress[producerDid];
        }

        delete records[_producer];

        // Reduce the record count
        recordCount = recordCount - 1;

        emit ProducerRecordRemoved(_producer);
    }

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
    function shareData(string calldata recordId, string calldata consumerDid, string calldata ownerDid)
        external
        override
        onlyProviderOrProducer(msg.sender)
        whenNotPaused
        didAuthInitialized
    {
        DataRecordCore storage record = records[msg.sender];

        if (record.producer == address(0)) revert DataRegistry__ProducerNotFound(msg.sender);

        // Enhanced owner verification with credential check
        bool isOwner = keccak256(bytes(record.ownerDid)) == keccak256(bytes(ownerDid));
        bool isAuthorizedProducer = didAuth.authenticate(ownerDid, didAuth.PRODUCER_ROLE());

        if (!isOwner && !isAuthorizedProducer) {
            revert DataRegistry__Unauthorized();
        }

        // verify payment to producer for the record
        bool verify = compensation.verifyPayment(recordId);

        if (!verify) revert DataRegistry__PaymentNotVerified();

        // check the consent status
        if (record.consent != ConsentStatus.Allowed) revert DataRegistry__ConsentNotAllowed(recordId, msg.sender);

        // check for consumer valid consumer
        if (!didAuth.authenticate(consumerDid, didAuth.CONSUMER_ROLE())) revert DataRegistry__UnauthorizedConsumer();

        authorizedConsumers[recordId][consumerDid] = true;

        emit ConsumerAuthorized(recordId, ownerDid, consumerDid);
    }

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
    function verifyData(string calldata recordId, string calldata verifierDid)
        external
        override
        whenNotPaused
        didAuthInitialized
    {
        DataRecordCore storage record = records[msg.sender];

        if (record.producer == address(0)) revert DataRegistry__ProducerNotFound(msg.sender);

        if (healthRecords[msg.sender][recordId].signature.length == 0) revert DataRegistry__RecordNotFound(recordId);

        // Enhanced service provider verification with credential check
        if (!didAuth.authenticate(verifierDid, didAuth.SERVICE_PROVIDER_ROLE())) {
            revert DataRegistry__UnauthorizedVerifier();
        }

        healthRecords[msg.sender][recordId].isVerified = true;

        emit DataVerified(recordId, verifierDid);
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
    function updateProducerRecordMetadata(address _producer, string memory _recordId, RecordMetadata memory _metadata)
        external
        override
        onlyOwner
        whenNotPaused
    {
        if (records[_producer].producer == address(0)) {
            revert DataRegistry__ProducerNotFound(_producer);
        }

        if (healthRecords[_producer][_recordId].signature.length == 0) {
            revert DataRegistry__RecordNotFound(_recordId);
        }

        healthRecords[_producer][_recordId].cid = _metadata.cid;
        healthRecords[_producer][_recordId].url = _metadata.url;
        healthRecords[_producer][_recordId].hash = _metadata.hash;

        emit ProducerRecordUpdated(_producer, _recordId, _metadata.cid, _metadata.hash);
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
    function updateProducerRecordStatus(address _producer, RecordStatus _status)
        external
        override
        onlyOwner
        whenNotPaused
    {
        if (records[_producer].producer == address(0)) {
            revert DataRegistry__ProducerNotFound(_producer);
        }

        records[_producer].status = _status;

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
    function updateProducerConsent(address _producer, ConsentStatus _status)
        external
        override
        onlyOwner
        whenNotPaused
    {
        if (records[_producer].producer == address(0)) {
            revert DataRegistry__ProducerNotFound(_producer);
        }

        records[_producer].consent = _status;

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
    function updateProviderMetadata(Metadata memory _metadata) external override onlyOwner whenNotPaused {
        providerMetadata.url = _metadata.url;
        providerMetadata.hash = _metadata.hash;

        emit ProviderMetadataUpdated(_metadata.url, _metadata.hash);
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
    function updateProviderRecordSchema(Schema memory _schemaRef) external override onlyOwner whenNotPaused {
        recordSchema.url = _schemaRef.schemaRef.url;
        recordSchema.hash = _schemaRef.schemaRef.hash;

        emit ProviderSchemaUpdated(_schemaRef.schemaRef.url, _schemaRef.schemaRef.hash);
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
        _pause ? pause() : unpause();

        emit PauseStateUpdated(address(this), msg.sender, _pause);
    }

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
    function changeTokenAddress(address _tokenAddress) external override onlyOwner {
        if (_tokenAddress == address(0)) {
            revert DataRegistry__InvalidInputParam();
        }

        token = IERC20(_tokenAddress);

        emit TokenAddressUpdated(_tokenAddress);
    }

    /**
     * @notice Updates the DidAuth contract address
     * @dev Only the owner can update the DidAuth contract address
     * @param _didAuthAddress The new DidAuth contract address
     */
    function updateDidAuthAddress(address _didAuthAddress) external onlyOwner {
        if (_didAuthAddress == address(0)) {
            revert DataRegistry__InvalidDidAuthAddress();
        }

        didAuth = DidAuth(_didAuthAddress);
    }

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
        override
        didAuthInitialized
        returns (string memory cid)
    {
        DataRecordCore storage record = records[msg.sender];

        if (record.producer == address(0)) revert DataRegistry__ProducerNotFound(msg.sender);

        if (healthRecords[msg.sender][recordId].signature.length == 0) revert DataRegistry__RecordNotFound(recordId);

        bool isConsumer = authorizedConsumers[recordId][requesterDid];

        // Enhanced consumer verification with credential check
        if (!isConsumer || !didAuth.authenticate(requesterDid, didAuth.CONSUMER_ROLE())) {
            revert DataRegistry__Unauthorized();
        }

        bool isPaymentVerified = compensation.verifyPayment(recordId);
        if (!isPaymentVerified) revert DataRegistry__PaymentNotVerified();

        // revoke access after one time access
        authorizedConsumers[recordId][requesterDid] = false;

        return healthRecords[msg.sender][recordId].cid; // encrypted data in IPFS
    }

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
    function getProducerRecordInfo(address _producer)
        external
        view
        override
        onlyProviderOrProducer(_producer)
        returns (DataRecordCore memory)
    {
        return records[_producer];
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
     * @return HealthRecord The medical record associated with the specified producer and record ID.
     *
     * @custom:modifier onlyProviderOrProducer Ensures that only the authorized provider or
     *        the producer themselves can call this function.
     */
    function getProducerRecord(address _producer, string memory _recordId)
        external
        view
        onlyProviderOrProducer(_producer)
        returns (HealthRecord memory)
    {
        return healthRecords[_producer][_recordId];
    }

    /**
     * @notice Retrieves all records associated with a producer.
     * @dev This function returns the status, consent status, and all records for a specified producer.
     *      It is useful for retrieving comprehensive information about a producer's records.
     *
     * @param _producer The address of the producer whose records are being retrieved.
     *
     * @return RecordStatus The current status of the producer's records.
     * @return ConsentStatus  The current consent status of the specified producer.
     * @return HealthRecord[] memory An array of records associated with the specified producer.
     * @return string[] memory An array of record IDs associated with the specified producer.
     * @return uint256 The current count of records (nonce) associated with the specified producer.
     */
    function getProducerRecords(address _producer)
        external
        view
        onlyProviderOrProducer(_producer)
        returns (RecordStatus, ConsentStatus, HealthRecord[] memory, string[] memory, uint256)
    {
        DataRecordCore storage record = records[_producer];
        uint256 count = ids[_producer].length;

        HealthRecord[] memory newHealthRecords = new HealthRecord[](count);

        for (uint256 i = 0; i < count; i++) {
            newHealthRecords[i] = healthRecords[_producer][ids[_producer][i]];
        }

        return (record.status, record.consent, newHealthRecords, ids[_producer], record.nonce);
    }

    /**
     * @notice Retrieves the consent status of a producer.
     * @dev This function allows anyone to access the consent status of a specific producer.
     *      It is useful for checking whether a producer has allowed or restricted access
     *      to their medical records.
     *
     * @param _address The address of the producer whose consent status is being retrieved.
     *
     * @return ConsentStatus The current consent status of the specified producer.
     */
    function getProducerConsent(address _address) external view returns (ConsentStatus) {
        return records[_address].consent;
    }

    /**
     * @notice Retrieves the count of records associated with a producer.
     * @dev This function returns the number of records that have been added for a specified producer.
     *      It can be used to track the total number of records or to verify the existence of records.
     *
     * @param _producer The address of the producer whose record count is being retrieved.
     *
     * @return uint256 The number of records associated with the specified producer.
     */
    function getProducerRecordCount(address _producer) external view returns (uint256) {
        return ids[_producer].length;
    }

    /**
     * @notice Retrieves the total count of all records in the registry.
     * @dev This function returns the overall number of records that have been registered in
     *      the contract, regardless of the producer. It can be used for reporting or analytics purposes.
     *
     * @return uint256 The total count of records stored in the registry.
     */
    function getTotalRecordsCount() external view returns (uint256) {
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
     * @return RecordStatus The current status of the records associated with the specified producer.
     */
    function getProducerRecordStatus(address _producer) external view returns (RecordStatus) {
        return records[_producer].status;
    }

    /**
     * @notice Retrieves the metadata of the provider.
     * @dev This function returns the metadata associated with the provider, including
     *      the URL and hash. This metadata can be used to reference the provider's
     *      information or specifications in external systems.
     *
     * @return DataTypes.Metadata The metadata of the provider, containing the URL and hash.
     */
    function getProviderMetadata() external view returns (Metadata memory) {
        return providerMetadata;
    }

    /**
     * @notice Retrieves the schema of the records.
     * @dev This function returns the schema reference associated with the records,
     *      including the URL and hash. This schema information can be used to validate
     *      or understand the structure of the records in the system.
     *
     * @return DataTypes.Schema The schema reference for the records, containing the URL and hash.
     */
    function getRecordSchema() external view returns (Schema memory) {
        return Schema({schemaRef: recordSchema});
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
    function producerExists(address _producer) external view returns (bool) {
        return records[_producer].producer != address(0);
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

    /**
     * @notice Checks if a consumer is authorized for a record
     * @dev This function verifies if a consumer has been authorized to access a specific record.
     *      It is useful for confirming whether a consumer has been granted access to a particular
     *      record in the system.
     *
     * @param recordId The identifier of the record to check.
     * @param consumerDid The DID of the consumer to check.
     * @return bool True if the consumer is authorized, otherwise false.
     */
    function isConsumerAuthorized(string calldata recordId, string calldata consumerDid) external view returns (bool) {
        return authorizedConsumers[recordId][consumerDid];
    }

    /**
     * @notice Gets the address associated with a DID
     * @dev This function returns the address mapped to a specific DID
     * @param did The DID to look up
     * @return The address associated with the DID
     */
    function getAddressFromDid(string calldata did) external view returns (address) {
        return didToAddress[did];
    }

    /**
     * @notice Gets the DID associated with a producer address
     * @dev This function returns the DID mapped to a specific producer address
     * @param _producer The producer address to look up
     * @return The DID associated with the producer address
     */
    function getProducerDid(address _producer) external view returns (string memory) {
        return records[_producer].ownerDid;
    }

    /*===================== ADMIN FUNCTIONS ======================*/
    function _validateConsumer(address _consumer, string calldata recordId) internal view returns (bool) {
        string memory consumerDid = didAuth.getDid(_consumer);

        if (!didAuth.authenticate(consumerDid, didAuth.CONSUMER_ROLE()) && authorizedConsumers[recordId][consumerDid]) {
            return false;
        }
        return true;
    }

    function _validateProducer(address _producer) internal view returns (bool) {
        string memory producerDid = didAuth.getDid(_producer);
        if (!didAuth.authenticate(producerDid, didAuth.PRODUCER_ROLE())) {
            return false;
        }
        return true;
    }

    modifier _validateProvider(address _producer) {
        string memory providerDid = didAuth.getDid(_producer);

        if (!didAuth.authenticate(providerDid, didAuth.SERVICE_PROVIDER_ROLE())) {
            revert DataRegistry__Unauthorized();
        }
        _;
    }

    function pause() internal onlyOwner whenNotPaused {
        _pause();
    }

    function unpause() internal onlyOwner whenPaused {
        _unpause();
    }
}
