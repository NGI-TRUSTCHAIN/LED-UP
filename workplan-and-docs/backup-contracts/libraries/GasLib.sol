// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title GasLib
 * @dev Library containing gas optimization utilities
 * @notice This library provides functions to optimize gas usage in contracts
 */
library GasLib {
    /**
     * @dev Packs multiple boolean flags into a single uint256
     * @param flags Array of boolean flags
     * @return packed Packed uint256 representation of the flags
     */
    function packBooleans(bool[] memory flags) internal pure returns (uint256 packed) {
        for (uint256 i = 0; i < flags.length; i++) {
            if (flags[i]) {
                packed |= (1 << i);
            }
        }
        return packed;
    }

    /**
     * @dev Unpacks a boolean flag from a packed uint256
     * @param packed Packed uint256
     * @param index Index of the flag to unpack
     * @return flag Boolean flag at the specified index
     */
    function unpackBoolean(uint256 packed, uint8 index) internal pure returns (bool flag) {
        return (packed & (1 << index)) != 0;
    }

    /**
     * @dev Sets a boolean flag in a packed uint256
     * @param packed Packed uint256
     * @param index Index of the flag to set
     * @param value Value to set the flag to
     * @return newPacked Updated packed uint256
     */
    function setFlag(uint256 packed, uint8 index, bool value) internal pure returns (uint256 newPacked) {
        if (value) {
            return packed | (1 << index);
        } else {
            return packed & ~(1 << index);
        }
    }

    /**
     * @dev Packs two uint128 values into a single uint256
     * @param a First uint128 value
     * @param b Second uint128 value
     * @return packed Packed uint256
     */
    function packUint128(uint128 a, uint128 b) internal pure returns (uint256 packed) {
        return (uint256(a) << 128) | uint256(b);
    }

    /**
     * @dev Unpacks the first uint128 value from a packed uint256
     * @param packed Packed uint256
     * @return a First uint128 value
     */
    function unpackUint128A(uint256 packed) internal pure returns (uint128 a) {
        return uint128(packed >> 128);
    }

    /**
     * @dev Unpacks the second uint128 value from a packed uint256
     * @param packed Packed uint256
     * @return b Second uint128 value
     */
    function unpackUint128B(uint256 packed) internal pure returns (uint128 b) {
        return uint128(packed);
    }

    /**
     * @dev Packs multiple small uints into a single uint256
     * @param a uint32 value
     * @param b uint32 value
     * @param c uint32 value
     * @param d uint32 value
     * @param e uint32 value
     * @param f uint32 value
     * @param g uint32 value
     * @param h uint32 value
     * @return packed Packed uint256
     */
    function packUint32(uint32 a, uint32 b, uint32 c, uint32 d, uint32 e, uint32 f, uint32 g, uint32 h)
        internal
        pure
        returns (uint256 packed)
    {
        return uint256(a) << 224 | uint256(b) << 192 | uint256(c) << 160 | uint256(d) << 128 | uint256(e) << 96
            | uint256(f) << 64 | uint256(g) << 32 | uint256(h);
    }

    /**
     * @dev Unpacks a uint32 value from a packed uint256
     * @param packed Packed uint256
     * @param index Index of the uint32 to unpack (0-7)
     * @return value Unpacked uint32 value
     */
    function unpackUint32(uint256 packed, uint8 index) internal pure returns (uint32 value) {
        require(index < 8, "Index out of bounds");
        return uint32(packed >> (32 * (7 - index)));
    }
}
