import { ethers, AlchemyProvider, InfuraProvider, JsonRpcProvider } from 'ethers';
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || '';
const INFURA_API_KEY = process.env.INFURA_API_KEY || '';
const RPC_URL = process.env.RPC_URL || '';

const PRIVATE_KEY = process.env.PRIVATE_KEY || '';

/**
 * Retrieves the RPC URL for connecting to the Ethereum blockchain.
 *
 * Priority is given to the following sources in order:
 * 1. Custom RPC URL from the environment variable `RPC_URL`.
 * 2. Alchemy service using the `ALCHEMY_API_KEY` for the Sepolia test network.
 * 3. Infura service using the `INFURA_API_KEY` for the Sepolia test network.
 *
 * @returns {string} The URL for the RPC endpoint.
 */
const getRpcUrl = () => {
  if (RPC_URL) {
    return RPC_URL;
  } else if (ALCHEMY_API_KEY) {
    return `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
  } else if (INFURA_API_KEY) {
    return `https://sepolia.infura.io/v3/${INFURA_API_KEY}`;
  }
};

/**
 * Initializes a provider for interacting with the Ethereum blockchain, prioritizing
 * Alchemy, followed by Infura, and finally falling back to a custom JSON-RPC provider.
 *
 * This provider will be used to connect to the Sepolia test network. The environment variables
 * `ALCHEMY_API_KEY`, `INFURA_API_KEY`, and `RPC_URL` are required for accessing their respective
 * services.
 *
 * @const {Provider} provider - The initialized Ethereum provider.
 *
 * @example
 * // Usage example:
 * const blockNumber = await provider.getBlockNumber();
 * console.log('Current block number:', blockNumber);
 */
export const provider = new JsonRpcProvider(getRpcUrl());

/**
 * Creates a wallet instance using the private key.
 *
 * The wallet is initialized with the `PRIVATE_KEY` environment variable, allowing the wallet to
 * sign transactions and messages, interact with smart contracts, and manage an Ethereum address.
 *
 * @const {Wallet} wallet - The wallet instance created from the private key.
 *
 * @example
 * // Usage example:
 * const balance = await wallet.getBalance();
 * console.log('Wallet balance:', ethers.utils.formatEther(balance));
 */
export const wallet = new ethers.Wallet(PRIVATE_KEY);
