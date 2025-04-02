// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IConsentManagement
 * @dev Interface for the Consent Management contract
 * @notice This interface defines the standard functions for consent management
 */
interface IConsentManagement {
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
    ) external;

    /**
     * @dev Revokes consent
     * @param dataSubjectDid The DID of the data subject
     * @param dataControllerDid The DID of the data controller
     * @param purposeId The ID of the purpose
     */
    function revokeConsent(string memory dataSubjectDid, string memory dataControllerDid, string memory purposeId)
        external;

    /**
     * @dev Gets the DID registry address
     * @return The DID registry address
     */
    function getDidRegistryAddress() external view returns (address);
}
