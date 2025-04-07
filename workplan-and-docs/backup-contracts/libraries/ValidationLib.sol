// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ValidationLib
 * @dev Library containing validation utilities
 * @notice This library provides functions for validating inputs and states
 */
library ValidationLib {
    /**
     * @dev Validates a DID format
     * @param _did The DID to validate
     * @param _method The expected DID method
     * @return True if the DID format is valid, false otherwise
     */
    function validateDidFormat(string memory _did, string memory _method) internal pure returns (bool) {
        bytes memory didBytes = bytes(_did);
        bytes memory methodBytes = bytes(_method);

        // Check minimum length: "did:" + method + ":" + at least 1 char
        if (didBytes.length < 7 + methodBytes.length) {
            return false;
        }

        // Check "did:" prefix
        if (didBytes[0] != "d" || didBytes[1] != "i" || didBytes[2] != "d" || didBytes[3] != ":") {
            return false;
        }

        // Check method
        for (uint256 i = 0; i < methodBytes.length; i++) {
            if (didBytes[4 + i] != methodBytes[i]) {
                return false;
            }
        }

        // Check separator after method
        if (didBytes[4 + methodBytes.length] != ":") {
            return false;
        }

        return true;
    }

    /**
     * @dev Validates an address is not the zero address
     * @param _address The address to validate
     * @return True if the address is valid, false otherwise
     */
    function validateAddress(address _address) internal pure returns (bool) {
        return _address != address(0);
    }

    /**
     * @dev Validates a string is not empty
     * @param _str The string to validate
     * @return True if the string is not empty, false otherwise
     */
    function validateString(string memory _str) internal pure returns (bool) {
        return bytes(_str).length > 0;
    }

    /**
     * @dev Validates a string has a minimum and maximum length
     * @param _str The string to validate
     * @param _minLength The minimum length
     * @param _maxLength The maximum length
     * @return True if the string length is valid, false otherwise
     */
    function validateStringLength(string memory _str, uint256 _minLength, uint256 _maxLength)
        internal
        pure
        returns (bool)
    {
        uint256 length = bytes(_str).length;
        return length >= _minLength && length <= _maxLength;
    }

    /**
     * @dev Validates a value is within a range
     * @param _value The value to validate
     * @param _minValue The minimum value
     * @param _maxValue The maximum value
     * @return True if the value is within the range, false otherwise
     */
    function validateRange(uint256 _value, uint256 _minValue, uint256 _maxValue) internal pure returns (bool) {
        return _value >= _minValue && _value <= _maxValue;
    }

    /**
     * @dev Validates a record ID format
     * @param _recordId The record ID to validate
     * @return True if the record ID format is valid, false otherwise
     */
    function validateRecordId(string memory _recordId) internal pure returns (bool) {
        bytes memory recordIdBytes = bytes(_recordId);

        // Check minimum length
        if (recordIdBytes.length < 3) {
            return false;
        }

        // Check for invalid characters
        for (uint256 i = 0; i < recordIdBytes.length; i++) {
            bytes1 char = recordIdBytes[i];

            // Allow alphanumeric characters, hyphens, and underscores
            bool isValid = (
                (char >= "0" && char <= "9") || (char >= "a" && char <= "z") || (char >= "A" && char <= "Z")
                    || char == "-" || char == "_"
            );

            if (!isValid) {
                return false;
            }
        }

        return true;
    }

    /**
     * @dev Validates a metadata format
     * @param _metadata The metadata to validate
     * @return True if the metadata format is valid, false otherwise
     */
    function validateMetadata(string memory _metadata) internal pure returns (bool) {
        bytes memory metadataBytes = bytes(_metadata);

        // Check minimum length
        if (metadataBytes.length < 2) {
            return false;
        }

        // Check for JSON format (starts with { and ends with })
        return metadataBytes[0] == "{" && metadataBytes[metadataBytes.length - 1] == "}";
    }

    /**
     * @dev Validates a consent purpose
     * @param _purpose The purpose to validate
     * @return True if the purpose is valid, false otherwise
     */
    function validateConsentPurpose(string memory _purpose) internal pure returns (bool) {
        return validateStringLength(_purpose, 3, 200);
    }
}
