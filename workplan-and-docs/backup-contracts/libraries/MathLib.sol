// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title MathLib
 * @dev Library containing mathematical utilities
 * @notice This library provides functions for efficient mathematical operations
 */
library MathLib {
    /**
     * @dev Calculates a percentage of a value
     * @param _value The value to calculate the percentage of
     * @param _percentage The percentage to calculate (0-100)
     * @return The percentage of the value
     */
    function calculatePercentage(uint256 _value, uint256 _percentage) internal pure returns (uint256) {
        return (_value * _percentage) / 100;
    }

    /**
     * @dev Calculates a percentage of a value with higher precision
     * @param _value The value to calculate the percentage of
     * @param _percentage The percentage to calculate (0-10000, where 10000 = 100%)
     * @return The percentage of the value
     */
    function calculatePercentagePrecise(uint256 _value, uint256 _percentage) internal pure returns (uint256) {
        return (_value * _percentage) / 10000;
    }

    /**
     * @dev Calculates the minimum of two values
     * @param _a The first value
     * @param _b The second value
     * @return The minimum value
     */
    function min(uint256 _a, uint256 _b) internal pure returns (uint256) {
        return _a < _b ? _a : _b;
    }

    /**
     * @dev Calculates the maximum of two values
     * @param _a The first value
     * @param _b The second value
     * @return The maximum value
     */
    function max(uint256 _a, uint256 _b) internal pure returns (uint256) {
        return _a > _b ? _a : _b;
    }

    /**
     * @dev Calculates the average of two values
     * @param _a The first value
     * @param _b The second value
     * @return The average value
     */
    function average(uint256 _a, uint256 _b) internal pure returns (uint256) {
        // Prevent overflow by using: (a + b) / 2 = (a / 2) + (b / 2) + ((a % 2) + (b % 2)) / 2
        uint256 result = (_a / 2) + (_b / 2);

        // Add 1 if both values are odd
        if ((_a % 2 == 1) && (_b % 2 == 1)) {
            result += 1;
        }

        return result;
    }

    /**
     * @dev Calculates the ceiling division of two values
     * @param _a The dividend
     * @param _b The divisor
     * @return The ceiling division result
     */
    function ceilDiv(uint256 _a, uint256 _b) internal pure returns (uint256) {
        return (_a + _b - 1) / _b;
    }
}
