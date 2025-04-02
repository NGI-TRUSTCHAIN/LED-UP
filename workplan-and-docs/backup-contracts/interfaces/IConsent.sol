// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IConsent
 * @dev Interface for the Consent Management contract
 * @notice This interface defines the standard functions for consent management
 */
interface IConsent {
    /*===================== ENUMS ======================*/
    /**
     * @dev Enum for consent status
     */
    enum ConsentStatus {
        NotSet,
        Granted,
        Revoked
    }

    /*===================== STRUCTS ======================*/
    /**
     * @dev Consent structure
     */
    struct Consent {
        string producerDid;
        string providerDid;
        ConsentStatus status;
        uint256 timestamp;
        uint256 expiryTime;
        string purpose;
    }

    /*===================== ERRORS ======================*/
    error ConsentManagement__InvalidDID();
    error ConsentManagement__NotFound();
    error ConsentManagement__AlreadyGranted();
    error ConsentManagement__Unauthorized();

    /*===================== EVENTS ======================*/
    /**
     * @dev Emitted when consent is granted
     * @param producerDid The DID of the producer
     * @param providerDid The DID of the provider
     * @param purpose The purpose of the consent
     * @param expiryTime The expiry time of the consent
     */
    event ConsentGranted(string indexed producerDid, string indexed providerDid, string purpose, uint256 expiryTime);

    /**
     * @dev Emitted when consent is revoked
     * @param producerDid The DID of the producer
     * @param providerDid The DID of the provider
     * @param reason The reason for revoking consent
     */
    event ConsentRevoked(string indexed producerDid, string indexed providerDid, string reason);

    /*===================== FUNCTIONS ======================*/
    /**
     * @dev Grants consent from a producer to a provider
     * @param producerDid The DID of the producer
     * @param providerDid The DID of the provider
     * @param purpose The purpose of the consent
     * @param expiryTime The expiry time of the consent (0 for no expiry)
     */
    function grantConsent(
        string calldata producerDid,
        string calldata providerDid,
        string calldata purpose,
        uint256 expiryTime
    ) external;

    /**
     * @dev Revokes consent from a producer to a provider
     * @param producerDid The DID of the producer
     * @param providerDid The DID of the provider
     * @param reason The reason for revoking consent
     */
    function revokeConsent(string calldata producerDid, string calldata providerDid, string calldata reason) external;

    /**
     * @dev Checks if consent has been granted
     * @param producerDid The DID of the producer
     * @param providerDid The DID of the provider
     * @return status The status of the consent
     * @return expiryTime The expiry time of the consent
     * @return purpose The purpose of the consent
     */
    function checkConsent(string calldata producerDid, string calldata providerDid)
        external
        view
        returns (ConsentStatus status, uint256 expiryTime, string memory purpose);

    /**
     * @dev Gets the full consent record
     * @param producerDid The DID of the producer
     * @param providerDid The DID of the provider
     * @return The consent record
     */
    function getConsent(string calldata producerDid, string calldata providerDid)
        external
        view
        returns (Consent memory);

    /**
     * @dev Checks if consent is valid (granted and not expired)
     * @param producerDid The DID of the producer
     * @param providerDid The DID of the provider
     * @return True if consent is valid, false otherwise
     */
    function isConsentValid(string calldata producerDid, string calldata providerDid) external view returns (bool);
}
