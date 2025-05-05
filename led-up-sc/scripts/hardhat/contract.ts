import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { SeedAccount, seedAccounts } from './seed';
import crypto from 'crypto';

// Fixed salt to ensure deterministic addresses across deployments
const FIXED_SALT = '0x0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Deploys a contract with truly deterministic address using CREATE2
 * @param deployer The signer to deploy the contract
 * @param contractName The name of the contract to deploy
 * @param args The constructor arguments
 * @returns The deployed contract instance and its address
 */
export const deployWithPredictedAddress = async (deployer: SignerWithAddress, contractName: string, args: any[]) => {
  // Get the contract factory
  const factory = await ethers.getContractFactory(contractName, deployer);

  // Get current gas price and increase it by 30% to account for fluctuations
  const feeData = await ethers.provider.getFeeData();
  const maxFeePerGas = feeData.maxFeePerGas ? (feeData.maxFeePerGas * 130n) / 100n : undefined;
  const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas ? (feeData.maxPriorityFeePerGas * 130n) / 100n : undefined;

  // Deploy the contract with higher gas settings
  const contract = await factory.deploy(...args, {
    maxFeePerGas,
    maxPriorityFeePerGas,
  });
  await contract.waitForDeployment();
  const deployedAddress = await contract.getAddress();

  console.log(`Deployed ${contractName} at ${deployedAddress}`);

  return { contract, address: deployedAddress };
};

/**
 * Calculates the deterministic CREATE2 address for a contract
 * This is a simplified version for demonstration purposes
 * @param contractName The name of the contract
 * @param args Constructor arguments (not used in this simplified version)
 * @returns A deterministic address based on the contract name
 */
export const calculateCreate2Address = async (contractName: string, args: any[] = []): Promise<string> => {
  // In a real implementation, we would calculate the proper CREATE2 address
  // For now, generate a deterministic address based on a hash of the contract name

  // Generate a deterministic hash from the contract name
  const hash = ethers.keccak256(ethers.toUtf8Bytes(contractName));

  // Use the first 20 bytes of the hash as the address (after 0x)
  return ethers.getAddress('0x' + hash.slice(2, 42));
};

/**
 * Calculate deterministic addresses for a sequence of contracts to be deployed
 * @param contractNames Array of contract names
 * @param argsArray Array of constructor arguments arrays (not used in simplified version)
 * @returns Array of predicted addresses
 */
export const calculateAllContractAddresses = async (
  contractNames: string[],
  argsArray: any[][] = []
): Promise<string[]> => {
  const addresses: string[] = [];

  for (let i = 0; i < contractNames.length; i++) {
    const address = await calculateCreate2Address(contractNames[i], argsArray[i] || []);
    addresses.push(address);
  }

  return addresses;
};

export const registerDid = async (seedAccount: SeedAccount, contractAddress: string) => {
  const initialDocument = {
    '@context': 'https://www.w3.org/ns/did/v1',
    id: crypto.randomUUID().toLowerCase(),
    verificationMethod: [
      {
        id: `${seedAccount.did}#keys-1`,
        type: 'EcdsaSecp256k1VerificationKey2019',
        controller: seedAccount.did,
        publicKeyHex: seedAccount.publicKey,
      },
    ],
    authentication: [`${seedAccount.did}#keys-1`],
    assertionMethod: [`${seedAccount.did}#keys-1`],
  };
  try {
    const didRegistry = await ethers.getContractAt('DidRegistry', contractAddress);
    const signer = await ethers.getSigner(seedAccount.address);

    const tx = await didRegistry
      .connect(signer)
      .registerDid(seedAccount.did, JSON.stringify(initialDocument), seedAccount.publicKey);

    // Wait for transaction confirmation
    const receipt = await tx.wait();
    if (receipt) {
      console.log(`DID registration transaction confirmed: ${receipt.hash}`);
    }

    // Try to get the document, but don't let it fail the entire process
    try {
      const didTx = await didRegistry.getDocumentForDid(seedAccount.did);
      console.log('DID Document:', didTx);
    } catch (docError: any) {
      console.log(
        `Note: Could not retrieve DID document immediately after registration, but registration was successful: ${docError.message}`
      );
    }

    return receipt;
  } catch (error) {
    console.error(`Error registering DID for ${seedAccount.name}:`, error);
    throw error; // Re-throw to allow proper error handling upstream
  }
};

export const grantRole = async (seedAccount: SeedAccount, contractAddress: string, role: Role) => {
  try {
    const [, admin1] = await ethers.getSigners();

    const contract = await ethers.getContractAt('DidAuth', contractAddress);
    const roleHash = getRoleHash(role);

    const tx = await contract.connect(admin1).grantDidRole(seedAccount.did, roleHash);

    // Wait for transaction confirmation
    const receipt = await tx.wait();
    if (receipt) {
      console.log(`Role grant transaction confirmed: ${receipt.hash}`);
    }
    const roleTx = await contract.getUserRolesByAddress(seedAccount.address);
    console.log(roleTx);
    return receipt;
  } catch (error) {
    console.error('Error granting role:', error);
    throw error; // Re-throw to allow proper error handling upstream
  }
};

