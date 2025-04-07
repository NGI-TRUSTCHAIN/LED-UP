// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ICompensation
 * @notice This interface defines the functions for handling compensation-related operations.
 */
interface ICompensation {
    /**
     * @notice This function requires that the caller has previously approved the transfer of
     * tokens to this contract. If the token transfer fails, the transaction will revert.
     *
     * @notice It emits a {PaymentProcessed} event upon successful payment processing,
     * containing details such as the producer's address, the sender's address, the
     * amount paid, and the service fee deducted.
     * @dev It processes a payment from the caller to the specified producer for the given record.
     *
     * This function calculates the total payment amount based on the size of the data being
     * processed and the unit price defined in the contract. It ensures that the producer address
     * is valid and that the token transfer from the caller is successful. The function also
     * deducts a service fee from the payment amount, which is accumulated in the service fee balance.
     *
     * Upon successful payment processing, it updates the producer's balance and records the
     * payment status for the specified record ID. An event is emitted to log the details of
     * the payment transaction.
     *
     * @param _producer The address of the producer receiving the payment.
     *                  Must not be a zero address.
     * @param _recordId The ID of the record for which the payment is being made.
     *                  This ID will be used to track the payment status.
     * @param dataSize The size of the data being processed, which determines the total payment
     *                 amount to be transferred to the producer. The total amount is calculated
     *                 as `dataSize * unitPrice`.
     * @param consumerDid The DID of the consumer initiating the payment.
     *
     * @dev The service fee is calculated as a percentage of the total payment amount, and
     *      the remaining balance after deducting the fee is credited to the producer's balance.
     *      The payment status is recorded for the specified record ID, ensuring transparency
     *      in payment transactions.
     */
    function processPayment(address _producer, string memory _recordId, uint256 dataSize, string memory consumerDid)
        external;

    /**
     * @notice This function is a view function, meaning it does not modify the state of the contract
     * and can be called for free without gas costs.
     * @dev This function verifies the payment status for a specified record.
     *
     * It allows users to check if a payment has been successfully processed
     * for a given record ID. It retrieves the payment information from the internal
     * `payments` mapping and returns a boolean indicating whether the payment has been
     * marked as paid.
     *
     * @param _recordId The ID of the record for which payment verification is being requested.
     *
     * @return bool A boolean value indicating the payment status.
     *              Returns `true` if the payment for the specified record ID has been processed,
     *              and `false` otherwise.
     *
     * @dev It is important to ensure that the `_recordId` provided corresponds to a valid record
     *      within the contract's payment system for accurate verification.
     */
    function verifyPayment(string memory _recordId) external view returns (bool);

    /**
     * @notice Allows a producer to withdraw a specified amount from their balance held in the contract.
     * This function ensures that the withdrawal meets the minimum withdrawal amount
     * and that the producer has sufficient balance. The operation is paused if the contract
     * is in a paused state.
     *
     * @dev This function checks that the requested amount is above the minimum withdrawal threshold
     * and that the producer has enough balance to cover the withdrawal. If both conditions are met,
     * the function proceeds to transfer the tokens to the producer's address.
     *
     * @param _amount The amount of tokens the producer wishes to withdraw.
     */
    function withdrawProducerBalance(uint256 _amount) external;

    /**
     * @notice Allows the contract owner to withdraw a specified amount of service fees from the contract.
     * The function checks that the requested withdrawal amount does not exceed the available service fee balance
     * and ensures that the contract is not paused before proceeding with the withdrawal.
     *
     * @dev The call to this function is restricted to the contract owner. It validates that the requested amount
     * does not exceed the current service fee balance. If validation passes, the service fee amount is
     * deducted from the balance and transferred to the designated wallet.
     *
     * @param _amount The amount of service fees the owner wishes to withdraw.
     *
     */
    function withdrawServiceFee(uint256 _amount) external;

    /**
     * @notice Removes the specified producer's balance from the contract.
     * This function deletes the producer's balance and emits an event to
     * signify the removal. It can only be called by the contract owner and
     * cannot be executed while the contract is paused.
     *
     * @param _producer The address of the producer whose balance is to be removed.
     *
     * @custom:event ProducerRemoved(_producer, block.timestamp) emitted when a producer's
     *        balance is successfully removed, capturing the producer's address
     *        and the timestamp of the transaction.
     */
    function removeProducer(address _producer) external;

