// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ICompensation} from "../interface/ICompensation.sol";

// import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

contract Compensation is ICompensation, Ownable, Pausable {
    /******************** ERRORS *****************/
    error Compensation__ProducerAlreadyExists();
    error Compensation__InsufficientBalance();
    error Compensation__NoBalanceToWithdraw();
    error Compensation__TokenTransferFailed();
    error Compensation__OnlyOwnerCanWithdraw();
    error Compensation__LowDepositAmount();
    error Compensation__MinimumWithdrawAmount();
    error Compensation__InvalidAddress();
    error Compensation__InvalidInputParam();

    /******************** LIBRARIES *****************/
    // using Math for uint256;

    /******************** VARIABLES *****************/
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

    /******************** EVENTS *****************/
    event ProducerRemoved(
        address indexed producer,
        // uint256 indexed payedAmount,
        uint256 timestamp
    );
    event ProducerPaid(
        address indexed producer,
        //address indexed from,
        uint256 indexed amount,
        // uint256 dataSize,
        uint256 indexed timestamp
    );
    event ServiceFeeWithdrawn(
        // address indexed initiator,
        address indexed wallet,
        uint256 indexed amount,
        uint256 indexed timestamp
    );
    event ServiceFeeChanged(
        address indexed initiator,
        uint256 oldServiceFee,
        uint256 indexed newServiceFee
    );

    event PaymentProcessed(
        // address indexed _consumer,
        address indexed _producer,
        address indexed _consumer,
        uint256 indexed amount,
        uint256 serviceFee
        //uint256 timestamp
    );

    event UnitPriceChanged(
        address initiator,
        uint256 oldUnitPrice,
        uint256 newUnitPrice
    );

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

    function processPayment(
        address _producer,
        string memory _recordId,
        uint256 dataSize
    ) public {
        if (_producer == address(0)) {
            revert Compensation__InvalidAddress();
        }

        uint256 amount = dataSize * unitPrice;

        require(
            token.transferFrom(msg.sender, address(this), amount),
            "Token transfer failed"
        );

        uint256 fee = (amount * serviceFeePercent) / 100; // Adjust for 2 decimal places in percentage
        serviceFeeBalance += fee;

        amount = amount - fee;

        producerBalances[_producer] += amount;

        payments[_recordId] = Payment({amount: amount, isPayed: true});

        emit PaymentProcessed(_producer, msg.sender, amount, fee);
    }

    function verifyPayment(string memory _recordId) public view returns (bool) {
        return payments[_recordId].isPayed;
    }

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

    function withdrawServiceFee(
        uint256 _amount
    ) public override onlyOwner whenNotPaused {
        if (_amount > serviceFeeBalance) {
            revert Compensation__NoBalanceToWithdraw();
        }

        serviceFeeBalance -= _amount;

        if (!token.transfer(leveaWallet, _amount)) {
            revert Compensation__TokenTransferFailed();
        }

        emit ServiceFeeWithdrawn(leveaWallet, _amount, block.timestamp);
    }

    function removeProducer(
        address _producer
    ) public override onlyOwner whenNotPaused {
        delete producerBalances[_producer];
        emit ProducerRemoved(_producer, block.timestamp);
    }

    function changeServiceFee(
        uint256 _newServiceFee
    ) public override onlyOwner {
        if (_newServiceFee == 0) {
            revert Compensation__InvalidInputParam();
        }
        uint256 oldServiceFee = serviceFeePercent;
        serviceFeePercent = _newServiceFee;

        emit ServiceFeeChanged(msg.sender, oldServiceFee, _newServiceFee);
    }

    function changeUnitPrice(uint256 _newUnitPrice) public override onlyOwner {
        if (_newUnitPrice == 0) {
            revert Compensation__InvalidInputParam();
        }

        uint256 oldUnitPrice = unitPrice;
        unitPrice = _newUnitPrice;

        emit UnitPriceChanged(msg.sender, oldUnitPrice, _newUnitPrice);
    }

    function setMinimumWithdrawAmount(
        uint256 _amount
    ) public override onlyOwner {
        minimumWithdrawAmount = _amount;
    }

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

    /******************** Getters *****************/
    function getServiceFee() public view override returns (uint256) {
        return serviceFeePercent;
    }

    function getLeveaWallet() public view override returns (address) {
        return leveaWallet;
    }

    function getLeveaWalletBalance() public view override returns (uint256) {
        return token.balanceOf(leveaWallet);
    }

    function getProducerBalance() public view override returns (uint256) {
        return producerBalances[msg.sender];
    }

    // Overloading
    function getProducerBalance(
        address _producer
    ) public view override onlyOwner returns (uint256) {
        return producerBalances[_producer];
    }

    function getMinimumWithdrawAmount() public view override returns (uint256) {
        return minimumWithdrawAmount;
    }

    function producerExist(address _producer) public view returns (bool) {
        return producerBalances[_producer] > 0;
    }

    function getUnitPrice() public view override returns (uint256) {
        return unitPrice;
    }

    function getPaymentTokenAddress() public view returns (address) {
        return address(token);
    }
}
