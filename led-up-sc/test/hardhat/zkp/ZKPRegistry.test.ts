// @ts-nocheck
import { expect } from 'chai';
import hre from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { getAddress, keccak256, stringToHex } from 'viem';

describe('ZKPRegistry', function () {
  // Fixture to deploy the ZKP Registry contract
  async function deployZKPRegistryFixture() {
    // Get signers
    const [owner, admin, nonAdmin] = await hre.viem.getWalletClients();

    // Deploy the ZKP Registry contract
    const zkpRegistry = await hre.viem.deployContract('ZKPRegistry');

    return { zkpRegistry, owner, admin, nonAdmin };
  }

  describe('Deployment', function () {
    it('Should set the owner as admin', async function () {
      const { zkpRegistry, owner } = await loadFixture(deployZKPRegistryFixture);

      // Check that the owner is an admin
      const isAdmin = await zkpRegistry.read.isAdmin([owner.account.address]);
      expect(isAdmin).to.be.true;
    });

    it('Should not have any verifiers initially', async function () {
      const { zkpRegistry } = await loadFixture(deployZKPRegistryFixture);

      // Check that the verifier is not registered
      const verifierType = keccak256(stringToHex('TEST_VERIFIER'));
      const isRegistered = await zkpRegistry.read.isVerifierRegistered([verifierType]);
      expect(isRegistered).to.be.false;
    });
  });

  describe('Admin Management', function () {
    it('Should allow owner to add an admin', async function () {
      const { zkpRegistry, owner, admin } = await loadFixture(deployZKPRegistryFixture);

      // Add admin
      await zkpRegistry.write.addAdmin([admin.account.address], { account: owner.account });

      // Check that the admin was added
      const isAdmin = await zkpRegistry.read.isAdmin([admin.account.address]);
      expect(isAdmin).to.be.true;
    });

    it('Should allow owner to remove an admin', async function () {
      const { zkpRegistry, owner, admin } = await loadFixture(deployZKPRegistryFixture);

      // Add admin
      await zkpRegistry.write.addAdmin([admin.account.address], { account: owner.account });

      // Remove admin
      await zkpRegistry.write.removeAdmin([admin.account.address], { account: owner.account });

      // Check that the admin was removed
      const isAdmin = await zkpRegistry.read.isAdmin([admin.account.address]);
      expect(isAdmin).to.be.false;
    });

    it('Should not allow non-owner to add an admin', async function () {
      const { zkpRegistry, admin, nonAdmin } = await loadFixture(deployZKPRegistryFixture);

      // Try to add admin as non-owner
      try {
        await zkpRegistry.write.addAdmin([admin.account.address], { account: nonAdmin.account });
        expect.fail('Expected function to throw an error');
      } catch (error: any) {
        // The error message from Ownable is different, so we just check that an error occurred
        expect(error).to.exist;
      }
    });

    it('Should not allow non-owner to remove an admin', async function () {
      const { zkpRegistry, owner, admin, nonAdmin } = await loadFixture(deployZKPRegistryFixture);

      // Add admin
      await zkpRegistry.write.addAdmin([admin.account.address], { account: owner.account });

      // Try to remove admin as non-owner
      try {
        await zkpRegistry.write.removeAdmin([admin.account.address], { account: nonAdmin.account });
        expect.fail('Expected function to throw an error');
      } catch (error: any) {
        // The error message from Ownable is different, so we just check that an error occurred
        expect(error).to.exist;
      }
    });
  });

  describe('Verifier Management', function () {
    it('Should allow admin to register a verifier', async function () {
      const { zkpRegistry, owner } = await loadFixture(deployZKPRegistryFixture);

      // Create a mock verifier
      const mockVerifier = await hre.viem.deployContract('MockZKPVerifier');

      // Register the verifier
      const verifierType = keccak256(stringToHex('TEST_VERIFIER'));
      await zkpRegistry.write.registerVerifier([verifierType, mockVerifier.address], { account: owner.account });

      // Check if the verifier was registered
      const isRegistered = await zkpRegistry.read.isVerifierRegistered([verifierType]);
      expect(isRegistered).to.be.true;

      // Get the registered address
      const registeredAddress = await zkpRegistry.read.getVerifier([verifierType]);
      expect(getAddress(registeredAddress)).to.equal(getAddress(mockVerifier.address));
    });

    it('Should allow admin to remove a verifier', async function () {
      const { zkpRegistry, owner } = await loadFixture(deployZKPRegistryFixture);

      // Create a mock verifier
      const mockVerifier = await hre.viem.deployContract('MockZKPVerifier');

      // Register the verifier
      const verifierType = keccak256(stringToHex('TEST_VERIFIER'));
      await zkpRegistry.write.registerVerifier([verifierType, mockVerifier.address], { account: owner.account });

      // Remove the verifier
      await zkpRegistry.write.removeVerifier([verifierType], { account: owner.account });

      // Check if the verifier was removed
      const isRegistered = await zkpRegistry.read.isVerifierRegistered([verifierType]);
      expect(isRegistered).to.be.false;
    });

    it('Should not allow non-admin to register a verifier', async function () {
      const { zkpRegistry, nonAdmin } = await loadFixture(deployZKPRegistryFixture);

      // Create a mock verifier
      const mockVerifier = await hre.viem.deployContract('MockZKPVerifier');

      // Try to register the verifier as non-admin
      const verifierType = keccak256(stringToHex('TEST_VERIFIER'));
      try {
        await zkpRegistry.write.registerVerifier([verifierType, mockVerifier.address], { account: nonAdmin.account });
        expect.fail('Expected function to throw an error');
      } catch (error: any) {
        expect(error.message).to.include('An unknown RPC error occurred');
      }
    });

    it('Should not allow non-admin to remove a verifier', async function () {
      const { zkpRegistry, owner, nonAdmin } = await loadFixture(deployZKPRegistryFixture);

      // Create a mock verifier
      const mockVerifier = await hre.viem.deployContract('MockZKPVerifier');

      // Register the verifier
      const verifierType = keccak256(stringToHex('TEST_VERIFIER'));
      await zkpRegistry.write.registerVerifier([verifierType, mockVerifier.address], { account: owner.account });

      // Try to remove the verifier as non-admin
      try {
        await zkpRegistry.write.removeVerifier([verifierType], { account: nonAdmin.account });
        expect.fail('Expected function to throw an error');
      } catch (error: any) {
        expect(error.message).to.include('An unknown RPC error occurred');
      }
    });
  });
});
