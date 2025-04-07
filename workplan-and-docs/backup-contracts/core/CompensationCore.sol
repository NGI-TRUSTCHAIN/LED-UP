// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {BaseContract} from "../base/BaseContract.sol";
import {ICompensation} from "../interfaces/ICompensation.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title CompensationCore
 * @dev Core implementation of the Compensation contract
 * @notice This contract provides the core functionality for managing compensation
 */
abstract contract CompensationCore is BaseContract, ICompensation {
    /*===================== ERRORS ======================*/
    error CompensationCore__Unauthorized();
    error CompensationCore__InvalidAmount();
    error CompensationCore__InvalidAddress();
    error CompensationCore__TransferFailed();
    error CompensationCore__InsufficientBalance();
    error CompensationCore__NotImplemented();

    /*===================== VARIABLES ======================*/
    // Token contract
    IERC20 private token;

    // DID registry contract address
    address private didRegistry;

    // Data registry contract address
    address private dataRegistry;

    // Compensation records
    mapping(address => uint256) private compensationRecords;
    mapping(address => uint256) private lastCompensationTime;

    // Service fee percentage (in basis points, e.g., 250 = 2.5%)
    uint256 private serviceFeePercent;

    // Unit price
    uint256 private unitPrice;

    // Minimum withdraw amount
    uint256 private minimumWithdrawAmount;

    // Producer balances
    mapping(address => uint256) private producerBalances;

    // Service fee balance
    uint256 private serviceFeeBalance;

    // Levea wallet address
    address private leveaWallet;

    // Payments
    mapping(string => Payment) private payments;

    /*===================== EVENTS ======================*/
    event CompensationPaid(address indexed participant, uint256 amount, uint256 timestamp);
    event TokenAddressUpdated(address indexed oldToken, address indexed newToken);
    event RegistryAddressUpdated(string indexed registryType, address indexed oldAddress, address indexed newAddress);

    /*===================== CONSTRUCTOR ======================*/
    /**
     * @dev Constructor
     * @param _token The address of the token contract
     * @param _didRegistry The address of the DID registry
     * @param _dataRegistry The address of the data registry
     */
    constructor(address _token, address _didRegistry, address _dataRegistry) {
        if (_token == address(0)) revert CompensationCore__InvalidAddress();
        if (_didRegistry == address(0)) revert CompensationCore__InvalidAddress();
        if (_dataRegistry == address(0)) revert CompensationCore__InvalidAddress();

        token = IERC20(_token);
        didRegistry = _didRegistry;
        dataRegistry = _dataRegistry;
        leveaWallet = msg.sender; // Default to deployer
        serviceFeePercent = 250; // Default 2.5%
        unitPrice = 1e16; // Default 0.01 tokens per unit
        minimumWithdrawAmount = 1e18; // Default 1 token
    }

    /*===================== EXTERNAL FUNCTIONS ======================*/
    /**
     * @dev Compensates a participant
     * @param participant The address of the participant
     * @param amount The amount to compensate
     * @return success Whether the compensation was successful
     */
    function compensateParticipant(address participant, uint256 amount)
        public
        virtual
        whenNotPausedWithCustomError
        returns (bool success)
    {
        if (participant == address(0)) revert CompensationCore__InvalidAddress();
        if (amount == 0) revert CompensationCore__InvalidAmount();

        // Check if contract has enough tokens
        if (token.balanceOf(address(this)) < amount) {
            revert CompensationCore__InsufficientBalance();
        }

        // Transfer tokens to participant
        bool transferSuccess = token.transfer(participant, amount);

        if (!transferSuccess) {
            revert CompensationCore__TransferFailed();
        }

        // Update compensation records
        compensationRecords[participant] += amount;
        lastCompensationTime[participant] = block.timestamp;

        emit CompensationPaid(participant, amount, block.timestamp);

        return true;
    }

    /**
     * @dev Updates the token address
     * @param _token The new token address
     */
    function updateTokenAddress(address _token) external onlyOwner {
        if (_token == address(0)) revert CompensationCore__InvalidAddress();

        address oldToken = address(token);
        token = IERC20(_token);

        emit TokenAddressUpdated(oldToken, _token);
    }

    /**
     * @dev Updates the DID registry address
     * @param _didRegistry The new DID registry address
     */
    function updateDidRegistryAddress(address _didRegistry) external onlyOwner {
        if (_didRegistry == address(0)) revert CompensationCore__InvalidAddress();

        address oldRegistry = didRegistry;
        didRegistry = _didRegistry;

        emit RegistryAddressUpdated("DID", oldRegistry, _didRegistry);
    }

    /**
     * @dev Updates the data registry address
     * @param _dataRegistry The new data registry address
     */
    function updateDataRegistryAddress(address _dataRegistry) external onlyOwner {
        if (_dataRegistry == address(0)) revert CompensationCore__InvalidAddress();

        address oldRegistry = dataRegistry;
        dataRegistry = _dataRegistry;

        emit RegistryAddressUpdated("Data", oldRegistry, _dataRegistry);
    }

    /**
     * @dev Processes a payment for a record
     * @param recordId The ID of the record
     * @param consumer The address of the consumer
     * @param producer The address of the producer
     * @param units The number of units to pay for
     * @return The amount of the payment
     */
    function processPayment(string calldata recordId, address consumer, address producer, uint256 units)
        external
        virtual
        returns (uint256)
    {
        revert CompensationCore__NotImplemented();
    }

    /**
     * @dev Withdraws a producer's balance
     * @param producer The address of the producer
     * @return The amount withdrawn
     */
    function withdrawProducerBalance(address producer) external virtual returns (uint256) {
        revert CompensationCore__NotImplemented();
    }

    /**
     * @dev Withdraws service fees
     * @return The amount withdrawn
     */
    function withdrawServiceFees() external virtual returns (uint256) {
        revert CompensationCore__NotImplemented();
    }

    /**
     * @dev Sets the service fee percentage
     * @param newServiceFeePercent The new service fee percentage
     */
    function setServiceFeePercent(uint256 newServiceFeePercent) external virtual {
        revert CompensationCore__NotImplemented();
    }

    /**
     * @dev Sets the unit price
     * @param newUnitPrice The new unit price
     */
    function setUnitPrice(uint256 newUnitPrice) external virtual {
        revert CompensationCore__NotImplemented();
    }

    /**
     * @dev Sets the minimum withdraw amount
     * @param newMinimumWithdrawAmount The new minimum withdraw amount
     */
    function setMinimumWithdrawAmount(uint256 newMinimumWithdrawAmount) external virtual {
        revert CompensationCore__NotImplemented();
    }

    /*===================== VIEW FUNCTIONS ======================*/
    /**
     * @dev Gets the compensation record for a participant
     * @param participant The address of the participant
     * @return amount The total compensation amount
     * @return lastTime The timestamp of the last compensation
     */
    function getCompensationRecord(address participant) external view returns (uint256 amount, uint256 lastTime) {
        return (compensationRecords[participant], lastCompensationTime[participant]);
    }

    /**
     * @dev Gets the token address
     * @return The token address
     */
    function getTokenAddress() external view returns (address) {
        return address(token);
    }

    /**
     * @dev Gets the DID registry address
     * @return The DID registry address
     */
    function getDidRegistryAddress() external view returns (address) {
        return didRegistry;
    }

    /**
     * @dev Gets the data registry address
     * @return The data registry address
     */
    function getDataRegistryAddress() external view returns (address) {
        return dataRegistry;
    }

    /**
     * @dev Gets a payment
     * @param recordId The ID of the record
     * @return The payment
     */
    function getPayment(string calldata recordId) external view virtual returns (Payment memory) {
        return payments[recordId];
    }

    /**
     * @dev Gets a producer's balance
     * @param producer The address of the producer
     * @return The producer's balance
     */
    function getProducerBalance(address producer) external view virtual returns (uint256) {
        return producerBalances[producer];
    }

    /**
     * @dev Gets the service fee balance
     * @return The service fee balance
     */
    function getServiceFeeBalance() external view virtual returns (uint256) {
        return serviceFeeBalance;
    }

    /**
     * @dev Gets the service fee percentage
     * @return The service fee percentage
     */
    function getServiceFeePercent() external view virtual returns (uint256) {
        return serviceFeePercent;
    }

    /**
     * @dev Gets the unit price
     * @return The unit price
     */
    function getUnitPrice() external view virtual returns (uint256) {
        return unitPrice;
    }

    /**
     * @dev Gets the minimum withdraw amount
     * @return The minimum withdraw amount
     */
    function getMinimumWithdrawAmount() external view virtual returns (uint256) {
        return minimumWithdrawAmount;
    }

    /**
     * @dev Gets the Levea wallet address
     * @return The Levea wallet address
     */
    function getLeveaWalletAddress() external view virtual returns (address) {
        return leveaWallet;
    }
}
