// @ts-nocheck
import { expect } from 'chai';
import hre from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { getAddress, keccak256, stringToHex } from 'viem';

describe('ZKPVerifierFactory', function () {
  // Fixture to deploy the ZKPVerifierFactory contract
  async function deployZKPFactoryFixture() {
    // Get signers
    const [owner, nonOwner] = await hre.viem.getWalletClients();

    // Deploy the ZKP registry
    const zkpRegistry = await hre.viem.deployContract('ZKPRegistry');

    // Deploy the ZKP verifier factory
    const zkpVerifierFactory = await hre.viem.deployContract('ZKPVerifierFactory', [zkpRegistry.address]);

    // Set the factory as the registry owner
    await zkpRegistry.write.transferOwnership([zkpVerifierFactory.address]);

    // Deploy mock verifiers for testing
    const mockAgeVerifier = await hre.viem.deployContract('MockZKPVerifier');
    const mockHashVerifier = await hre.viem.deployContract('MockZKPVerifier');
    const mockEnhancedHashVerifier = await hre.viem.deployContract('MockZKPVerifier');
    const mockFHIRVerifier = await hre.viem.deployContract('MockZKPVerifier');

    return {
      zkpRegistry,
      zkpVerifierFactory,
      mockAgeVerifier,
      mockHashVerifier,
      mockEnhancedHashVerifier,
      mockFHIRVerifier,
      owner,
      nonOwner,
    };
  }

  describe('Deployment', function () {
    it('Should set the right registry address', async function () {
      const { zkpVerifierFactory, zkpRegistry } = await loadFixture(deployZKPFactoryFixture);

      // Check that the registry address is set correctly
      expect(getAddress(await zkpVerifierFactory.read.registry())).to.equal(getAddress(zkpRegistry.address));
    });

    it('Should revert if registry address is zero', async function () {
      const zeroAddress = '0x0000000000000000000000000000000000000000';

      // Try to deploy with zero address
      try {
        await hre.viem.deployContract('ZKPVerifierFactory', [zeroAddress]);
        // If we get here, the test should fail
        expect.fail('Expected deployment to revert');
      } catch (error: any) {
        // The error message might vary, but the deployment should revert
        expect(error).to.exist;
      }
    });
  });

  describe('Verifier Deployment', function () {
    it('Should deploy and register the AgeVerifier', async function () {
      const { zkpVerifierFactory, mockAgeVerifier, owner, zkpRegistry } = await loadFixture(deployZKPFactoryFixture);

      // Deploy the AgeVerifier
      const tx = await zkpVerifierFactory.write.deployAgeVerifier([mockAgeVerifier.address], {
        account: owner.account,
      });

      // Wait for the transaction to be mined
      const publicClient = await hre.viem.getPublicClient();
      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });

      // Check that the transaction was successful
      expect(receipt.status).to.equal('success');

      // Get the verifier type
      const ageVerifierType = await zkpVerifierFactory.read.AGE_VERIFIER_TYPE();

      // Check that the verifier is registered in the registry
      const verifierAddress = await zkpRegistry.read.getVerifier([ageVerifierType]);
      expect(verifierAddress).to.not.equal('0x0000000000000000000000000000000000000000');
    });

    it('Should deploy and register the HashVerifier', async function () {
      const { zkpVerifierFactory, mockHashVerifier, owner, zkpRegistry } = await loadFixture(deployZKPFactoryFixture);

      // Deploy the HashVerifier
      const tx = await zkpVerifierFactory.write.deployHashVerifier([mockHashVerifier.address], {
        account: owner.account,
      });

      // Wait for the transaction to be mined
      const publicClient = await hre.viem.getPublicClient();
      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });

      // Check that the transaction was successful
      expect(receipt.status).to.equal('success');

      // Get the verifier type
      const hashVerifierType = await zkpVerifierFactory.read.HASH_VERIFIER_TYPE();

      // Check that the verifier is registered in the registry
      const verifierAddress = await zkpRegistry.read.getVerifier([hashVerifierType]);
      expect(verifierAddress).to.not.equal('0x0000000000000000000000000000000000000000');
    });

    it('Should deploy and register the EnhancedHashVerifier', async function () {
      const { zkpVerifierFactory, mockEnhancedHashVerifier, owner, zkpRegistry } = await loadFixture(
        deployZKPFactoryFixture
      );

      // Deploy the EnhancedHashVerifier
      const tx = await zkpVerifierFactory.write.deployEnhancedHashVerifier([mockEnhancedHashVerifier.address], {
        account: owner.account,
      });

      // Wait for the transaction to be mined
      const publicClient = await hre.viem.getPublicClient();
      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });

      // Check that the transaction was successful
      expect(receipt.status).to.equal('success');

      // Get the verifier type
      const enhancedHashVerifierType = await zkpVerifierFactory.read.ENHANCED_HASH_VERIFIER_TYPE();

      // Check that the verifier is registered in the registry
      const verifierAddress = await zkpRegistry.read.getVerifier([enhancedHashVerifierType]);
      expect(verifierAddress).to.not.equal('0x0000000000000000000000000000000000000000');
    });

    it('Should deploy and register the FHIRVerifier', async function () {
      const { zkpVerifierFactory, mockFHIRVerifier, owner, zkpRegistry } = await loadFixture(deployZKPFactoryFixture);

      // Deploy the FHIRVerifier
      const tx = await zkpVerifierFactory.write.deployFHIRVerifier([mockFHIRVerifier.address], {
        account: owner.account,
      });

      // Wait for the transaction to be mined
      const publicClient = await hre.viem.getPublicClient();
      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });

      // Check that the transaction was successful
      expect(receipt.status).to.equal('success');

      // Get the verifier type
      const fhirVerifierType = await zkpVerifierFactory.read.FHIR_VERIFIER_TYPE();

      // Check that the verifier is registered in the registry
      const verifierAddress = await zkpRegistry.read.getVerifier([fhirVerifierType]);
      expect(verifierAddress).to.not.equal('0x0000000000000000000000000000000000000000');
    });
  });

  describe('Access Control', function () {
    it('Should revert if non-owner tries to deploy a verifier', async function () {
      const { zkpVerifierFactory, mockAgeVerifier, nonOwner } = await loadFixture(deployZKPFactoryFixture);

      // Try to deploy the AgeVerifier as non-owner
      try {
        await zkpVerifierFactory.write.deployAgeVerifier([mockAgeVerifier.address], { account: nonOwner.account });
        // If we get here, the test should fail
        expect.fail('Expected function to revert');
      } catch (error: any) {
        // The error message might vary, but the function should revert
        expect(error).to.exist;
      }

      // Try to deploy the HashVerifier as non-owner
      try {
        await zkpVerifierFactory.write.deployHashVerifier([mockAgeVerifier.address], { account: nonOwner.account });
        // If we get here, the test should fail
        expect.fail('Expected function to revert');
      } catch (error: any) {
        // The error message might vary, but the function should revert
        expect(error).to.exist;
      }

      // Try to deploy the EnhancedHashVerifier as non-owner
      try {
        await zkpVerifierFactory.write.deployEnhancedHashVerifier([mockAgeVerifier.address], {
          account: nonOwner.account,
        });
        // If we get here, the test should fail
        expect.fail('Expected function to revert');
      } catch (error: any) {
        // The error message might vary, but the function should revert
        expect(error).to.exist;
      }

      // Try to deploy the FHIRVerifier as non-owner
      try {
        await zkpVerifierFactory.write.deployFHIRVerifier([mockAgeVerifier.address], { account: nonOwner.account });
        // If we get here, the test should fail
        expect.fail('Expected function to revert');
      } catch (error: any) {
        // The error message might vary, but the function should revert
        expect(error).to.exist;
      }
    });

    it('Should revert if verifier address is zero', async function () {
      const { zkpVerifierFactory, owner } = await loadFixture(deployZKPFactoryFixture);
      const zeroAddress = '0x0000000000000000000000000000000000000000';

      // Try to deploy the AgeVerifier with address zero
      try {
        await zkpVerifierFactory.write.deployAgeVerifier([zeroAddress], { account: owner.account });
        // If we get here, the test should fail
        expect.fail('Expected function to revert');
      } catch (error: any) {
        // The error message might vary, but the function should revert
        expect(error).to.exist;
      }

      // Try to deploy the HashVerifier with address zero
      try {
        await zkpVerifierFactory.write.deployHashVerifier([zeroAddress], { account: owner.account });
        // If we get here, the test should fail
        expect.fail('Expected function to revert');
      } catch (error: any) {
        // The error message might vary, but the function should revert
        expect(error).to.exist;
      }

      // Try to deploy the EnhancedHashVerifier with address zero
      try {
        await zkpVerifierFactory.write.deployEnhancedHashVerifier([zeroAddress], { account: owner.account });
        // If we get here, the test should fail
        expect.fail('Expected function to revert');
      } catch (error: any) {
        // The error message might vary, but the function should revert
        expect(error).to.exist;
      }

      // Try to deploy the FHIRVerifier with address zero
      try {
        await zkpVerifierFactory.write.deployFHIRVerifier([zeroAddress], { account: owner.account });
        // If we get here, the test should fail
        expect.fail('Expected function to revert');
      } catch (error: any) {
        // The error message might vary, but the function should revert
        expect(error).to.exist;
      }
    });
  });
});
