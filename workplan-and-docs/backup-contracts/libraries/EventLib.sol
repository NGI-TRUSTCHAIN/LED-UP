// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title EventLib
 * @dev Library containing utilities for event-based storage
 * @notice This library provides functions for using events as a cheaper alternative to storage
 */
library EventLib {
    /**
     * @dev Computes a unique identifier for an event
     * @param _address The address associated with the event
     * @param _id The ID associated with the event
     * @return A unique identifier for the event
     */
    function computeEventId(address _address, bytes32 _id) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(_address, _id));
    }

    /**
     * @dev Computes a unique identifier for an event
     * @param _address The address associated with the event
     * @param _id The string ID associated with the event
     * @return A unique identifier for the event
     */
    function computeEventId(address _address, string memory _id) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(_address, _id));
    }

    /**
     * @dev Computes a unique identifier for an event
     * @param _address1 The first address associated with the event
     * @param _address2 The second address associated with the event
     * @param _id The ID associated with the event
     * @return A unique identifier for the event
     */
    function computeEventId(address _address1, address _address2, bytes32 _id) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(_address1, _address2, _id));
    }

    /**
     * @dev Computes a unique identifier for an event
     * @param _address1 The first address associated with the event
     * @param _address2 The second address associated with the event
     * @param _id The string ID associated with the event
     * @return A unique identifier for the event
     */
    function computeEventId(address _address1, address _address2, string memory _id) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(_address1, _address2, _id));
    }

    /**
     * @dev Computes a unique identifier for an event
     * @param _did1 The first DID associated with the event
     * @param _did2 The second DID associated with the event
     * @return A unique identifier for the event
     */
    function computeEventId(string memory _did1, string memory _did2) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(_did1, _did2));
    }

    /**
     * @dev Computes a unique identifier for an event
     * @param _did The DID associated with the event
     * @param _role The role associated with the event
     * @return A unique identifier for the event
     */
    function computeEventId(string memory _did, bytes32 _role) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(_did, _role));
    }

    /**
     * @dev Computes a unique identifier for an event
     * @param _did The DID associated with the event
     * @param _credentialType The credential type associated with the event
     * @param _credentialId The credential ID associated with the event
     * @return A unique identifier for the event
     */
    function computeEventId(string memory _did, string memory _credentialType, bytes32 _credentialId)
        internal
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(_did, _credentialType, _credentialId));
    }

    /**
     * @dev Computes a unique identifier for a record event
     * @param _producer The producer address
     * @param _recordId The record ID
     * @return A unique identifier for the record event
     */
    function computeRecordEventId(address _producer, string memory _recordId) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(_producer, _recordId));
    }

    /**
     * @dev Computes a unique identifier for a consent event
     * @param _producerDid The producer DID
     * @param _providerDid The provider DID
     * @param _purpose The purpose of the consent
     * @return A unique identifier for the consent event
     */
    function computeConsentEventId(string memory _producerDid, string memory _providerDid, string memory _purpose)
        internal
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(_producerDid, _providerDid, _purpose));
    }

    /**
     * @dev Computes a unique identifier for a payment event
     * @param _consumer The consumer address
     * @param _producer The producer address
     * @param _recordId The record ID
     * @return A unique identifier for the payment event
     */
    function computePaymentEventId(address _consumer, address _producer, string memory _recordId)
        internal
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(_consumer, _producer, _recordId));
    }
}
