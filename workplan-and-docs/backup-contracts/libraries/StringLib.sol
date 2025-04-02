// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title StringLib
 * @dev Library containing string manipulation utilities
 * @notice This library provides functions for efficient string operations
 */
library StringLib {
    /**
     * @dev Checks if two strings are equal
     * @param a First string
     * @param b Second string
     * @return True if the strings are equal, false otherwise
     */
    function equals(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }

    /**
     * @dev Concatenates two strings
     * @param a First string
     * @param b Second string
     * @return result Concatenated string
     */
    function concat(string memory a, string memory b) internal pure returns (string memory result) {
        return string(abi.encodePacked(a, b));
    }

    /**
     * @dev Concatenates three strings
     * @param a First string
     * @param b Second string
     * @param c Third string
     * @return result Concatenated string
     */
    function concat(string memory a, string memory b, string memory c) internal pure returns (string memory result) {
        return string(abi.encodePacked(a, b, c));
    }

    /**
     * @dev Checks if a string is empty
     * @param s String to check
     * @return True if the string is empty, false otherwise
     */
    function isEmpty(string memory s) internal pure returns (bool) {
        return bytes(s).length == 0;
    }

    /**
     * @dev Converts an address to a string
     * @param addr Address to convert
     * @return result String representation of the address
     */
    function addressToString(address addr) internal pure returns (string memory result) {
        bytes memory addressBytes = abi.encodePacked(addr);
        bytes memory stringBytes = new bytes(42);

        stringBytes[0] = "0";
        stringBytes[1] = "x";

        for (uint256 i = 0; i < 20; i++) {
            uint8 leftNibble = uint8(addressBytes[i]) >> 4;
            uint8 rightNibble = uint8(addressBytes[i]) & 0xf;

            stringBytes[2 + i * 2] = toHexChar(leftNibble);
            stringBytes[2 + i * 2 + 1] = toHexChar(rightNibble);
        }

        return string(stringBytes);
    }

    /**
     * @dev Converts a uint256 to a string
     * @param value uint256 to convert
     * @return result String representation of the uint256
     */
    function uint256ToString(uint256 value) internal pure returns (string memory result) {
        if (value == 0) {
            return "0";
        }

        uint256 temp = value;
        uint256 digits;

        while (temp != 0) {
            digits++;
            temp /= 10;
        }

        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }

        return string(buffer);
    }

    /**
     * @dev Converts a byte to its hexadecimal character representation
     * @param b Byte to convert
     * @return Hexadecimal character
     */
    function toHexChar(uint8 b) internal pure returns (bytes1) {
        if (b < 10) {
            return bytes1(b + 48); // 0-9
        } else {
            return bytes1(b + 87); // a-f
        }
    }

    /**
     * @dev Extracts a substring from a string
     * @param str String to extract from
     * @param startIndex Start index of the substring
     * @param endIndex End index of the substring (exclusive)
     * @return result Extracted substring
     */
    function substring(string memory str, uint256 startIndex, uint256 endIndex)
        internal
        pure
        returns (string memory result)
    {
        bytes memory strBytes = bytes(str);
        require(startIndex < endIndex, "Invalid indices");
        require(endIndex <= strBytes.length, "End index out of bounds");

        bytes memory substringBytes = new bytes(endIndex - startIndex);
        for (uint256 i = startIndex; i < endIndex; i++) {
            substringBytes[i - startIndex] = strBytes[i];
        }

        return string(substringBytes);
    }
}
