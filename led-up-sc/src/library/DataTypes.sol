// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

/**
 * @title DataTypes
 * @notice This library defines various data structures and enumerations used throughout the contract.
 */
library DataTypes {
    /**
     * @dev Represents metadata for an entity.
     * @param url The URL of the metadata.
     * @param hash The hash of the metadata for integrity verification.
     */
    struct Metadata {
        string url; // the url of the metadata
        bytes32 hash; // the hash of the metadata
    }

    /**
     * @dev Represents the metadata of a record.
     * @param cid The content identifier of the metadata (e.g., QmYwAPJzv5CZsnAzt8auVTL6gUsR52ygqybH3QW3sF9S5A).
     * @param url The FHIR URL of the metadata (e.g., https://leveaserver.com/Producer/123).
     * @param hash The hash of the encrypted metadata stored in the CID URL.
     */
    struct RecordMetadata {
        string cid; // the cid of the metadata - example - QmYwAPJzv5CZsnAzt8auVTL6gUsR52ygqybH3QW3sF9S5A
        string url; // the fhir url  of the metadata - example - https://leveaserver.com/Producer/123
        bytes32 hash; // the hash of the encrypted metadata stored in cid url
            // uint256 size; // the size of the metadata in bytes
    }

    /**
     * @dev Represents a schema that references metadata.
     * @param schemaRef The metadata that defines the schema.
     */
    struct Schema {
        Metadata schemaRef;
    }

    /**
     * @dev Defines possible statuses of a record.
     */
    enum RecordStatus {
        ACTIVE, // The record is active.
        INACTIVE, // The record is inactive.
        SUSPENDED, // The record is suspended.
        ERROR, // The record encountered an error.
        UNKNOWN // The record status is unknown.

    }

    /**
     * @dev Defines possible consent statuses.
     */
    enum ConsentStatus {
        Allowed, // Consent is allowed.
        Denied, // Consent is denied.
        Pending // Consent is pending.

    }

    /**
     * @dev Represents a record of patient data.
     * @param signature The signature of the patient for verification purposes.
     * @param resourceType The type of resource represented by the record.
     * @param metadata Metadata associated with the record.
     */
    struct Record {
        bytes signature;
        string resourceType;
        RecordMetadata metadata;
    }

    /**
     * @dev Represents information about a specific record.
     * @param producer The address of the producer associated with the record.
     * @param status The status of the record.
     * @param consent The consent status related to the record.
     * @param nonce A unique identifier for the record to prevent replay attacks.
     */
    struct RecordInfo {
        address producer;
        RecordStatus status;
        ConsentStatus consent;
        uint256 nonce;
    }

    /**
     * @dev Represents a producer's records.
     * @param producer The address of the producer.
     * @param status The current status of the producer's records.
     * @param consent The consent status of the producer.
     * @param records A mapping of record identifiers to their respective records.
     * @param nonce A unique identifier for the producer's records to prevent replay attacks.
     */
    struct ProducerRecord {
        address producer;
        DataTypes.RecordStatus status; // active, inactive, suspended, error, unknown
        DataTypes.ConsentStatus consent; // allowed, denied, pending
        mapping(string => DataTypes.Record) records;
        uint256 nonce;
    }
}
