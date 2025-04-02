// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

library Utils {
    error Math__Overflow();

    using Math for uint256;

    function equal(string memory a, string memory b) internal pure returns (bool) {
        return bytes(a).length == bytes(b).length && keccak256(bytes(a)) == keccak256(bytes(b));
    }

    function preciseMul(uint256 a, uint256 b) internal pure returns (uint256) {
        (bool success, uint256 result) = Math.tryMul(a, b);

        if (!success) revert Math__Overflow();
        return result;
    }

    function preciseDiv(uint256 a, uint256 b) internal pure returns (uint256) {
        (bool success, uint256 result) = Math.tryDiv(a, b);

        if (!success) revert Math__Overflow();
        return result;
    }
}
