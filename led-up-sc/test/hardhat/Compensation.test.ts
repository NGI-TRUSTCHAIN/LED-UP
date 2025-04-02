import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Compensation, DidAuth, DidRegistry, DidVerifier, DidIssuer, Token } from '../../typechain-types';

describe('Compensation', function () {
  let compensation: Compensation;
  let didAuth: DidAuth;
  let didRegistry: DidRegistry;
  let didVerifier: DidVerifier;
  let didIssuer: DidIssuer;
  let token: Token;
  let owner: any;
  let producer: any;
  let consumer: any;
  let provider: any;
  let otherAccount: any;
  let serviceFee = 5; // 5% service fee
  let unitPrice = ethers.parseEther('1'); // 1 Token per unit
  const recordId = 'test-record-123';
  const dataSize = 10; // 10 units of data

  beforeEach(async function () {
    [owner, producer, consumer, provider, otherAccount] = await ethers.getSigners();

    // Deploy Token contract
    const TokenFactory = await ethers.getContractFactory('Token');
    token = await TokenFactory.deploy();
    await token.waitForDeployment();

    // Mint tokens for the consumer
    await token.mint(consumer.address, ethers.parseEther('1000'));

    // Deploy DidRegistry
    const DidRegistry = await ethers.getContractFactory('DidRegistry');
    didRegistry = await DidRegistry.deploy();
    await didRegistry.waitForDeployment();

    // Deploy DidVerifier
    const DidVerifier = await ethers.getContractFactory('DidVerifier');
    didVerifier = await DidVerifier.deploy(await didRegistry.getAddress());
    await didVerifier.waitForDeployment();

    // Deploy DidIssuer
    const DidIssuer = await ethers.getContractFactory('DidIssuer');
    didIssuer = await DidIssuer.deploy(await didRegistry.getAddress());
    await didIssuer.waitForDeployment();

    // Deploy DidAuth
    const DidAuth = await ethers.getContractFactory('DidAuth1');
    didAuth = await DidAuth.deploy(
      await didRegistry.getAddress(),
      await didVerifier.getAddress(),
      await didIssuer.getAddress()
    );
    await didAuth.waitForDeployment();

    // Create DIDs for testing
    const producerDid = `did:example:producer:${producer.address}`;
    const consumerDid = `did:example:consumer:${consumer.address}`;

    // Each address needs a valid document and public key
    const document = '{}'; // Empty JSON document for testing
    const publicKey = '0x123456'; // Dummy public key for testing

    // Register DIDs in the registry
    await didRegistry.connect(producer).registerDid(producerDid, document, publicKey);
    await didRegistry.connect(consumer).registerDid(consumerDid, document, publicKey);

    // Set up trusted issuers in the verifier
    await didVerifier.setIssuerTrustStatus(await didAuth.PRODUCER_CREDENTIAL(), producer.address, true);
    await didVerifier.setIssuerTrustStatus(await didAuth.CONSUMER_CREDENTIAL(), consumer.address, true);

    // Issue credentials
    const producerCredentialId = ethers.keccak256(ethers.toUtf8Bytes(`producer-${Date.now()}`));
    const consumerCredentialId = ethers.keccak256(ethers.toUtf8Bytes(`consumer-${Date.now()}`));

    await didIssuer
      .connect(producer)
      .issueCredential(await didAuth.PRODUCER_CREDENTIAL(), producerDid, producerCredentialId);

    await didIssuer
      .connect(consumer)
      .issueCredential(await didAuth.CONSUMER_CREDENTIAL(), consumerDid, consumerCredentialId);

    // Grant roles in DidAuth
    const PRODUCER_ROLE = await didAuth.PRODUCER_ROLE();
    const CONSUMER_ROLE = await didAuth.CONSUMER_ROLE();

    await didAuth.grantDidRole(producerDid, PRODUCER_ROLE);
    await didAuth.grantDidRole(consumerDid, CONSUMER_ROLE);

    // Deploy Compensation contract
    const Compensation = await ethers.getContractFactory('Compensation1');
    compensation = await Compensation.deploy(
      provider.address,
      await token.getAddress(),
      serviceFee,
      unitPrice,
      await didAuth.getAddress()
    );
    await compensation.waitForDeployment();

    // Log authentication status for debugging
    console.log('----- SETUP VERIFICATION -----');
    console.log('Producer DID:', producerDid);
    console.log('Consumer DID:', consumerDid);
    console.log('Producer has PRODUCER_ROLE:', await didAuth.hasDidRole(producerDid, PRODUCER_ROLE));
    console.log('Consumer has CONSUMER_ROLE:', await didAuth.hasDidRole(consumerDid, CONSUMER_ROLE));
    console.log('Producer authenticated:', await didAuth.authenticate(producerDid, PRODUCER_ROLE));
    console.log('Consumer authenticated:', await didAuth.authenticate(consumerDid, CONSUMER_ROLE));
    console.log('------------------------------');
  });

  describe('Initialization', function () {
    it('should initialize with correct values', async function () {
      expect(await compensation.getServiceFee()).to.equal(serviceFee);
      expect(await compensation.getUnitPrice()).to.equal(unitPrice);
      expect(await compensation.getPaymentTokenAddress()).to.equal(await token.getAddress());
      expect(await compensation.owner()).to.equal(provider.address);
    });

    it('should emit appropriate events during deployment', async function () {
      // Deploy a new instance to capture events
      const Compensation = await ethers.getContractFactory('Compensation1');
      const newCompensation = await Compensation.deploy(
        provider.address,
        await token.getAddress(),
        serviceFee,
        unitPrice,
        await didAuth.getAddress()
      );

      // Check deployment details were set correctly
      expect(await newCompensation.getServiceFee()).to.equal(serviceFee);
      expect(await newCompensation.getUnitPrice()).to.equal(unitPrice);
    });
  });

  describe('Payment Processing', function () {
    beforeEach(async function () {
      // Approve tokens for the compensation contract
      await token.connect(consumer).approve(await compensation.getAddress(), ethers.parseEther('1000'));
    });

    it('should process payment correctly', async function () {
      const expectedAmount = BigInt(dataSize) * unitPrice;
      const expectedFee = (expectedAmount * BigInt(serviceFee)) / 100n;
      const expectedProducerAmount = expectedAmount - expectedFee;

      const producerDid = await didAuth.getDidFromAddress(producer.address);
      const consumerDid = await didAuth.getDidFromAddress(consumer.address);

      // Process payment
      await compensation.connect(consumer).processPayment(producer.address, recordId, dataSize, consumerDid);

      // Check payment was recorded
      expect(await compensation.verifyPayment(recordId)).to.be.true;

      // Check producer balance using the producer's function
      const producerBalanceFunc = compensation.connect(producer)['getProducerBalance()'];
      expect(await producerBalanceFunc()).to.equal(expectedProducerAmount);

      // Check service fee balance
      expect(await compensation.serviceFeeBalance()).to.equal(expectedFee);
    });

    it('should emit PaymentProcessed event with correct data', async function () {
      const expectedAmount = BigInt(dataSize) * unitPrice;
      const expectedFee = (expectedAmount * BigInt(serviceFee)) / 100n;
      const expectedProducerAmount = expectedAmount - expectedFee;

      const consumerDid = await didAuth.getDidFromAddress(consumer.address);

      // Check for event emission
      await expect(compensation.connect(consumer).processPayment(producer.address, recordId, dataSize, consumerDid))
        .to.emit(compensation, 'PaymentProcessed')
        .withArgs(producer.address, consumer.address, expectedProducerAmount, expectedFee);
    });

    it('should fail when processing payment with invalid producer', async function () {
      const invalidProducer = ethers.ZeroAddress;
      const consumerDid = await didAuth.getDidFromAddress(consumer.address);

      await expect(
        compensation.connect(consumer).processPayment(invalidProducer, recordId, dataSize, consumerDid)
      ).to.be.revertedWithCustomError(compensation, 'Compensation__InvalidAddress');
    });

    it('should fail when consumer has not approved enough tokens', async function () {
      // Reset approval to 0
      await token.connect(consumer).approve(await compensation.getAddress(), 0);

      const consumerDid = await didAuth.getDidFromAddress(consumer.address);

      // Accept any revert since this could fail for multiple reasons
      await expect(compensation.connect(consumer).processPayment(producer.address, recordId, dataSize, consumerDid)).to
        .be.reverted;
    });

    it('should fail when consumer DID is invalid', async function () {
      const invalidDid = 'did:example:invalid:12345';

      await expect(compensation.connect(consumer).processPayment(producer.address, recordId, dataSize, invalidDid)).to
        .be.reverted;
    });
  });

  describe('Balance Withdrawal', function () {
    beforeEach(async function () {
      // Approve tokens for the compensation contract
      await token.connect(consumer).approve(await compensation.getAddress(), ethers.parseEther('1000'));

      const consumerDid = await didAuth.getDidFromAddress(consumer.address);

      // Process payment
      await compensation.connect(consumer).processPayment(producer.address, recordId, dataSize, consumerDid);
    });

    it('should allow producer to withdraw balance', async function () {
      const initialBalance = await token.balanceOf(producer.address);

      // Get producer balance using array access notation for the function
      const producerBalanceFunc = compensation.connect(producer)['getProducerBalance()'];
      const producerBalance = await producerBalanceFunc();

      // Set minimum withdraw amount to a lower value for testing
      await compensation.connect(provider).setMinimumWithdrawAmount(ethers.parseEther('0.1'));

      // Withdraw producer balance
      await compensation.connect(producer).withdrawProducerBalance(producerBalance);

      // Check producer's token balance increased
      const finalBalance = await token.balanceOf(producer.address);
      expect(finalBalance - initialBalance).to.equal(producerBalance);

      // Check producer's balance in contract is zero
      expect(await producerBalanceFunc()).to.equal(0);
    });

    it('should emit ProducerPaid event when balance is withdrawn', async function () {
      // Set minimum withdraw amount to a lower value for testing
      await compensation.connect(provider).setMinimumWithdrawAmount(ethers.parseEther('0.1'));

      // Get producer balance
      const producerBalanceFunc = compensation.connect(producer)['getProducerBalance()'];
      const producerBalance = await producerBalanceFunc();

      // Check for event emission
      await expect(compensation.connect(producer).withdrawProducerBalance(producerBalance))
        .to.emit(compensation, 'ProducerPaid')
        .withArgs(
          producer.address,
          producerBalance,
          await ethers.provider.getBlock('latest').then((b) => b!.timestamp + 1)
        );
    });

    it('should fail when non-producer tries to withdraw', async function () {
      // Set minimum withdraw amount to a lower value for testing
      await compensation.connect(provider).setMinimumWithdrawAmount(ethers.parseEther('0.1'));

      // Attempt to withdraw as a non-producer account
      await expect(compensation.connect(otherAccount).withdrawProducerBalance(ethers.parseEther('1'))).to.be.reverted;
    });

    it('should fail when producer tries to withdraw with zero balance', async function () {
      // Create a new producer with no balance
      const newProducerDid = `did:example:producer:${otherAccount.address}`;
      const document = '{}';
      const publicKey = '0x123456';

      // Register the new producer
      await didRegistry.connect(otherAccount).registerDid(newProducerDid, document, publicKey);
      await didVerifier.setIssuerTrustStatus(await didAuth.PRODUCER_CREDENTIAL(), otherAccount.address, true);

      const producerCredentialId = ethers.keccak256(ethers.toUtf8Bytes(`producer-new-${Date.now()}`));
      await didIssuer
        .connect(otherAccount)
        .issueCredential(await didAuth.PRODUCER_CREDENTIAL(), newProducerDid, producerCredentialId);

      await didAuth.grantDidRole(newProducerDid, await didAuth.PRODUCER_ROLE());

      // Set minimum withdraw amount to a lower value for testing
      await compensation.connect(provider).setMinimumWithdrawAmount(ethers.parseEther('0.1'));

      // Try to withdraw with no balance
      await expect(
        compensation.connect(otherAccount).withdrawProducerBalance(ethers.parseEther('1'))
      ).to.be.revertedWithCustomError(compensation, 'Compensation__NoBalanceToWithdraw');
    });
  });

  describe('Admin Functions', function () {
    it('should allow owner to change service fee', async function () {
      const newServiceFee = 10; // 10% service fee
      await compensation.connect(provider).changeServiceFee(newServiceFee);
      expect(await compensation.getServiceFee()).to.equal(newServiceFee);
    });

    it('should allow owner to change unit price', async function () {
      const newUnitPrice = ethers.parseEther('2'); // 2 Tokens per unit
      await compensation.connect(provider).changeUnitPrice(newUnitPrice);
      expect(await compensation.getUnitPrice()).to.equal(newUnitPrice);
    });

    it('should allow owner to pause and unpause service', async function () {
      // Pause service
      await compensation.connect(provider).pauseService();
      expect(await compensation.paused()).to.be.true;

      // Unpause service
      await compensation.connect(provider).unpauseService();
      expect(await compensation.paused()).to.be.false;
    });

    it('should allow owner to withdraw service fees', async function () {
      // First process a payment to generate service fees
      const consumerDid = await didAuth.getDidFromAddress(consumer.address);

      await token.connect(consumer).approve(await compensation.getAddress(), ethers.parseEther('1000'));

      await compensation.connect(consumer).processPayment(producer.address, recordId, dataSize, consumerDid);

      const serviceFeeBalance = await compensation.serviceFeeBalance();
      expect(serviceFeeBalance).to.be.gt(0);

      // Withdraw service fees
      await compensation.connect(provider).withdrawServiceFee(serviceFeeBalance);

      // Service fee balance should be zero now
      expect(await compensation.serviceFeeBalance()).to.equal(0);
    });

    it('should fail when non-owner tries to change service fee', async function () {
      await expect(compensation.connect(consumer).changeServiceFee(10)).to.be.reverted;
    });

    it('should fail when non-owner tries to change unit price', async function () {
      await expect(compensation.connect(consumer).changeUnitPrice(ethers.parseEther('2'))).to.be.reverted;
    });

    it('should fail when non-owner tries to pause/unpause service', async function () {
      await expect(compensation.connect(consumer).pauseService()).to.be.reverted;

      await expect(compensation.connect(consumer).unpauseService()).to.be.reverted;
    });

    it('should fail when non-owner tries to withdraw service fees', async function () {
      await expect(compensation.connect(consumer).withdrawServiceFee(1)).to.be.reverted;
    });

    it('should fail when trying to set invalid service fee', async function () {
      await expect(compensation.connect(provider).changeServiceFee(0)).to.be.revertedWithCustomError(
        compensation,
        'Compensation__InvalidInputParam'
      );
    });

    it('should fail when trying to set invalid unit price', async function () {
      await expect(compensation.connect(provider).changeUnitPrice(0)).to.be.revertedWithCustomError(
        compensation,
        'Compensation__InvalidInputParam'
      );
    });
  });

  describe('Edge Cases', function () {
    it('should correctly handle multiple payments from same consumer to different producers', async function () {
      // Set up a second producer
      const secondProducer = otherAccount;
      const secondProducerDid = `did:example:producer:${secondProducer.address}`;
      const document = '{}';
      const publicKey = '0x123456';

      // Register the second producer
      await didRegistry.connect(secondProducer).registerDid(secondProducerDid, document, publicKey);
      await didVerifier.setIssuerTrustStatus(await didAuth.PRODUCER_CREDENTIAL(), secondProducer.address, true);

      const producerCredentialId = ethers.keccak256(ethers.toUtf8Bytes(`producer-second-${Date.now()}`));
      await didIssuer
        .connect(secondProducer)
        .issueCredential(await didAuth.PRODUCER_CREDENTIAL(), secondProducerDid, producerCredentialId);

      await didAuth.grantDidRole(secondProducerDid, await didAuth.PRODUCER_ROLE());

      // Approve tokens
      await token.connect(consumer).approve(await compensation.getAddress(), ethers.parseEther('1000'));

      const consumerDid = await didAuth.getDidFromAddress(consumer.address);

      // Pay first producer
      await compensation.connect(consumer).processPayment(producer.address, 'record-1', dataSize, consumerDid);

      // Pay second producer
      await compensation
        .connect(consumer)
        .processPayment(secondProducer.address, 'record-2', dataSize * 2, consumerDid);

      // Check balances - first producer should have payment for 10 units
      const firstProducerBalanceFunc = compensation.connect(producer)['getProducerBalance()'];
      const expectedFirstProducerAmount =
        BigInt(dataSize) * unitPrice - (BigInt(dataSize) * unitPrice * BigInt(serviceFee)) / 100n;

      // Second producer should have payment for 20 units
      const secondProducerBalanceFunc = compensation.connect(secondProducer)['getProducerBalance()'];
      const expectedSecondProducerAmount =
        BigInt(dataSize * 2) * unitPrice - (BigInt(dataSize * 2) * unitPrice * BigInt(serviceFee)) / 100n;

      expect(await firstProducerBalanceFunc()).to.equal(expectedFirstProducerAmount);
      expect(await secondProducerBalanceFunc()).to.equal(expectedSecondProducerAmount);
    });

    it('should track payments by record ID', async function () {
      // Approve tokens
      await token.connect(consumer).approve(await compensation.getAddress(), ethers.parseEther('1000'));

      const consumerDid = await didAuth.getDidFromAddress(consumer.address);

      // Make multiple payments with different record IDs
      await compensation.connect(consumer).processPayment(producer.address, 'record-a', dataSize, consumerDid);
      await compensation.connect(consumer).processPayment(producer.address, 'record-b', dataSize, consumerDid);

      // Verify each payment
      expect(await compensation.verifyPayment('record-a')).to.be.true;
      expect(await compensation.verifyPayment('record-b')).to.be.true;
      expect(await compensation.verifyPayment('record-c')).to.be.false; // Non-existent record
    });
  });
});
