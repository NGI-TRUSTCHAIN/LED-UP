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
 * @title DataRegistry
 * @author menge-mm
 * @notice DataRegistry contract is a contract that manages the data registry of the producer records.
 * It provides functions to register, update, and query producer records.
 * @dev The DataRegistry contract is a child contract of the IDataRegistry interface.
 * It inherits the Ownable and Pausable contracts.
 * The DataRegistry contract is responsible for managing the data registry of the
 *  producer records. It provides functions to register, update, and query producer records.*
 *
 * Terminologies
 *  - A provider refers to an entity that can register, update, and query producer records.
 *  - A producer refers to an entity whose data is being registered, updated, and queried. In this case, the producer is the patient.
 *  - A consumer refers to an entity who is third party who consumes the data.
 */

contract DataRegistry is IDataRegistry, Ownable, Pausable {
    /***************** ERRORS **************** */
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

    /***************** VARIABLES *****************/
    string private providerMetadataUrl;
    bytes32 private providerMetadataHash;
    string private recordSchemaUrl;
    bytes32 private recordSchemaHash;
    uint256 private recordCount = 0;

    // decision one CID per Record or one CID per Total ProducerRecord
    // I chose the first option: CID per Record
    mapping(address => DataTypes.ProducerRecord) producerRecords;

    // -------> new
    Compensation private compensation;
    IERC20 private token;
    // -------> new

    /****************** EVENTS *****************/
    event ProducerRecordAdded(
        address indexed producer,
        string indexed recordId,
        string indexed cid,
        string url,
        bytes32 hash
        // uint256 dataSize
    );

    event ProducerRecordRemoved(address indexed producer);

    event ProducerRecordUpdated(
        address indexed producer,
        string indexed recordId,
        string url,
        string cid,
        bytes32 hash
    );
    event ProducerRecordStatusUpdated(
        address indexed producer,
        DataTypes.RecordStatus indexed status
    );
    event ProducerConsentUpdated(
        address indexed producer,
        DataTypes.ConsentStatus indexed consent
    );

    event ProviderMetadataUpdated(
        address indexed provider,
        string url,
        bytes32 hash
    );

    event ProviderSchemaUpdated(
        address indexed provider,
        string url,
        bytes32 hash
    );

    event PauseStateUpdated(
        address indexed contractAddress,
        address indexed pausedBy,
        bool indexed pause
    );

    event DataShared(
        address indexed producer,
        address indexed dataConsumer,
        string recordId,
        string url,
        string cid,
        bytes32 hash
    );

    event TokenAddressUpdated(address indexed _tokenAddress);

    /***************** MODIFIERS *****************/
    modifier onlyProviderOrProducer(
        address _producer,
        string memory _recordId
    ) {
        if (producerRecords[_producer].producer == address(0)) {
            revert Registry__ProducerNotFound(_producer);
        }
        if (owner() != msg.sender && msg.sender != _producer) {
            revert Registry__NotAuthorized();
        }
        _;
    }

    /**
     * @notice the function that will be called once at time of deployement
     * @dev constructor - initializes the contract with the provider metadata url and hash, schemaRef, providerKey, and provider address
     * @param _metadata  -  the provider metadata url and hash - this belongs to contract provider
     * @param _schema  -  the record schema url and hash
     * @param _provider  -  the provider address - this belongs to contract provider
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

        compensation = new Compensation(
            _provider,
            _tokenAddress,
            _leveaWallet,
            _serviceFeePercent,
            1e18
        );
    }

    /***************** EXTERNAL FUNCTIONS *****************/
    /// @inheritdoc IDataRegistry
    function registerProducerRecord(
        string memory _recordId,
        address _producer,
        bytes memory _signature,
        string memory _resourceType,
        DataTypes.ConsentStatus _consent,
        DataTypes.RecordMetadata memory _metadata
    ) external override onlyOwner whenNotPaused {
        DataTypes.Record memory medicalResource = DataTypes.Record(
            _signature,
            _resourceType,
            _metadata
        );

        DataTypes.ProducerRecord storage producerData = producerRecords[
            _producer
        ];

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
            keccak256(abi.encodePacked(_recordId)) ==
            keccak256(
                abi.encodePacked(producerData.records[_recordId].resourceType)
            )
        ) {
            revert Registry__RecordAlreadyExists(_recordId);
        }

        // Add the record to the producer's records
        producerData.records[_recordId] = medicalResource;
        producerData.nonce = producerData.nonce + 1;

        emit ProducerRecordAdded(
            _producer,
            _recordId,
            _metadata.cid,
            _metadata.url,
            _metadata.hash
            // _metadata.dataSize
        );
    }

    /// @inheritdoc IDataRegistry
    function shareData(
        address _producer,
        address _consumer,
        string memory _recordId
    ) external override whenNotPaused {
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
        DataTypes.ProducerRecord storage producerRecord = producerRecords[
            _producer
        ];

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

        emit DataShared(
            _producer,
            _consumer,
            _recordId,
            record.metadata.cid,
            record.metadata.url,
            record.metadata.hash
        );
    }

    /// @inheritdoc IDataRegistry
    function removeProducerRecord(
        address _producer
    ) external override onlyOwner whenNotPaused {
        delete producerRecords[_producer];
        // reduce the record count
        recordCount = recordCount - 1;

        emit ProducerRecordRemoved(_producer);
    }

    /// @inheritdoc IDataRegistry
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
        DataTypes.Record memory medicalResource = DataTypes.Record(
            _signature,
            _resourceType,
            _recordMetadata
        );

        producerRecords[_producer].records[_recordId] = medicalResource;
        producerRecords[_producer].status = _status;
        producerRecords[_producer].consent = _consent;
        producerRecords[_producer].nonce = producerRecords[_producer].nonce + 1;

        emit ProducerRecordUpdated(
            _producer,
            _recordId,
            _recordMetadata.cid,
            _recordMetadata.url,
            _recordMetadata.hash
        );
    }

    /// @inheritdoc IDataRegistry
    function updateProducerRecordMetadata(
        address _producer,
        string memory _recordId,
        DataTypes.RecordMetadata memory _metadata
    ) external override onlyOwner whenNotPaused {
        producerRecords[_producer].records[_recordId].metadata = _metadata;

        emit ProducerRecordUpdated(
            _producer,
            _recordId,
            _metadata.cid,
            _metadata.url,
            _metadata.hash
        );
    }

    /// @inheritdoc IDataRegistry
    function updateProducerRecordStatus(
        address _producer,
        DataTypes.RecordStatus _status
    ) external override onlyOwner whenNotPaused {
        producerRecords[_producer].status = _status;

        emit ProducerRecordStatusUpdated(_producer, _status);
    }

    /// @inheritdoc IDataRegistry
    function updateProducerConsent(
        address _producer,
        DataTypes.ConsentStatus _status
    ) external override onlyOwner whenNotPaused {
        producerRecords[_producer].consent = _status;

        emit ProducerConsentUpdated(_producer, _status);
    }

    /// @inheritdoc IDataRegistry
    function updateProviderMetadata(
        DataTypes.Metadata memory _metadata
    ) external override onlyOwner whenNotPaused {
        providerMetadataUrl = _metadata.url;
        providerMetadataHash = _metadata.hash;

        emit ProviderMetadataUpdated(owner(), _metadata.url, _metadata.hash);
    }

    /// @inheritdoc IDataRegistry
    function updateProviderRecordSchema(
        DataTypes.Schema memory _schemaRef
    ) external override onlyOwner whenNotPaused {
        recordSchemaUrl = _schemaRef.schemaRef.url;
        recordSchemaHash = _schemaRef.schemaRef.hash;

        emit ProviderSchemaUpdated(
            owner(),
            _schemaRef.schemaRef.url,
            _schemaRef.schemaRef.hash
        );
    }

    /// @inheritdoc IDataRegistry
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

    function changeTokenAddress(address _tokenAddress) external onlyOwner {
        if (_tokenAddress == address(0)) {
            revert Registry__InvalidInputParam();
        }

        token = IERC20(_tokenAddress);

        emit TokenAddressUpdated(_tokenAddress);
    }

    /********************** VIEW FUNCTIONS ******************** */
    /// @inheritdoc IDataRegistry
    function getProducerRecordInfo(
        address _address
    ) external view override onlyOwner returns (DataTypes.RecordInfo memory) {
        return
            DataTypes.RecordInfo(
                producerRecords[_address].producer,
                producerRecords[_address].status,
                producerRecords[_address].consent,
                producerRecords[_address].nonce
            );
    }

    /// @inheritdoc IDataRegistry
    function getProducerRecord(
        address _producer,
        string memory _recordId
    )
        external
        view
        override
        onlyProviderOrProducer(_producer, _recordId)
        returns (DataTypes.Record memory)
    {
        return producerRecords[_producer].records[_recordId];
    }

    /// @inheritdoc IDataRegistry
    function getProducerConsent(
        address _address
    ) external view override returns (DataTypes.ConsentStatus) {
        return producerRecords[_address].consent;
    }

    /// @inheritdoc IDataRegistry
    function getProducerRecordCount(
        address _producer
    ) external view override returns (uint256) {
        return producerRecords[_producer].nonce; // need to check
    }

    /// @inheritdoc IDataRegistry
    function getTotalRecordsCount() external view override returns (uint256) {
        return recordCount;
    }

    /// @inheritdoc IDataRegistry
    function getProducerRecordStatus(
        address _producer
    ) external view override returns (DataTypes.RecordStatus) {
        return producerRecords[_producer].status;
    }

    /// @inheritdoc IDataRegistry
    function getProviderMetadata()
        external
        view
        override
        returns (DataTypes.Metadata memory)
    {
        DataTypes.Metadata memory metadata = DataTypes.Metadata({
            url: providerMetadataUrl,
            hash: providerMetadataHash
        });

        return metadata;
    }

    /// @inheritdoc IDataRegistry
    function getRecordSchema()
        external
        view
        override
        returns (DataTypes.Schema memory)
    {
        DataTypes.Schema memory recordSchema = DataTypes.Schema({
            schemaRef: DataTypes.Metadata({
                url: recordSchemaUrl,
                hash: recordSchemaHash
            })
        });

        return recordSchema;
    }

    /// @inheritdoc IDataRegistry
    function producerExists(
        address _producer
    ) external view override returns (bool) {
        return producerRecords[_producer].producer != address(0);
    }

    function getCompensationContractAddress() external view returns (address) {
        return address(compensation);
    }
}
