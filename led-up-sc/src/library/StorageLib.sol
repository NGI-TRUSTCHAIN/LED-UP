// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title StorageLib
 * @dev Optimized storage structures for LED-UP ecosystem
 * @notice This library provides standardized data structures with optimized storage layouts
 */
library StorageLib {
    /*===================== CONSTANTS ======================*/
    // Status constants for bit packing
    uint8 internal constant STATUS_ACTIVE = 0;
    uint8 internal constant STATUS_INACTIVE = 1;
    uint8 internal constant STATUS_SUSPENDED = 2;
    uint8 internal constant STATUS_ERROR = 3;
    uint8 internal constant STATUS_UNKNOWN = 4;

    // Consent constants for bit packing
    uint8 internal constant CONSENT_ALLOWED = 0;
    uint8 internal constant CONSENT_DENIED = 1;
    uint8 internal constant CONSENT_PENDING = 2;

    // Role constants for bit packing
    uint8 internal constant ROLE_ADMIN = 0;
    uint8 internal constant ROLE_OPERATOR = 1;
    uint8 internal constant ROLE_PRODUCER = 2;
    uint8 internal constant ROLE_CONSUMER = 3;
    uint8 internal constant ROLE_SERVICE_PROVIDER = 4;
    uint8 internal constant ROLE_VERIFIER = 5;
    uint8 internal constant ROLE_ISSUER = 6;

    /*===================== DID STRUCTURES ======================*/
    /**
     * @dev Optimized DID Document structure
     */
    struct DIDDocument {
        address subject; // 20 bytes - The controller/subject address
        uint40 lastUpdated; // 5 bytes - Timestamp of last update (good until year 36812)
        bool active; // 1 byte - Active status flag
        bytes32 publicKeyHash; // 32 bytes - Hash of public key (original stored off-chain)
        bytes32 documentHash; // 32 bytes - Hash of document (original stored off-chain)
    }

    /**
     * @dev Compact DID reference for cross-contract use
     */
    struct DIDReference {
        bytes32 didHash; // 32 bytes - Hash of the DID string
        address subject; // 20 bytes - The controller/subject address
    }

    /*===================== ROLE STRUCTURES ======================*/
    /**
     * @dev Optimized role assignment using bit flags
     */
    struct RoleAssignment {
        uint256 roleFlags; // 32 bytes - Bit flags for role assignments
        uint40 lastUpdated; // 5 bytes - Timestamp of last update
    }

    /**
     * @dev Role requirement structure
     */
    struct RoleRequirement {
        bytes32 requirementHash; // 32 bytes - Hash of requirement string
        bool active; // 1 byte - Whether requirement is active
    }

    /*===================== CREDENTIAL STRUCTURES ======================*/
    /**
     * @dev Optimized credential structure
     */
    struct Credential {
        bytes32 id; // 32 bytes - Unique identifier
        bytes32 didHash; // 32 bytes - Subject DID hash
        bytes32 typeHash; // 32 bytes - Credential type hash
        bytes32 issuerDidHash; // 32 bytes - Issuer DID hash
        uint40 issuedAt; // 5 bytes - Issuance timestamp
        uint40 expiresAt; // 5 bytes - Expiration timestamp
        bool revoked; // 1 byte - Revocation status
    }

    /*===================== CONSENT STRUCTURES ======================*/
    /**
     * @dev Optimized consent structure
     */
    struct Consent {
        bytes32 producerDidHash; // 32 bytes - Producer DID hash
        bytes32 providerDidHash; // 32 bytes - Provider DID hash
        uint8 status; // 1 byte - Consent status (0=NotSet, 1=Granted, 2=Revoked)
        uint40 timestamp; // 5 bytes - Last update timestamp
        uint40 expiryTime; // 5 bytes - Expiration timestamp (0 = no expiry)
        bytes32 purposeHash; // 32 bytes - Hash of purpose string (original stored off-chain)
    }

    /*===================== DATA REGISTRY STRUCTURES ======================*/
    /**
     * @dev Optimized data record core structure
     */
    struct DataRecordCore {
        bytes32 ownerDidHash; // 32 bytes - Owner DID hash
        address producer; // 20 bytes - Producer address
        uint8 status; // 1 byte - Record status
        uint8 consent; // 1 byte - Consent status
        bool isActive; // 1 byte - Active flag
        uint40 updatedAt; // 5 bytes - Last update timestamp
        uint32 nonce; // 4 bytes - Nonce for replay protection
    }

    /**
     * @dev Optimized health record structure
     */
    struct HealthRecord {
        bytes signature; // Variable - Signature bytes
        bytes32 resourceTypeHash; // 32 bytes - Hash of resource type string
        bytes32 cidHash; // 32 bytes - Hash of CID (original stored off-chain)
        bytes32 urlHash; // 32 bytes - Hash of URL (original stored off-chain)
        bytes32 dataHash; // 32 bytes - Hash of data
        bool isVerified; // 1 byte - Verification status
    }

    /**
     * @dev Optimized metadata structure
     */
    struct Metadata {
        bytes32 urlHash; // 32 bytes - Hash of URL (original stored off-chain)
        bytes32 dataHash; // 32 bytes - Hash of data
    }

    /*===================== COMPENSATION STRUCTURES ======================*/
    /**
     * @dev Optimized storage structure for producer balances
     * @param balance The current balance of the producer
     * @param lastWithdrawal Timestamp of the last withdrawal
     * @param withdrawalCount Number of withdrawals made
     */
    struct ProducerBalance {
        uint128 balance; // 16 bytes - Sufficient for token balances
        uint40 lastWithdrawal; // 5 bytes - Timestamp (good until year 36812)
        uint88 withdrawalCount; // 11 bytes - Count of withdrawals
    }

    /**
     * @dev Optimized storage structure for payment records
     * @param amount The payment amount
     * @param isPayed Whether the payment has been made
     * @param timestamp Timestamp of the payment
     */
    struct Payment {
        uint128 amount; // 16 bytes - Sufficient for payment amounts
        bool isPayed; // 1 byte - Payment status
        uint40 timestamp; // 5 bytes - Timestamp (good until year 36812)
            // 8 bytes padding automatically added by Solidity
    }

    /*===================== UTILITY FUNCTIONS ======================*/
    /**
     * @dev Sets a bit in a uint256 flag field
     * @param flags The current flags
     * @param position The bit position to set
     * @param value The boolean value to set
     * @return The updated flags
     */
    function setBit(uint256 flags, uint8 position, bool value) internal pure returns (uint256) {
        if (value) {
            return flags | (1 << position);
        } else {
            return flags & ~(1 << position);
        }
    }

    /**
     * @dev Gets a bit from a uint256 flag field
     * @param flags The flags to check
     * @param position The bit position to get
     * @return The boolean value at the position
     */
    function getBit(uint256 flags, uint8 position) internal pure returns (bool) {
        return (flags & (1 << position)) != 0;
    }

    /**
     * @dev Converts a string to bytes32 for gas-efficient storage
     * @param source The string to convert
     * @return result The bytes32 representation of the string
     */
    function stringToBytes32(string memory source) internal pure returns (bytes32 result) {
        // Convert string to bytes32 for storage efficiency
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            result := mload(add(source, 32))
        }
    }

    /**
     * @dev Converts bytes32 back to a string
     * @param source The bytes32 to convert
     * @return The string representation of the bytes32
     */
    function bytes32ToString(bytes32 source) internal pure returns (string memory) {
        // Handle empty bytes32
        if (source == 0x0) {
            return "";
        }

        // Convert bytes32 to string
        bytes memory bytesString = new bytes(32);
        uint256 charCount = 0;

        for (uint256 i = 0; i < 32; i++) {
            bytes1 char = bytes1(bytes32(uint256(source) * 2 ** (8 * i)));
            if (char != 0) {
                bytesString[charCount] = char;
                charCount++;
            }
        }

        bytes memory bytesStringTrimmed = new bytes(charCount);
        for (uint256 i = 0; i < charCount; i++) {
            bytesStringTrimmed[i] = bytesString[i];
        }

        return string(bytesStringTrimmed);
    }

    /**
     * @dev Computes a unique hash from multiple inputs
     * @param producer The producer address
     * @param consumer The consumer address
     * @param recordId The record ID as bytes32
     * @return A unique hash combining all inputs
     */
    function computePaymentHash(address producer, address consumer, bytes32 recordId) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(producer, consumer, recordId));
    }

    /**
     * @dev Safely converts uint256 to uint128 with overflow check
     * @param value The uint256 value to convert
     * @return The uint128 representation of the value
     */
    function toUint128(uint256 value) internal pure returns (uint128) {
        require(value <= type(uint128).max, "StorageLib: value exceeds uint128 max");
        return uint128(value);
    }

    /**
     * @dev Safely converts uint256 to uint40 with overflow check
     * @param value The uint256 value to convert
     * @return The uint40 representation of the value
     */
    function toUint40(uint256 value) internal pure returns (uint40) {
        require(value <= type(uint40).max, "StorageLib: value exceeds uint40 max");
        return uint40(value);
    }
}
