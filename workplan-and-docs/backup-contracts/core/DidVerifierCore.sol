// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {BaseContract} from "../base/BaseContract.sol";
import {IDidVerifier} from "../interfaces/IDidVerifier.sol";
import {IDidRegistry} from "../interfaces/IDidRegistry.sol";
import {IDidIssuer} from "../interfaces/IDidIssuer.sol";
import {ValidationLib} from "../libraries/ValidationLib.sol";
import {SecurityLib} from "../libraries/SecurityLib.sol";

/**
 * @title DidVerifierCore
 * @dev Core implementation of the DID Verifier contract
 * @notice This contract provides the core functionality for verifying DID credentials
 */
abstract contract DidVerifierCore is BaseContract, IDidVerifier {
    /*===================== VARIABLES ======================*/
    // DID registry contract address
    address private didRegistry;

    // DID issuer contract address
    address private didIssuer;

    // Trusted issuers
    mapping(string => bool) private trustedIssuers;
    string[] private trustedIssuersList;

    // Verification records
    struct VerificationRecord {
        string did;
        string credentialType;
        bytes32 credentialId;
        string issuerDid;
        uint256 timestamp;
        bool success;
    }

    // Verification history
    mapping(string => VerificationRecord[]) private verificationHistory;

    /*===================== CONSTRUCTOR ======================*/
    /**
     * @dev Constructor
     * @param _didRegistry The address of the DID registry
     * @param _didIssuer The address of the DID issuer
     */
    constructor(address _didRegistry, address _didIssuer) {
        if (_didRegistry == address(0)) revert DidVerifier__InvalidDID();
        if (_didIssuer == address(0)) revert DidVerifier__InvalidIssuer();

        didRegistry = _didRegistry;
        didIssuer = _didIssuer;
    }

    /*===================== MODIFIERS ======================*/
    /**
     * @dev Ensures the DID exists
     * @param _did The DID to check
     */
    modifier didExists(string calldata _did) {
        if (!_didExists(_did)) {
            revert DidVerifier__InvalidDID();
        }
        _;
    }

    /*===================== EXTERNAL FUNCTIONS ======================*/
    /**
     * @dev Verifies a credential
     * @param did The DID of the credential subject
     * @param credentialType The type of credential
     * @param credentialData The credential data
     * @param issuerDid The DID of the issuer
     * @return True if the credential is valid, false otherwise
     */
    function verifyCredential(
        string calldata credentialType,
        string calldata issuerDid,
        string calldata did,
        bytes calldata credentialData
    ) public virtual whenNotPausedWithCustomError didExists(did) returns (bool) {
        // Check if issuer is trusted
        if (!trustedIssuers[issuerDid]) {
            _recordVerification(did, credentialType, bytes32(0), issuerDid, false);
            return false;
        }

        // Generate credential ID (same way as in the issuer)
        bytes32 credentialId = keccak256(abi.encodePacked(did, credentialType, credentialData, block.timestamp));

        // Check if credential is valid
        bool isValid = IDidIssuer(didIssuer).isCredentialValid(did, credentialId);

        // Record verification
        _recordVerification(did, credentialType, credentialId, issuerDid, isValid);

        return isValid;
    }

    /**
     * @dev Verifies a credential with a signature
     * @param did The DID of the credential subject
     * @param credentialType The type of credential
     * @param credentialData The credential data
     * @param issuerDid The DID of the issuer
     * @param signature The signature of the credential
     * @return True if the credential is valid, false otherwise
     */
    function verifyCredentialWithSignature(
        string calldata did,
        string calldata credentialType,
        bytes calldata credentialData,
        string calldata issuerDid,
        bytes calldata signature
    ) external virtual override whenNotPausedWithCustomError didExists(did) returns (bool) {
        // Check if issuer is trusted
        if (!trustedIssuers[issuerDid]) {
            _recordVerification(did, credentialType, bytes32(0), issuerDid, false);
            return false;
        }

        // Get issuer address
        address issuerAddress = IDidRegistry(didRegistry).getAddressByDid(issuerDid);
        if (issuerAddress == address(0)) {
            _recordVerification(did, credentialType, bytes32(0), issuerDid, false);
            return false;
        }

        // Create message hash
        bytes32 messageHash = keccak256(abi.encodePacked(did, credentialType, credentialData));

        // Verify signature
        bool isValid = SecurityLib.validateSignature(messageHash, signature, issuerAddress);

        // Generate credential ID
        bytes32 credentialId = keccak256(abi.encodePacked(did, credentialType, credentialData, block.timestamp));

        // Record verification
        _recordVerification(did, credentialType, credentialId, issuerDid, isValid);

        return isValid;
    }

    /**
     * @dev Adds a trusted issuer
     * @param issuerDid The DID of the issuer to trust
     */
    function addTrustedIssuer(string calldata issuerDid) external onlyOwner {
        if (trustedIssuers[issuerDid]) {
            return; // Already trusted
        }

        trustedIssuers[issuerDid] = true;
        trustedIssuersList.push(issuerDid);
    }

    /**
     * @dev Removes a trusted issuer
     * @param issuerDid The DID of the issuer to untrust
     */
    function removeTrustedIssuer(string calldata issuerDid) external onlyOwner {
        if (!trustedIssuers[issuerDid]) {
            return; // Not trusted
        }

        trustedIssuers[issuerDid] = false;

        // Remove from list (not gas efficient but simple)
        for (uint256 i = 0; i < trustedIssuersList.length; i++) {
            if (keccak256(bytes(trustedIssuersList[i])) == keccak256(bytes(issuerDid))) {
                // Replace with the last element and pop
                trustedIssuersList[i] = trustedIssuersList[trustedIssuersList.length - 1];
                trustedIssuersList.pop();
                break;
            }
        }
    }

    /**
     * @dev Updates the DID issuer address
     * @param _didIssuer The new DID issuer address
     */
    function updateDidIssuerAddress(address _didIssuer) external onlyOwner {
        if (_didIssuer == address(0)) revert DidVerifier__InvalidIssuer();
        didIssuer = _didIssuer;
    }

    /*===================== VIEW FUNCTIONS ======================*/
    /**
     * @dev Gets the verification history for a DID
     * @param did The DID to get the history for
     * @return The verification history
     */
    function getVerificationHistory(string calldata did) external view returns (VerificationRecord[] memory) {
        return verificationHistory[did];
    }

    /**
     * @dev Checks if an issuer is trusted
     * @param issuerDid The DID of the issuer
     * @return True if the issuer is trusted, false otherwise
     */
    function isTrustedIssuer(string calldata issuerDid) external view returns (bool) {
        return trustedIssuers[issuerDid];
    }

    /**
     * @dev Gets all trusted issuers
     * @return The list of trusted issuers
     */
    function getTrustedIssuers() external view returns (string[] memory) {
        return trustedIssuersList;
    }

    /**
     * @dev Gets the DID registry address
     * @return The address of the DID registry
     */
    function getDidRegistryAddress() external view override returns (address) {
        return didRegistry;
    }

    /**
     * @dev Gets the DID issuer address
     * @return The address of the DID issuer
     */
    function getDidIssuerAddress() external view override returns (address) {
        return didIssuer;
    }

    /*===================== INTERNAL FUNCTIONS ======================*/
    /**
     * @dev Checks if a DID exists
     * @param _did The DID to check
     * @return True if the DID exists, false otherwise
     */
    function _didExists(string calldata _did) internal view returns (bool) {
        try IDidRegistry(didRegistry).getAddressByDid(_did) returns (address controller) {
            return controller != address(0);
        } catch {
            return false;
        }
    }

    /**
     * @dev Records a verification
     * @param did The DID of the credential subject
     * @param credentialType The type of credential
     * @param credentialId The ID of the credential
     * @param issuerDid The DID of the issuer
     * @param success Whether the verification was successful
     */
    function _recordVerification(
        string calldata did,
        string calldata credentialType,
        bytes32 credentialId,
        string calldata issuerDid,
        bool success
    ) internal {
        verificationHistory[did].push(
            VerificationRecord({
                did: did,
                credentialType: credentialType,
                credentialId: credentialId,
                issuerDid: issuerDid,
                timestamp: block.timestamp,
                success: success
            })
        );

        emit CredentialVerified(did, credentialType, credentialId, issuerDid, block.timestamp, success);
    }
}
