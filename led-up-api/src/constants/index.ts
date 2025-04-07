// smart contract addresses
export const DATA_REGISTRY_CONTRACT_ADDRESS = process.env.DATA_REGISTRY_CONTRACT_ADDRESS as string;
export const COMPENSATION_CONTRACT_ADDRESS = process.env.COMPENSATION_CONTRACT_ADDRESS as string;
export const TOKEN_CONTRACT_ADDRESS = process.env.TOKEN_CONTRACT_ADDRESS as string;
export const DID_AUTH_CONTRACT_ADDRESS = process.env.DID_AUTH_CONTRACT_ADDRESS as string;
export const DID_REGISTRY_CONTRACT_ADDRESS = process.env.DID_REGISTRY_CONTRACT_ADDRESS as string;
export const DID_VERIFIER_CONTRACT_ADDRESS = process.env.DID_VERIFIER_CONTRACT_ADDRESS as string;
export const DID_ISSUER_CONTRACT_ADDRESS = process.env.DID_ISSUER_CONTRACT_ADDRESS as string;
export const DID_ACCESS_CONTROL_CONTRACT_ADDRESS = process.env
  .DID_ACCESS_CONTROL_CONTRACT_ADDRESS as string;
export const CONSENT_MANAGEMENT_CONTRACT_ADDRESS = process.env
  .CONSENT_MANAGEMENT_CONTRACT_ADDRESS as string;
export const ZKP_CONTRACT_ADDRESS = process.env.ZKP_CONTRACT_ADDRESS as string;

// blockchain sync configuration
export const MAX_BLOCKS_PER_SYNC = parseInt(process.env.MAX_BLOCKS_PER_SYNC || '100');
export const MAX_RETRY_ATTEMPTS = parseInt(process.env.MAX_RETRY_ATTEMPTS || '3');
export const RETRY_DELAY_MS = parseInt(process.env.RETRY_DELAY_MS || '2000');

// database configuration
export const DB_HOST = process.env.DB_HOST as string;
export const DB_PORT = parseInt(process.env.DB_PORT || '5432');
export const DB_USER = process.env.DB_USER as string;
export const DB_PASSWORD = process.env.DB_PASSWORD as string;
export const DB_NAME = process.env.DB_NAME as string;

// Wallet configuration
export const OWNER_ADDRESS = process.env.OWNER_ADDRESS as string;
export const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY as string;
export const PATIENT_ADDRESS = process.env.PATIENT_ADDRESS as string;
export const PATIENT_PRIVATE_KEY = process.env.PATIENT_PRIVATE_KEY as string;

// Blockchain configuration
export const RPC_URL = process.env.RPC_URL as string;
export const CHAIN_ID = parseInt(process.env.CHAIN_ID || '1337');
export const START_BLOCK = parseInt(process.env.START_BLOCK || '0');
export const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY as string;
export const INFURA_API_KEY = process.env.INFURA_API_KEY as string;

// Encryption configuration
export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY as string;
export const ENCRYPTION_ALGORITHM = process.env.ENCRYPTION_ALGORITHM as string;
export const ENCRYPTION_IV = process.env.ENCRYPTION_IV as string;
export const JWT_SECRET = process.env.JWT_SECRET as string;
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

// AZURE TABLE STORAGE
export const TABLE_ACCOUNT_ENDPOINT = process.env.TABLE_ACCOUNT_ENDPOINT as string;
export const TABLE_ACCOUNT_KEY = process.env.TABLE_ACCOUNT_KEY as string;
export const TABLE_ACCOUNT_NAME = process.env.TABLE_ACCOUNT_NAME as string;
export const TABLE_CONNECTION_STRING = process.env.TABLE_CONNECTION_STRING as string;
export const SYNC_STATE_TABLE = process.env.SYNC_STATE_TABLE as string;
export const DEFAULT_PARTITION_KEY = process.env.DEFAULT_PARTITION_KEY as string;
export const SYNC_STATE_ROW_KEY = process.env.SYNC_STATE_ROW_KEY as string;

// IPFS
export const PINATA_JWT = process.env.PINATA_JWT as string;
export const PINATA_API_KEY = process.env.PINATA_API_KEY as string;
export const PINATA_API_SECRET = process.env.PINATA_API_SECRET as string;
export const PINATA_API_JWT = process.env.PINATA_API_JWT as string;
export const IPFS_GATEWAY_URL = process.env.IPFS_GATEWAY_URL as string;
