// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {ConsentManagementCore} from "../core/ConsentManagementCore.sol";
import {ValidationLib} from "../libraries/ValidationLib.sol";
import {SecurityLib} from "../libraries/SecurityLib.sol";
import {IDidRegistry} from "../interfaces/IDidRegistry.sol";

/**
 * @title ConsentManagementExtended
 * @dev Extended implementation of the Consent Management contract with additional features
 * @notice This contract extends the core Consent Management contract with additional functionality
 */
contract ConsentManagementExtended is ConsentManagementCore {
    /*===================== ERRORS ======================*/
    error ConsentManagementExtended__InvalidSignature();
    error ConsentManagementExtended__InvalidTimestamp();
    error ConsentManagementExtended__InvalidPurpose();
    error ConsentManagementExtended__InvalidConsent();
    error ConsentManagementExtended__ConsentAlreadyExists();
    error ConsentManagementExtended__ConsentNotFound();
    error ConsentManagementExtended__ConsentExpired();
    error ConsentManagementExtended__InvalidDataSubject();

    /*===================== STRUCTS ======================*/
    /**
     * @dev Consent purpose structure
     */
    struct ConsentPurpose {
        string purposeId;
        string name;
        string description;
        uint256 timestamp;
        bool active;
    }

    /**
     * @dev Extended consent structure
     */
    struct ExtendedConsent {
        bytes32 consentId;
        string dataSubjectDid;
        string dataControllerDid;
        string purposeId;
        string[] dataCategories;
        uint256 createdAt;
        uint256 expiresAt;
        bool active;
        string jurisdiction;
        string legalBasis;
        string[] thirdParties;
    }

    /**
     * @dev Consent history entry structure
     */
    struct ConsentHistoryEntry {
        bytes32 consentId;
        string action;
        uint256 timestamp;
        string reason;
    }

    /*===================== VARIABLES ======================*/
    // Consent purposes
    mapping(string => ConsentPurpose) private consentPurposes;
    string[] private purposeIds;

    // Extended consents
    mapping(bytes32 => ExtendedConsent) private extendedConsents;

    // Consent history
    mapping(bytes32 => ConsentHistoryEntry[]) private consentHistory;

    // Used nonces for replay protection
    mapping(bytes32 => bool) private usedNonces;

    // DID registry interface
    IDidRegistry private didRegistryInterface;

    /*===================== EVENTS ======================*/
    event PurposeCreated(string indexed purposeId, string name);
    event PurposeUpdated(string indexed purposeId, string name);
    event PurposeDeactivated(string indexed purposeId);
    event ExtendedConsentGiven(
        bytes32 indexed consentId, string dataSubjectDid, string dataControllerDid, string purposeId
    );
    event ExtendedConsentRevoked(bytes32 indexed consentId, string reason);
    event ConsentHistoryAdded(bytes32 indexed consentId, string action);

    /*===================== CONSTRUCTOR ======================*/
    /**
     * @dev Constructor
     * @param _didRegistry The address of the DID registry
     */
    constructor(address _didRegistry) ConsentManagementCore(_didRegistry) {
        didRegistryInterface = IDidRegistry(_didRegistry);
    }

    /*===================== EXTERNAL FUNCTIONS ======================*/
    /**
     * @dev Creates a consent purpose
     * @param purposeId The ID of the purpose
     * @param name The name of the purpose
     * @param description The description of the purpose
     */
    function createConsentPurpose(string calldata purposeId, string calldata name, string calldata description)
        external
        onlyOwner
        whenNotPausedWithCustomError
    {
        if (bytes(consentPurposes[purposeId].purposeId).length > 0) {
            revert ConsentManagementExtended__ConsentAlreadyExists();
        }

        consentPurposes[purposeId] = ConsentPurpose({
            purposeId: purposeId,
            name: name,
            description: description,
            timestamp: block.timestamp,
            active: true
        });

        purposeIds.push(purposeId);

        emit PurposeCreated(purposeId, name);
    }

    /**
     * @dev Updates a consent purpose
     * @param purposeId The ID of the purpose
     * @param name The updated name
     * @param description The updated description
     */
    function updateConsentPurpose(string calldata purposeId, string calldata name, string calldata description)
        external
        onlyOwner
        whenNotPausedWithCustomError
    {
        if (bytes(consentPurposes[purposeId].purposeId).length == 0) {
            revert ConsentManagementExtended__InvalidPurpose();
        }

        consentPurposes[purposeId].name = name;
        consentPurposes[purposeId].description = description;
        consentPurposes[purposeId].timestamp = block.timestamp;

        emit PurposeUpdated(purposeId, name);
    }

    /**
     * @dev Deactivates a consent purpose
     * @param purposeId The ID of the purpose
     */
    function deactivateConsentPurpose(string calldata purposeId) external onlyOwner whenNotPausedWithCustomError {
        if (bytes(consentPurposes[purposeId].purposeId).length == 0) {
            revert ConsentManagementExtended__InvalidPurpose();
        }

        consentPurposes[purposeId].active = false;

        emit PurposeDeactivated(purposeId);
    }

    /**
     * @dev Gives extended consent
     * @param dataSubjectDid The DID of the data subject
     * @param dataControllerDid The DID of the data controller
     * @param purposeId The ID of the purpose
     * @param dataCategories The categories of data
     * @param expiresAt The expiration timestamp
     * @param jurisdiction The jurisdiction
     * @param legalBasis The legal basis
     * @param thirdParties The third parties
     * @return consentId The ID of the created consent
     */
    function giveExtendedConsent(
        string calldata dataSubjectDid,
        string calldata dataControllerDid,
        string calldata purposeId,
        string[] calldata dataCategories,
        uint256 expiresAt,
        string calldata jurisdiction,
        string calldata legalBasis,
        string[] calldata thirdParties
    ) public whenNotPausedWithCustomError returns (bytes32 consentId) {
        // Validate inputs
        if (bytes(consentPurposes[purposeId].purposeId).length == 0 || !consentPurposes[purposeId].active) {
            revert ConsentManagementExtended__InvalidPurpose();
        }

        if (expiresAt <= block.timestamp) {
            revert ConsentManagementExtended__InvalidTimestamp();
        }

        // Generate consent ID
        consentId = keccak256(abi.encodePacked(dataSubjectDid, dataControllerDid, purposeId, block.timestamp));

        // Store extended consent
        extendedConsents[consentId] = ExtendedConsent({
            consentId: consentId,
            dataSubjectDid: dataSubjectDid,
            dataControllerDid: dataControllerDid,
            purposeId: purposeId,
            dataCategories: dataCategories,
            createdAt: block.timestamp,
            expiresAt: expiresAt,
            active: true,
            jurisdiction: jurisdiction,
            legalBasis: legalBasis,
            thirdParties: thirdParties
        });

        // Add to history
        consentHistory[consentId].push(
            ConsentHistoryEntry({consentId: consentId, action: "given", timestamp: block.timestamp, reason: ""})
        );

        // Also register in the core contract
        giveConsent(dataSubjectDid, dataControllerDid, purposeId, dataCategories, expiresAt);

        emit ExtendedConsentGiven(consentId, dataSubjectDid, dataControllerDid, purposeId);

        return consentId;
    }

    /**
     * @dev Revokes extended consent
     * @param consentId The ID of the consent
     * @param reason The reason for revocation
     */
    function revokeExtendedConsent(bytes32 consentId, string calldata reason) external whenNotPausedWithCustomError {
        ExtendedConsent storage consent = extendedConsents[consentId];

        if (consent.consentId == bytes32(0)) {
            revert ConsentManagementExtended__ConsentNotFound();
        }

        if (!consent.active) {
            revert ConsentManagementExtended__InvalidConsent();
        }

        // Deactivate consent
        consent.active = false;

        // Add to history
        consentHistory[consentId].push(
            ConsentHistoryEntry({consentId: consentId, action: "revoked", timestamp: block.timestamp, reason: reason})
        );

        // Also revoke in the core contract
        super.revokeConsent(consent.dataSubjectDid, consent.dataControllerDid, consent.purposeId);

        emit ExtendedConsentRevoked(consentId, reason);
    }

    /**
     * @dev Gives extended consent with a signature
     * @param dataSubjectDid The DID of the data subject
     * @param dataControllerDid The DID of the data controller
     * @param purposeId The ID of the purpose
     * @param dataCategories The categories of data
     * @param expiresAt The expiration timestamp
     * @param jurisdiction The jurisdiction
     * @param legalBasis The legal basis
     * @param thirdParties The third parties
     * @param nonce A unique nonce
     * @param timestamp The timestamp of the consent
     * @param signature The signature of the consent data
     * @return consentId The ID of the created consent
     */
    function giveExtendedConsentWithSignature(
        string calldata dataSubjectDid,
        string calldata dataControllerDid,
        string calldata purposeId,
        string[] calldata dataCategories,
        uint256 expiresAt,
        string calldata jurisdiction,
        string calldata legalBasis,
        string[] calldata thirdParties,
        bytes32 nonce,
        uint256 timestamp,
        bytes calldata signature
    ) external whenNotPausedWithCustomError returns (bytes32 consentId) {
        // Check if nonce has been used
        if (!SecurityLib.validateNonce(usedNonces, nonce)) {
            revert ConsentManagementExtended__InvalidSignature();
        }

        // Check if timestamp is valid (within 5 minutes)
        if (!SecurityLib.validateTimestamp(timestamp, 5 minutes)) {
            revert ConsentManagementExtended__InvalidTimestamp();
        }

        // Create message hash
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                dataSubjectDid,
                dataControllerDid,
                purposeId,
                _hashStringArray(dataCategories),
                expiresAt,
                jurisdiction,
                legalBasis,
                _hashStringArray(thirdParties),
                nonce,
                timestamp
            )
        );

        // Get the data subject's address
        address dataSubject = didRegistryInterface.getAddressByDid(dataSubjectDid);

        // Verify signature
        if (!SecurityLib.validateSignature(messageHash, signature, dataSubject)) {
            revert ConsentManagementExtended__InvalidSignature();
        }

        // Give consent
        consentId = giveExtendedConsent(
            dataSubjectDid,
            dataControllerDid,
            purposeId,
            dataCategories,
            expiresAt,
            jurisdiction,
            legalBasis,
            thirdParties
        );

        return consentId;
    }

    /*===================== VIEW FUNCTIONS ======================*/
    /**
     * @dev Gets a consent purpose
     * @param purposeId The ID of the purpose
     * @return name The name of the purpose
     * @return description The description of the purpose
     * @return timestamp The timestamp of the purpose
     * @return active Whether the purpose is active
     */
    function getConsentPurpose(string calldata purposeId)
        external
        view
        returns (string memory name, string memory description, uint256 timestamp, bool active)
    {
        ConsentPurpose memory purpose = consentPurposes[purposeId];

        if (bytes(purpose.purposeId).length == 0) {
            revert ConsentManagementExtended__InvalidPurpose();
        }

        return (purpose.name, purpose.description, purpose.timestamp, purpose.active);
    }

    /**
     * @dev Gets all purpose IDs
     * @return The list of purpose IDs
     */
    function getPurposeIds() external view returns (string[] memory) {
        return purposeIds;
    }

    /**
     * @dev Gets an extended consent
     * @param consentId The ID of the consent
     * @return The extended consent
     */
    function getExtendedConsent(bytes32 consentId) external view returns (ExtendedConsent memory) {
        ExtendedConsent memory consent = extendedConsents[consentId];

        if (consent.consentId == bytes32(0)) {
            revert ConsentManagementExtended__ConsentNotFound();
        }

        return consent;
    }

    /**
     * @dev Gets the consent history
     * @param consentId The ID of the consent
     * @return The consent history
     */
    function getConsentHistory(bytes32 consentId) external view returns (ConsentHistoryEntry[] memory) {
        return consentHistory[consentId];
    }

    /**
     * @dev Checks if extended consent is valid
     * @param consentId The ID of the consent
     * @return True if the consent is valid, false otherwise
     */
    function isExtendedConsentValid(bytes32 consentId) external view returns (bool) {
        ExtendedConsent memory consent = extendedConsents[consentId];

        if (consent.consentId == bytes32(0)) {
            return false;
        }

        return (consent.active && consent.expiresAt > block.timestamp && consentPurposes[consent.purposeId].active);
    }

    /*===================== INTERNAL FUNCTIONS ======================*/
    /**
     * @dev Hashes an array of strings
     * @param strings The array of strings
     * @return The hash of the array
     */
    function _hashStringArray(string[] calldata strings) internal pure returns (bytes32) {
        bytes32[] memory hashes = new bytes32[](strings.length);

        for (uint256 i = 0; i < strings.length; i++) {
            hashes[i] = keccak256(bytes(strings[i]));
        }

        return keccak256(abi.encodePacked(hashes));
    }
}
