// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title StorageLib
 * @dev Library containing common data structures used across contracts
 * @notice This library centralizes data structures to ensure consistency and reduce redundancy
 */
library StorageLib {
    /*===================== DID STRUCTURES ======================*/
    /**
     * @dev DID Document structure with optimized storage
     */
    struct DIDDocument {
        address subject; // The controller/subject address
        uint40 lastUpdated; // Timestamp of last update (reduced from uint256)
        bool active; // Active status flag
        string publicKey; // Public key string
        string document; // Document string
    }

    /**
     * @dev Optimized DID Document structure using hashes instead of strings
     */
    struct DIDDocumentOptimized {
        address subject; // The controller/subject address
        uint40 lastUpdated; // Timestamp of last update (reduced from uint256)
        bool active; // Active status flag
        bytes32 publicKeyHash; // Hash of public key
        bytes32 documentHash; // Hash of document
    }

    /*===================== CONSENT STRUCTURES ======================*/
    /**
     * @dev Enum for consent status
     */
    enum ConsentStatus {
        NotSet,
        Granted,
        Revoked
    }

    /**
     * @dev Consent structure
     */
    struct Consent {
        string producerDid; // Producer DID
        string providerDid; // Provider DID
        ConsentStatus status; // Consent status
        uint256 timestamp; // Timestamp of last update
        uint256 expiryTime; // Optional expiry time (0 means no expiry)
        string purpose; // Purpose for which consent is granted
    }

    /**
     * @dev Optimized Consent structure using hashes
     */
    struct ConsentOptimized {
        bytes32 producerDidHash; // Hash of producer DID
        bytes32 providerDidHash; // Hash of provider DID
        uint8 status; // Status as uint8 (0=NotSet, 1=Granted, 2=Revoked)
        uint40 timestamp; // Timestamp of last update (reduced size)
        uint40 expiryTime; // Optional expiry time (reduced size)
        bytes32 purposeHash; // Hash of purpose
    }

    /*===================== PAYMENT STRUCTURES ======================*/
    /**
     * @dev Payment structure
     */
    struct Payment {
        address consumer; // Consumer address
        address producer; // Producer address
        uint256 amount; // Payment amount
        uint256 serviceFee; // Service fee amount
        uint256 timestamp; // Timestamp of payment
        bool processed; // Whether payment has been processed
    }

    /**
     * @dev Optimized Payment structure
     */
    struct PaymentOptimized {
        address consumer; // Consumer address
        address producer; // Producer address
        uint128 amount; // Payment amount (reduced size)
        uint128 serviceFee; // Service fee amount (reduced size)
        uint40 timestamp; // Timestamp of payment (reduced size)
        bool processed; // Whether payment has been processed
    }

    /*===================== DATA REGISTRY STRUCTURES ======================*/
    /**
     * @dev Health Record structure
     */
    struct HealthRecord {
        string id; // Record ID
        address producer; // Producer address
        string metadata; // Metadata
        uint256 timestamp; // Timestamp of creation
        bool active; // Active status flag
    }

    /**
     * @dev Optimized Health Record structure
     */
    struct HealthRecordOptimized {
        bytes32 idHash; // Hash of record ID
        address producer; // Producer address
        bytes32 metadataHash; // Hash of metadata
        uint40 timestamp; // Timestamp of creation (reduced size)
        bool active; // Active status flag
    }

    /**
     * @dev Data Record Core structure
     */
    struct DataRecordCore {
        address producer; // Producer address
        uint256 timestamp; // Timestamp of creation
        bool registered; // Registration status
    }

    /**
     * @dev Metadata structure
     */
    struct Metadata {
        string name; // Name
        string description; // Description
        string schema; // Schema
        uint256 timestamp; // Timestamp of creation
    }

    /**
     * @dev Optimized Metadata structure
     */
    struct MetadataOptimized {
        bytes32 nameHash; // Hash of name
        bytes32 descriptionHash; // Hash of description
        bytes32 schemaHash; // Hash of schema
        uint40 timestamp; // Timestamp of creation (reduced size)
    }
}
