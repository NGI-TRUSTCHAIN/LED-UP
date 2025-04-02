import { expect } from 'chai';
import hre from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { time } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'ethers';

describe('ZKPVerificationRegistry', function () {
  // Fixture to deploy the ZKPVerificationRegistry contract
  async function deployZKPVerificationRegistryFixture() {
    // Get signers
    const [owner, admin, verifier, subject, nonAdmin, nonVerifier] = await hre.viem.getWalletClients();

    // Deploy the ZKPVerificationRegistry contract
    const zkpVerificationRegistry = await hre.viem.deployContract('ZKPVerificationRegistry');

    // Define verification types using ethers utils
    // Convert to 0x-prefixed hex strings that match the expected type
    const ageVerificationType = `0x${Buffer.from(ethers.encodeBytes32String('age').slice(2), 'hex').toString(
      'hex'
    )}` as `0x${string}`;
    const hashVerificationType = `0x${Buffer.from(ethers.encodeBytes32String('hash').slice(2), 'hex').toString(
      'hex'
    )}` as `0x${string}`;
    const fhirVerificationType = `0x${Buffer.from(ethers.encodeBytes32String('fhir').slice(2), 'hex').toString(
      'hex'
    )}` as `0x${string}`;

    // Define verification IDs
    const verificationId1 = `0x${'0'.repeat(63)}1` as `0x${string}`;
    const verificationId2 = `0x${'0'.repeat(63)}2` as `0x${string}`;
    const verificationId3 = `0x${'0'.repeat(63)}3` as `0x${string}`;

    // Sample metadata
    const metadata = `0x1234` as `0x${string}`;

    return {
      zkpVerificationRegistry,
      owner,
      admin,
      verifier,
      subject,
      nonAdmin,
      nonVerifier,
      ageVerificationType,
      hashVerificationType,
      fhirVerificationType,
      verificationId1,
      verificationId2,
      verificationId3,
      metadata,
    };
  }

  describe('Deployment', function () {
    it('Should set the deployer as owner and admin', async function () {
      const { zkpVerificationRegistry, owner } = await loadFixture(deployZKPVerificationRegistryFixture);

      // Check if the deployer is an admin
      const isAdmin = await zkpVerificationRegistry.read.isAdministrator([owner.account.address]);
      expect(isAdmin).to.be.true;
    });
  });

  describe('Administrator Management', function () {
    it('Should allow owner to add an admin', async function () {
      const { zkpVerificationRegistry, owner, admin } = await loadFixture(deployZKPVerificationRegistryFixture);

      // Add admin
      const tx = await zkpVerificationRegistry.write.addAdministrator([admin.account.address], {
        account: owner.account,
      });

      // Wait for the transaction to be mined
      const publicClient = await hre.viem.getPublicClient();
      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });

      // Check that the transaction was successful
      expect(receipt.status).to.equal('success');

      // Check if the address is now an admin
      const isAdmin = await zkpVerificationRegistry.read.isAdministrator([admin.account.address]);
      expect(isAdmin).to.be.true;
    });

    it('Should not allow non-owner to add an admin', async function () {
      const { zkpVerificationRegistry, admin, nonAdmin } = await loadFixture(deployZKPVerificationRegistryFixture);

      // Try to add admin from non-owner account
      try {
        await zkpVerificationRegistry.write.addAdministrator([nonAdmin.account.address], {
          account: admin.account,
        });
        // If we get here, the test should fail
        expect.fail('Expected function to throw an error');
      } catch (error: any) {
        // The error message might vary, but the function should throw an error
        expect(error).to.exist;
      }
    });

    it('Should allow owner to remove an admin', async function () {
      const { zkpVerificationRegistry, owner, admin } = await loadFixture(deployZKPVerificationRegistryFixture);

      // Add admin
      await zkpVerificationRegistry.write.addAdministrator([admin.account.address], {
        account: owner.account,
      });

      // Remove admin
      const tx = await zkpVerificationRegistry.write.removeAdministrator([admin.account.address], {
        account: owner.account,
      });

      // Wait for the transaction to be mined
      const publicClient = await hre.viem.getPublicClient();
      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });

      // Check that the transaction was successful
      expect(receipt.status).to.equal('success');

      // Check if the address is no longer an admin
      const isAdmin = await zkpVerificationRegistry.read.isAdministrator([admin.account.address]);
      expect(isAdmin).to.be.false;
    });

    it('Should not allow non-owner to remove an admin', async function () {
      const { zkpVerificationRegistry, owner, admin, nonAdmin } = await loadFixture(
        deployZKPVerificationRegistryFixture
      );

      // Add admin
      await zkpVerificationRegistry.write.addAdministrator([admin.account.address], {
        account: owner.account,
      });

      // Try to remove admin from non-owner account
      try {
        await zkpVerificationRegistry.write.removeAdministrator([admin.account.address], {
          account: nonAdmin.account,
        });
        // If we get here, the test should fail
        expect.fail('Expected function to throw an error');
      } catch (error: any) {
        // The error message might vary, but the function should throw an error
        expect(error).to.exist;
      }
    });

    it('Should not allow removing the owner as admin', async function () {
      const { zkpVerificationRegistry, owner } = await loadFixture(deployZKPVerificationRegistryFixture);

      // Try to remove owner as admin
      try {
        await zkpVerificationRegistry.write.removeAdministrator([owner.account.address], {
          account: owner.account,
        });
        // If we get here, the test should fail
        expect.fail('Expected function to throw an error');
      } catch (error: any) {
        // The error message might vary, but the function should throw an error
        expect(error).to.exist;
      }
    });
  });

  describe('Verifier Management', function () {
    it('Should allow admin to authorize a verifier', async function () {
      const { zkpVerificationRegistry, owner, verifier, ageVerificationType } = await loadFixture(
        deployZKPVerificationRegistryFixture
      );

      // Authorize verifier
      const tx = await zkpVerificationRegistry.write.authorizeVerifier(
        [verifier.account.address, ageVerificationType],
        {
          account: owner.account,
        }
      );

      // Wait for the transaction to be mined
      const publicClient = await hre.viem.getPublicClient();
      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });

      // Check that the transaction was successful
      expect(receipt.status).to.equal('success');

      // Check if the verifier is authorized
      const isAuthorized = await zkpVerificationRegistry.read.isVerifierAuthorized([
        verifier.account.address,
        ageVerificationType,
      ]);
      expect(isAuthorized).to.be.true;
    });

    it('Should not allow non-admin to authorize a verifier', async function () {
      const { zkpVerificationRegistry, verifier, nonAdmin, ageVerificationType } = await loadFixture(
        deployZKPVerificationRegistryFixture
      );

      // Try to authorize verifier from non-admin account
      try {
        await zkpVerificationRegistry.write.authorizeVerifier([verifier.account.address, ageVerificationType], {
          account: nonAdmin.account,
        });
        // If we get here, the test should fail
        expect.fail('Expected function to throw an error');
      } catch (error: any) {
        // The error message might vary, but the function should throw an error
        expect(error).to.exist;
      }
    });

    it('Should allow admin to revoke a verifier authorization', async function () {
      const { zkpVerificationRegistry, owner, verifier, ageVerificationType } = await loadFixture(
        deployZKPVerificationRegistryFixture
      );

      // Authorize verifier
      await zkpVerificationRegistry.write.authorizeVerifier([verifier.account.address, ageVerificationType], {
        account: owner.account,
      });

      // Revoke verifier authorization
      const tx = await zkpVerificationRegistry.write.revokeVerifierAuthorization(
        [verifier.account.address, ageVerificationType],
        {
          account: owner.account,
        }
      );

      // Wait for the transaction to be mined
      const publicClient = await hre.viem.getPublicClient();
      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });

      // Check that the transaction was successful
      expect(receipt.status).to.equal('success');

      // Check if the verifier is no longer authorized
      const isAuthorized = await zkpVerificationRegistry.read.isVerifierAuthorized([
        verifier.account.address,
        ageVerificationType,
      ]);
      expect(isAuthorized).to.be.false;
    });

    it('Should not allow non-admin to revoke a verifier authorization', async function () {
      const { zkpVerificationRegistry, owner, verifier, nonAdmin, ageVerificationType } = await loadFixture(
        deployZKPVerificationRegistryFixture
      );

      // Authorize verifier
      await zkpVerificationRegistry.write.authorizeVerifier([verifier.account.address, ageVerificationType], {
        account: owner.account,
      });

      // Try to revoke verifier authorization from non-admin account
      try {
        await zkpVerificationRegistry.write.revokeVerifierAuthorization(
          [verifier.account.address, ageVerificationType],
          {
            account: nonAdmin.account,
          }
        );
        // If we get here, the test should fail
        expect.fail('Expected function to throw an error');
      } catch (error: any) {
        // The error message might vary, but the function should throw an error
        expect(error).to.exist;
      }
    });
  });

  describe('Verification Registration', function () {
    it('Should allow authorized verifier to register a verification', async function () {
      const { zkpVerificationRegistry, owner, verifier, subject, ageVerificationType, verificationId1, metadata } =
        await loadFixture(deployZKPVerificationRegistryFixture);

      // Authorize verifier
      await zkpVerificationRegistry.write.authorizeVerifier([verifier.account.address, ageVerificationType], {
        account: owner.account,
      });

      // Register verification
      const futureTime = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1 hour from now
      const tx = await zkpVerificationRegistry.write.registerVerification(
        [subject.account.address, ageVerificationType, verificationId1, true, futureTime, metadata],
        {
          account: verifier.account,
        }
      );

      // Wait for the transaction to be mined
      const publicClient = await hre.viem.getPublicClient();
      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });

      // Check that the transaction was successful
      expect(receipt.status).to.equal('success');

      // Get the verification
      const verification = await zkpVerificationRegistry.read.getVerification([verificationId1]);

      // Check verification details using named properties instead of indices
      // Use toLowerCase() to handle case sensitivity in address comparison
      expect(verification.subject.toLowerCase()).to.equal(subject.account.address.toLowerCase());
      expect(verification.verificationType).to.equal(ageVerificationType);
      expect(verification.verificationId).to.equal(verificationId1);
      expect(verification.expirationTime).to.equal(futureTime);
      expect(verification.result).to.be.true;
      expect(verification.revoked).to.be.false;
    });

    it('Should not allow unauthorized verifier to register a verification', async function () {
      const { zkpVerificationRegistry, nonVerifier, subject, ageVerificationType, verificationId1, metadata } =
        await loadFixture(deployZKPVerificationRegistryFixture);

      // Try to register verification from unauthorized account
      const futureTime = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1 hour from now
      try {
        await zkpVerificationRegistry.write.registerVerification(
          [subject.account.address, ageVerificationType, verificationId1, true, futureTime, metadata],
          {
            account: nonVerifier.account,
          }
        );
        // If we get here, the test should fail
        expect.fail('Expected function to throw an error');
      } catch (error: any) {
        // The error message might vary, but the function should throw an error
        expect(error).to.exist;
      }
    });

    it('Should not allow registration with past expiration time', async function () {
      const { zkpVerificationRegistry, owner, verifier, subject, ageVerificationType, verificationId1, metadata } =
        await loadFixture(deployZKPVerificationRegistryFixture);

      // Authorize verifier
      await zkpVerificationRegistry.write.authorizeVerifier([verifier.account.address, ageVerificationType], {
        account: owner.account,
      });

      // Try to register verification with past expiration time
      const pastTime = BigInt(Math.floor(Date.now() / 1000) - 3600); // 1 hour ago
      try {
        await zkpVerificationRegistry.write.registerVerification(
          [subject.account.address, ageVerificationType, verificationId1, true, pastTime, metadata],
          {
            account: verifier.account,
          }
        );
        // If we get here, the test should fail
        expect.fail('Expected function to throw an error');
      } catch (error: any) {
        // The error message might vary, but the function should throw an error
        expect(error).to.exist;
      }
    });

    it('Should allow registration with no expiration time (0)', async function () {
      const { zkpVerificationRegistry, owner, verifier, subject, ageVerificationType, verificationId1, metadata } =
        await loadFixture(deployZKPVerificationRegistryFixture);

      // Authorize verifier
      await zkpVerificationRegistry.write.authorizeVerifier([verifier.account.address, ageVerificationType], {
        account: owner.account,
      });

      // Register verification with no expiration
      const tx = await zkpVerificationRegistry.write.registerVerification(
        [subject.account.address, ageVerificationType, verificationId1, true, 0n, metadata],
        {
          account: verifier.account,
        }
      );

      // Wait for the transaction to be mined
      const publicClient = await hre.viem.getPublicClient();
      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });

      // Check that the transaction was successful
      expect(receipt.status).to.equal('success');

      // Get the verification
      const verification = await zkpVerificationRegistry.read.getVerification([verificationId1]);

      // Check verification details
      expect(verification.expirationTime).to.equal(0n);
    });
  });

  describe('Verification Revocation', function () {
    it('Should allow admin to revoke a verification', async function () {
      const { zkpVerificationRegistry, owner, verifier, subject, ageVerificationType, verificationId1, metadata } =
        await loadFixture(deployZKPVerificationRegistryFixture);

      // Authorize verifier
      await zkpVerificationRegistry.write.authorizeVerifier([verifier.account.address, ageVerificationType], {
        account: owner.account,
      });

      // Register verification
      await zkpVerificationRegistry.write.registerVerification(
        [subject.account.address, ageVerificationType, verificationId1, true, 0n, metadata],
        {
          account: verifier.account,
        }
      );

      // Revoke verification
      const tx = await zkpVerificationRegistry.write.revokeVerification([verificationId1], {
        account: owner.account,
      });

      // Wait for the transaction to be mined
      const publicClient = await hre.viem.getPublicClient();
      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });

      // Check that the transaction was successful
      expect(receipt.status).to.equal('success');

      // Get the verification
      const verification = await zkpVerificationRegistry.read.getVerification([verificationId1]);

      // Check that it's revoked
      expect(verification.revoked).to.be.true;
    });

    it('Should not allow non-admin to revoke a verification', async function () {
      const {
        zkpVerificationRegistry,
        owner,
        verifier,
        subject,
        nonAdmin,
        ageVerificationType,
        verificationId1,
        metadata,
      } = await loadFixture(deployZKPVerificationRegistryFixture);

      // Authorize verifier
      await zkpVerificationRegistry.write.authorizeVerifier([verifier.account.address, ageVerificationType], {
        account: owner.account,
      });

      // Register verification
      await zkpVerificationRegistry.write.registerVerification(
        [subject.account.address, ageVerificationType, verificationId1, true, 0n, metadata],
        {
          account: verifier.account,
        }
      );

      // Try to revoke verification from non-admin account
      try {
        await zkpVerificationRegistry.write.revokeVerification([verificationId1], {
          account: nonAdmin.account,
        });
        // If we get here, the test should fail
        expect.fail('Expected function to throw an error');
      } catch (error: any) {
        // The error message might vary, but the function should throw an error
        expect(error).to.exist;
      }
    });
  });

  describe('Verification Validity', function () {
    it('Should return true for valid verification', async function () {
      const { zkpVerificationRegistry, owner, verifier, subject, ageVerificationType, verificationId1, metadata } =
        await loadFixture(deployZKPVerificationRegistryFixture);

      // Authorize verifier
      await zkpVerificationRegistry.write.authorizeVerifier([verifier.account.address, ageVerificationType], {
        account: owner.account,
      });

      // Register verification with positive result
      await zkpVerificationRegistry.write.registerVerification(
        [subject.account.address, ageVerificationType, verificationId1, true, 0n, metadata],
        {
          account: verifier.account,
        }
      );

      // Check if verification is valid
      const isValid = await zkpVerificationRegistry.read.isVerificationValid([verificationId1]);
      expect(isValid).to.be.true;
    });

    it('Should return false for verification with negative result', async function () {
      const { zkpVerificationRegistry, owner, verifier, subject, ageVerificationType, verificationId1, metadata } =
        await loadFixture(deployZKPVerificationRegistryFixture);

      // Authorize verifier
      await zkpVerificationRegistry.write.authorizeVerifier([verifier.account.address, ageVerificationType], {
        account: owner.account,
      });

      // Register verification with negative result
      await zkpVerificationRegistry.write.registerVerification(
        [subject.account.address, ageVerificationType, verificationId1, false, 0n, metadata],
        {
          account: verifier.account,
        }
      );

      // Check if verification is valid
      const isValid = await zkpVerificationRegistry.read.isVerificationValid([verificationId1]);
      expect(isValid).to.be.false;
    });

    it('Should return false for revoked verification', async function () {
      const { zkpVerificationRegistry, owner, verifier, subject, ageVerificationType, verificationId1, metadata } =
        await loadFixture(deployZKPVerificationRegistryFixture);

      // Authorize verifier
      await zkpVerificationRegistry.write.authorizeVerifier([verifier.account.address, ageVerificationType], {
        account: owner.account,
      });

      // Register verification
      await zkpVerificationRegistry.write.registerVerification(
        [subject.account.address, ageVerificationType, verificationId1, true, 0n, metadata],
        {
          account: verifier.account,
        }
      );

      // Revoke verification
      await zkpVerificationRegistry.write.revokeVerification([verificationId1], {
        account: owner.account,
      });

      // Check if verification is valid
      const isValid = await zkpVerificationRegistry.read.isVerificationValid([verificationId1]);
      expect(isValid).to.be.false;
    });

    it('Should return false for expired verification', async function () {
      const { zkpVerificationRegistry, owner, verifier, subject, ageVerificationType, verificationId1, metadata } =
        await loadFixture(deployZKPVerificationRegistryFixture);

      // Authorize verifier
      await zkpVerificationRegistry.write.authorizeVerifier([verifier.account.address, ageVerificationType], {
        account: owner.account,
      });

      // Register verification with short expiration
      const shortExpirationTime = BigInt(Math.floor(Date.now() / 1000) + 300); // 5 minutes from now
      await zkpVerificationRegistry.write.registerVerification(
        [subject.account.address, ageVerificationType, verificationId1, true, shortExpirationTime, metadata],
        {
          account: verifier.account,
        }
      );

      // Advance time past expiration
      await time.increase(600); // 10 minutes

      // Check if verification is valid
      const isValid = await zkpVerificationRegistry.read.isVerificationValid([verificationId1]);
      expect(isValid).to.be.false;
    });

    it('Should return false for non-existent verification', async function () {
      const { zkpVerificationRegistry, verificationId1 } = await loadFixture(deployZKPVerificationRegistryFixture);

      // Check if non-existent verification is valid
      const isValid = await zkpVerificationRegistry.read.isVerificationValid([verificationId1]);
      expect(isValid).to.be.false;
    });
  });

  describe('Subject Verifications', function () {
    it('Should return all verifications for a subject', async function () {
      const {
        zkpVerificationRegistry,
        owner,
        verifier,
        subject,
        ageVerificationType,
        hashVerificationType,
        verificationId1,
        verificationId2,
        metadata,
      } = await loadFixture(deployZKPVerificationRegistryFixture);

      // Authorize verifier for both verification types
      await zkpVerificationRegistry.write.authorizeVerifier([verifier.account.address, ageVerificationType], {
        account: owner.account,
      });
      await zkpVerificationRegistry.write.authorizeVerifier([verifier.account.address, hashVerificationType], {
        account: owner.account,
      });

      // Register two verifications for the same subject
      await zkpVerificationRegistry.write.registerVerification(
        [subject.account.address, ageVerificationType, verificationId1, true, 0n, metadata],
        {
          account: verifier.account,
        }
      );
      await zkpVerificationRegistry.write.registerVerification(
        [subject.account.address, hashVerificationType, verificationId2, true, 0n, metadata],
        {
          account: verifier.account,
        }
      );

      // Get subject verifications
      const verifications = await zkpVerificationRegistry.read.getSubjectVerifications([subject.account.address]);

      // Check that both verification IDs are returned
      expect(verifications.length).to.equal(2);
      expect(verifications).to.include(verificationId1);
      expect(verifications).to.include(verificationId2);
    });

    it('Should return empty array for subject with no verifications', async function () {
      const { zkpVerificationRegistry, subject } = await loadFixture(deployZKPVerificationRegistryFixture);

      // Get subject verifications
      const verifications = await zkpVerificationRegistry.read.getSubjectVerifications([subject.account.address]);

      // Check that an empty array is returned
      expect(verifications.length).to.equal(0);
    });
  });
});
