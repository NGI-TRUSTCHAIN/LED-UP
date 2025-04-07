process.env.NODE_ENV = 'test';

// Global test timeout
jest.setTimeout(30000);

// Mock SQL Server
jest.mock('mssql', () => ({
  ConnectionPool: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue({}),
    request: jest.fn().mockReturnValue({
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({ recordset: [] }),
    }),
    close: jest.fn(),
  })),
  config: {
    server: 'localhost',
    database: 'testdb',
    user: 'testuser',
    password: 'testpassword',
    options: {
      encrypt: true,
      trustServerCertificate: true,
    },
  },
}));

// Mock Azure Table Storage
jest.mock('@azure/data-tables', () => ({
  TableServiceClient: {
    fromConnectionString: jest.fn().mockReturnValue({
      getTableClient: jest.fn().mockReturnValue({
        createTable: jest.fn(),
        deleteTable: jest.fn(),
        createEntity: jest.fn(),
        getEntity: jest.fn(),
        listEntities: jest.fn().mockReturnValue([]),
      }),
    }),
  },
}));

// Mock contract constants
jest.mock('../src/constants', () => ({
  DATA_REGISTRY_CONTRACT_ADDRESS: '0x1234567890abcdef1234567890abcdef12345678',
  DID_REGISTRY_CONTRACT_ADDRESS: '0x1234567890abcdef1234567890abcdef12345678',
  DID_AUTH_CONTRACT_ADDRESS: '0x1234567890abcdef1234567890abcdef12345678',
  DID_VERIFIER_CONTRACT_ADDRESS: '0x1234567890abcdef1234567890abcdef12345678',
  DID_ISSUER_CONTRACT_ADDRESS: '0x1234567890abcdef1234567890abcdef12345678',
  DID_ACCESS_CONTROL_CONTRACT_ADDRESS: '0x1234567890abcdef1234567890abcdef12345678',
  COMPENSATION_CONTRACT_ADDRESS: '0x1234567890abcdef1234567890abcdef12345678',
  CONSENT_MANAGEMENT_CONTRACT_ADDRESS: '0x1234567890abcdef1234567890abcdef12345678',
  TOKEN_CONTRACT_ADDRESS: '0x1234567890abcdef1234567890abcdef12345678',
}));

// Mock contract helpers
jest.mock('../src/helpers/data-registry', () => ({
  __esModule: true,
  default: {
    on: jest.fn(),
    filters: {
      DataRegistered: jest.fn(),
      DataUpdated: jest.fn(),
      DataDeleted: jest.fn(),
    },
  },
}));

// Mock the database connection
jest.mock('../src/services/db/connect', () => ({
  sql: {
    connect: jest.fn().mockResolvedValue({}),
    close: jest.fn(),
    request: jest.fn().mockReturnValue({
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({ recordset: [] }),
    }),
  },
  connectToDatabase: jest.fn().mockResolvedValue({}),
}));

// Mock the blockchain provider and wallet
jest.mock('../src/helpers/provider', () => ({
  wallet: {
    address: '0x1234567890abcdef1234567890abcdef12345678',
    connect: jest.fn().mockReturnThis(),
  },
  provider: {
    getNetwork: jest.fn().mockResolvedValue({ chainId: 1 }),
    getBlockNumber: jest.fn().mockResolvedValue(1000000),
    getGasPrice: jest.fn().mockResolvedValue(ethers.parseUnits('10', 'gwei')),
    getBalance: jest.fn().mockResolvedValue(ethers.parseEther('10')),
    listAccounts: jest.fn().mockResolvedValue(['0x1234567890abcdef1234567890abcdef12345678']),
    send: jest.fn().mockResolvedValue({}),
  },
}));

// Mock the signer
jest.mock('../src/helpers/get-signer', () => ({
  signer: {
    address: '0x1234567890abcdef1234567890abcdef12345678',
    getAddress: jest.fn().mockResolvedValue('0x1234567890abcdef1234567890abcdef12345678'),
    signMessage: jest.fn().mockResolvedValue('0xmocksignature'),
    connect: jest.fn().mockReturnThis(),
  },
}));

// Mock the auth middleware
jest.mock('../src/helpers/auth-middleware', () => {
  const originalModule = jest.requireActual('../src/helpers/auth-middleware');

  return {
    ...originalModule,
    authMiddleware: jest.fn().mockImplementation(request => {
      // Get the authorization header
      const authHeader = request.headers.authorization || request.headers.get?.('authorization');

      // Check if the authorization header exists
      if (!authHeader) {
        return {
          status: 401,
          jsonBody: {
            error: 'Unauthorized',
            message: 'Authorization header is required',
          },
        };
      }

      // Authentication successful
      return null;
    }),
    getUser: jest.fn().mockImplementation(request => {
      // Get the authorization header
      const authHeader = request.headers.authorization || request.headers.get?.('authorization');

      // Check if the authorization header exists
      if (!authHeader) {
        return null;
      }

      // Return a mock user
      return {
        address: '0x1234567890abcdef1234567890abcdef12345678',
        role: 'consumer',
        did: 'did:ethr:0x1234567890abcdef1234567890abcdef12345678',
      };
    }),
  };
});

// Import ethers for use in mocks
import { ethers } from 'ethers';
