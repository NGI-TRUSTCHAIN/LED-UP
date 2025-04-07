// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ICompensation
 * @dev Interface for the Compensation contract
 * @notice This interface defines the standard functions for compensation management
 */
interface ICompensation {
    /*===================== STRUCTS ======================*/
    /**
     * @dev Payment structure
     */
    struct Payment {
        address consumer;
        address producer;
        uint256 amount;
        uint256 serviceFee;
        uint256 timestamp;
        bool processed;
    }

    /*===================== ERRORS ======================*/
    error Compensation__InvalidAmount();
    error Compensation__InsufficientBalance();
    error Compensation__PaymentFailed();
    error Compensation__InvalidAddress();
    error Compensation__Unauthorized();
    error Compensation__InvalidProducer();
    error Compensation__InvalidConsumer();
    error Compensation__InvalidServiceFee();
    error Compensation__InvalidUnitPrice();
    error Compensation__InvalidRecordId();
    error Compensation__PaymentAlreadyProcessed();
    error Compensation__BelowMinimumWithdrawAmount();

    /*===================== EVENTS ======================*/
    /**
     * @dev Emitted when a payment is processed
     * @param recordId The ID of the record
     * @param consumer The address of the consumer
     * @param producer The address of the producer
     * @param amount The amount of the payment
     * @param serviceFee The service fee amount
     * @param timestamp The timestamp of the payment
     */
    event PaymentProcessed(
        string indexed recordId,
        address indexed consumer,
        address indexed producer,
        uint256 amount,
        uint256 serviceFee,
        uint256 timestamp
    );

    /**
     * @dev Emitted when a producer withdraws their balance
     * @param producer The address of the producer
     * @param amount The amount withdrawn
     * @param timestamp The timestamp of the withdrawal
     */
    event ProducerWithdrawal(address indexed producer, uint256 amount, uint256 timestamp);

    /**
     * @dev Emitted when service fees are withdrawn
     * @param recipient The address of the recipient
     * @param amount The amount withdrawn
     * @param timestamp The timestamp of the withdrawal
     */
    event ServiceFeeWithdrawal(address indexed recipient, uint256 amount, uint256 timestamp);

    /**
     * @dev Emitted when the service fee percentage is updated
     * @param oldFee The old service fee percentage
     * @param newFee The new service fee percentage
     * @param timestamp The timestamp of the update
     */
    event ServiceFeeUpdated(uint256 oldFee, uint256 newFee, uint256 timestamp);

    /**
     * @dev Emitted when the unit price is updated
     * @param oldPrice The old unit price
     * @param newPrice The new unit price
     * @param timestamp The timestamp of the update
     */
    event UnitPriceUpdated(uint256 oldPrice, uint256 newPrice, uint256 timestamp);

    /**
     * @dev Emitted when the minimum withdraw amount is updated
     * @param oldAmount The old minimum withdraw amount
     * @param newAmount The new minimum withdraw amount
     * @param timestamp The timestamp of the update
     */
    event MinimumWithdrawAmountUpdated(uint256 oldAmount, uint256 newAmount, uint256 timestamp);

    /*===================== FUNCTIONS ======================*/
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
        returns (uint256);

    /**
     * @dev Withdraws a producer's balance
     * @param producer The address of the producer
     * @return The amount withdrawn
     */
    function withdrawProducerBalance(address producer) external returns (uint256);

    /**
     * @dev Withdraws service fees
     * @return The amount withdrawn
     */
    function withdrawServiceFees() external returns (uint256);

    /**
     * @dev Sets the service fee percentage
     * @param newServiceFeePercent The new service fee percentage
     */
    function setServiceFeePercent(uint256 newServiceFeePercent) external;

    /**
     * @dev Sets the unit price
     * @param newUnitPrice The new unit price
     */
    function setUnitPrice(uint256 newUnitPrice) external;

    /**
     * @dev Sets the minimum withdraw amount
     * @param newMinimumWithdrawAmount The new minimum withdraw amount
     */
    function setMinimumWithdrawAmount(uint256 newMinimumWithdrawAmount) external;

    /**
     * @dev Gets a payment
     * @param recordId The ID of the record
     * @return The payment
     */
    function getPayment(string calldata recordId) external view returns (Payment memory);

    /**
     * @dev Gets a producer's balance
     * @param producer The address of the producer
     * @return The producer's balance
     */
    function getProducerBalance(address producer) external view returns (uint256);

    /**
     * @dev Gets the service fee balance
     * @return The service fee balance
     */
    function getServiceFeeBalance() external view returns (uint256);

    /**
     * @dev Gets the service fee percentage
     * @return The service fee percentage
     */
    function getServiceFeePercent() external view returns (uint256);

    /**
     * @dev Gets the unit price
     * @return The unit price
     */
    function getUnitPrice() external view returns (uint256);

    /**
     * @dev Gets the minimum withdraw amount
     * @return The minimum withdraw amount
     */
    function getMinimumWithdrawAmount() external view returns (uint256);

    /**
     * @dev Gets the token address
     * @return The token address
     */
    function getTokenAddress() external view returns (address);

    /**
     * @dev Gets the Levea wallet address
     * @return The Levea wallet address
     */
    function getLeveaWalletAddress() external view returns (address);

    /**
     * @dev Compensates a participant
     * @param participant The address of the participant
     * @param amount The amount to compensate
     * @return success Whether the compensation was successful
     */
    function compensateParticipant(address participant, uint256 amount) external returns (bool success);

    /**
     * @dev Gets the compensation record for a participant
     * @param participant The address of the participant
     * @return amount The total compensation amount
     * @return lastTime The timestamp of the last compensation
     */
    function getCompensationRecord(address participant) external view returns (uint256 amount, uint256 lastTime);

    /**
     * @dev Gets the DID registry address
     * @return The DID registry address
     */
    function getDidRegistryAddress() external view returns (address);

    /**
     * @dev Gets the data registry address
     * @return The data registry address
     */
    function getDataRegistryAddress() external view returns (address);
}
