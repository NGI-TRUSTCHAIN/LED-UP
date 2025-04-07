// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {DidAuth} from "./DidAuth.sol";
import {Compensation} from "./Compensation.sol";

/**
 * @title DataRegistry
 * @notice Registry for secure data sharing with direct string storage
 * @dev Implements DID-based authentication with string-based record and CID storage
 */
contract DataRegistry is AccessControl, Pausable, ReentrancyGuard, Ownable {
    /*===================== ERRORS ======================*/
    error DataRegistry__Unauthorized();
    error DataRegistry__RecordNotFound(string recordId);
    error DataRegistry__RecordAlreadyExists(string recordId);
    error DataRegistry__InvalidDID(string did);
    error DataRegistry__AccessDenied(address consumer, string recordId);
    error DataRegistry__InvalidAccessDuration(uint256 provided, uint256 min, uint256 max);
    error DataRegistry__ExpiredAccess(address consumer, string recordId, uint256 expiration);
    error DataRegistry__InvalidContentHash();
    error DataRegistry__PaymentNotVerified(string recordId);
    error DataRegistry__DidAuthNotInitialized();
    error DataRegistry__InvalidDidAuthAddress();
    error DataRegistry__AlreadyRegistered(address producer);
    error DataRegistry__ConsentNotAllowed(string recordId, address producer);

    /*===================== DATA STRUCTURES ======================*/
    enum ResourceType {
        Patient,
        Observation,
        Condition,
        Procedure,
        Encounter,
        Medication,
        MedicationStatement,
        MedicationRequest,
        DiagnosticReport,
        Immunization,
        AllergyIntolerance,
        CarePlan,
        CareTeam,
        Basic,
        Other
    }

    enum RecordStatus {
        Inactive,
        Active,
        Suspended,
        Deleted
    }

    enum ConsentStatus {
        NotSet,
        Allowed,
        Denied
    }

    enum AccessLevel {
        None,
        Read,
        Write
    }

    // Updated producer metadata to use string for did
    struct ProducerMetadata {
        string did; // DID of the producer (no longer hashed)
        uint8 consent; // 0 = NotSet, 1 = Allowed, 2 = Denied
        uint16 entries; // Total entries for this producer
        bool isActive; // If the producer is active
        uint40 lastUpdated; // Last updated timestamp
        uint40 nonce; // Nonce for the producer
        uint32 version; // Version of the producer
    }

    // Updated resource metadata to use strings for IDs and CID
    struct ResourceMetadata {
        uint8 resourceType; // Resource type
        string recordId; // Record ID of the resource (no longer hashed)
        address producer; // Producer address
        uint32 sharedCount; // Total shared count for this resource
        uint40 updatedAt; // Last updated timestamp
        uint24 dataSize; // Size of the data
        bytes32 contentHash; // Content hash of the resource
        string cid; // CID of the resource (no longer hashed)
    }

    // Access permission structure remains the same
    struct AccessPermission {
        uint40 expiration; // Expiration timestamp
        bool isRevoked; // If access is revoked
        uint8 accessLevel; // Access level
    }

    /*===================== STATE VARIABLES ======================*/
    // External contract references
    DidAuth public didAuth;
    Compensation private compensation;
    IERC20 private token;

    // Total records counter
    uint128 private _totalRecords;

    // Updated mappings to use string keys where appropriate
    mapping(address => ProducerMetadata) private _producerMetadata;
    mapping(string => ResourceMetadata) private _resourceMetadata;
    mapping(string => mapping(address => AccessPermission)) private _accessPermissions;
    mapping(address => string[]) private _producerRecords;
    mapping(address => bool) private _authorizedProviders;

    // Verification tracking
    mapping(string => bool) private _verifiedRecords;

    // Add this mapping at the state variables section
    mapping(string => address) private _recordProducers;

    /*===================== EVENTS ======================*/
    event RecordRegistered(
        string indexed recordId, string did, string cid, bytes32 contentHash, address indexed provider
    );
    event RecordUpdated(string indexed recordId, string cid, bytes32 contentHash, address indexed provider);
    event RecordStatusChanged(string indexed recordId, RecordStatus status, address indexed updater);
    event ConsentStatusChanged(address indexed provider, ConsentStatus status, address indexed updater);
    event AccessGranted(
        string indexed recordId, address indexed consumer, string consumerDid, uint40 expiration, uint8 accessLevel
    );
    event AccessRevoked(string indexed recordId, address indexed consumer, string consumerDid, address indexed revoker);
    event RecordVerified(string indexed recordId, address indexed verifier);
    event DidAuthUpdated(address indexed oldAddress, address indexed newAddress);
    event CompensationUpdated(address indexed oldAddress, address indexed newAddress);
    event ConsumerAuthorized(address indexed consumer, string recordId, AccessLevel accessLevel, uint40 expiration);
    event ProviderAuthorized(address indexed provider, string recordId, AccessLevel accessLevel, uint40 timestamp);
    event AccessTriggered(
        string indexed recordId, address indexed consumer, string consumerDid, AccessLevel accessLevel
    );
    event ProviderAdded(address indexed provider);
    event ProviderRemoved(address indexed provider);

    /*===================== MODIFIERS ======================*/
    modifier authorizedProvider() {
        if (!_authorizedProviders[msg.sender]) {
            revert DataRegistry__Unauthorized();
        }
        _;
    }

    modifier recordExists(string memory recordId) {
        if (bytes(_resourceMetadata[recordId].recordId).length == 0) {
            revert DataRegistry__RecordNotFound(recordId);
        }
        _;
    }

    modifier checkDataAccess(string memory recordId) {
        bool isProducer = didAuth.authenticate(didAuth.getDidFromAddress(msg.sender), didAuth.PRODUCER_ROLE())
            || msg.sender == _resourceMetadata[recordId].producer;

        if (!isProducer && !isAuthorizedProvider(msg.sender, recordId)) {
            revert DataRegistry__Unauthorized();
        }
        _;
    }

    modifier consentAllowed(string memory recordId) {
        ResourceMetadata memory metadata = _resourceMetadata[recordId];
        address producer = msg.sender; // Since we store the actual recordId now
        if (_producerMetadata[producer].consent != uint8(ConsentStatus.Allowed)) {
            revert DataRegistry__ConsentNotAllowed(recordId, producer);
        }
        _;
    }

    modifier paymentVerified(string memory recordId) {
        if (!compensation.verifyPayment(recordId)) {
            revert DataRegistry__PaymentNotVerified(recordId);
        }
        _;
    }

    modifier withRole(bytes32 role) {
        string memory callerDid = didAuth.getDidFromAddress(msg.sender);
        if (!didAuth.authenticate(callerDid, role)) {
            revert DataRegistry__Unauthorized();
        }
        _;
    }

    modifier onlyProducer(string memory recordId) {
        if (_resourceMetadata[recordId].producer != msg.sender) {
            revert DataRegistry__Unauthorized();
        }
        _;
    }

    modifier onlyRegisteredProducer() {
        if (!didAuth.authenticate(_producerMetadata[msg.sender].did, didAuth.PRODUCER_ROLE())) {
            revert DataRegistry__Unauthorized();
        }
        _;
    }

    /*===================== CONSTRUCTOR ======================*/
    constructor(address _tokenAddress, address payable _provider, uint256 _serviceFee, address _didAuthAddress)
        Ownable(msg.sender)
    {
        if (_didAuthAddress == address(0)) {
            revert DataRegistry__InvalidDidAuthAddress();
        }

        didAuth = DidAuth(_didAuthAddress);
        compensation = new Compensation(_provider, _tokenAddress, _serviceFee, 1e18, _didAuthAddress);
        token = IERC20(_tokenAddress);
    }

    /*===================== EXTERNAL FUNCTIONS ======================*/
    /**
     * @notice Add a provider to the authorized providers list
     * @param _provider Address of the provider to add
     */
    function addProvider(address _provider) external onlyOwner {
        _authorizedProviders[_provider] = true;
        emit ProviderAdded(_provider);
    }

    /**
     * @notice Remove a provider from the authorized providers list
     * @param _provider Address of the provider to remove
     */
    function removeProvider(address _provider) external onlyOwner {
        _authorizedProviders[_provider] = false;
        emit ProviderRemoved(_provider);
    }

    /**
     * @notice Register producer with DID
     * @param _status Initial record status
     * @param _consent Initial consent status
     */
    function registerProducer(RecordStatus _status, ConsentStatus _consent) external whenNotPaused {
        string memory producerDid = didAuth.getDidFromAddress(msg.sender);

        // Ensure producer DID exists
        if (bytes(producerDid).length == 0) {
            revert DataRegistry__InvalidDID(producerDid);
        }

        // Check if already registered
        if (bytes(_producerMetadata[msg.sender].did).length > 0) {
            revert DataRegistry__AlreadyRegistered(msg.sender);
        }

        // update the producer role
        didAuth.grantDidRole(producerDid, didAuth.PRODUCER_ROLE());

        // Store producer metadata
        _producerMetadata[msg.sender] = ProducerMetadata({
            did: producerDid,
            consent: uint8(_consent),
            entries: 0,
            isActive: _status == RecordStatus.Active,
            lastUpdated: uint40(block.timestamp),
            nonce: 0,
            version: 1
        });
    }

    /**
     * @notice Register a new data record with minimal on-chain footprint
     * @param recordId String representation of record ID
     * @param cid IPFS Content ID (will be stored as hash on-chain)
     * @param contentHash Hash of the content for integrity verification
     * @param resourceType Resource type string (stored as hash)
     * @param dataSize Size of data for payment calculation
     */
    function registerRecord(
        string calldata recordId,
        string calldata cid,
        bytes32 contentHash,
        ResourceType resourceType,
        uint24 dataSize
    ) external whenNotPaused onlyRegisteredProducer nonReentrant {
        //practically it should the provider who can create resource
        _resourceMetadata[recordId] = ResourceMetadata({
            resourceType: uint8(resourceType),
            recordId: recordId,
            producer: msg.sender,
            sharedCount: 0,
            updatedAt: uint40(block.timestamp),
            dataSize: dataSize,
            contentHash: contentHash,
            cid: cid
        });

        // Add to producer records
        _producerRecords[msg.sender].push(recordId);

        // Update producer metadata
        _producerMetadata[msg.sender].entries++;
        _producerMetadata[msg.sender].lastUpdated = uint40(block.timestamp);
        _producerMetadata[msg.sender].nonce++;

        // Increment total records
        unchecked {
            _totalRecords++;
        }

        emit RecordRegistered(recordId, _producerMetadata[msg.sender].did, cid, contentHash, msg.sender);
    }

    /**
     * @notice Update an existing record
     * @param recordId String representation of record ID
     * @param cid New IPFS Content ID
     * @param contentHash New content hash
     */
    function updateRecord(string calldata recordId, string calldata cid, bytes32 contentHash)
        external
        whenNotPaused
        onlyRegisteredProducer
        nonReentrant
    {
        address producer = _resourceMetadata[recordId].producer;

        if (producer != msg.sender || _resourceMetadata[recordId].contentHash == bytes32(0)) {
            revert DataRegistry__Unauthorized();
        }

        // Update record with minimal data
        _resourceMetadata[recordId].contentHash = contentHash;
        _resourceMetadata[recordId].cid = cid;
        _resourceMetadata[recordId].updatedAt = uint40(block.timestamp);

        // Update producer metadata
        _producerMetadata[msg.sender].lastUpdated = uint40(block.timestamp);
        _producerMetadata[msg.sender].nonce++;

        emit RecordUpdated(recordId, cid, contentHash, msg.sender);
    }

    /**
     * @notice Share data by granting access to consumer
     * @param recordId String representation of record ID
     * @param consumerAddress Address of consumer to grant access
     * @param accessDuration Duration of access in seconds
     */
    function shareData(string calldata recordId, address consumerAddress, uint40 accessDuration)
        external
        whenNotPaused
        nonReentrant
        withRole(didAuth.PRODUCER_ROLE())
        consentAllowed(recordId)
    {
        // Ensure record exists and caller is producer
        address producer = _resourceMetadata[recordId].producer;

        if (producer != msg.sender || _resourceMetadata[recordId].contentHash == bytes32(0)) {
            revert DataRegistry__Unauthorized();
        }

        // Verify consent is allowed
        if (_producerMetadata[producer].consent != uint8(ConsentStatus.Allowed)) {
            revert DataRegistry__ConsentNotAllowed(recordId, producer);
        }

        // Verify payment
        if (!compensation.verifyPayment(recordId)) {
            revert DataRegistry__PaymentNotVerified(recordId);
        }

        // Get consumer DID
        string memory consumerDid = didAuth.getDidFromAddress(consumerAddress);

        // Verify consumer role
        if (!didAuth.authenticate(consumerDid, didAuth.CONSUMER_ROLE())) {
            revert DataRegistry__Unauthorized();
        }

        // Calculate expiration
        uint40 expiration = uint40(block.timestamp) + accessDuration;

        // Grant access
        _accessPermissions[recordId][consumerAddress] =
            AccessPermission({expiration: expiration, isRevoked: false, accessLevel: uint8(AccessLevel.Read)});

        // Update sharing stats
        _resourceMetadata[recordId].sharedCount++;

        emit ConsumerAuthorized(consumerAddress, recordId, AccessLevel.Read, expiration);
    }

    function shareToProvider(string calldata recordId, address provider, uint40 accessDuration, AccessLevel accessLevel)
        external
        withRole(didAuth.PRODUCER_ROLE())
        consentAllowed(recordId)
    {
        if (!_authorizedProviders[provider]) {
            revert DataRegistry__Unauthorized();
        }

        address producer = _resourceMetadata[recordId].producer;
        // Ensure record exists and caller is producer
        if (producer != msg.sender || _resourceMetadata[recordId].contentHash == bytes32(0)) {
            revert DataRegistry__RecordNotFound(recordId);
        }

        // Update producer metadata
        _producerMetadata[producer].lastUpdated = uint40(block.timestamp);
        _producerMetadata[producer].nonce++;

        // Update resource metadata
        _resourceMetadata[recordId].sharedCount++;

        emit ProviderAuthorized(provider, recordId, accessLevel, uint40(block.timestamp + accessDuration));
    }

    /**
     * @notice Get the CID of a record if caller has access
     * @param recordId String representation of record ID
     */
    function triggerAccess(string calldata recordId)
        external
        withRole(didAuth.CONSUMER_ROLE())
        paymentVerified(recordId)
    {
        // Check record existence
        if (_resourceMetadata[recordId].contentHash == bytes32(0)) {
            revert DataRegistry__RecordNotFound(recordId);
        }

        // Check consumer access
        AccessPermission memory access = _accessPermissions[recordId][msg.sender];

        // Verify access
        if (access.isRevoked) {
            revert DataRegistry__AccessDenied(msg.sender, recordId);
        }

        if (access.expiration < uint40(block.timestamp)) {
            revert DataRegistry__ExpiredAccess(msg.sender, recordId, access.expiration);
        }

        // revoke access after one time access
        _accessPermissions[recordId][msg.sender].isRevoked = true;

        emit AccessTriggered(recordId, msg.sender, didAuth.getDidFromAddress(msg.sender), AccessLevel.Read);
    }

    /**
     * @notice Revoke previously granted access
     * @param recordId String representation of record ID
     * @param consumerAddress Address of consumer to revoke access from
     */
    function revokeAccess(string calldata recordId, address consumerAddress) external whenNotPaused nonReentrant {
        // Check record existence
        if (_resourceMetadata[recordId].contentHash == bytes32(0)) {
            revert DataRegistry__RecordNotFound(recordId);
        }

        // Get producer address
        address producer = _resourceMetadata[recordId].producer;

        // Only producer, owner, or the consumer themselves can revoke
        bool isProducer = producer == msg.sender;
        bool isOwner = owner() == msg.sender;
        bool isSelfRevocation = consumerAddress == msg.sender;

        if (!isProducer && !isOwner && !isSelfRevocation) {
            revert DataRegistry__Unauthorized();
        }

        // Mark access as revoked
        _accessPermissions[recordId][consumerAddress].isRevoked = true;
        _accessPermissions[recordId][consumerAddress].expiration = uint40(block.timestamp);

        emit AccessRevoked(recordId, consumerAddress, didAuth.getDidFromAddress(consumerAddress), msg.sender);
    }

    /**
     * @notice Verify a record by a trusted verifier
     * @param recordId String representation of record ID
     */
    function verifyRecord(string calldata recordId)
        external
        whenNotPaused
        nonReentrant
        withRole(didAuth.VERIFIER_ROLE())
    {
        // Check record existence
        if (_resourceMetadata[recordId].contentHash == bytes32(0)) {
            revert DataRegistry__RecordNotFound(recordId);
        }

        // Mark as verified
        _verifiedRecords[recordId] = true;

        emit RecordVerified(recordId, msg.sender);
    }

    /**
     * @notice Update consent status for a producer
     * @param producer Producer address
     * @param consentStatus New consent status
     */
    function updateProducerConsent(address producer, ConsentStatus consentStatus)
        external
        withRole(didAuth.PRODUCER_ROLE())
        whenNotPaused
    {
        // Ensure producer exists
        if (bytes(_producerMetadata[producer].did).length == 0) {
            revert DataRegistry__Unauthorized();
        }

        // Update consent
        _producerMetadata[producer].consent = uint8(consentStatus);
        _producerMetadata[producer].lastUpdated = uint40(block.timestamp);

        emit ConsentStatusChanged(producer, consentStatus, msg.sender);
    }

    /*===================== VIEW FUNCTIONS ======================*/
    /**
     * @notice Check if a consumer has access to a record
     * @param recordId String representation of record ID
     * @param consumerAddress any address that is allowed to access the record
     */
    function checkAccess(string calldata recordId, address consumerAddress)
        external
        view
        returns (bool hasAccess, uint40 expiration, uint8 accessLevel, bool isRevoked)
    {
        // Check record existence
        if (_resourceMetadata[recordId].contentHash == bytes32(0)) {
            return (false, 0, 0, true);
        }

        // Get producer address
        address producer = _resourceMetadata[recordId].producer;
        // Producer always has full access
        if (producer == consumerAddress) {
            return (true, type(uint40).max, uint8(AccessLevel.Write), false);
        }

        // Get access permissions
        AccessPermission memory access = _accessPermissions[recordId][consumerAddress];

        // Check if revoked
        if (access.isRevoked) {
            return (false, access.expiration, access.accessLevel, true);
        }

        // Check if expired
        hasAccess = uint40(block.timestamp) <= access.expiration;

        return (hasAccess, access.expiration, access.accessLevel, access.isRevoked);
    }

    /**
     * @notice Get basic record information this should be public as we are not storing any sensitive data
     * @param recordId String representation of record ID
     */
    function getRecordInfo(string calldata recordId)
        external
        view
        returns (bool isVerified, ResourceMetadata memory metadata)
    {
        // checkDataAccess(recordId)
        // Check record existence
        if (bytes(_resourceMetadata[recordId].recordId).length == 0) {
            revert DataRegistry__RecordNotFound(recordId);
        }

        metadata = _resourceMetadata[recordId];
        isVerified = _verifiedRecords[recordId];
    }

    /**
     * @notice Get all records for a producer
     * @param producer Producer address
     */
    function getProducerRecords(address producer) external view returns (string[] memory recordIds) {
        return _producerRecords[producer];
    }

    /**
     * @notice Get producer metadata
     * @param producer Producer address
     */
    function getProducerMetadata(address producer)
        external
        view
        returns (string memory did, uint8 consent, uint16 entries, bool isActive, uint40 lastUpdated, uint40 nonce)
    {
        ProducerMetadata memory metadata = _producerMetadata[producer];
        return
            (metadata.did, metadata.consent, metadata.entries, metadata.isActive, metadata.lastUpdated, metadata.nonce);
    }

    /**
     * @notice Get total record count
     */
    function getTotalRecords() external view returns (uint256) {
        return _totalRecords;
    }

    /**
     * @notice Check if a record is verified
     * @param recordId String representation of record ID
     */
    function isRecordVerified(string calldata recordId) external view returns (bool) {
        return _verifiedRecords[recordId];
    }

    /**
     * @notice Check if a provider is authorized for a record
     * @param _provider Provider address to check
     * @param recordId Record ID to check
     */
    function isAuthorizedProvider(address _provider, string memory recordId) public view returns (bool) {
        bool isProvider = didAuth.authenticate(didAuth.getDidFromAddress(_provider), didAuth.PROVIDER_ROLE())
            && _authorizedProviders[_provider];
        bool hasPermission = _accessPermissions[recordId][_provider].accessLevel > 0;

        return isProvider && hasPermission;
    }

    function getCompensationAddress() external view returns (address) {
        return address(compensation);
    }

    /*===================== ADMIN FUNCTIONS ======================*/
    /**
     * @notice Update the DidAuth contract address
     * @param _didAuthAddress Address of the new DidAuth contract
     */
    function updateDidAuthAddress(address _didAuthAddress) external onlyOwner {
        if (_didAuthAddress == address(0)) {
            revert DataRegistry__InvalidDidAuthAddress();
        }

        address oldAddress = address(didAuth);
        didAuth = DidAuth(_didAuthAddress);

        emit DidAuthUpdated(oldAddress, _didAuthAddress);
    }

    /**
     * @notice Update the Compensation contract address
     * @param _compensationAddress Address of the new Compensation contract
     */
    function updateCompensationAddress(address _compensationAddress) external onlyOwner {
        address oldAddress = address(compensation);
        compensation = Compensation(_compensationAddress);

        emit CompensationUpdated(oldAddress, _compensationAddress);
    }

    /**
     * @notice Pauses the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpauses the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // Add a view function to get producer
    function getRecordProducer(string calldata recordId) external view returns (address) {
        return _resourceMetadata[recordId].producer;
    }
}
