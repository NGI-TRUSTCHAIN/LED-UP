import { ethers } from 'hardhat';
import {
  DataRegistry1,
  Compensation1,
  Token,
  DidAuth1,
  DidRegistry,
  DidVerifier,
  DidIssuer,
} from '../../typechain-types';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

// Constants for testing
export enum RecordStatus {
  Inactive,
  Active,
  Suspended,
  Deleted,
}

export enum ConsentStatus {
  NotSet,
  Allowed,
  Denied,
}

export enum ResourceType {
  Patient,
  Observation,
  Condition,
  Procedure,
  Encounter,
}

export enum AccessLevel {
  None,
  Read,
  Write,
}

// Test data constants
export const testDataId = 'test-data-123';
export const testCid = 'ipfs://QmTest123456';
export const contentHash = ethers.keccak256(ethers.toUtf8Bytes('test content hash'));
export const dataSize = 1024;
export const accessDuration = 7 * 24 * 60 * 60; // 7 days in seconds
export const serviceFee = 10; // 10%
export const unitPrice = ethers.parseEther('0.01'); // 0.01 tokens per data unit

// Common test context shared across test files
export interface TestContext {
  // Signers
  owner: HardhatEthersSigner;
  producer: HardhatEthersSigner;
  anotherProducer: HardhatEthersSigner;
  consumer: HardhatEthersSigner;
  provider: HardhatEthersSigner;
  verifier: HardhatEthersSigner;
  unauthorized: HardhatEthersSigner;

  // Contracts
  dataRegistry: DataRegistry1;
  token: Token;
  compensation: Compensation1;
  didAuth: DidAuth1;
  didRegistry: DidRegistry;
  didVerifier: DidVerifier;
  didIssuer: DidIssuer;
}

/**
 * Sets up the test environment by deploying contracts and setting up initial state
 */
export async function setupTest(): Promise<TestContext> {
  // Get signers
  const [owner, producer, anotherProducer, consumer, provider, verifier, unauthorized] = await ethers.getSigners();

  // Deploy Token
  const TokenFactory = await ethers.getContractFactory('Token');
  const token = await TokenFactory.deploy();

  // Deploy DID Registry
  const DidRegistryFactory = await ethers.getContractFactory('DidRegistry');
  const didRegistry = await DidRegistryFactory.deploy();

  // Deploy DidVerifier and DidIssuer (needed for DidAuth)
  const DidVerifierFactory = await ethers.getContractFactory('DidVerifier');
  const didVerifier = await DidVerifierFactory.deploy(await didRegistry.getAddress());

  const DidIssuerFactory = await ethers.getContractFactory('DidIssuer');
  const didIssuer = await DidIssuerFactory.deploy(await didRegistry.getAddress());

  // Deploy DidAuth
  const DidAuthFactory = await ethers.getContractFactory('DidAuth1');
  const didAuth = await DidAuthFactory.deploy(
    await didRegistry.getAddress(),
    await didVerifier.getAddress(),
    await didIssuer.getAddress()
  );

  // Deploy Compensation1
  const CompensationFactory = await ethers.getContractFactory('Compensation1');
  const compensation = await CompensationFactory.deploy(
    owner.address,
    await token.getAddress(),
    serviceFee,
    unitPrice,
    await didAuth.getAddress()
  );

  // Deploy DataRegistry1
  const DataRegistryFactory = await ethers.getContractFactory('DataRegistry1');
  const dataRegistry = await DataRegistryFactory.deploy(
    await token.getAddress(),
    owner.address,
    serviceFee,
    await didAuth.getAddress()
  );

  // Register compensation address in DataRegistry
  await dataRegistry.updateCompensationAddress(await compensation.getAddress());

  // Set up DIDs for testing
  await setupDIDs(didRegistry, didAuth, producer, consumer, provider, verifier);

  // Mint tokens to consumer for testing
  await token.mint(consumer.address, ethers.parseEther('1000'));

  // Consumer approves compensation contract to spend tokens
  await token.connect(consumer).approve(await compensation.getAddress(), ethers.parseEther('1000'));

  return {
    owner,
    producer,
    anotherProducer,
    consumer,
    provider,
    verifier,
    unauthorized,
    dataRegistry,
    token,
    compensation,
    didAuth,
    didRegistry,
    didVerifier,
    didIssuer,
  };
}

/**
 * Sets up DIDs for testing
 */
