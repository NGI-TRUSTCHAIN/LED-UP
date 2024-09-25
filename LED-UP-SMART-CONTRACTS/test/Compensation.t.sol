// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/contracts/Compensation.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Mock is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}

contract CompensationTest is Test {
    Compensation public compensation;
    address PROVIDER = makeAddr("provider");
    address LEVEA_WALLET = makeAddr("leveaWallet");
    address PRODUCER1 = makeAddr("producer1");
    address PRODUCER2 = makeAddr("producer2");
    address CONSUMER1 = makeAddr("consumer1");
    address CONSUMER2 = makeAddr("consumer2");
    address TOKEN = makeAddr("token");
    ERC20Mock token;

    function setUp() public {
        vm.startPrank(PROVIDER);
        token = new ERC20Mock("Test Token", "TTK");
        compensation = new Compensation(
            PROVIDER, //admin
            address(token),
            payable(LEVEA_WALLET), // an address where the compensation service fee will be paid
            10,
            1e18
        );
        token.mint(CONSUMER1, 1000e18);
        token.mint(CONSUMER2, 1000e18);
        vm.stopPrank();
    }

    function testOwnerIsSet() public view {
        assert(compensation.owner() == PROVIDER);
    }

    function testTokenAddressIsSet() public view {
        assert(address(compensation.token()) == address(token));
    }

    function testLeveaWalletIsSet() public view {
        assert(compensation.getLeveaWallet() == LEVEA_WALLET);
    }

    function testServiceFeeIsSet() public view {
        assert(compensation.getServiceFee() == 10);
    }

    function testTokenAddressCannotBeChangedByNonOwner() public {
        vm.expectRevert();
        compensation.changeTokenAddress(TOKEN);
    }

    function testTokenAddressCannotBeChangedForAddressZero() public {
        vm.expectRevert();
        compensation.changeTokenAddress(address(0));
    }

    function testChangeTokenAddress() public {
        vm.startPrank(PROVIDER);
        ERC20Mock newToken = new ERC20Mock("Test Token", "TTK");
        compensation.changeTokenAddress(address(newToken));
        vm.stopPrank();
        assert(address(compensation.token()) == address(newToken));
    }

    function testConsumerBalance() public view {
        assert(token.balanceOf(CONSUMER1) == 1000e18);
        assert(token.balanceOf(CONSUMER2) == 1000e18);
    }

    function testCannotUnpauseWhenNotPaused() public {
        vm.expectRevert();
        compensation.unpauseService();
    }

    function testGetTokenAddress() public view {
        assert(compensation.getPaymentTokenAddress() == address(token));
    }

    function testGetUnitPrice() public view {
        assert(compensation.getUnitPrice() == 1e18);
    }

    function testPauseService() public {
        vm.prank(PROVIDER);
        compensation.pauseService();

        bool paused = compensation.paused();
        assertTrue(paused, "Service should be paused");
    }

    function testUnpauseService() public {
        vm.startPrank(PROVIDER);
        compensation.pauseService();
        compensation.unpauseService();
        vm.stopPrank();

        bool paused = compensation.paused();
        assertTrue(!paused, "Service should be unpaused");
    }

    function testWithdrawProducerBalanceWithoutFunding() public {
        vm.expectRevert();
        compensation.withdrawProducerBalance(1e18);
    }

    // FIXME:
    function testWithdrawProducerBalance() public {
        vm.startPrank(CONSUMER1);
        token.approve(address(compensation), 100e18);
        compensation.processPayment(PRODUCER1, "1", 100);
        vm.stopPrank();

        vm.startPrank(PRODUCER1);
        compensation.withdrawProducerBalance(80e18);
        uint256 producerBalance = token.balanceOf(PRODUCER1);
        uint256 expectedProducerBalance = 80e18; // 90 tokens after 10% service fee
        assertEq(
            producerBalance,
            expectedProducerBalance,
            "Producer should have withdrawn 90 tokens"
        );

        uint256 afterWithdrawBalance = compensation.getProducerBalance();
        assertEq(afterWithdrawBalance, 10e18);
        vm.stopPrank();
    }

    function testRemoveProducer() public {
        vm.startPrank(CONSUMER1);
        token.approve(address(compensation), 100e18);
        compensation.processPayment(PRODUCER1, "1", 100);
        vm.stopPrank();

        vm.startPrank(PROVIDER);
        compensation.removeProducer(PRODUCER1);
        bool exists = compensation.producerExist(PRODUCER1);
        assertTrue(!exists, "Producer should be removed");
        vm.stopPrank();
    }

    function testPaymentCannotBeProcessedForAddressZero() public {
        vm.prank(PROVIDER);
        vm.expectRevert();
        compensation.processPayment(address(0), "1", 10);
        vm.stopPrank();
    }

    function testOnlyOwnerCanChangeServiceFeeAmount() public {
        vm.expectRevert();
        compensation.changeServiceFee(10);
    }

    function testChangeServiceFee() public {
        vm.startPrank(PROVIDER);
        compensation.changeServiceFee(5); // it was 10%
        vm.stopPrank();

        assert(compensation.getServiceFee() == 5);
    }

    function testOnlyOwnerCanWithdrawServiceFees() public {
        vm.expectRevert();
        compensation.withdrawServiceFee(1e18);
    }

    // FIXME:
    function testWithdrawServiceFee() public {
        vm.startPrank(CONSUMER1);
        token.approve(address(compensation), 100e18);
        compensation.processPayment(PRODUCER1, "1", 100);
        vm.stopPrank();

        vm.startPrank(PRODUCER1);
        compensation.withdrawProducerBalance(80e18);
        uint256 producerBalance = token.balanceOf(PRODUCER1);
        uint256 expectedProducerBalance = 80e18; // 90 tokens after 10% service fee
        assertEq(
            producerBalance,
            expectedProducerBalance,
            "Producer should have withdrawn 90 tokens"
        );
        uint256 afterWithdrawBalance = compensation.getProducerBalance();
        assertEq(afterWithdrawBalance, 10e18);
        vm.stopPrank();

        vm.startPrank(PROVIDER);
        compensation.withdrawServiceFee(5e18);
        uint256 leveaBalance = token.balanceOf(LEVEA_WALLET);
        uint256 expectedLeveaBalance = 5e18; // 10 tokens as service fee
        assertEq(
            leveaBalance,
            expectedLeveaBalance,
            "Levea wallet should have 10 tokens"
        );
        vm.stopPrank();
    }

    function testOnlyOwnerCanSetMinimumWithdrawAmount() public {
        vm.expectRevert();
        compensation.setMinimumWithdrawAmount(5e18);
    }

    function testsetMinimumWithdrawAmount() public {
        vm.startPrank(PROVIDER);
        compensation.setMinimumWithdrawAmount(5e18);
        vm.stopPrank();
        assert(compensation.getMinimumWithdrawAmount() == 5e18);
    }
}
