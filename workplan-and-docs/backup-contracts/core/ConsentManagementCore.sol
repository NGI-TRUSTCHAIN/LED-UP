// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {BaseContract} from "../base/BaseContract.sol";
import {IConsentManagement} from "../interfaces/IConsentManagement.sol";
import {IDidRegistry} from "../interfaces/IDidRegistry.sol";

/**
 * @title ConsentManagementCore
 * @dev Core implementation of the Consent Management contract
 * @notice This contract provides the core functionality for managing consent
 */
abstract contract ConsentManagementCore is BaseContract, IConsentManagement {
    /*===================== ERRORS ======================*/
    error ConsentManagementCore__Unauthorized();
    error ConsentManagementCore__InvalidDID();
    error ConsentManagementCore__InvalidConsent();
    error ConsentManagementCore__ConsentNotFound();
    error ConsentManagementCore__ConsentExpired();
    error ConsentManagementCore__InvalidPurpose();
    error ConsentManagementCore__InvalidTimestamp();

    /*===================== STRUCTS ======================*/
    /**
     * @dev Consent structure
     */
    struct Consent {
        string dataSubjectDid;
        string dataControllerDid;
        string purposeId;
        string[] dataCategories;
        uint256 createdAt;
        uint256 expiresAt;
        bool active;
    }

    /*===================== VARIABLES ======================*/
    // DID registry contract address
    address private didRegistry;

    // Consent storage
    // dataSubjectDid => dataControllerDid => purposeId => Consent
    mapping(string => mapping(string => mapping(string => Consent))) private consents;

    /*===================== EVENTS ======================*/
    event ConsentGiven(
        string indexed dataSubjectDid, string indexed dataControllerDid, string purposeId, uint256 expiresAt
    );
    event ConsentRevoked(string indexed dataSubjectDid, string indexed dataControllerDid, string purposeId);
    event DidRegistryAddressUpdated(address indexed oldAddress, address indexed newAddress);

    /*===================== CONSTRUCTOR ======================*/
    /**
     * @dev Constructor
     * @param _didRegistry The address of the DID registry
     */
    constructor(address _didRegistry) {
        if (_didRegistry == address(0)) revert ConsentManagementCore__InvalidDID();
        didRegistry = _didRegistry;
    }

    /*===================== EXTERNAL FUNCTIONS ======================*/
    /**
     * @dev Gives consent
     * @param dataSubjectDid The DID of the data subject
     * @param dataControllerDid The DID of the data controller
     * @param purposeId The ID of the purpose
     * @param dataCategories The categories of data
     * @param expiresAt The expiration timestamp
     */
    function giveConsent(
        string calldata dataSubjectDid,
        string calldata dataControllerDid,
        string calldata purposeId,
        string[] calldata dataCategories,
        uint256 expiresAt
    ) public virtual whenNotPausedWithCustomError {
        if (bytes(dataSubjectDid).length == 0) revert ConsentManagementCore__InvalidDID();
        if (bytes(dataControllerDid).length == 0) revert ConsentManagementCore__InvalidDID();
        if (bytes(purposeId).length == 0) revert ConsentManagementCore__InvalidPurpose();
        if (expiresAt <= block.timestamp) revert ConsentManagementCore__InvalidTimestamp();

        // Store consent
        consents[dataSubjectDid][dataControllerDid][purposeId] = Consent({
            dataSubjectDid: dataSubjectDid,
            dataControllerDid: dataControllerDid,
            purposeId: purposeId,
            dataCategories: dataCategories,
            createdAt: block.timestamp,
            expiresAt: expiresAt,
            active: true
        });

        emit ConsentGiven(dataSubjectDid, dataControllerDid, purposeId, expiresAt);
    }

    /**
     * @dev Revokes consent
     * @param dataSubjectDid The DID of the data subject
     * @param dataControllerDid The DID of the data controller
     * @param purposeId The ID of the purpose
     */
    function revokeConsent(string memory dataSubjectDid, string memory dataControllerDid, string memory purposeId)
        public
        virtual
        whenNotPausedWithCustomError
    {
        Consent storage consent = consents[dataSubjectDid][dataControllerDid][purposeId];

        if (bytes(consent.dataSubjectDid).length == 0) {
            revert ConsentManagementCore__ConsentNotFound();
        }

        if (!consent.active) {
            revert ConsentManagementCore__InvalidConsent();
        }

        // Deactivate consent
        consent.active = false;

        emit ConsentRevoked(dataSubjectDid, dataControllerDid, purposeId);
    }

    /**
     * @dev Updates the DID registry address
     * @param _didRegistry The new DID registry address
     */
    function updateDidRegistryAddress(address _didRegistry) external onlyOwner {
        if (_didRegistry == address(0)) revert ConsentManagementCore__InvalidDID();

        address oldRegistry = didRegistry;
        didRegistry = _didRegistry;

        emit DidRegistryAddressUpdated(oldRegistry, _didRegistry);
    }

    /**
     * @dev Gets the address for a DID
     * @param did The DID to get the address for
     * @return The address associated with the DID
     */
    function getAddressByDid(string calldata did) public view returns (address) {
        // Call the DID registry to get the address
        return IDidRegistry(didRegistry).getAddressByDid(did);
    }

    /*===================== VIEW FUNCTIONS ======================*/
    /**
     * @dev Gets consent
     * @param dataSubjectDid The DID of the data subject
     * @param dataControllerDid The DID of the data controller
     * @param purposeId The ID of the purpose
     * @return The consent
     */
    function getConsent(string calldata dataSubjectDid, string calldata dataControllerDid, string calldata purposeId)
        external
        view
        returns (Consent memory)
    {
        Consent memory consent = consents[dataSubjectDid][dataControllerDid][purposeId];

        if (bytes(consent.dataSubjectDid).length == 0) {
            revert ConsentManagementCore__ConsentNotFound();
        }

        return consent;
    }

    /**
     * @dev Checks if consent is valid
     * @param dataSubjectDid The DID of the data subject
     * @param dataControllerDid The DID of the data controller
     * @param purposeId The ID of the purpose
     * @return True if the consent is valid, false otherwise
     */
    function isConsentValid(
        string calldata dataSubjectDid,
        string calldata dataControllerDid,
        string calldata purposeId
    ) external view returns (bool) {
        Consent memory consent = consents[dataSubjectDid][dataControllerDid][purposeId];

        if (bytes(consent.dataSubjectDid).length == 0) {
            return false;
        }

        return (consent.active && consent.expiresAt > block.timestamp);
    }

    /**
     * @dev Gets the DID registry address
     * @return The DID registry address
     */
    function getDidRegistryAddress() external view returns (address) {
        return didRegistry;
    }
}
