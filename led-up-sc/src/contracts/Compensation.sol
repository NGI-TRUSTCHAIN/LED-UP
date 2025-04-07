// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ICompensation} from "src/interfaces/ICompensation.sol";
import {DidAuth} from "./DidAuth.sol";

/**
 * @title Compensation
 * @dev This contract manages the compensation payments to producers for the services rendered,
 *      as well as service fees associated with these transactions.
 * @notice The Compensation contract provides functionalities for processing payments,
 *         withdrawing balances, adjusting service fees, and administrative actions.
 *         It inherits from OpenZeppelin's Ownable and Pausable contracts for enhanced security and control.
 *         It integrates with DidAuth for DID-based authentication and authorization.
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
    error Compensation__InvalidProducerDID();
    error Compensation__InvalidConsumerDID();
    error Compensation__InvalidRole();
    error Compensation__InvalidProducer();
    error Compensation__InvalidConsumer();

    /*===================== LIBRARIES ======================*/
    using SafeERC20 for IERC20;

    /*===================== STRUCTS ======================*/
    struct Payment {
        uint256 amount;
        bool isPayed;
    }

    /*===================== VARIABLES ======================*/
    IERC20 public token;
    uint256 internal serviceFeePercent;
    uint256 internal minimumWithdrawAmount = 10e18; // 10 Tokens
    uint256 internal unitPrice = 1e18; // 1 Token
    uint256 public serviceFeeBalance = 0;
    mapping(address => uint256) internal producerBalances;
    mapping(string => Payment) public payments;

    // DID Authentication
    DidAuth public didAuth;

    // // Add DID mapping for producers and consumers
    // mapping(address => string) internal producerDids;
    // mapping(address => string) internal consumerDids;

    /*===================== EVENTS ======================*/
    event ProducerRemoved(address indexed producer, uint256 timestamp);
    event ProducerPaid(address indexed producer, uint256 indexed amount, uint256 indexed timestamp);
    event ServiceFeeWithdrawn(address indexed wallet, uint256 indexed amount, uint256 indexed timestamp);
    event ServiceFeeChanged(address indexed initiator, uint256 oldServiceFee, uint256 indexed newServiceFee);
    event PaymentProcessed(
        address indexed _producer, address indexed _consumer, uint256 indexed amount, uint256 serviceFee
    );
    event UnitPriceChanged(address initiator, uint256 oldUnitPrice, uint256 newUnitPrice);

    /**
     * @dev Initializes the Compensation contract.
     * @param _provider The address of the provider who owns the contract.
     * @param _tokenAddress The address of the ERC20 token used for compensation.
     * @param _serviceFeePercent The percentage of the service fee applied to transactions.
     * @param _unitPrice The unit price for the services provided by the contract.
     * @param _didAuthAddress The address of the DidAuth contract for authentication.
     */
    constructor(
        address _provider,
        address _tokenAddress,
        uint256 _serviceFeePercent,
        uint256 _unitPrice,
        address _didAuthAddress
    ) Ownable(_provider) {
        token = IERC20(_tokenAddress);
        serviceFeePercent = _serviceFeePercent;
        unitPrice = _unitPrice;
        didAuth = DidAuth(_didAuthAddress);
    }

    /**
     * @inheritdoc ICompensation
     */
    function processPayment(address _producer, string memory _recordId, uint256 dataSize, string memory consumerDid)
        public
    {
        if (_producer == address(0)) {
            revert Compensation__InvalidAddress();
        }

        // Verify producer has PRODUCER_ROLE
        string memory producerDid = didAuth.getDidFromAddress(_producer);

        if (bytes(producerDid).length == 0 || !didAuth.authenticate(producerDid, didAuth.PRODUCER_ROLE())) {
            revert Compensation__InvalidProducer();
        }

        // Verify consumer has CONSUMER_ROLE
        if (!didAuth.authenticate(consumerDid, didAuth.CONSUMER_ROLE())) {
            revert Compensation__InvalidConsumer();
        }

        uint256 amount = dataSize * unitPrice;

        if (!token.transferFrom(msg.sender, address(this), amount)) {
            revert Compensation__TokenTransferFailed();
        }
        token.safeTransferFrom(msg.sender, address(this), amount);

        // Calculate service fee using basis points (10000 = 100%)
        uint256 fee = (amount * serviceFeePercent * 100) / 10000;
        serviceFeeBalance += fee;

        amount = amount - fee;

        producerBalances[_producer] += amount;

        payments[_recordId] = Payment({amount: amount, isPayed: true});

        emit PaymentProcessed(_producer, msg.sender, amount, fee);
    }

    /**
     * @inheritdoc ICompensation
     */
    function verifyPayment(string memory _recordId) public view returns (bool) {
        return payments[_recordId].isPayed;
    }

    /**
     * @inheritdoc ICompensation
     */
    function withdrawProducerBalance(uint256 _amount) public whenNotPaused {
        // Verify producer has a registered DID with PRODUCER_ROLE
        string memory producerDid = didAuth.getDidFromAddress(msg.sender);

        if (bytes(producerDid).length == 0 || !didAuth.authenticate(producerDid, didAuth.PRODUCER_ROLE())) {
            revert Compensation__InvalidProducer();
        }

        if (_amount < minimumWithdrawAmount) {
            revert Compensation__MinimumWithdrawAmount();
        }

        uint256 producerBalance = producerBalances[msg.sender];

        if (producerBalance < minimumWithdrawAmount) {
            revert Compensation__NoBalanceToWithdraw();
        }

        if (producerBalance < _amount) {
            revert Compensation__InsufficientBalance();
        }

        producerBalances[msg.sender] -= _amount;

        if (!token.transfer(msg.sender, _amount)) {
            revert Compensation__TokenTransferFailed();
        }

        emit ProducerPaid(msg.sender, _amount, block.timestamp);
    }

    /**
     * @inheritdoc ICompensation
     */
    function withdrawServiceFee(uint256 _amount) public override onlyOwner whenNotPaused {
        if (_amount > serviceFeeBalance) {
            revert Compensation__NoBalanceToWithdraw();
        }

        serviceFeeBalance -= _amount;

        if (!token.transfer(address(this), _amount)) {
            revert Compensation__TokenTransferFailed();
        }

        emit ServiceFeeWithdrawn(address(this), _amount, block.timestamp);
    }

    /**
     * @inheritdoc ICompensation
     */
    function removeProducer(address _producer) public override onlyOwner whenNotPaused {
        if (producerBalances[_producer] > 0) {
            token.transfer(_producer, producerBalances[_producer]);
        }

        delete producerBalances[_producer];
        emit ProducerRemoved(_producer, block.timestamp);
    }

    /**
     * @inheritdoc ICompensation
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
     * @inheritdoc ICompensation
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
     * @inheritdoc ICompensation
     */
    function setMinimumWithdrawAmount(uint256 _amount) public override onlyOwner {
        minimumWithdrawAmount = _amount;
    }

    /**
     * @inheritdoc ICompensation
     */
    function changeTokenAddress(address _tokenAddress) public onlyOwner {
        if (_tokenAddress == address(0)) {
            revert Compensation__InvalidInputParam();
        }

        token = IERC20(_tokenAddress);
    }

    /**
     * @inheritdoc ICompensation
     */
    function pauseService() public override onlyOwner whenNotPaused {
        _pause();
    }

    /**
     * @inheritdoc ICompensation
     */
    function unpauseService() public override onlyOwner whenPaused {
        _unpause();
    }

    /*===================== VIEW FUNCTIONS ======================*/

    /**
     * @inheritdoc ICompensation
     */
    function getServiceFee() public view override returns (uint256) {
        return serviceFeePercent;
    }

    /**
     * @inheritdoc ICompensation
     */
    function getProviderBalance() public view override returns (uint256) {
        return token.balanceOf(address(this));
    }

    /**
     * @inheritdoc ICompensation
     */
    function getProducerBalance() public view override returns (uint256) {
        return producerBalances[msg.sender];
    }

    /**
     * @inheritdoc ICompensation
     */
    function getProducerBalance(address _producer) public view override onlyOwner returns (uint256) {
        return producerBalances[_producer];
    }

    /**
     * @inheritdoc ICompensation
     */
    function getMinimumWithdrawAmount() public view override returns (uint256) {
        return minimumWithdrawAmount;
    }

    /**
     * @dev Checks if a producer exists in the system.
     * @param _producer The address of the producer to check.
     * @return bool True if the producer exists, false otherwise.
     */
    function producerExist(address _producer) public view returns (bool) {
        return producerBalances[_producer] > 0;
    }

    /**
     * @inheritdoc ICompensation
     */
    function getUnitPrice() public view override returns (uint256) {
        return unitPrice;
    }

    /**
     * @dev Gets the address of the payment token.
     * @return The address of the payment token.
     */
    function getPaymentTokenAddress() public view returns (address) {
        return address(token);
    }

    /**
     * @dev Gets the DID of a producer.
     * @param _producer The address of the producer.
     * @return The DID of the producer.
     */
    function getProducerDid(address _producer) public view returns (string memory) {
        return didAuth.getDidFromAddress(_producer);
    }

    /**
     * @dev Gets the DID of a consumer.
     * @param _consumer The address of the consumer.
     * @return The DID of the consumer.
     */
    function getConsumerDid(address _consumer) public view returns (string memory) {
        return didAuth.getDidFromAddress(_consumer);
    }

    /**
     * @dev Updates the DidAuth contract address.
     * @param _didAuthAddress The new DidAuth contract address.
     */
    function updateDidAuthAddress(address _didAuthAddress) public onlyOwner {
        if (_didAuthAddress == address(0)) {
            revert Compensation__InvalidAddress();
        }

        didAuth = DidAuth(_didAuthAddress);
    }
}
