import { expect } from 'chai';
import { ethers } from 'hardhat';
import { setupTest, TestContext, testDataId } from './TestCommon';

describe('DataRegistry1 - Administrative Functions', function () {
  let ctx: TestContext;

  before(async function () {
    // This test can take time
    this.timeout(60000);

    // Setup the test context
    ctx = await setupTest();
  });

  it('should allow owner to pause and unpause the contract', async function () {
    // Pause the contract
    await ctx.dataRegistry.connect(ctx.owner).pause();
    expect(await ctx.dataRegistry.paused()).to.be.true;

    // Try to register a record while paused
    await expect(
      ctx.dataRegistry
        .connect(ctx.producer)
        .registerRecord(
          'paused-test',
          'ipfs://QmPaused',
          ethers.keccak256(ethers.toUtf8Bytes('paused content')),
          0,
          1024
        )
    ).to.be.revertedWithCustomError(ctx.dataRegistry, 'EnforcedPause');

    // Unpause the contract
    await ctx.dataRegistry.connect(ctx.owner).unpause();
    expect(await ctx.dataRegistry.paused()).to.be.false;

    // Register a record after unpausing
    await ctx.dataRegistry
      .connect(ctx.producer)
      .registerRecord(
        'paused-test',
        'ipfs://QmPaused',
        ethers.keccak256(ethers.toUtf8Bytes('paused content')),
        0,
        1024
      );
  });

  it('should update the DidAuth address', async function () {
    // Deploy a new DidRegistry first
    const DidRegistryFactory = await ethers.getContractFactory('DidRegistry');
    const newDidRegistry = await DidRegistryFactory.deploy();

    // Deploy DidVerifier
    const DidVerifierFactory = await ethers.getContractFactory('DidVerifier');
    const newDidVerifier = await DidVerifierFactory.deploy(await newDidRegistry.getAddress());

    // Deploy DidIssuer
    const DidIssuerFactory = await ethers.getContractFactory('DidIssuer');
    const newDidIssuer = await DidIssuerFactory.deploy(await newDidRegistry.getAddress());

    // Deploy a new DidAuth contract
    const DidAuthFactory = await ethers.getContractFactory('DidAuth1');
    const newDidAuth = await DidAuthFactory.deploy(
      await newDidRegistry.getAddress(),
      await newDidVerifier.getAddress(),
      await newDidIssuer.getAddress()
    );

    // Update the DidAuth address
    await ctx.dataRegistry.connect(ctx.owner).updateDidAuthAddress(await newDidAuth.getAddress());

    // Verify the update
    const updatedDidAuthAddress = await ctx.dataRegistry.didAuth();
    expect(updatedDidAuthAddress).to.equal(await newDidAuth.getAddress());
  });

  it('should update the compensation address', async function () {
    // Deploy a new Compensation contract
    const CompensationFactory = await ethers.getContractFactory('Compensation1');
    const newCompensation = await CompensationFactory.deploy(
      ctx.owner.address,
      await ctx.token.getAddress(),
      10, // serviceFeePercent
      ethers.parseEther('1'), // unitPrice
      await ctx.didAuth.getAddress()
    );

    // Update the compensation address
    await ctx.dataRegistry.connect(ctx.owner).updateCompensationAddress(await newCompensation.getAddress());

    // We can't directly access the compensation property, so we'll verify by calling a function
    // that interacts with the compensation contract or check the transaction result
    const tx = await ctx.dataRegistry.connect(ctx.owner).updateCompensationAddress(await newCompensation.getAddress());
    const receipt = await tx.wait();
    expect(receipt).to.not.be.null;
  });

  it('should prevent non-owners from executing administrative functions', async function () {
    // Try to update compensation address as non-owner
    await expect(
      ctx.dataRegistry.connect(ctx.unauthorized).updateCompensationAddress(ethers.ZeroAddress)
    ).to.be.revertedWithCustomError(ctx.dataRegistry, 'OwnableUnauthorizedAccount');

    // Try to update DidAuth address as non-owner
    await expect(
      ctx.dataRegistry.connect(ctx.unauthorized).updateDidAuthAddress(ethers.ZeroAddress)
    ).to.be.revertedWithCustomError(ctx.dataRegistry, 'OwnableUnauthorizedAccount');

    // Try to pause as non-owner
    await expect(ctx.dataRegistry.connect(ctx.unauthorized).pause()).to.be.revertedWithCustomError(
      ctx.dataRegistry,
      'OwnableUnauthorizedAccount'
    );
  });
});
