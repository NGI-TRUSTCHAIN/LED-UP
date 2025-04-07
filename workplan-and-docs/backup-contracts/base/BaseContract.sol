// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title BaseContract
 * @dev Base contract with common functionality, errors, and modifiers
 * @notice This contract provides a foundation for other contracts with shared utilities
 */
abstract contract BaseContract is Ownable, Pausable {
    /*===================== ERRORS ======================*/
    error BaseContract__Unauthorized();
    error BaseContract__InvalidAddress();
    error BaseContract__InvalidParameter();
    error BaseContract__ContractPaused();
    error BaseContract__ZeroAddress();
    error BaseContract__EmptyString();
    error BaseContract__InvalidLength();
    error BaseContract__AlreadyInitialized();

    /*===================== EVENTS ======================*/
    event ContractInitialized(address indexed initializer, uint256 timestamp);
    event ContractUpgraded(address indexed upgrader, uint256 timestamp);

    /*===================== MODIFIERS ======================*/
    /**
     * @dev Validates that the provided address is not the zero address
     * @param _address The address to validate
     */
    modifier validAddress(address _address) {
        if (_address == address(0)) revert BaseContract__ZeroAddress();
        _;
    }

    /**
     * @dev Custom implementation of whenNotPaused with a specific error
     */
    modifier whenNotPausedWithCustomError() {
        if (paused()) revert BaseContract__ContractPaused();
        _;
    }

    /**
     * @dev Validates that the provided string is not empty
     * @param _str The string to validate
     */
    modifier nonEmptyString(string memory _str) {
        if (bytes(_str).length == 0) revert BaseContract__EmptyString();
        _;
    }

    /**
     * @dev Constructor
     * Initializes the contract by setting the deployer as the initial owner
     */
    constructor() Ownable(msg.sender) {
        emit ContractInitialized(msg.sender, block.timestamp);
    }

    /*===================== UTILITY FUNCTIONS ======================*/
    /**
     * @dev Converts a string to bytes32
     * @param source The string to convert
     * @return result The bytes32 representation of the string
     */
    function stringToBytes32(string memory source) internal pure returns (bytes32 result) {
        if (bytes(source).length == 0) {
            return 0x0;
        }
        assembly {
            result := mload(add(source, 32))
        }
    }

    /**
     * @dev Converts bytes32 to a string
     * @param _bytes32 The bytes32 to convert
     * @return The string representation of the bytes32
     */
    function bytes32ToString(bytes32 _bytes32) internal pure returns (string memory) {
        uint8 i = 0;
        while (i < 32 && _bytes32[i] != 0) {
            i++;
        }
        bytes memory bytesArray = new bytes(i);
        for (i = 0; i < 32 && _bytes32[i] != 0; i++) {
            bytesArray[i] = _bytes32[i];
        }
        return string(bytesArray);
    }

    /**
     * @dev Computes the keccak256 hash of a string
     * @param _string The string to hash
     * @return The keccak256 hash of the string
     */
    function hashString(string memory _string) internal pure returns (bytes32) {
        return keccak256(bytes(_string));
    }

    /**
     * @dev Checks if two strings are equal
     * @param a The first string
     * @param b The second string
     * @return True if the strings are equal, false otherwise
     */
    function stringsEqual(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }

    /**
     * @dev Pauses the contract
     * @notice Only the owner can pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses the contract
     * @notice Only the owner can unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
