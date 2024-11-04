import { ethers, AlchemyProvider, InfuraProvider, JsonRpcProvider } from 'ethers';
const RPC_URL = process.env.SEPOLIA_RPC_URL || '';

const PRIVATE_KEY = process.env.PRIVATE_KEY || '';

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
export const provider =
  new AlchemyProvider('sepolia', process.env.ALCHEMY_API_KEY) ||
  new InfuraProvider('sepolia', process.env.INFURA_API_KEY) ||
  new JsonRpcProvider(RPC_URL);

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
