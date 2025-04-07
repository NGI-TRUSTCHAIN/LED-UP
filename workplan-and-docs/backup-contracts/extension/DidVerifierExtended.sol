// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {DidVerifierCore} from "../core/DidVerifierCore.sol";
import {ValidationLib} from "../libraries/ValidationLib.sol";
import {SecurityLib} from "../libraries/SecurityLib.sol";
import {IDidRegistry} from "../interfaces/IDidRegistry.sol";
import {IDidIssuer} from "../interfaces/IDidIssuer.sol";

/**
 * @title DidVerifierExtended
 * @dev Extended implementation of the DID Verifier contract with additional features
 * @notice This contract extends the core DID Verifier contract with additional functionality
 */
contract DidVerifierExtended is DidVerifierCore {
    /*===================== ERRORS ======================*/
    error DidVerifierExtended__InvalidSignature();
    error DidVerifierExtended__InvalidTimestamp();
    error DidVerifierExtended__InvalidNonce();
    error DidVerifierExtended__InvalidPolicy();
    error DidVerifierExtended__PolicyAlreadyExists();
    error DidVerifierExtended__PolicyNotFound();
    error DidVerifierExtended__VerificationFailed();

    /*===================== STRUCTS ======================*/
    /**
     * @dev Verification policy structure
     */
    struct VerificationPolicy {
        string policyId;
        string name;
        string description;
        string[] requiredCredentialTypes;
        mapping(string => bool) trustedIssuersOnly;
        uint256 createdAt;
        bool active;
    }

    /**
     * @dev Verification result structure
     */
    struct VerificationResult {
        string did;
        string policyId;
        bool success;
        string[] missingCredentials;
        uint256 timestamp;
    }

    /*===================== VARIABLES ======================*/
    // Verification policies
    mapping(string => VerificationPolicy) private verificationPolicies;
    string[] private policyIds;

    // Verification results
    mapping(string => VerificationResult[]) private verificationResults;

    // Used nonces for replay protection
    mapping(bytes32 => bool) private usedNonces;

    // DID registry interface
    IDidRegistry private didRegistryInterface;

    // DID issuer interface
    IDidIssuer private didIssuerInterface;

    /*===================== EVENTS ======================*/
    event VerificationPolicyCreated(string indexed policyId, string name, uint256 timestamp);
    event VerificationPolicyUpdated(string indexed policyId, uint256 timestamp);
    event VerificationPolicyDeactivated(string indexed policyId, uint256 timestamp);
    event VerificationCompleted(string indexed did, string indexed policyId, bool success, uint256 timestamp);

    /*===================== CONSTRUCTOR ======================*/
    /**
     * @dev Constructor
     * @param _didRegistry The address of the DID registry
     * @param _didIssuer The address of the DID issuer
     */
    constructor(address _didRegistry, address _didIssuer) DidVerifierCore(_didRegistry, _didIssuer) {
        didRegistryInterface = IDidRegistry(_didRegistry);
        didIssuerInterface = IDidIssuer(_didIssuer);
    }

    /*===================== EXTERNAL FUNCTIONS ======================*/
    /**
     * @dev Creates a verification policy
     * @param policyId The ID of the policy
     * @param name The name of the policy
     * @param description The description of the policy
     * @param requiredCredentialTypes The required credential types for the policy
     * @param trustedIssuersOnly Whether to only trust issuers for each credential type
     */
    function createVerificationPolicy(
        string calldata policyId,
        string calldata name,
        string calldata description,
        string[] calldata requiredCredentialTypes,
        bool[] calldata trustedIssuersOnly
    ) external onlyOwner {
        if (bytes(policyId).length == 0) revert DidVerifierExtended__InvalidPolicy();
        if (bytes(verificationPolicies[policyId].policyId).length > 0) {
            revert DidVerifierExtended__PolicyAlreadyExists();
        }
        if (requiredCredentialTypes.length != trustedIssuersOnly.length) {
            revert DidVerifierExtended__InvalidPolicy();
        }

        VerificationPolicy storage policy = verificationPolicies[policyId];
        policy.policyId = policyId;
        policy.name = name;
        policy.description = description;
        policy.requiredCredentialTypes = requiredCredentialTypes;
        policy.createdAt = block.timestamp;
        policy.active = true;

        for (uint256 i = 0; i < requiredCredentialTypes.length; i++) {
            policy.trustedIssuersOnly[requiredCredentialTypes[i]] = trustedIssuersOnly[i];
        }

        policyIds.push(policyId);

        emit VerificationPolicyCreated(policyId, name, block.timestamp);
    }

    /**
     * @dev Updates a verification policy
     * @param policyId The ID of the policy
     * @param name The updated name
     * @param description The updated description
     */
    function updateVerificationPolicy(string calldata policyId, string calldata name, string calldata description)
        external
        onlyOwner
    {
        if (bytes(verificationPolicies[policyId].policyId).length == 0) {
            revert DidVerifierExtended__PolicyNotFound();
        }

        VerificationPolicy storage policy = verificationPolicies[policyId];
        policy.name = name;
        policy.description = description;

        emit VerificationPolicyUpdated(policyId, block.timestamp);
    }

    /**
     * @dev Deactivates a verification policy
     * @param policyId The ID of the policy
     */
    function deactivateVerificationPolicy(string calldata policyId) external onlyOwner {
        if (bytes(verificationPolicies[policyId].policyId).length == 0) {
            revert DidVerifierExtended__PolicyNotFound();
        }

        verificationPolicies[policyId].active = false;

        emit VerificationPolicyDeactivated(policyId, block.timestamp);
    }

    /**
     * @dev Activates a verification policy
     * @param policyId The ID of the policy
     */
    function activateVerificationPolicy(string calldata policyId) external onlyOwner {
        if (bytes(verificationPolicies[policyId].policyId).length == 0) {
            revert DidVerifierExtended__PolicyNotFound();
        }

        verificationPolicies[policyId].active = true;
    }

    /**
     * @dev Verifies a DID against a policy
     * @param did The DID to verify
     * @param policyId The ID of the policy
     * @param credentialIds The IDs of the credentials to verify
     * @return success True if verification is successful, false otherwise
     * @return missingCredentials The list of missing credential types
     */
    function verifyDidAgainstPolicy(string calldata did, string calldata policyId, bytes32[] calldata credentialIds)
        public
        whenNotPausedWithCustomError
        didExists(did)
        returns (bool success, string[] memory missingCredentials)
    {
        if (bytes(verificationPolicies[policyId].policyId).length == 0) {
            revert DidVerifierExtended__PolicyNotFound();
        }

        if (!verificationPolicies[policyId].active) {
            revert DidVerifierExtended__PolicyNotFound();
        }

        VerificationPolicy storage policy = verificationPolicies[policyId];
        string[] memory requiredTypes = policy.requiredCredentialTypes;
        string[] memory missing = new string[](requiredTypes.length);
        uint256 missingCount = 0;

        // Check each required credential type
        for (uint256 i = 0; i < requiredTypes.length; i++) {
            bool found = false;

            // Check if any of the provided credentials match this type
            for (uint256 j = 0; j < credentialIds.length; j++) {
                // Check if credential is valid
                if (didIssuerInterface.isCredentialValid(did, credentialIds[j])) {
                    // TODO: Check credential type (would require additional interface methods)
                    found = true;
                    break;
                }
            }

            if (!found) {
                missing[missingCount] = requiredTypes[i];
                missingCount++;
            }
        }

        // Resize missing array to actual count
        if (missingCount > 0) {
            string[] memory result = new string[](missingCount);
            for (uint256 i = 0; i < missingCount; i++) {
                result[i] = missing[i];
            }
            missingCredentials = result;
            success = false;
        } else {
            missingCredentials = new string[](0);
            success = true;
        }

        // Record verification result
        _recordPolicyVerification(did, policyId, success, missingCredentials);

        return (success, missingCredentials);
    }

    /**
     * @dev Verifies a DID against a policy with a signature
     * @param did The DID to verify
     * @param policyId The ID of the policy
     * @param credentialIds The IDs of the credentials to verify
     * @param nonce A unique nonce
     * @param timestamp The timestamp of the verification
     * @param signature The signature of the verification data
     * @return success True if verification is successful, false otherwise
     * @return missingCredentials The list of missing credential types
     */
    function verifyDidAgainstPolicyWithSignature(
        string calldata did,
        string calldata policyId,
        bytes32[] calldata credentialIds,
        bytes32 nonce,
        uint256 timestamp,
        bytes calldata signature
    ) external whenNotPausedWithCustomError didExists(did) returns (bool success, string[] memory missingCredentials) {
        // Check if nonce has been used
        if (usedNonces[nonce]) revert DidVerifierExtended__InvalidNonce();
        usedNonces[nonce] = true;

        // Check if timestamp is valid (within 5 minutes)
        if (!SecurityLib.validateTimestamp(timestamp, 5 minutes)) {
            revert DidVerifierExtended__InvalidTimestamp();
        }

        // Create message hash
        bytes32 messageHash =
            keccak256(abi.encodePacked(did, policyId, _hashBytes32Array(credentialIds), nonce, timestamp));

        // Get the controller address
        address controller = didRegistryInterface.getAddressByDid(did);

        // Verify signature
        if (!SecurityLib.validateSignature(messageHash, signature, controller)) {
            revert DidVerifierExtended__InvalidSignature();
        }

        // Verify against policy
        return verifyDidAgainstPolicy(did, policyId, credentialIds);
    }

    /*===================== VIEW FUNCTIONS ======================*/
    /**
     * @dev Gets a verification policy
     * @param policyId The ID of the policy
     * @return name The name of the policy
     * @return description The description of the policy
     * @return requiredCredentialTypes The required credential types for the policy
     * @return createdAt The timestamp of creation
     * @return active Whether the policy is active
     */
    function getVerificationPolicy(string calldata policyId)
        external
        view
        returns (
            string memory name,
            string memory description,
            string[] memory requiredCredentialTypes,
            uint256 createdAt,
            bool active
        )
    {
        if (bytes(verificationPolicies[policyId].policyId).length == 0) {
            revert DidVerifierExtended__PolicyNotFound();
        }

        VerificationPolicy storage policy = verificationPolicies[policyId];

        return (policy.name, policy.description, policy.requiredCredentialTypes, policy.createdAt, policy.active);
    }

    /**
     * @dev Gets all policy IDs
     * @return The list of policy IDs
     */
    function getPolicyIds() external view returns (string[] memory) {
        return policyIds;
    }

    /**
     * @dev Gets the verification results for a DID
     * @param did The DID to get results for
     * @return The verification results
     */
    function getVerificationResults(string calldata did) external view returns (VerificationResult[] memory) {
        return verificationResults[did];
    }

    /**
     * @dev Checks if a policy requires trusted issuers for a credential type
     * @param policyId The ID of the policy
     * @param credentialType The credential type
     * @return True if trusted issuers are required, false otherwise
     */
    function requiresTrustedIssuers(string calldata policyId, string calldata credentialType)
        external
        view
        returns (bool)
    {
        if (bytes(verificationPolicies[policyId].policyId).length == 0) {
            revert DidVerifierExtended__PolicyNotFound();
        }

        return verificationPolicies[policyId].trustedIssuersOnly[credentialType];
    }

    /*===================== INTERNAL FUNCTIONS ======================*/
    /**
     * @dev Records a policy verification
     * @param did The DID that was verified
     * @param policyId The ID of the policy
     * @param success Whether the verification was successful
     * @param missingCredentials The list of missing credential types
     */
    function _recordPolicyVerification(
        string calldata did,
        string calldata policyId,
        bool success,
        string[] memory missingCredentials
    ) internal {
        verificationResults[did].push(
            VerificationResult({
                did: did,
                policyId: policyId,
                success: success,
                missingCredentials: missingCredentials,
                timestamp: block.timestamp
            })
        );

        emit VerificationCompleted(did, policyId, success, block.timestamp);
    }

    /**
     * @dev Hashes an array of bytes32
     * @param array The array to hash
     * @return The hash of the array
     */
    function _hashBytes32Array(bytes32[] calldata array) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(array));
    }
}
