// SPDX-License-Identifier: MIT
// ZKPVerifiers.test.js - Test script for ZKP verifier contracts

const { expect } = require('chai');
const hre = require('hardhat');
const fs = require('fs');
const path = require('path');

describe('ZKP Verifiers', function () {
  let registry;
  let factory;
  let ageVerifierBase;
  let hashVerifierBase;
  let fhirVerifierBase;
  let ageVerifier;
  let hashVerifier;
  let fhirVerifier;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2] = await hre.viem.getWalletClients();

    // Deploy ZKPRegistry
    registry = await hre.viem.deployContract('ZKPRegistry');

    // Deploy mock verifiers for testing
    ageVerifierBase = await hre.viem.deployContract('MockZKPVerifier');
    hashVerifierBase = await hre.viem.deployContract('MockZKPVerifier');
    fhirVerifierBase = await hre.viem.deployContract('MockZKPVerifier');

    // Deploy ZKPVerifierFactory
    factory = await hre.viem.deployContract('ZKPVerifierFactory', [registry.address]);

    // Set the factory as the registry owner
    await registry.write.transferOwnership([factory.address], { account: owner.account });

    // Deploy verifiers
    const ageVerifierTx = await factory.write.deployAgeVerifier([ageVerifierBase.address], {
      account: owner.account,
    });
    const hashVerifierTx = await factory.write.deployHashVerifier([hashVerifierBase.address], {
      account: owner.account,
    });
    const fhirVerifierTx = await factory.write.deployFHIRVerifier([fhirVerifierBase.address], {
      account: owner.account,
    });

    // Get the verifier types
    const ageVerifierType = await factory.read.AGE_VERIFIER_TYPE();
    const hashVerifierType = await factory.read.HASH_VERIFIER_TYPE();
    const fhirVerifierType = await factory.read.FHIR_VERIFIER_TYPE();

    // Get the verifier addresses
    const ageVerifierAddress = await registry.read.getVerifier([ageVerifierType]);
    const hashVerifierAddress = await registry.read.getVerifier([hashVerifierType]);
    const fhirVerifierAddress = await registry.read.getVerifier([fhirVerifierType]);

    // Get the verifier contracts
    ageVerifier = await hre.viem.getContractAt('AgeVerifier', ageVerifierAddress);
    hashVerifier = await hre.viem.getContractAt('HashVerifier', hashVerifierAddress);
    fhirVerifier = await hre.viem.getContractAt('FHIRVerifier', fhirVerifierAddress);
  });

  describe('ZKPRegistry', function () {
    it('Should register verifiers correctly', async function () {
      // Get the verifier types
      const ageVerifierType = await factory.read.AGE_VERIFIER_TYPE();
      const hashVerifierType = await factory.read.HASH_VERIFIER_TYPE();
      const fhirVerifierType = await factory.read.FHIR_VERIFIER_TYPE();

      // Check that the verifiers are registered
      expect(await registry.read.isVerifierRegistered([ageVerifierType])).to.be.true;
      expect(await registry.read.isVerifierRegistered([hashVerifierType])).to.be.true;
      expect(await registry.read.isVerifierRegistered([fhirVerifierType])).to.be.true;
    });

    it('Should return the correct verifier addresses', async function () {
      // Get the verifier types
      const ageVerifierType = await factory.read.AGE_VERIFIER_TYPE();
      const hashVerifierType = await factory.read.HASH_VERIFIER_TYPE();
      const fhirVerifierType = await factory.read.FHIR_VERIFIER_TYPE();

      // Check that the verifier addresses are correct
      expect(await registry.read.getVerifier([ageVerifierType])).to.equal(ageVerifier.address);
      expect(await registry.read.getVerifier([hashVerifierType])).to.equal(hashVerifier.address);
      expect(await registry.read.getVerifier([fhirVerifierType])).to.equal(fhirVerifier.address);
    });
  });

  describe('AgeVerifier', function () {
    it('Should verify age correctly when proof is valid', async function () {
      // Set the mock verifier to return true
      await ageVerifierBase.write.setReturnValue([true]);

      // Create dummy proof parameters
      const a = [0, 0];
      const b = [
        [0, 0],
        [0, 0],
      ];
      const c = [0, 0];
      const input = 25; // Age 25

      // Verify the age
      const tx = await ageVerifier.write.verifyAge([a, b, c, input], { account: owner.account });

      // Check that the verification was successful
      const publicClient = await hre.viem.getPublicClient();
      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
      expect(receipt.status).to.equal('success');
    });

    it('Should not verify age when proof is invalid', async function () {
      // Set the mock verifier to return false
      await ageVerifierBase.write.setReturnValue([false]);

      // Create dummy proof parameters
      const a = [0, 0];
      const b = [
        [0, 0],
        [0, 0],
      ];
      const c = [0, 0];
      const input = 25; // Age 25

      // Try to verify the age
      try {
        await ageVerifier.write.verifyAge([a, b, c, input], { account: owner.account });
        expect.fail('Expected function to revert');
      } catch (error) {
        expect(error).to.exist;
      }
    });
  });

  describe('HashVerifier', function () {
    it('Should verify hash correctly when proof is valid', async function () {
      // Set the mock verifier to return true
      await hashVerifierBase.write.setReturnValue([true]);

      // Create dummy proof parameters
      const a = [0, 0];
      const b = [
        [0, 0],
        [0, 0],
      ];
      const c = [0, 0];
      const input = [0, 0]; // Hash input

      // Verify the hash
      const tx = await hashVerifier.write.verifyHash([a, b, c, input], { account: owner.account });

      // Check that the verification was successful
      const publicClient = await hre.viem.getPublicClient();
      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
      expect(receipt.status).to.equal('success');
    });

    it('Should not verify hash when proof is invalid', async function () {
      // Set the mock verifier to return false
      await hashVerifierBase.write.setReturnValue([false]);

      // Create dummy proof parameters
      const a = [0, 0];
      const b = [
        [0, 0],
        [0, 0],
      ];
      const c = [0, 0];
      const input = [0, 0]; // Hash input

      // Try to verify the hash
      try {
        await hashVerifier.write.verifyHash([a, b, c, input], { account: owner.account });
        expect.fail('Expected function to revert');
      } catch (error) {
        expect(error).to.exist;
      }
    });
  });

  describe('FHIRVerifier', function () {
    it('Should verify FHIR resource correctly when proof is valid', async function () {
      // Set the mock verifier to return true
      await fhirVerifierBase.write.setReturnValue([true]);

      // Create dummy proof parameters
      const a = [0, 0];
      const b = [
        [0, 0],
        [0, 0],
      ];
      const c = [0, 0];
      const resourceType = 0; // Patient
      const expectedHash = [0, 0];

      // Verify the FHIR resource
      const tx = await fhirVerifier.write.verifyFHIRResource([a, b, c, resourceType, expectedHash], {
        account: owner.account,
      });

      // Check that the verification was successful
      const publicClient = await hre.viem.getPublicClient();
      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
      expect(receipt.status).to.equal('success');
    });

    it('Should not verify FHIR resource when proof is invalid', async function () {
      // Set the mock verifier to return false
      await fhirVerifierBase.write.setReturnValue([false]);

      // Create dummy proof parameters
      const a = [0, 0];
      const b = [
        [0, 0],
        [0, 0],
      ];
      const c = [0, 0];
      const resourceType = 0; // Patient
      const expectedHash = [0, 0];

      // Try to verify the FHIR resource
      try {
        await fhirVerifier.write.verifyFHIRResource([a, b, c, resourceType, expectedHash], {
          account: owner.account,
        });
        expect.fail('Expected function to revert');
      } catch (error) {
        expect(error).to.exist;
      }
    });
  });
});
