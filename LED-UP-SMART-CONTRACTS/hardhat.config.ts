import { HardhatUserConfig, task } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomicfoundation/hardhat-foundry';
import 'hardhat-circom';
import 'hardhat-docgen';

import dotenv from 'dotenv';
dotenv.config();

// sample command: npx hardhat accounts --network sepolia
task('accounts', 'Prints the list of accounts', async (_, { ethers }) => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// sample command
// npx hardhat balance 0x7bE129dc9F7715f51D459c36bB127Cc2FaE98B32 --network sepolia
task('balance', "Prints an account's balance")
  .addPositionalParam('account', 'The account to print balance for')
  .setAction(async (taskArgs, { ethers }) => {
    const balance = await ethers.provider.getBalance(taskArgs.account);
    console.log(ethers.formatEther(balance), 'ETH');
  });

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.24',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: '0.8.20',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      chainId: 1337,
    },
    sepolia: {
      chainId: 11155111,
      url: process.env.SEPOLIA_RPC_URL as string,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  circom: {
    inputBasePath: '.circuits',
    ptau: 'https://storage.googleapis.com/zkevm/ptau/powersOfTau28_hez_final_15.ptau',
    circuits: [{ name: 'ageVerifier' }],
  },
  docgen: {
    path: './docs',
    clear: true,
    runOnCompile: true,
  },
};

export default config;
