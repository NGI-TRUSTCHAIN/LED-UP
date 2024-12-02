// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ICompensation} from "../interface/ICompensation.sol";

// import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title Compensation
 * @dev This contract manages the compensation payments to producers for the services rendered,
 *      as well as service fees associated with these transactions.
 * @notice The Compensation contract provides functionalities for processing payments,
 *         withdrawing balances, adjusting service fees, and administrative actions.
 *         It inherits from OpenZeppelin's Ownable and Pausable contracts for enhanced security and control.
 */
contract Compensation is ICompensation, Ownable, Pausable {
    /*===================== ERRORS ======================*/
    error Compensation__ProducerAlreadyExists();
    error Compensation__InsufficientBalance();
    error Compensation__NoBalanceToWithdraw();
    error Compensation__TokenTransferFailed();
    error Compensation__OnlyOwnerCanWithdraw();
    error Compensation__LowDepositAmount();
    error Compensation__MinimumWithdrawAmount();
    error Compensation__InvalidAddress();
    error Compensation__InvalidInputParam();

    /*===================== VARIABLES ======================*/
    struct Payment {
        uint256 amount;
        bool isPayed;
    }

    IERC20 public token;
    address payable private leveaWallet;
    uint256 private serviceFeePercent;
    uint256 private minimumWithdrawAmount = 10e18; // 10 Tokens
    uint256 private unitPrice = 1e18; // 1 Token
    uint256 public serviceFeeBalance = 0;

    mapping(address => uint256) private producerBalances;
    mapping(string => Payment) public payments; // bytes32 is --> recordId

    /*===================== EVENTS ======================*/
    event ProducerRemoved(address indexed producer, uint256 timestamp);
    event ProducerPaid(address indexed producer, uint256 indexed amount, uint256 indexed timestamp);
    // address indexed initiator,
    event ServiceFeeWithdrawn(address indexed wallet, uint256 indexed amount, uint256 indexed timestamp);
    event ServiceFeeChanged(address indexed initiator, uint256 oldServiceFee, uint256 indexed newServiceFee);

    // address indexed _consumer,
    event PaymentProcessed(
        address indexed _producer, address indexed _consumer, uint256 indexed amount, uint256 serviceFee
    );
    //uint256 timestamp

    event UnitPriceChanged(address initiator, uint256 oldUnitPrice, uint256 newUnitPrice);

    /**
     * @dev Initializes the Compensation contract.
     * @param _provider The address of the provider who owns the contract.
     * @param _tokenAddress The address of the ERC20 token used for compensation.
     * @param _leveaWallet The address of the wallet that will receive service fees.
     * @param _serviceFeePercent The percentage of the service fee applied to transactions.
     * @param _unitPrice The unit price for the services provided by the contract.
     */
    constructor(
        address _provider,
        address _tokenAddress,
        address payable _leveaWallet,
        uint256 _serviceFeePercent,
        uint256 _unitPrice
    ) Ownable(_provider) {
        token = IERC20(_tokenAddress);
        leveaWallet = _leveaWallet;
        serviceFeePercent = _serviceFeePercent;
        unitPrice = _unitPrice;
    }

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
     *
     * @dev The service fee is calculated as a percentage of the total payment amount, and
     *      the remaining balance after deducting the fee is credited to the producer's balance.
     *      The payment status is recorded for the specified record ID, ensuring transparency
     *      in payment transactions.
     */
    function processPayment(address _producer, string memory _recordId, uint256 dataSize) public {
        if (_producer == address(0)) {
            revert Compensation__InvalidAddress();
        }

        uint256 amount = dataSize * unitPrice;

        require(token.transferFrom(msg.sender, address(this), amount), "Token transfer failed");

        uint256 fee = (amount * serviceFeePercent) / 100; // Adjust for 2 decimal places in percentage
        serviceFeeBalance += fee;

        amount = amount - fee;

        producerBalances[_producer] += amount;

        payments[_recordId] = Payment({amount: amount, isPayed: true});

        emit PaymentProcessed(_producer, msg.sender, amount, fee);
    }

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
    function verifyPayment(string memory _recordId) public view returns (bool) {
        return payments[_recordId].isPayed;
    }

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
    function withdrawProducerBalance(uint256 _amount) public whenNotPaused {
        if (_amount < minimumWithdrawAmount) {
            revert Compensation__MinimumWithdrawAmount();
        }

        uint256 producerBalance = producerBalances[msg.sender];

        if (producerBalance < minimumWithdrawAmount) {
            revert Compensation__NoBalanceToWithdraw();
        }

        producerBalances[msg.sender] -= _amount;

        if (!token.transfer(msg.sender, _amount)) {
            revert Compensation__TokenTransferFailed();
        }

        emit ProducerPaid(msg.sender, _amount, block.timestamp);
    }

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
    function withdrawServiceFee(uint256 _amount) public override onlyOwner whenNotPaused {
        if (_amount > serviceFeeBalance) {
            revert Compensation__NoBalanceToWithdraw();
        }

        serviceFeeBalance -= _amount;

        if (!token.transfer(leveaWallet, _amount)) {
            revert Compensation__TokenTransferFailed();
        }

        emit ServiceFeeWithdrawn(leveaWallet, _amount, block.timestamp);
    }

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
    function removeProducer(address _producer) public override onlyOwner whenNotPaused {
        delete producerBalances[_producer];
        emit ProducerRemoved(_producer, block.timestamp);
    }

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
    function changeServiceFee(uint256 _newServiceFee) public override onlyOwner {
        if (_newServiceFee == 0) {
            revert Compensation__InvalidInputParam();
        }
        uint256 oldServiceFee = serviceFeePercent;
        serviceFeePercent = _newServiceFee;

        emit ServiceFeeChanged(msg.sender, oldServiceFee, _newServiceFee);
    }
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

    function changeUnitPrice(uint256 _newUnitPrice) public override onlyOwner {
        if (_newUnitPrice == 0) {
            revert Compensation__InvalidInputParam();
        }

        uint256 oldUnitPrice = unitPrice;
        unitPrice = _newUnitPrice;

        emit UnitPriceChanged(msg.sender, oldUnitPrice, _newUnitPrice);
    }

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
    function setMinimumWithdrawAmount(uint256 _amount) public override onlyOwner {
        minimumWithdrawAmount = _amount;
    }

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
    function changeTokenAddress(address _tokenAddress) public onlyOwner {
        if (_tokenAddress == address(0)) {
            revert Compensation__InvalidInputParam();
        }

        token = IERC20(_tokenAddress);
    }

    function pauseService() public override onlyOwner whenNotPaused {
        _pause();
    }

    function unpauseService() public override onlyOwner whenPaused {
        _unpause();
    }

    /*===================== VIEW FUNCTIONS ======================*/
    /**
     * @notice Retrieves the current service fee percentage.
     * This function returns the percentage of service fees applied to payments.
     *
     * @return The current service fee percentage as a uint256 value.
     */
    function getServiceFee() public view override returns (uint256) {
        return serviceFeePercent;
    }
    /**
     * @notice Retrieves the address of the Levea wallet.
     * This function provides the address where service fees are collected.
     *
     * @return The address of the Levea wallet.
     */

    function getLeveaWallet() public view override returns (address) {
        return leveaWallet;
    }

    /**
     * @notice Retrieves the current balance of the Levea wallet.
     * This function checks the token balance held by the Levea wallet.
     *
     * @return The balance of the Levea wallet in tokens as a uint256 value.
     */
    function getLeveaWalletBalance() public view override returns (uint256) {
        return token.balanceOf(leveaWallet);
    }

    /**
     * @notice Retrieves the balance of the caller (producer).
     * This function returns the current balance of the producer calling the function.
     *
     * @return The balance of the calling producer in tokens as a uint256 value.
     */
    function getProducerBalance() public view override returns (uint256) {
        return producerBalances[msg.sender];
    }

    /**
     * @notice Retrieves the balance of a specified producer.
     * This overloaded function allows the owner to check the balance of any producer.
     *
     * @param _producer The address of the producer whose balance is being queried.
     * @return The balance of the specified producer in tokens as a uint256 value.
     */
    function getProducerBalance(address _producer) public view override onlyOwner returns (uint256) {
        return producerBalances[_producer];
    }

    /**
     * @notice Retrieves the minimum amount required for withdrawal.
     * This function provides the minimum withdrawal amount set for producers.
     *
     * @return The minimum withdrawal amount as a uint256 value.
     */
    function getMinimumWithdrawAmount() public view override returns (uint256) {
        return minimumWithdrawAmount;
    }

    /**
     * @notice Checks if a specified producer exists.
     * This function verifies whether the specified producer has a balance greater than zero.
     *
     * @param _producer The address of the producer to check.
     * @return True if the producer exists (has a balance), otherwise false.
     */
    function producerExist(address _producer) public view returns (bool) {
        return producerBalances[_producer] > 0;
    }

    /**
     * @notice Retrieves the current unit price for data.
     * This function returns the price per unit for services rendered.
     *
     * @return The current unit price as a uint256 value.
     */
    function getUnitPrice() public view override returns (uint256) {
        return unitPrice;
    }

    /**
     * @notice Retrieves the address of the payment token.
     * This function returns the address of the ERC20 token used for payments.
     *
     * @return The address of the payment token as an address type.
     */
    function getPaymentTokenAddress() public view returns (address) {
        return address(token);
    }
}
