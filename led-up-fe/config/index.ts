/**
 * Default configuration for the application
 * These values should be overridden in production
 */
export const defaultConfig = {
  contractAddress: (process.env.NEXT_PUBLIC_DATA_REGISTRY_CONTRACT_ADDRESS || '0x0') as `0x${string}`,
  chainId: Number(process.env.CHAIN_ID || 1),
  rpcUrl: process.env.RPC_URL || 'http://127.0.0.1:8545',
};
