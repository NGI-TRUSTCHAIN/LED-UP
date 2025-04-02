// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../../interfaces/IZKPVerifier.sol";

/**
 * @title AgeVerifier
 * @dev Contract for verifying age-related zero-knowledge proofs
 */
contract AgeVerifier is IZKPVerifier {
    /*===================== ERRORS ======================*/
    error AgeVerifier__InvalidVerifierAddress();
    error AgeVerifier__InvalidInputLength();
    error AgeVerifier__VerificationCallFailed();

    /*===================== VARIABLES ======================*/
    /// @dev The underlying ZoKrates-generated verifier contract
    address private immutable verifierAddress;

    /// @dev Event emitted when an age verification is performed
    event AgeVerified(address indexed verifier, uint256 threshold, bool result);

    /**
     * @dev Constructor
     * @param _verifierAddress Address of the ZoKrates-generated verifier contract
     */
    constructor(address _verifierAddress) {
        if (_verifierAddress == address(0)) revert AgeVerifier__InvalidVerifierAddress();
        verifierAddress = _verifierAddress;
    }

    /*===================== FUNCTIONS ======================*/

    /**
     * @dev Verifies a zero-knowledge proof
     * @param a The 'a' part of the proof
     * @param b The 'b' part of the proof
     * @param c The 'c' part of the proof
     * @param input The public inputs to the verification (threshold)
     * @return True if the proof is valid, false otherwise
     */
    function verify(uint256[2] calldata a, uint256[2][2] calldata b, uint256[2] calldata c, uint256[] calldata input)
        external
        view
        override
        returns (bool)
    {
        if (input.length != 1) revert AgeVerifier__InvalidInputLength();

        // Call the ZoKrates-generated verifier
        (bool success, bytes memory data) = verifierAddress.staticcall(
            abi.encodeWithSignature("verifyProof(uint256[2],uint256[2][2],uint256[2],uint256[1])", a, b, c, [input[0]])
        );

        if (!success) revert AgeVerifier__VerificationCallFailed();
        return abi.decode(data, (bool));
    }

    /**
     * @dev Verifies if a person's age is greater than the threshold
     * @param a The 'a' part of the proof
     * @param b The 'b' part of the proof
     * @param c The 'c' part of the proof
     * @param threshold The age threshold to check against
     * @return True if the person's age is greater than the threshold, false otherwise
     */
    function verifyAge(uint256[2] calldata a, uint256[2][2] calldata b, uint256[2] calldata c, uint256 threshold)
        external
        returns (bool)
    {
        uint256[] memory input = new uint256[](1);
        input[0] = threshold;

        bool result = this.verify(a, b, c, input);
        emit AgeVerified(msg.sender, threshold, result);

        return result;
    }
}
