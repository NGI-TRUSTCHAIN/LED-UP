// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

library DataTypes {
    struct Metadata {
        string url; // the url of the metadata
        bytes32 hash; // the hash of the metadata
    }

    struct RecordMetadata {
        string cid; // the cid of the metadata - example - QmYwAPJzv5CZsnAzt8auVTL6gUsR52ygqybH3QW3sF9S5A
        string url; // the fhir url  of the metadata - example - https://leveaserver.com/Producer/123
        bytes32 hash; // the hash of the encrypted metadata stored in cid url
        // uint256 size; // the size of the metadata in bytes
    }

    struct Schema {
        Metadata schemaRef;
    }

    enum RecordStatus {
        ACTIVE,
        INACTIVE,
        SUSPENDED,
        ERROR,
        UNKNOWN
    }

    enum ConsentStatus {
        Allowed,
        Denied,
        Pending
    }

    struct Record {
        bytes signature; // the signature of the patient - where data is signed by the patient and stored here for verification purpose
        string resourceType; // the resource type of the record
        RecordMetadata metadata; // the metadata url of the record
    }

    struct RecordInfo {
        address producer;
        RecordStatus status;
        ConsentStatus consent;
        uint256 nonce;
    }

    // array of records will be patient Record
    struct ProducerRecord {
        address producer;
        DataTypes.RecordStatus status; // active, inactive, suspended, error, unknown
        DataTypes.ConsentStatus consent; // allowed, denied, pending
        mapping(string => DataTypes.Record) records;
        uint256 nonce;
    }
}
