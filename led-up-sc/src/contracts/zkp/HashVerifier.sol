// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../../interfaces/IZKPVerifier.sol";

/**
 * @title HashVerifier
 * @dev Contract for verifying hash-related zero-knowledge proofs
 */
contract HashVerifier is IZKPVerifier {
    /*===================== ERRORS ======================*/
    error HashVerifier__InvalidVerifierAddress();
    error HashVerifier__InvalidInputLength();
    error HashVerifier__VerificationCallFailed();

    /*===================== VARIABLES ======================*/
    /// @dev The underlying ZoKrates-generated verifier contract
    address private immutable verifierAddress;

    /*===================== EVENTS ======================*/
    /// @dev Event emitted when a hash verification is performed
    event HashVerified(address indexed verifier, uint256[2] expectedHash, bool result);

    /**
     * @dev Constructor
     * @param _verifierAddress Address of the ZoKrates-generated verifier contract
     */
    constructor(address _verifierAddress) {
        if (_verifierAddress == address(0)) revert HashVerifier__InvalidVerifierAddress();
        verifierAddress = _verifierAddress;
    }

    /*===================== FUNCTIONS ======================*/

    /**
     * @dev Verifies a zero-knowledge proof
     * @param a The 'a' part of the proof
     * @param b The 'b' part of the proof
     * @param c The 'c' part of the proof
     * @param input The public inputs to the verification (expected hash)
     * @return True if the proof is valid, false otherwise
     */
    function verify(uint256[2] calldata a, uint256[2][2] calldata b, uint256[2] calldata c, uint256[] calldata input)
        external
        view
        override
        returns (bool)
    {
        if (input.length != 2) revert HashVerifier__InvalidInputLength();

        // Call the ZoKrates-generated verifier
        (bool success, bytes memory data) = verifierAddress.staticcall(
            abi.encodeWithSignature(
                "verifyProof(uint256[2],uint256[2][2],uint256[2],uint256[2])", a, b, c, [input[0], input[1]]
            )
        );

        if (!success) revert HashVerifier__VerificationCallFailed();
        return abi.decode(data, (bool));
    }

    /**
     * @dev Verifies if the hash of private data matches the expected hash
     * @param a The 'a' part of the proof
     * @param b The 'b' part of the proof
     * @param c The 'c' part of the proof
     * @param expectedHash The expected hash to check against
     * @return True if the hash of the private data matches the expected hash, false otherwise
     */
    function verifyHash(
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[2] calldata expectedHash
    ) external returns (bool) {
        uint256[] memory input = new uint256[](2);
        input[0] = expectedHash[0];
        input[1] = expectedHash[1];

        bool result = this.verify(a, b, c, input);
        emit HashVerified(msg.sender, expectedHash, result);

        return result;
    }
}
