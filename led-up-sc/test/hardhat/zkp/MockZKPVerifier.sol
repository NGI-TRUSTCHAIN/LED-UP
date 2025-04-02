// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title MockZKPVerifier
 * @dev A mock verifier contract for testing ZKP verification
 */
contract MockZKPVerifier {
    bool private returnValue;

    /**
     * @dev Sets the return value for the verifyProof function
     * @param _returnValue The value that verifyProof should return
     */
    function setReturnValue(bool _returnValue) external {
        returnValue = _returnValue;
    }

    /**
     * @dev Mock implementation of the verifyProof function
     * @return The predetermined return value
     */
    function verifyProof(
        uint256[2] calldata, // a
        uint256[2][2] calldata, // b
        uint256[2] calldata, // c
        uint256[] calldata // input
    ) external view returns (bool) {
        return returnValue;
    }
}
