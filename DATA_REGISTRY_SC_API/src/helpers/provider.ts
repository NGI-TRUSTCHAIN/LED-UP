import { ethers, AlchemyProvider, InfuraProvider, JsonRpcProvider } from 'ethers';
const RPC_URL = process.env.SEPOLIA_RPC_URL || '';

const PRIVATE_KEY = process.env.PRIVATE_KEY || '';

export const provider =
  new AlchemyProvider('sepolia', process.env.ALCHEMY_API_KEY) ||
  new InfuraProvider('sepolia', process.env.INFURA_API_KEY) ||
  new JsonRpcProvider(RPC_URL);

export const wallet = new ethers.Wallet(PRIVATE_KEY);
