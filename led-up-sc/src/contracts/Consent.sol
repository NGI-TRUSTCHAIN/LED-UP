// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import {AccessManaged} from "@openzeppelin/contracts/access/manager/AccessManaged.sol";
import {DidRegistry} from "./DidRegistry.sol";

contract ConsentManagement is AccessManaged {
    /*===================== ERRORS ======================*/
    error ConsentManagement__InvalidDID();
    error ConsentManagement__NotFound();
    error ConsentManagement__AlreadyGranted();
    error ConsentManagement__Unauthorized();

    /*===================== State Variables ======================*/
    DidRegistry private didRegistry;

    enum ConsentStatus {
        NotSet,
        Granted,
        Revoked
    }

    struct Consent {
        // Store the original DIDs as strings for event emission and external interfaces
        string producerDid;
        string providerDid;
        ConsentStatus status;
        uint256 timestamp;
        uint256 expiryTime; // Optional expiry time (0 means no expiry)
        string purpose; // Purpose for which consent is granted
    }

    // Use bytes32 hashes for more efficient storage and lookup
    // Mapping: producer DID hash => provider DID hash => Consent
    mapping(bytes32 => mapping(bytes32 => Consent)) private consents;

    // Cache for address to DID conversion to avoid repeated string operations
    mapping(address => string) private addressToDid;
    mapping(address => bytes32) private addressToDidHash;

    /*===================== EVENTS ======================*/
    event ConsentGranted(string indexed producerDid, string indexed providerDid, string purpose, uint256 expiryTime);

    event ConsentRevoked(string indexed producerDid, string indexed providerDid, string reason);

    constructor(address _didRegistryAddress) AccessManaged(msg.sender) {
        didRegistry = DidRegistry(_didRegistryAddress);
    }

    /**
     * @dev Get or create DID from address
     * @param addr The address to convert
     * @return didString The DID string
     * @return didHash The DID hash
     */
    function getOrCreateDid(address addr) internal returns (string memory didString, bytes32 didHash) {
        // Check if we already have this address's DID cached
        if (bytes(addressToDid[addr]).length > 0) {
            return (addressToDid[addr], addressToDidHash[addr]);
        }

        // Create new DID
        didString = string(abi.encodePacked("did:ala:sepolia", toAsciiString(addr)));

        didHash = keccak256(bytes(didString));

        // Cache for future use
        addressToDid[addr] = didString;
        addressToDidHash[addr] = didHash;

        return (didString, didHash);
    }

    /**
     * @dev Grant consent to a provider
     * @param providerDid The DID of the provider receiving consent
     * @param purpose The purpose for which consent is granted
     * @param expiryTime Optional timestamp when consent expires (0 for no expiry)
     */
    function grantConsent(string calldata providerDid, string calldata purpose, uint256 expiryTime) external {
        // Get producer DID and hash
        (string memory producerDid, bytes32 producerDidHash) = getOrCreateDid(msg.sender);
        bytes32 providerDidHash = keccak256(bytes(providerDid));

        // Verify both DIDs exist and are active
        if (!didRegistry.isActive(producerDid) || !didRegistry.isActive(providerDid)) {
            revert ConsentManagement__InvalidDID();
        }

        // Check if consent already exists and is granted
        if (consents[producerDidHash][providerDidHash].status == ConsentStatus.Granted) {
            revert ConsentManagement__AlreadyGranted();
        }

        // Store consent using hashes for efficient lookup
        consents[producerDidHash][providerDidHash] = Consent({
            producerDid: producerDid,
            providerDid: providerDid,
            status: ConsentStatus.Granted,
            timestamp: block.timestamp,
            expiryTime: expiryTime,
            purpose: purpose
        });

        emit ConsentGranted(producerDid, providerDid, purpose, expiryTime);
    }

    /**
     * @dev Revoke previously granted consent
     * @param providerDid The DID of the provider
     * @param reason The reason for revoking consent
     */
    function revokeConsent(string calldata providerDid, string calldata reason) external {
        // Get producer DID and hash
        (string memory producerDid, bytes32 producerDidHash) = getOrCreateDid(msg.sender);
        bytes32 providerDidHash = keccak256(bytes(providerDid));

        Consent storage consent = consents[producerDidHash][providerDidHash];

        if (consent.status != ConsentStatus.Granted) {
            revert ConsentManagement__NotFound();
        }

        consent.status = ConsentStatus.Revoked;
        consent.timestamp = block.timestamp;

        emit ConsentRevoked(producerDid, providerDid, reason);
    }

    /**
     * @dev Query consent status between a producer and provider
     * @param producerDid The DID of the consent giver
     * @param providerDid The DID of the consent receiver
     * @return status The current consent status
     * @return timestamp When the status was last updated
     * @return purpose The purpose for which consent was granted
     */
    function queryConsent(string calldata producerDid, string calldata providerDid)
        external
        view
        returns (ConsentStatus status, uint256 timestamp, string memory purpose)
    {
        bytes32 producerDidHash = keccak256(bytes(producerDid));
        bytes32 providerDidHash = keccak256(bytes(providerDid));

        Consent memory consent = consents[producerDidHash][providerDidHash];

        if (bytes(consent.producerDid).length == 0) {
            revert ConsentManagement__NotFound();
        }

        // Check if consent has expired
        if (consent.expiryTime != 0 && block.timestamp > consent.expiryTime) {
            return (ConsentStatus.Revoked, consent.timestamp, consent.purpose);
        }

        return (consent.status, consent.timestamp, consent.purpose);
    }

    /**
     * @dev Check if valid consent exists between producer and provider
     * @param producerDid The DID of the consent giver
     * @param providerDid The DID of the consent receiver
     * @return bool indicating if valid consent exists
     */
    function hasValidConsent(string calldata producerDid, string calldata providerDid) external view returns (bool) {
        bytes32 producerDidHash = keccak256(bytes(producerDid));
        bytes32 providerDidHash = keccak256(bytes(providerDid));

        Consent memory consent = consents[producerDidHash][providerDidHash];

        if (consent.status != ConsentStatus.Granted) {
            return false;
        }

        if (consent.expiryTime != 0 && block.timestamp > consent.expiryTime) {
            return false;
        }

        return true;
    }

    /**
     * @dev Helper function to get DID from an Ethereum address
     * @param addr The Ethereum address
     * @return The corresponding DID
     */
    function getDidFromAddress(address addr) internal pure returns (string memory) {
        return string(abi.encodePacked("did:ethr:", toAsciiString(addr)));
    }

    /**
     * @dev Helper function to convert address to string
     * @param addr The address to convert
     * @return The address as a string
     */
    function toAsciiString(address addr) internal pure returns (string memory) {
        bytes memory s = new bytes(40);
        for (uint256 i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint256(uint160(addr)) / (2 ** (8 * (19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2 * i] = char(hi);
            s[2 * i + 1] = char(lo);
        }
        return string(s);
    }

    function char(bytes1 b) internal pure returns (bytes1) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }
}
