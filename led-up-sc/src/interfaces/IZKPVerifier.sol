// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IZKPVerifier
 * @dev Interface for ZKP verifier contracts
 */
interface IZKPVerifier {
    /**
     * @dev Verifies a zero-knowledge proof
     * @param a The 'a' part of the proof
     * @param b The 'b' part of the proof
     * @param c The 'c' part of the proof
     * @param input The public inputs to the verification
     * @return True if the proof is valid, false otherwise
     */
    function verify(uint256[2] calldata a, uint256[2][2] calldata b, uint256[2] calldata c, uint256[] calldata input)
        external
        view
        returns (bool);
}