    /**
     * @notice Changes the service fee percentage for the contract.
     * This function allows the contract owner to update the service fee.
     * The new service fee must be greater than zero. The old service fee
     * is stored before the update for reference, and an event is emitted
     * to log the change.
     *
     * @param _newServiceFee The new service fee percentage to be set.
     *        Must be greater than zero.
     *
     * @custom:event ServiceFeeChanged(msg.sender, oldServiceFee, _newServiceFee) emitted
     *        when the service fee is successfully changed, capturing the address
     *        of the caller, the old service fee, and the new service fee.
     */
    function changeServiceFee(uint256 _newServiceFee) external;

    /**
     * @notice Changes the unit price for the contract.
     * This function allows the contract owner to update the unit price.
     * The new unit price must be greater than zero. The old unit price
     * is stored before the update for reference, and an event is emitted
     * to log the change.
     *
     * @param _newUnitPrice The new unit price to be set.
     *        Must be greater than zero.
     *
     * @custom:event UnitPriceChanged(msg.sender, oldUnitPrice, _newUnitPrice) emitted
     *        when the unit price is successfully changed, capturing the address
     *        of the caller, the old unit price, and the new unit price.
     */
    function changeUnitPrice(uint256 _newUnitPrice) external;

    /**
     * @notice Sets the minimum withdraw amount for producers.
     * This function allows the contract owner to specify the minimum
     * amount that producers are required to withdraw.
     *
     * @param _amount The new minimum withdraw amount to be set.
     *
     * @custom:event MinimumWithdrawAmountUpdated(msg.sender, _amount) emitted
     *        when the minimum withdraw amount is successfully updated,
     *        capturing the address of the caller and the new amount.
     */
    function setMinimumWithdrawAmount(uint256 _amount) external;

    /**
     * @notice Changes the address of the token used for payments.
     * This function allows the contract owner to update the token address.
     * The new token address must be a valid, non-zero address.
     *
     * @param _tokenAddress The address of the new token contract.
     *
     * @custom:event TokenAddressUpdated(_tokenAddress) emitted when the token address
     *        is successfully updated, capturing the new token address.
     */
    function changeTokenAddress(address _tokenAddress) external;

    /**
     * @notice Pauses the service, preventing any payments or withdrawals.
     */
    function pauseService() external;

    /**
     * @notice Unpauses the service, allowing payments and withdrawals.
     */
    function unpauseService() external;

    /*===================== VIEW FUNCTIONS ======================*/

    /**
     * @notice Retrieves the current service fee percentage.
     * This function returns the percentage of service fees applied to payments.
     *
     * @return The current service fee percentage as a uint256 value.
     */
    function getServiceFee() external view returns (uint256);

    /**
     * @notice Retrieves the current balance of the Levea wallet.
     * This function checks the token balance held by the Levea wallet.
     *
     * @return The balance of the Levea wallet in tokens as a uint256 value.
     */
    function getLeveaWallet() external view returns (address);

    /**
     * @notice Retrieves the balance of the caller (producer).
     * This function returns the current balance of the producer calling the function.
     *
     * @return The balance of the calling producer in tokens as a uint256 value.
     */
    function getLeveaWalletBalance() external view returns (uint256);

    /**
     * @notice Retrieves the producer's balance of the caller.
     * @return The balance of the caller (producer) in tokens.
     */
    function getProducerBalance() external view returns (uint256);

    /**
     * @notice Retrieves the balance of a specified producer.
     * This overloaded function allows the owner to check the balance of any producer.
     *
     * @param _producer The address of the producer whose balance is being queried.
     * @return The balance of the specified producer in tokens as a uint256 value.
     */
    function getProducerBalance(address _producer) external view returns (uint256);

    /**
     * @notice Retrieves the minimum amount required for withdrawal.
     * This function provides the minimum withdrawal amount set for producers.
     *
     * @return The minimum withdrawal amount as a uint256 value.
     */
    function getMinimumWithdrawAmount() external view returns (uint256);

    /**
     * @notice Checks if a specified producer exists.
     * This function verifies whether the specified producer has a balance greater than zero.
     *
     * @param _producer The address of the producer to check.
     * @return True if the producer exists (has a balance), otherwise false.
     */
    function producerExist(address _producer) external view returns (bool);

    /**
     * @notice Retrieves the current unit price for data.
     * This function returns the price per unit for services rendered.
     *
     * @return The current unit price as a uint256 value.
     */
    function getUnitPrice() external view returns (uint256);

    /**
     * @notice Retrieves the address of the payment token.
     * This function returns the address of the ERC20 token used for payments.
     *
     * @return The address of the payment token as an address type.
     */
    function getPaymentTokenAddress() external view returns (address);
}