async function setupDIDs(
  didRegistry: DidRegistry,
  didAuth: DidAuth1,
  producer: HardhatEthersSigner,
  consumer: HardhatEthersSigner,
  provider: HardhatEthersSigner,
  verifier: HardhatEthersSigner
) {
  // Create DIDs
  const producerDid = `did:example:producer:${producer.address}`;
  const consumerDid = `did:example:consumer:${consumer.address}`;
  const providerDid = `did:example:provider:${provider.address}`;
  const verifierDid = `did:example:verifier:${verifier.address}`;

  const document = '{}'; // Empty document for testing
  const publicKey = '0x123456'; // Dummy public key

  // Register DIDs
  await didRegistry.connect(producer).registerDid(producerDid, document, publicKey);
  await didRegistry.connect(consumer).registerDid(consumerDid, document, publicKey);
  await didRegistry.connect(provider).registerDid(providerDid, document, publicKey);
  await didRegistry.connect(verifier).registerDid(verifierDid, document, publicKey);

  // Grant roles
  const PRODUCER_ROLE = await didAuth.PRODUCER_ROLE();
  const CONSUMER_ROLE = await didAuth.CONSUMER_ROLE();
  const PROVIDER_ROLE = await didAuth.PROVIDER_ROLE();
  const VERIFIER_ROLE = await didAuth.VERIFIER_ROLE();

  await didAuth.grantDidRole(producerDid, PRODUCER_ROLE);
  await didAuth.grantDidRole(consumerDid, CONSUMER_ROLE);
  await didAuth.grantDidRole(providerDid, PROVIDER_ROLE);
  await didAuth.grantDidRole(verifierDid, VERIFIER_ROLE);
}

/**
 * Registers a test record in the data registry
 */
export async function registerTestRecord(
  dataRegistry: DataRegistry1,
  producer: HardhatEthersSigner,
  recordId: string = testDataId,
  cidStr: string = testCid,
  hash: string = contentHash,
  resourceType: ResourceType = ResourceType.Patient,
  size: number = dataSize
) {
  await dataRegistry.connect(producer).registerRecord(recordId, cidStr, hash, resourceType, size);
}

/**
 * Process payment for a record
 */
export async function processPaymentForRecord(ctx: TestContext, consumer: HardhatEthersSigner, recordId: string) {
  // Ensure consumer has approved token transfers
  await ctx.token.connect(consumer).approve(await ctx.compensation.getAddress(), ethers.parseEther('1000'));

  // Since we can't directly call getRecordInfo without authorization,
  // we'll use the producer from ctx since that's who created the record in our tests
  const producerAddress = ctx.producer.address;

  // Default data size to what was used in the tests
  const dataSize = 1024n;

  // Get consumer DID
  const consumerDid = await ctx.didAuth.getDidFromAddress(consumer.address);

  // Process the payment
  await ctx.compensation.connect(consumer).processPayment(producerAddress, recordId, dataSize, consumerDid);

  // Verify payment was processed
  const isVerified = await ctx.compensation.verifyPayment(recordId);
  if (!isVerified) {
    throw new Error('Payment verification failed');
  }

  return true;
}

/**
 * Get the producer address for a record
 */
async function getProducerForRecord(dataRegistry: DataRegistry1, recordId: string): Promise<string> {
  const recordInfo = await dataRegistry.getRecordInfo(recordId);
  return recordInfo[0]; // producer is the first returned value
}

/**
 * Get the consent status for a record
 */
async function getConsentStatus(dataRegistry: DataRegistry1, recordId: string): Promise<ConsentStatus> {
  // This is a simplification - in actual code, we'd need to determine this from the producer metadata
  // First get the producer
  const producerAddress = await getProducerForRecord(dataRegistry, recordId);

  // Then get the producer metadata
  const producerMetadata = await dataRegistry.getProducerMetadata(producerAddress);

  // The consent status is the second element in the returned tuple
  return Number(producerMetadata[1]) as ConsentStatus;
}

/**
 * Update consent for a record
 */
async function updateConsent(
  dataRegistry: DataRegistry1,
  producer: HardhatEthersSigner,
  recordId: string,
  status: ConsentStatus
) {
  // In the actual contract, this should be updateProducerConsent
  await dataRegistry.connect(producer).updateProducerConsent(producer.address, status);
}

/**
 * Check if consumer has access to a record
 */
export async function canAccess(
  dataRegistry: DataRegistry1,
  consumer: HardhatEthersSigner | string,
  recordId: string
): Promise<boolean> {
  let consumerAddress: string;
  if (typeof consumer === 'string') {
    consumerAddress = consumer;
  } else {
    consumerAddress = consumer.address;
  }

  const [hasAccess] = await dataRegistry.checkAccess(recordId, consumerAddress);
  return hasAccess;
}

/**
 * Share data with a consumer
 */
export async function shareDataWithConsumer(
  ctx: TestContext,
  producer: HardhatEthersSigner,
  consumer: HardhatEthersSigner,
  recordId: string
) {
  // Share data with consumer
  await ctx.dataRegistry.connect(producer).shareData(recordId, consumer.address, accessDuration);

  return true;
}

/**
 * Setup complete data sharing flow (payment + sharing)
 */
export async function setupCompleteSharing(
  ctx: TestContext,
  producer: HardhatEthersSigner,
  consumer: HardhatEthersSigner,
  recordId: string
) {
  // First process payment
  await processPaymentForRecord(ctx, consumer, recordId);

  // Then share data
  await shareDataWithConsumer(ctx, producer, consumer, recordId);

  // Check if consumer has access
  const hasAccess = await canAccess(ctx.dataRegistry, consumer, recordId);

  return hasAccess;
}
