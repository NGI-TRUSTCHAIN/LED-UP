// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ICompensation
 * @notice This interface defines the functions for handling compensation-related operations.
 */
interface ICompensation {
    /**
     * @notice Processes a payment for a given producer based on the data size.
     * @param _producer The address of the producer receiving the payment.
     * @param _recordId The ID of the record associated with the payment.
     * @param dataSize The size of the data for which the payment is being processed.
     */
    function processPayment(address _producer, string memory _recordId, uint256 dataSize) external;

    /**
     * @notice Verifies whether a payment has been made for a specific record.
     * @param _recordId The ID of the record to verify the payment for.
     * @return True if the payment has been processed, otherwise false.
     */
    function verifyPayment(string memory _recordId) external view returns (bool);

    /**
     * @notice Withdraws the balance of the caller (producer).
     * @param _amount The amount to withdraw from the producer's balance.
     */
    function withdrawProducerBalance(uint256 _amount) external;

    /**
     * @notice Withdraws a specified service fee amount to the levea wallet.
     * @param _amount The amount of service fee to withdraw.
     */
    function withdrawServiceFee(uint256 _amount) external;

    /**
     * @notice Removes a producer from the system, clearing their balance.
     * @param _producer The address of the producer to be removed.
     */
    function removeProducer(address _producer) external;

    /**
     * @notice Changes the service fee percentage.
     * @param _newServiceFee The new service fee percentage to set.
     */
    function changeServiceFee(uint256 _newServiceFee) external;

    /**
     * @notice Changes the unit price for payments.
     * @param _newUnitPrice The new unit price to set.
     */
    function changeUnitPrice(uint256 _newUnitPrice) external;

    /**
     * @notice Sets the minimum withdrawable amount for producers.
     * @param _amount The new minimum withdraw amount.
     */
    function setMinimumWithdrawAmount(uint256 _amount) external;

    /**
     * @notice Pauses the service, preventing any payments or withdrawals.
     */
    function pauseService() external;

    /**
     * @notice Unpauses the service, allowing payments and withdrawals.
     */
    function unpauseService() external;

    /**
     * @notice Retrieves the current service fee percentage.
     * @return The current service fee percentage.
     */
    function getServiceFee() external view returns (uint256);

    /**
     * @notice Retrieves the address of the levea wallet.
     * @return The address of the levea wallet.
     */
    function getLeveaWallet() external view returns (address);

    /**
     * @notice Retrieves the balance of the levea wallet.
     * @return The balance of the levea wallet in tokens.
     */
    function getLeveaWalletBalance() external view returns (uint256);

    /**
     * @notice Retrieves the producer's balance of the caller.
     * @return The balance of the caller (producer) in tokens.
     */
    function getProducerBalance() external view returns (uint256);

    /**
     * @notice Retrieves the balance of a specific producer.
     * @param _producer The address of the producer to check.
     * @return The balance of the specified producer in tokens.
     */
    function getProducerBalance(address _producer) external view returns (uint256);

    /**
     * @notice Retrieves the minimum withdrawable amount for producers.
     * @return The minimum withdrawable amount in tokens.
     */
    function getMinimumWithdrawAmount() external view returns (uint256);

    /**
     * @notice Checks if a producer exists based on their address.
     * @param _producer The address of the producer to check.
     * @return True if the producer exists, otherwise false.
     */
    function producerExist(address _producer) external view returns (bool);

    /**
     * @notice Retrieves the current unit price for payments.
     * @return The current unit price in tokens.
     */
    function getUnitPrice() external view returns (uint256);
}
