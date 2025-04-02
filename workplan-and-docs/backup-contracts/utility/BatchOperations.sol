// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {BaseContract} from "../base/BaseContract.sol";
import {IDidRegistry} from "../interfaces/IDidRegistry.sol";
import {IDataRegistry} from "../interfaces/IDataRegistry.sol";
import {IDidAuth} from "../interfaces/IDidAuth.sol";

/**
 * @title BatchOperations
 * @dev Contract for batch operations to reduce gas costs for multiple transactions
 * @notice This contract provides functions for performing batch operations on various contracts
 */
contract BatchOperations is BaseContract {
    /*===================== VARIABLES ======================*/
    IDidRegistry public didRegistry;
    IDataRegistry public dataRegistry;
    IDidAuth public didAuth;

    /*===================== EVENTS ======================*/
    event BatchDidRegistration(uint256 count, uint256 timestamp);
    event BatchDidUpdate(uint256 count, uint256 timestamp);
    event BatchDidDeactivation(uint256 count, uint256 timestamp);
    event BatchHealthRecordCreation(uint256 count, uint256 timestamp);
    event BatchHealthRecordUpdate(uint256 count, uint256 timestamp);
    event BatchHealthRecordDeletion(uint256 count, uint256 timestamp);
    event BatchConsumerAuthorization(uint256 count, uint256 timestamp);
    event BatchConsumerAuthorizationRevocation(uint256 count, uint256 timestamp);

    /*===================== CONSTRUCTOR ======================*/
    /**
     * @dev Constructor
     * @param _didRegistryAddress The address of the DID Registry contract
     * @param _dataRegistryAddress The address of the Data Registry contract
     * @param _didAuthAddress The address of the DID Auth contract
     */
    constructor(address _didRegistryAddress, address _dataRegistryAddress, address _didAuthAddress) BaseContract() {
        didRegistry = IDidRegistry(_didRegistryAddress);
        dataRegistry = IDataRegistry(_dataRegistryAddress);
        didAuth = IDidAuth(_didAuthAddress);
    }

    /*===================== BATCH DID OPERATIONS ======================*/
    /**
     * @dev Batch registers DIDs
     * @param dids Array of DIDs to register
     * @param documents Array of DID documents
     * @param publicKeys Array of public keys
     */
    function batchRegisterDids(string[] calldata dids, string[] calldata documents, string[] calldata publicKeys)
        external
        onlyOwner
        whenNotPausedWithCustomError
    {
        require(dids.length == documents.length && dids.length == publicKeys.length, "Array lengths must match");

        for (uint256 i = 0; i < dids.length; i++) {
            didRegistry.registerDid(dids[i], documents[i], publicKeys[i]);
        }

        emit BatchDidRegistration(dids.length, block.timestamp);
    }

    /**
     * @dev Batch updates DIDs
     * @param dids Array of DIDs to update
     * @param documents Array of updated DID documents
     * @param publicKeys Array of updated public keys
     */
    function batchUpdateDids(string[] calldata dids, string[] calldata documents, string[] calldata publicKeys)
        external
        onlyOwner
        whenNotPausedWithCustomError
    {
        require(dids.length == documents.length && dids.length == publicKeys.length, "Array lengths must match");

        for (uint256 i = 0; i < dids.length; i++) {
            didRegistry.updateDid(dids[i], documents[i], publicKeys[i]);
        }

        emit BatchDidUpdate(dids.length, block.timestamp);
    }

    /**
     * @dev Batch deactivates DIDs
     * @param dids Array of DIDs to deactivate
     */
    function batchDeactivateDids(string[] calldata dids) external onlyOwner whenNotPausedWithCustomError {
        for (uint256 i = 0; i < dids.length; i++) {
            didRegistry.deactivateDid(dids[i]);
        }

        emit BatchDidDeactivation(dids.length, block.timestamp);
    }

    /*===================== BATCH DATA REGISTRY OPERATIONS ======================*/
    /**
     * @dev Batch creates health records
     * @param recordIds Array of record IDs
     * @param metadatas Array of record metadatas
     */
    function batchCreateHealthRecords(string[] calldata recordIds, string[] calldata metadatas)
        external
        whenNotPausedWithCustomError
    {
        require(recordIds.length == metadatas.length, "Array lengths must match");

        for (uint256 i = 0; i < recordIds.length; i++) {
            dataRegistry.createHealthRecord(recordIds[i], metadatas[i]);
        }

        emit BatchHealthRecordCreation(recordIds.length, block.timestamp);
    }

    /**
     * @dev Batch updates health records
     * @param recordIds Array of record IDs
     * @param metadatas Array of updated record metadatas
     */
    function batchUpdateHealthRecords(string[] calldata recordIds, string[] calldata metadatas)
        external
        whenNotPausedWithCustomError
    {
        require(recordIds.length == metadatas.length, "Array lengths must match");

        for (uint256 i = 0; i < recordIds.length; i++) {
            dataRegistry.updateHealthRecord(recordIds[i], metadatas[i]);
        }

        emit BatchHealthRecordUpdate(recordIds.length, block.timestamp);
    }

    /**
     * @dev Batch deletes health records
     * @param recordIds Array of record IDs
     */
    function batchDeleteHealthRecords(string[] calldata recordIds) external whenNotPausedWithCustomError {
        for (uint256 i = 0; i < recordIds.length; i++) {
            dataRegistry.deleteHealthRecord(recordIds[i]);
        }

        emit BatchHealthRecordDeletion(recordIds.length, block.timestamp);
    }

    /**
     * @dev Batch authorizes consumers
     * @param recordIds Array of record IDs
     * @param consumerDids Array of consumer DIDs
     */
    function batchAuthorizeConsumers(string[] calldata recordIds, string[] calldata consumerDids)
        external
        whenNotPausedWithCustomError
    {
        require(recordIds.length == consumerDids.length, "Array lengths must match");

        for (uint256 i = 0; i < recordIds.length; i++) {
            dataRegistry.authorizeConsumer(recordIds[i], consumerDids[i]);
        }

        emit BatchConsumerAuthorization(recordIds.length, block.timestamp);
    }

    /**
     * @dev Batch revokes consumer authorizations
     * @param recordIds Array of record IDs
     * @param consumerDids Array of consumer DIDs
     */
    function batchRevokeConsumerAuthorizations(string[] calldata recordIds, string[] calldata consumerDids)
        external
        whenNotPausedWithCustomError
    {
        require(recordIds.length == consumerDids.length, "Array lengths must match");

        for (uint256 i = 0; i < recordIds.length; i++) {
            dataRegistry.revokeConsumerAuthorization(recordIds[i], consumerDids[i]);
        }

        emit BatchConsumerAuthorizationRevocation(recordIds.length, block.timestamp);
    }

    /*===================== BATCH DID AUTH OPERATIONS ======================*/
    /**
     * @dev Batch grants roles to DIDs
     * @param dids Array of DIDs
     * @param roles Array of roles
     */
    function batchGrantRoles(string[] calldata dids, bytes32[] calldata roles)
        external
        onlyOwner
        whenNotPausedWithCustomError
    {
        require(dids.length == roles.length, "Array lengths must match");

        for (uint256 i = 0; i < dids.length; i++) {
            didAuth.grantRole(dids[i], roles[i]);
        }
    }

    /**
     * @dev Batch revokes roles from DIDs
     * @param dids Array of DIDs
     * @param roles Array of roles
     */
    function batchRevokeRoles(string[] calldata dids, bytes32[] calldata roles)
        external
        onlyOwner
        whenNotPausedWithCustomError
    {
        require(dids.length == roles.length, "Array lengths must match");

        for (uint256 i = 0; i < dids.length; i++) {
            didAuth.revokeRole(dids[i], roles[i]);
        }
    }
}
