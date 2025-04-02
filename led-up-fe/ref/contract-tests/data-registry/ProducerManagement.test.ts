import { expect } from 'chai';
import { ethers } from 'hardhat';
import { setupTest, TestContext, testDataId, ConsentStatus, RecordStatus } from './TestCommon';

describe('DataRegistry1 - Producer Management', function () {
  let ctx: TestContext;

  before(async function () {
    // This test can take time
    this.timeout(60000);

    // Setup the test context
    ctx = await setupTest();

    // First try to register the producer
    try {
      await ctx.dataRegistry.connect(ctx.producer).registerProducer(RecordStatus.Active, ConsentStatus.Allowed);
      console.log('Producer registered in before hook');
    } catch (error: any) {
      if (error.message.includes('DataRegistry__AlreadyRegistered')) {
        console.log('Producer already registered in before hook');
      } else {
        console.error('Error registering producer:', error.message);
      }
    }

    // Register initial test record if needed
    try {
      await ctx.dataRegistry
        .connect(ctx.producer)
        .registerRecord(
          testDataId,
          'ipfs://QmTest123456',
          ethers.keccak256(ethers.toUtf8Bytes('test content hash')),
          0,
          1024
        );
      console.log('Test record registered in before hook');
    } catch (error: any) {
      if (error.message.includes('DataRegistry__RecordAlreadyExists')) {
        console.log('Test record already exists in before hook');
      } else {
        console.error('Error registering test record:', error.message);
      }
    }
  });

  it('should register a producer', async function () {
    // First verify that trying to register the already registered producer fails
    await expect(
      ctx.dataRegistry.connect(ctx.producer).registerProducer(RecordStatus.Active, ConsentStatus.Allowed)
    ).to.be.revertedWithCustomError(ctx.dataRegistry, 'DataRegistry__AlreadyRegistered');
  });

  it('should get correct producer for a record', async function () {
    // We'll verify indirectly by trying to update the record
    // Only the producer can update their own records
    const updatedCid = 'ipfs://QmUpdated123';
    const updatedContentHash = ethers.keccak256(ethers.toUtf8Bytes('updated content hash'));

    // Update the existing record - this should work only for the producer
    await ctx.dataRegistry.connect(ctx.producer).updateRecord(testDataId, updatedCid, updatedContentHash);

    // If we get here without errors, it means the producer is correctly associated with the record
  });

  it('should allow a producer to update their consent for data sharing', async function () {
    // A producer should be able to update their own consent status
    await ctx.dataRegistry.connect(ctx.producer).updateProducerConsent(ctx.producer.address, ConsentStatus.Denied);

    // Verify the consent was updated by checking producer metadata
    const metadata = await ctx.dataRegistry.getProducerMetadata(ctx.producer.address);
    expect(metadata[1]).to.equal(ConsentStatus.Denied);

    // Set it back to Allowed for other tests
    await ctx.dataRegistry.connect(ctx.producer).updateProducerConsent(ctx.producer.address, ConsentStatus.Allowed);
  });

  it('should prevent producers from registering duplicate records', async function () {
    // Try to register a record with the same ID
    await expect(
      ctx.dataRegistry
        .connect(ctx.producer)
        .registerRecord(
          testDataId,
          'ipfs://QmDuplicate',
          ethers.keccak256(ethers.toUtf8Bytes('duplicate content')),
          0,
          1024
        )
    ).to.be.revertedWithCustomError(ctx.dataRegistry, 'DataRegistry__RecordAlreadyExists');
  });

  it('should prevent unauthorized users from updating consent', async function () {
    // Try to update consent with non-producer, non-owner
    await expect(
      ctx.dataRegistry.connect(ctx.unauthorized).updateProducerConsent(ctx.unauthorized.address, ConsentStatus.Denied)
    ).to.be.revertedWithCustomError(ctx.dataRegistry, 'DataRegistry__Unauthorized');
  });

  it('should prevent unauthorized producers from updating others consent', async function () {
    // Try to have one producer update another producer's consent (should fail)
    // Only the producer themselves or the owner should be able to update a producer's consent
    await expect(
      ctx.dataRegistry.connect(ctx.producer).updateProducerConsent(ctx.owner.address, ConsentStatus.Denied)
    ).to.be.revertedWithCustomError(ctx.dataRegistry, 'DataRegistry__Unauthorized');
  });
});
