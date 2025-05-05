import { ethers } from 'hardhat';
import * as hre from 'hardhat';
import path from 'path';
import * as fs from 'fs';
import { calculateAllContractAddresses, deployWithPredictedAddress, postDeploy } from './contract';

/**
 * Deploys the DataRegistry contract with all required dependencies
 *
 * The DataRegistry contract requires:
 * - A token address (ERC20 token for payments)
 * - A provider address (payable address that receives service fees)
 * - A service fee amount
 * - A DidAuth contract address (for DID-based authentication)
 */
async function main() {
  const [
    deployer,
    admin1,
    admin2,
    provider1,
    provider2,
    producer1,
    producer2,
    producer3,
    consumer1,
    consumer2,
    consumer3,
  ] = await ethers.getSigners();

  console.log({
    deployer: deployer.address,
    admin1: admin1.address,
    admin2: admin2.address,
    provider1: provider1.address,
    provider2: provider2.address,
    producer1: producer1.address,
    producer2: producer2.address,
    producer3: producer3.address,
    consumer1: consumer1.address,
    consumer2: consumer2.address,
    consumer3: consumer3.address,
  });

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('Deploying DataRegistry contract with account:', deployer.address);
  console.log('Account balance:', ethers.formatEther(balance));

  // Configuration parameters
  // In a production environment, these would typically come from environment variables
  // or a configuration file
  const serviceFee = 10n; // Service fee amount

  // Define all contracts to deploy
  const contractNames = [
    'DidRegistry',
    'ConsentManagement',
    'DidAccessControl',
    'DidVerifier',
    'DidIssuer',
    'DidAuth',
    'Token',
    'DataRegistry',
  ];

  console.log('Starting deployment of contracts...');

  // Deploy all contracts with actual addresses (not using predicted addresses)
  console.log('Deploying DidRegistry contract...');
  const { contract: didRegistry, address: actualDidRegistryAddress } = await deployWithPredictedAddress(
    deployer,
    'DidRegistry',
    []
  );
  console.log('DidRegistry deployed to:', actualDidRegistryAddress);

  console.log('Deploying ConsentManagement contract...');
  const { contract: consentManagement, address: actualConsentManagementAddress } = await deployWithPredictedAddress(
    deployer,
    'ConsentManagement',
    [actualDidRegistryAddress]
  );
  console.log('ConsentManagement deployed to:', actualConsentManagementAddress);

  // Deploy DidAuth contract with dependencies
  console.log('Deploying DidAccessControl contract...');
  const { contract: didAccessControl, address: actualDidAccessControlAddress } = await deployWithPredictedAddress(
    deployer,
    'DidAccessControl',
    [actualDidRegistryAddress]
  );
  console.log('DidAccessControl deployed to:', actualDidAccessControlAddress);

  console.log('Deploying DidVerifier contract...');
  const { contract: didVerifier, address: actualDidVerifierAddress } = await deployWithPredictedAddress(
    deployer,
    'DidVerifier',
    [actualDidRegistryAddress]
  );
  console.log('DidVerifier deployed to:', actualDidVerifierAddress);

  console.log('Deploying DidIssuer contract...');
  const { contract: didIssuer, address: actualDidIssuerAddress } = await deployWithPredictedAddress(
    deployer,
    'DidIssuer',
    [actualDidRegistryAddress]
  );
  console.log('DidIssuer deployed to:', actualDidIssuerAddress);

  console.log('Deploying DidAuth contract...');
  const { contract: didAuth, address: actualDidAuthAddress } = await deployWithPredictedAddress(deployer, 'DidAuth', [
    actualDidRegistryAddress,
    actualDidVerifierAddress,
    actualDidIssuerAddress,
    deployer.address,
  ]);
  console.log('DidAuth deployed to:', actualDidAuthAddress);

  // Deploy token contract
  console.log('Deploying token contract...');
  const { contract: token, address: actualTokenAddress } = await deployWithPredictedAddress(deployer, 'Token', []);
  console.log('Token deployed to:', actualTokenAddress);

  // Mint some tokens to the deployer for testing
  const mintAmount = ethers.parseEther('10000000000000'); // 10 billion tokens
  // Use type casting to access contract-specific methods
  await (token as any).mint(deployer.address, mintAmount);
  console.log(`Minted ${ethers.formatEther(mintAmount)} tokens to ${deployer.address}`);

  // Deploy DataRegistry contract
  console.log('Deploying DataRegistry contract...');
  const { contract: dataRegistry, address: actualDataRegistryAddress } = await deployWithPredictedAddress(
    deployer,
    'DataRegistry',
    [actualTokenAddress, deployer.address, serviceFee, actualDidAuthAddress]
  );
  console.log('DataRegistry deployed to:', actualDataRegistryAddress);

  // Get the Compensation contract address from the DataRegistry contract
  // Use type casting to access contract-specific methods
  const actualCompensationAddress = await (dataRegistry as any).getCompensationAddress();
  console.log('Compensation contract deployed to:', actualCompensationAddress);

  // Use type casting to access contract-specific methods
  await (token as any).mint(deployer.address, mintAmount);
  console.log(`Minted ${ethers.formatEther(mintAmount)} tokens to ${deployer.address}`);

  // Save the contract addresses to .env file
  const envVars = {
    DID_REGISTRY_CONTRACT_ADDRESS: actualDidRegistryAddress,
    DID_ACCESS_CONTROL_CONTRACT_ADDRESS: actualDidAccessControlAddress,
    DID_VERIFIER_CONTRACT_ADDRESS: actualDidVerifierAddress,
    DID_ISSUER_CONTRACT_ADDRESS: actualDidIssuerAddress,
    DID_AUTH_CONTRACT_ADDRESS: actualDidAuthAddress,
    TOKEN_CONTRACT_ADDRESS: actualTokenAddress,
    DATA_REGISTRY_CONTRACT_ADDRESS: actualDataRegistryAddress,
    COMPENSATION_CONTRACT_ADDRESS: actualCompensationAddress,
    CONSENT_MANAGEMENT_CONTRACT_ADDRESS: actualConsentManagementAddress,
  };

  // Path to the .env file (in the project root)
  const envFilePath = path.resolve(__dirname, '../../.env');
  const frontendEnvFilePath = path.resolve(__dirname, '../../../led-up-fe/.env.local');
  const localSettingsFilePath = path.resolve(__dirname, '../../../led-up-api/local.settings.json');

  // Check if .env file exists
  let envContent = '';
  let localSettingsContent = '';

  if (fs.existsSync(envFilePath)) {
    // Read existing .env file
    envContent = fs.readFileSync(envFilePath, 'utf8');
  }

  // Update or add each environment variable
  Object.entries(envVars).forEach(([key, value]) => {
    // Check if the variable already exists in the file
    const regex = new RegExp(`^${key}=.*`, 'gm');
    if (regex.test(envContent)) {
      // Replace existing variable
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      // Add new variable
      envContent += `\n${key}=${value}`;
    }
  });

  console.log('\nContract addresses have been saved to .env file:');
  Object.entries(envVars).forEach(([key, value]) => {
    console.log(`${key}=${value}`);
  });

  // Write the updated content back to the .env file
  fs.writeFileSync(envFilePath, envContent.trim());

  // Handle frontend .env.local file
  console.log('\nUpdating frontend .env.local file...');
  let frontendEnvContent = '';
  if (fs.existsSync(frontendEnvFilePath)) {
    frontendEnvContent = fs.readFileSync(frontendEnvFilePath, 'utf8');
  }

  // Update or add each environment variable with NEXT_PUBLIC_ prefix
  Object.entries(envVars).forEach(([key, value]) => {
    const nextPublicKey = `NEXT_PUBLIC_${key}`;
    const regex = new RegExp(`^${nextPublicKey}=.*`, 'gm');

    // Also update non-prefixed variables for backward compatibility
    const regularRegex = new RegExp(`^${key}=.*`, 'gm');

    if (regex.test(frontendEnvContent)) {
      // Replace existing NEXT_PUBLIC_ variable
      frontendEnvContent = frontendEnvContent.replace(regex, `${nextPublicKey}=${value}`);
    } else {
      // Add new NEXT_PUBLIC_ variable
      frontendEnvContent += `\n${nextPublicKey}=${value}`;
    }

    // Update or add non-prefixed version
    if (regularRegex.test(frontendEnvContent)) {
      frontendEnvContent = frontendEnvContent.replace(regularRegex, `${key}=${value}`);
    } else {
      frontendEnvContent += `\n${key}=${value}`;
    }
  });

  // Write the updated content back to the frontend .env.local file
  if (frontendEnvContent) {
    fs.writeFileSync(frontendEnvFilePath, frontendEnvContent.trim());
    console.log('Frontend .env.local file has been updated with contract addresses');
  }

  // Update local.settings.json if it exists
  if (fs.existsSync(localSettingsFilePath)) {
    try {
      console.log(`Found local.settings.json at: ${localSettingsFilePath}`);
      localSettingsContent = fs.readFileSync(localSettingsFilePath, 'utf8');
      const localSettings = JSON.parse(localSettingsContent);

      console.log('Successfully parsed local.settings.json');

      // Update the contract addresses in the Values section
      Object.entries(envVars).forEach(([key, value]) => {
        if (localSettings.Values) {
          console.log(`Updating ${key} to ${value} in local.settings.json`);
          localSettings.Values[key] = value;
        } else {
          console.log('Warning: Values section not found in local.settings.json');
        }
      });

      // Write the updated content back to the local.settings.json file
      const updatedContent = JSON.stringify(localSettings, null, 2);

      console.log(`Writing updated content to: ${localSettingsFilePath}`);
      fs.writeFileSync(localSettingsFilePath, updatedContent);

      console.log('\nContract addresses have also been updated in local.settings.json');
    } catch (error) {
      console.error('Error updating local.settings.json:', error);
      console.error('localSettingsFilePath:', localSettingsFilePath);
      if (localSettingsContent) {
        console.error('First 100 chars of localSettingsContent:', localSettingsContent.substring(0, 100));
      }
    }
  } else {
    console.log(`Warning: local.settings.json not found at ${localSettingsFilePath}`);
  }

  console.log(JSON.stringify(envVars, null, 2));

  // Verify contracts on Etherscan if not on a local network
  console.log('Verifying contracts on Etherscan...');
  // Verify contracts on Etherscan if not on a local network
  const network = await ethers.provider.getNetwork();
  const chainId = network.chainId;

  if (chainId !== 31337n && chainId !== 1337n) {
    console.log('\nVerifying contracts on Etherscan...');

    try {
      await hre.run('verify:verify', {
        address: actualDidRegistryAddress,
        constructorArguments: [],
      });
      console.log('DidRegistry verified on Etherscan');
    } catch (error) {
      console.log('Error verifying DidRegistry:', error);
    }

    try {
      await hre.run('verify:verify', {
        address: actualDidAccessControlAddress,
        constructorArguments: [actualDidRegistryAddress],
      });
      console.log('DidAccessControl verified on Etherscan');
    } catch (error) {
      console.log('Error verifying DidAccessControl:', error);
    }

    try {
      await hre.run('verify:verify', {
        address: actualDidVerifierAddress,
        constructorArguments: [actualDidRegistryAddress],
      });
      console.log('DidVerifier verified on Etherscan');
    } catch (error) {
      console.log('Error verifying DidVerifier:', error);
    }

    try {
      await hre.run('verify:verify', {
        address: actualDidIssuerAddress,
        constructorArguments: [actualDidRegistryAddress],
      });
      console.log('DidIssuer verified on Etherscan');
    } catch (error) {
      console.log('Error verifying DidIssuer:', error);
    }

    try {
      await hre.run('verify:verify', {
        address: actualDidAuthAddress,
        constructorArguments: [
          actualDidRegistryAddress,
          actualDidVerifierAddress,
          actualDidIssuerAddress,
          deployer.address,
        ],
      });
      console.log('DidAuth verified on Etherscan');
    } catch (error) {
      console.log('Error verifying DidAuth:', error);
    }

    try {
      await hre.run('verify:verify', {
        address: actualTokenAddress,
        constructorArguments: [],
      });
      console.log('Token verified on Etherscan');
    } catch (error) {
      console.log('Error verifying Token:', error);
    }

    try {
      await hre.run('verify:verify', {
        address: actualDataRegistryAddress,
        constructorArguments: [actualTokenAddress, deployer.address, serviceFee, actualDidAuthAddress],
      });
      console.log('DataRegistry verified on Etherscan');
    } catch (error) {
      console.log('Error verifying DataRegistry:', error);
    }

    try {
      await hre.run('verify:verify', {
        address: actualCompensationAddress,
        constructorArguments: [
          deployer.address, // provider
          actualTokenAddress, // token address
          deployer.address, // levea wallet (using deployer for simplicity)
          10, // service fee percent (default in Compensation contract)
          1e18, // unit price (default in Compensation contract)
          actualDidAuthAddress, // DidAuth contract address
        ],
      });
      console.log('Compensation verified on Etherscan');
    } catch (error) {
      console.log('Error verifying Compensation:', error);
    }
  }

  // Finally, call the postDeploy function with actual addresses
  await postDeploy(actualDataRegistryAddress, actualDidAuthAddress, actualDidRegistryAddress);

  return {
    didRegistry,
    didAccessControl,
    didVerifier,
    didIssuer,
    didAuth,
    token,
    dataRegistry,
    compensationAddress: actualCompensationAddress,
  };
}

// Execute as standalone script
if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

// Export for use in other scripts
export default main;