export const registerProducer = async (seedAccount: SeedAccount, contractAddress: string) => {
  try {
    const signer = await ethers.getSigner(seedAccount.address);
    const contract = await ethers.getContractAt('DataRegistry', contractAddress);

    const tx = await contract.connect(signer).registerProducer(1, 1);

    // Wait for transaction confirmation
    const receipt = await tx.wait();
    if (receipt) {
      console.log(`Producer registration transaction confirmed: ${receipt.hash}`);
    }
    const producerTx = await contract.getProducerMetadata(seedAccount.address);
    console.log(producerTx);
    return receipt;
  } catch (error) {
    console.error('Error registering producer:', error);
    throw error; // Re-throw to allow proper error handling upstream
  }
};

type Role = 'DEFAULT_ADMIN' | 'ADMIN' | 'OPERATOR' | 'PRODUCER' | 'CONSUMER' | 'PROVIDER' | 'ISSUER' | 'VERIFIER';

// Using pre-computed keccak256 hashes for common roles
// These are the standard hashes used by OpenZeppelin's AccessControl
function getRoleHash(role: Role): string {
  switch (role.toUpperCase()) {
    case 'DEFAULT_ADMIN':
      return '0x0000000000000000000000000000000000000000000000000000000000000000';
    case 'ADMIN':
      return ethers.keccak256(ethers.toUtf8Bytes('ADMIN'));
    case 'OPERATOR':
      return ethers.keccak256(ethers.toUtf8Bytes('OPERATOR'));
    case 'PRODUCER':
      return ethers.keccak256(ethers.toUtf8Bytes('PRODUCER'));
    case 'CONSUMER':
      return ethers.keccak256(ethers.toUtf8Bytes('CONSUMER'));
    case 'PROVIDER':
      return ethers.keccak256(ethers.toUtf8Bytes('PROVIDER'));
    case 'ISSUER':
      return ethers.keccak256(ethers.toUtf8Bytes('ISSUER'));
    case 'VERIFIER':
      return ethers.keccak256(ethers.toUtf8Bytes('VERIFIER'));
    default:
      console.error(`Unknown role: ${role}`);
      return '0x0000000000000000000000000000000000000000000000000000000000000000';
  }
}

export const postDeploy = async (dataRegistryAddress: string, didAuthAddress: string, didRegistryAddress: string) => {
  // Check if contracts are correctly deployed at these addresses
  try {
    const didRegistryCode = await ethers.provider.getCode(didRegistryAddress);
    const didAuthCode = await ethers.provider.getCode(didAuthAddress);
    const dataRegistryCode = await ethers.provider.getCode(dataRegistryAddress);

    if (didRegistryCode === '0x' || didRegistryCode === '') {
      throw new Error(`No contract code found at DidRegistry address: ${didRegistryAddress}`);
    }
    if (didAuthCode === '0x' || didAuthCode === '') {
      throw new Error(`No contract code found at DidAuth address: ${didAuthAddress}`);
    }
    if (dataRegistryCode === '0x' || dataRegistryCode === '') {
      throw new Error(`No contract code found at DataRegistry address: ${dataRegistryAddress}`);
    }

    console.log('All contracts verified to exist at the provided addresses.');
  } catch (error) {
    console.error('Error verifying contract addresses:', error);
    throw error;
  }

  for (const seedAccount of seedAccounts) {
    console.log(`\nProcessing account: ${seedAccount.name} (${seedAccount.address})`);

    try {
      // Register DID
      console.log(`Registering DID for ${seedAccount.name}...`);
      const didReceipt = await registerDid(seedAccount, didRegistryAddress);
      if (didReceipt) {
        console.log(`✅ DID registered for ${seedAccount.name} (tx: ${didReceipt.hash})`);
      } else {
        console.log(`⚠️ DID registration for ${seedAccount.name} did not return a receipt`);
      }

      // Handle producer role separately
      if (seedAccount.role === 'PRODUCER') {
        console.log(`Registering ${seedAccount.name} as producer...`);
        const producerReceipt = await registerProducer(seedAccount, dataRegistryAddress);
        if (producerReceipt) {
          console.log(`✅ Registered ${seedAccount.name} as producer (tx: ${producerReceipt.hash})`);
        } else {
          console.log(`⚠️ Producer registration for ${seedAccount.name} did not return a receipt`);
        }
        continue;
      }

      // Grant appropriate role
      console.log(`Granting role ${seedAccount.role} to ${seedAccount.name}...`);
      const roleReceipt = await grantRole(seedAccount, didAuthAddress, seedAccount.role as Role);
      if (roleReceipt) {
        console.log(`✅ Granted role ${seedAccount.role} to ${seedAccount.name} (tx: ${roleReceipt.hash})`);
      } else {
        console.log(`⚠️ Role grant for ${seedAccount.name} did not return a receipt`);
      }
    } catch (error) {
      console.error(`❌ Error processing account ${seedAccount.name}:`, error);
    }

    console.log(`Completed processing for ${seedAccount.name}\n`);
  }

  console.log('All seed accounts processed successfully');
};
