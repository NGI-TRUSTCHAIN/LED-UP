// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {Compensation} from "src/contracts/Compensation.sol";
import {ICompensation} from "src/interfaces/ICompensation.sol";
import {DidAuth} from "src/contracts/DidAuth.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Mock is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}

// Mock DidAuth contract for testing
contract DidAuthMock {
    mapping(string => bool) private validProducers;
    mapping(string => bool) private validConsumers;

    bytes32 public constant PRODUCER_ROLE = keccak256("PRODUCER");
    bytes32 public constant CONSUMER_ROLE = keccak256("CONSUMER");
    bytes32 public constant SERVICE_PROVIDER_ROLE = keccak256("SERVICE_PROVIDER");

    function authenticate(string memory did, bytes32 role) public view returns (bool) {
        if (role == PRODUCER_ROLE) {
            return validProducers[did];
        } else if (role == CONSUMER_ROLE) {
            return validConsumers[did];
        }
        return false;
    }

    // For testing purposes
    function setValidProducer(string memory did, bool isValid) public {
        validProducers[did] = isValid;
    }

    function setValidConsumer(string memory did, bool isValid) public {
        validConsumers[did] = isValid;
    }
}

contract CompensationTest is Test {
    Compensation public compensation;
    DidAuthMock public didAuthMock;

    address PROVIDER = makeAddr("provider");
    address LEVEA_WALLET = makeAddr("leveaWallet");
    address PRODUCER1 = makeAddr("producer1");
    address PRODUCER2 = makeAddr("producer2");
    address CONSUMER1 = makeAddr("consumer1");
    address CONSUMER2 = makeAddr("consumer2");
    address TOKEN = makeAddr("token");

    ERC20Mock token;

    // DIDs for testing
    string constant PRODUCER1_DID = "did:example:producer1";
    string constant PRODUCER2_DID = "did:example:producer2";
    string constant CONSUMER1_DID = "did:example:consumer1";
    string constant CONSUMER2_DID = "did:example:consumer2";

    function setUp() public {
        vm.startPrank(PROVIDER);

        // Create token
        token = new ERC20Mock("Test Token", "TTK");

        // Create DidAuth mock
        didAuthMock = new DidAuthMock();

        // Set valid DIDs
        didAuthMock.setValidProducer(PRODUCER1_DID, true);
        didAuthMock.setValidProducer(PRODUCER2_DID, true);
        didAuthMock.setValidConsumer(CONSUMER1_DID, true);
        didAuthMock.setValidConsumer(CONSUMER2_DID, true);

        // Create compensation contract
        compensation = new Compensation(
            PROVIDER, //admin
            address(token),
            payable(LEVEA_WALLET), // an address where the compensation service fee will be paid
            10, // service fee percent
            1e18, // unit price
            address(didAuthMock) // DidAuth address
        );

        // Register producers and consumers
        compensation.registerProducer(PRODUCER1, PRODUCER1_DID);
        compensation.registerProducer(PRODUCER2, PRODUCER2_DID);
        compensation.registerConsumer(CONSUMER1, CONSUMER1_DID);
        compensation.registerConsumer(CONSUMER2, CONSUMER2_DID);

        // Mint tokens to consumers
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

    function testDidAuthIsSet() public view {
        assert(address(compensation.didAuth()) == address(didAuthMock));
    }

    function testProducerDidRegistration() public view {
        assert(keccak256(bytes(compensation.getProducerDid(PRODUCER1))) == keccak256(bytes(PRODUCER1_DID)));
        assert(keccak256(bytes(compensation.getProducerDid(PRODUCER2))) == keccak256(bytes(PRODUCER2_DID)));
    }

    function testConsumerDidRegistration() public view {
        assert(keccak256(bytes(compensation.getConsumerDid(CONSUMER1))) == keccak256(bytes(CONSUMER1_DID)));
        assert(keccak256(bytes(compensation.getConsumerDid(CONSUMER2))) == keccak256(bytes(CONSUMER2_DID)));
    }

    function testTokenAddressCannotBeChangedByNonOwner() public {
        vm.expectRevert();
        compensation.changeTokenAddress(TOKEN);
    }

    function testTokenAddressCannotBeChangedForAddressZero() public {
        vm.prank(PROVIDER);
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
        vm.prank(PRODUCER1);
        vm.expectRevert();
        compensation.withdrawProducerBalance(1e18);
    }

    function testProcessPaymentWithValidDids() public {
        vm.startPrank(CONSUMER1);
        token.approve(address(compensation), 100e18);
        compensation.processPayment(PRODUCER1, "1", 100, CONSUMER1_DID);
        vm.stopPrank();

        // Check producer balance
        vm.prank(PROVIDER);
        uint256 producerBalance = compensation.getProducerBalance(PRODUCER1);
        assertEq(producerBalance, 90e18, "Producer should have 90 tokens after 10% service fee");

        // Check payment verification
        bool isPaid = compensation.verifyPayment("1");
        assertTrue(isPaid, "Payment should be verified");
    }

    function testProcessPaymentWithInvalidConsumerDid() public {
        vm.startPrank(CONSUMER1);
        token.approve(address(compensation), 100e18);

        // Set consumer DID to invalid
        vm.stopPrank();
        vm.prank(PROVIDER);
        didAuthMock.setValidConsumer(CONSUMER1_DID, false);

        // Try to process payment
        vm.prank(CONSUMER1);
        vm.expectRevert(ICompensation.Compensation__InvalidConsumer.selector);
        compensation.processPayment(PRODUCER1, "1", 100, CONSUMER1_DID);
    }

    function testProcessPaymentWithInvalidProducerDid() public {
        vm.startPrank(CONSUMER1);
        token.approve(address(compensation), 100e18);

        // Set producer DID to invalid
        vm.stopPrank();
        vm.prank(PROVIDER);
        didAuthMock.setValidProducer(PRODUCER1_DID, false);

        // Try to process payment
        vm.prank(CONSUMER1);
        vm.expectRevert(ICompensation.Compensation__InvalidProducer.selector);
        compensation.processPayment(PRODUCER1, "1", 100, CONSUMER1_DID);
    }

    function testWithdrawProducerBalance() public {
        // Process payment first
        vm.startPrank(CONSUMER1);
        token.approve(address(compensation), 100e18);
        compensation.processPayment(PRODUCER1, "1", 100, CONSUMER1_DID);
        vm.stopPrank();

        // Withdraw producer balance
        vm.startPrank(PRODUCER1);
        compensation.withdrawProducerBalance(80e18);
        uint256 producerBalance = token.balanceOf(PRODUCER1);
        uint256 expectedProducerBalance = 80e18;
        assertEq(producerBalance, expectedProducerBalance, "Producer should have withdrawn 80 tokens");

        uint256 afterWithdrawBalance = compensation.getProducerBalance();
        assertEq(afterWithdrawBalance, 10e18, "Producer should have 10 tokens left in contract");
        vm.stopPrank();
    }

    function testRemoveProducer() public {
        // Process payment first
        vm.startPrank(CONSUMER1);
        token.approve(address(compensation), 100e18);
        compensation.processPayment(PRODUCER1, "1", 100, CONSUMER1_DID);
        vm.stopPrank();

        // Remove producer
        vm.startPrank(PROVIDER);
        compensation.removeProducer(PRODUCER1);
        bool exists = compensation.producerExist(PRODUCER1);
        assertTrue(!exists, "Producer should be removed");
        vm.stopPrank();
    }

    function testPaymentCannotBeProcessedForAddressZero() public {
        vm.startPrank(CONSUMER1);
        token.approve(address(compensation), 100e18);
        vm.expectRevert();
        compensation.processPayment(address(0), "1", 10, CONSUMER1_DID);
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

    function testWithdrawServiceFee() public {
        // Process payment first
        vm.startPrank(CONSUMER1);
        token.approve(address(compensation), 100e18);
        compensation.processPayment(PRODUCER1, "1", 100, CONSUMER1_DID);
        vm.stopPrank();

        // Withdraw service fee
        vm.startPrank(PROVIDER);
        compensation.withdrawServiceFee(10e18);
        uint256 leveaBalance = token.balanceOf(LEVEA_WALLET);
        uint256 expectedLeveaBalance = 10e18; // 10 tokens as service fee
        assertEq(leveaBalance, expectedLeveaBalance, "Levea wallet should have 10 tokens");
        vm.stopPrank();
    }

    function testOnlyOwnerCanSetMinimumWithdrawAmount() public {
        vm.expectRevert();
        compensation.setMinimumWithdrawAmount(5e18);
    }

    function testSetMinimumWithdrawAmount() public {
        vm.startPrank(PROVIDER);
        compensation.setMinimumWithdrawAmount(5e18);
        vm.stopPrank();
        assert(compensation.getMinimumWithdrawAmount() == 5e18);
    }

    function testUpdateDidAuthAddress() public {
        // Create new DidAuth mock
        DidAuthMock newDidAuthMock = new DidAuthMock();

        // Update DidAuth address
        vm.prank(PROVIDER);
        compensation.updateDidAuthAddress(address(newDidAuthMock));

        // Check if address was updated
        assertEq(address(compensation.didAuth()), address(newDidAuthMock), "DidAuth address should be updated");
    }

    function testCannotUpdateDidAuthAddressToZero() public {
        vm.prank(PROVIDER);
        vm.expectRevert(ICompensation.Compensation__InvalidAddress.selector);
        compensation.updateDidAuthAddress(address(0));
    }

    function testRegisterProducerWithInvalidDid() public {
        // Create new producer address
        address newProducer = makeAddr("newProducer");
        string memory invalidDid = "did:example:invalid";

        // Try to register with invalid DID
        vm.prank(PROVIDER);
        vm.expectRevert(ICompensation.Compensation__InvalidProducerDID.selector);
        compensation.registerProducer(newProducer, invalidDid);
    }

    function testRegisterConsumerWithInvalidDid() public {
        // Create new consumer address
        address newConsumer = makeAddr("newConsumer");
        string memory invalidDid = "did:example:invalid";

        // Try to register with invalid DID
        vm.prank(PROVIDER);
        vm.expectRevert(ICompensation.Compensation__InvalidConsumerDID.selector);
        compensation.registerConsumer(newConsumer, invalidDid);
    }
}
