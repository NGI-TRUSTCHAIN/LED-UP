import { expect } from 'chai';
import { ethers } from 'hardhat';
import { DidRegistry } from '../typechain-types';

describe('DidRegistry reactivation', function () {
  let didRegistry: DidRegistry;
  let owner: any;
  let user: any;
  let userDid: string;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    // Deploy DidRegistry
    const DidRegistry = await ethers.getContractFactory('DidRegistry');
    didRegistry = await DidRegistry.deploy();
    await didRegistry.waitForDeployment();

    // Create DID for testing
    userDid = `did:example:user:${user.address}`;

    // Register DID in the registry - connect with user
    const document = '{}'; // Empty JSON document for testing
    const publicKey = '0x123456'; // Dummy public key for testing
    await didRegistry.connect(user).registerDid(userDid, document, publicKey);
  });

  it('should allow deactivation and reactivation of a DID', async function () {
    // First, check that the DID is initially active
    expect(await didRegistry.isActiveForDid(userDid)).to.be.true;

    // Then deactivate the DID
    await didRegistry.connect(user).deactivateDid(userDid);
    expect(await didRegistry.isActiveForDid(userDid)).to.be.false;

    // Then reactivate the DID
    await didRegistry.connect(user).reactivateDid(userDid);
    expect(await didRegistry.isActiveForDid(userDid)).to.be.true;
  });
});
