// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IDidRegistry
 * @dev Interface for the DID Registry contract
 * @notice This interface defines the standard functions for DID management
 */
interface IDidRegistry {
    /*===================== EVENTS ======================*/
    /**
     * @dev Emitted when a DID is registered
     * @param did The registered DID
     * @param controller The address of the controller
     */
    event DIDRegistered(string did, address indexed controller);

    /**
     * @dev Emitted when a DID is updated
     * @param did The updated DID
     * @param timestamp The timestamp of the update
     */
    event DIDUpdated(string did, uint256 indexed timestamp);

    /**
     * @dev Emitted when a DID is deactivated
     * @param did The deactivated DID
     * @param timestamp The timestamp of the deactivation
     */
    event DIDDeactivated(string did, uint256 indexed timestamp);

    /*===================== FUNCTIONS ======================*/
    /**
     * @dev Registers a new DID
     * @param did The DID to register
     * @param document The DID document
     * @param publicKey The public key associated with the DID
     */
    function registerDid(string calldata did, string calldata document, string calldata publicKey) external;

    /**
     * @dev Updates an existing DID
     * @param did The DID to update
     * @param document The updated DID document
     * @param publicKey The updated public key
     */
    function updateDid(string calldata did, string calldata document, string calldata publicKey) external;

    /**
     * @dev Deactivates a DID
     * @param did The DID to deactivate
     */
    function deactivateDid(string calldata did) external;

    /**
     * @dev Checks if a DID is active
     * @param did The DID to check
     * @return True if the DID is active, false otherwise
     */
    function isActive(string calldata did) external view returns (bool);

    /**
     * @dev Gets the DID document for a DID
     * @param did The DID to get the document for
     * @return subject The address of the controller
     * @return lastUpdated The timestamp of the last update
     * @return active Whether the DID is active
     * @return publicKey The public key associated with the DID
     * @return document The DID document
     */
    function getDidDocument(string calldata did)
        external
        view
        returns (address subject, uint256 lastUpdated, bool active, string memory publicKey, string memory document);

    /**
     * @dev Gets the DID for an address
     * @param subject The address to get the DID for
     * @return The DID associated with the address
     */
    function getDidByAddress(address subject) external view returns (string memory);

    /**
     * @dev Gets the address for a DID
     * @param did The DID to get the address for
     * @return The address associated with the DID
     */
    function getAddressByDid(string calldata did) external view returns (address);
}
