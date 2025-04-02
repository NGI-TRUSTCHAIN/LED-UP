// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {BaseContract} from "../base/BaseContract.sol";
import {IDidRegistry} from "../interfaces/IDidRegistry.sol";
import {GasLib} from "../libraries/GasLib.sol";

/**
 * @title DidIssuerOptimized
 * @dev Gas-optimized implementation of DID credential issuance
 * @notice This contract is used to issue credentials with optimized gas usage
 */
contract DidIssuerOptimized is BaseContract {
    /*===================== ERRORS ======================*/
    error DidIssuer__InvalidSubject();
    error DidIssuer__CredentialAlreadyIssued();
    error DidIssuer__InvalidCredentialType();

    /*===================== VARIABLES ======================*/
    IDidRegistry private didRegistry;

    // Issued credentials - optimized using bytes32 for credential type hashes
    mapping(bytes32 => bool) private issuedCredentials;

    // Credential types - optimized using bytes32 for credential type hashes
    mapping(bytes32 => bool) private validCredentialTypes;

    /*===================== EVENTS ======================*/
    event CredentialIssued(
        bytes32 indexed credentialTypeHash,
        bytes32 indexed subjectDidHash,
        bytes32 indexed credentialId,
        uint256 timestamp
    );

    event CredentialTypeAdded(bytes32 indexed credentialTypeHash, string credentialType);

    /*===================== CONSTRUCTOR ======================*/
    /**
     * @dev Constructor
     * @param _didRegistryAddress The address of the DID registry contract
     */
    constructor(address _didRegistryAddress) validAddress(_didRegistryAddress) {
        didRegistry = IDidRegistry(_didRegistryAddress);
    }

    /*===================== EXTERNAL FUNCTIONS ======================*/
    /**
     * @dev Add a valid credential type
     * @param credentialType The type of credential to add
     */
    function addCredentialType(string calldata credentialType) external onlyOwner {
        bytes32 credentialTypeHash = keccak256(bytes(credentialType));
        validCredentialTypes[credentialTypeHash] = true;

        emit CredentialTypeAdded(credentialTypeHash, credentialType);
    }

    /**
     * @dev Issue a new credential
     * @param credentialType The type of credential being issued
     * @param subject The DID of the subject
     * @param credentialId Unique identifier for the credential
     */
    function issueCredential(string calldata credentialType, string calldata subject, bytes32 credentialId)
        external
        whenNotPausedWithCustomError
    {
        // Check if subject is valid and active
        if (!didRegistry.isActive(subject)) revert DidIssuer__InvalidSubject();

        // Check if credential already exists
        if (issuedCredentials[credentialId]) revert DidIssuer__CredentialAlreadyIssued();

        // Check if credential type is valid
        bytes32 credentialTypeHash = keccak256(bytes(credentialType));
        if (!validCredentialTypes[credentialTypeHash]) revert DidIssuer__InvalidCredentialType();

        // Issue credential
        issuedCredentials[credentialId] = true;

        // Get subject DID hash
        bytes32 subjectDidHash = keccak256(bytes(subject));

        emit CredentialIssued(credentialTypeHash, subjectDidHash, credentialId, block.timestamp);
    }

    /**
     * @dev Check if a credential is valid
     * @param credentialId The unique identifier of the credential
     * @return bool indicating if the credential exists
     */
    function isCredentialValid(bytes32 credentialId) external view returns (bool) {
        return issuedCredentials[credentialId];
    }

    /**
     * @dev Batch issue credentials
     * @param credentialTypes Array of credential types
     * @param subjects Array of subject DIDs
     * @param credentialIds Array of credential IDs
     */
    function batchIssueCredentials(
        string[] calldata credentialTypes,
        string[] calldata subjects,
        bytes32[] calldata credentialIds
    ) external whenNotPausedWithCustomError {
        require(
            credentialTypes.length == subjects.length && credentialTypes.length == credentialIds.length,
            "Array lengths must match"
        );

        for (uint256 i = 0; i < credentialTypes.length; i++) {
            // Check if subject is valid and active
            if (!didRegistry.isActive(subjects[i])) continue;

            // Check if credential already exists
            if (issuedCredentials[credentialIds[i]]) continue;

            // Check if credential type is valid
            bytes32 credentialTypeHash = keccak256(bytes(credentialTypes[i]));
            if (!validCredentialTypes[credentialTypeHash]) continue;

            // Issue credential
            issuedCredentials[credentialIds[i]] = true;

            // Get subject DID hash
            bytes32 subjectDidHash = keccak256(bytes(subjects[i]));

            emit CredentialIssued(credentialTypeHash, subjectDidHash, credentialIds[i], block.timestamp);
        }
    }
}
