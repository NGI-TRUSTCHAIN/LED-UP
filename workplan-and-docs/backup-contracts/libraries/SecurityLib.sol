// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SecurityLib
 * @dev Library containing security utilities
 * @notice This library provides functions for enhancing the security of contracts
 */
library SecurityLib {
    /**
     * @dev Validates a signature
     * @param _hash The hash that was signed
     * @param _signature The signature
     * @param _signer The address of the signer
     * @return True if the signature is valid, false otherwise
     */
    function validateSignature(bytes32 _hash, bytes memory _signature, address _signer) internal pure returns (bool) {
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _hash));

        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);

        address recoveredAddress = ecrecover(ethSignedMessageHash, v, r, s);

        return recoveredAddress == _signer;
    }

    /**
     * @dev Splits a signature into its components
     * @param _signature The signature to split
     * @return r The r component of the signature
     * @return s The s component of the signature
     * @return v The v component of the signature
     */
    function splitSignature(bytes memory _signature) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(_signature.length == 65, "Invalid signature length");

        assembly {
            r := mload(add(_signature, 32))
            s := mload(add(_signature, 64))
            v := byte(0, mload(add(_signature, 96)))
        }

        if (v < 27) {
            v += 27;
        }

        require(v == 27 || v == 28, "Invalid signature v value");

        return (r, s, v);
    }

    /**
     * @dev Validates a timestamp is within a certain range
     * @param _timestamp The timestamp to validate
     * @param _maxAge The maximum age of the timestamp in seconds
     * @return True if the timestamp is valid, false otherwise
     */
    function validateTimestamp(uint256 _timestamp, uint256 _maxAge) internal view returns (bool) {
        return _timestamp + _maxAge >= block.timestamp && _timestamp <= block.timestamp;
    }

    /**
     * @dev Validates that a nonce has not been used before
     * @param _usedNonces Mapping of used nonces
     * @param _nonce The nonce to validate
     * @return True if the nonce is valid, false otherwise
     */
    function validateNonce(mapping(bytes32 => bool) storage _usedNonces, bytes32 _nonce) internal returns (bool) {
        if (_usedNonces[_nonce]) {
            return false;
        }

        _usedNonces[_nonce] = true;
        return true;
    }

    /**
     * @dev Computes a hash for a message that can be signed
     * @param _from The address of the sender
     * @param _to The address of the recipient
     * @param _value The value being transferred
     * @param _data The data being sent
     * @param _nonce A unique nonce
     * @param _timestamp The timestamp of the message
     * @return The hash of the message
     */
    function computeMessageHash(
        address _from,
        address _to,
        uint256 _value,
        bytes memory _data,
        bytes32 _nonce,
        uint256 _timestamp
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(_from, _to, _value, keccak256(_data), _nonce, _timestamp));
    }

    /**
     * @dev Computes a hash for a DID operation that can be signed
     * @param _did The DID being operated on
     * @param _operation The operation being performed (e.g., "register", "update", "deactivate")
     * @param _data The data associated with the operation
     * @param _nonce A unique nonce
     * @param _timestamp The timestamp of the operation
     * @return The hash of the DID operation
     */
    function computeDidOperationHash(
        string memory _did,
        string memory _operation,
        bytes memory _data,
        bytes32 _nonce,
        uint256 _timestamp
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(_did, _operation, keccak256(_data), _nonce, _timestamp));
    }
}
