import { expect } from 'chai';
import { setupTest, registerTestRecord, TestContext, ConsentStatus, RecordStatus } from './TestCommon';

describe('DataRegistry1 - Basic Functionality', function () {
  let ctx: TestContext;

  before(async function () {
    // This test can take time
    this.timeout(60000);

    // Setup the test context
    ctx = await setupTest();
  });

  it('should initialize with correct values', async function () {
    expect(await ctx.dataRegistry.owner()).to.equal(ctx.owner.address);
    expect(await ctx.dataRegistry.didAuth()).to.equal(await ctx.didAuth.getAddress());
  });

  it('should register a new record', async function () {
    await registerTestRecord(ctx.dataRegistry, ctx.producer);

    // Since there's no direct getRecord function, we can verify through other mechanisms
    expect(await ctx.dataRegistry.getTotalRecords()).to.equal(1);
    // We could also check events or other indicators of successful registration
  });

  it('should fail to register duplicate record', async function () {
    await expect(registerTestRecord(ctx.dataRegistry, ctx.producer)).to.be.revertedWithCustomError(
      ctx.dataRegistry,
      'DataRegistry__RecordAlreadyExists'
    );
  });

  it('should not allow unauthorized users to update records', async function () {
    await expect(
      ctx.dataRegistry
        .connect(ctx.consumer)
        .updateRecord(
          'test-data-123',
          'ipfs://QmNewHash',
          '0x0000000000000000000000000000000000000000000000000000000000000000'
        )
    ).to.be.revertedWithCustomError(ctx.dataRegistry, 'DataRegistry__Unauthorized');
  });

  it('should verify a record', async function () {
    await ctx.dataRegistry.connect(ctx.verifier).verifyRecord('test-data-123');
    expect(await ctx.dataRegistry.isRecordVerified('test-data-123')).to.be.true;
  });

  it('should update producer consent', async function () {
    // First register the producer if not already registered
    try {
      await ctx.dataRegistry.connect(ctx.producer).registerProducer(RecordStatus.Active, ConsentStatus.Allowed);
    } catch (error) {
      // Producer may already be registered, proceed with test
    }

    // Update to Denied consent
    await ctx.dataRegistry.connect(ctx.producer).updateProducerConsent(ctx.producer.address, ConsentStatus.Denied);

    // Get producer metadata to verify
    const metadata = await ctx.dataRegistry.getProducerMetadata(ctx.producer.address);
    expect(metadata[1]).to.equal(2); // ConsentStatus.Denied

    // Reset consent back to allowed for subsequent tests
    await ctx.dataRegistry.connect(ctx.producer).updateProducerConsent(ctx.producer.address, ConsentStatus.Allowed);
  });

  it('should get total records count', async function () {
    const totalRecords = await ctx.dataRegistry.getTotalRecords();
    expect(totalRecords).to.equal(1);
  });
});
