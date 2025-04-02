import { ethers } from 'ethers';

// This is a fallback signer for backward compatibility
// In production, you should use the signer from the wallet client
const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
export const signer = new ethers.Wallet(
  process.env.NEXT_PUBLIC_PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000001',
  provider
);
