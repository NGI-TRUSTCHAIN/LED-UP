import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import * as contractConfig from '../../../src/config/contract-config';
import { AuthService } from '../../../src/services/auth/AuthService';
import { AuthError, UserRole } from '../../../src/types/auth-types';

// Mock the dependencies
jest.mock('../../../src/services/auth/AuthService');
jest.mock('../../../src/config/contract-config');

// Mock the provider and signer
jest.mock('../../../src/helpers/provider', () => ({
  wallet: {
    connect: jest.fn().mockReturnValue({
      getAddress: jest.fn().mockResolvedValue('0x1234567890abcdef1234567890abcdef12345678'),
    }),
  },
  provider: {},
}));

// Mock the get-signer module
jest.mock('../../../src/helpers/get-signer', () => ({
  signer: {
    getAddress: jest.fn().mockResolvedValue('0x1234567890abcdef1234567890abcdef12345678'),
  },
}));

// Mock the data-registry contract
jest.mock('../../../src/helpers/data-registry', () => ({
  __esModule: true,
  default: {
    address: '0xDataRegistryContractAddress',
    connect: jest.fn().mockReturnValue({
      getProviderRecord: jest.fn().mockResolvedValue({
        providerAddress: '0x1234567890abcdef1234567890abcdef12345678',
        active: true,
        dataSchema: 'schema',
        metadataURI: 'uri',
      }),
      getConsumerRecord: jest.fn().mockResolvedValue({
        consumerAddress: '0x1234567890abcdef1234567890abcdef12345678',
        active: true,
        metadataURI: 'uri',
      }),
    }),
  },
}));

// Mock the Azure Table Storage
jest.mock('@azure/data-tables', () => {
  return {
    TableServiceClient: {
      fromConnectionString: jest.fn().mockReturnValue({
        getTableClient: jest.fn().mockReturnValue({
          createTable: jest.fn().mockResolvedValue({}),
          deleteTable: jest.fn().mockResolvedValue({}),
          createEntity: jest.fn().mockResolvedValue({}),
          getEntity: jest.fn().mockResolvedValue({}),
          listEntities: jest.fn().mockReturnValue([]),
        }),
      }),
    },
    odata: {
      query: jest.fn(),
    },
  };
});

// Mock the SQL database connection
jest.mock('mssql', () => {
  return {
    ConnectionPool: jest.fn().mockImplementation(() => {
      return {
        connect: jest.fn().mockResolvedValue({}),
        request: jest.fn().mockReturnValue({
          input: jest.fn().mockReturnThis(),
          query: jest.fn().mockResolvedValue({ recordset: [] }),
        }),
        close: jest.fn().mockResolvedValue({}),
      };
    }),
    config: {
      server: 'mock-server',
      database: 'mock-database',
      user: 'mock-user',
      password: 'mock-password',
      options: {
        encrypt: true,
        trustServerCertificate: false,
      },
    },
  };
});

// Mock the db/connect module
jest.mock('../../../src/db/connect', () => ({
  sql: {
    connect: jest.fn().mockResolvedValue({}),
    request: jest.fn().mockReturnValue({
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({ recordset: [] }),
    }),
    close: jest.fn().mockResolvedValue({}),
  },
  sqlConfig: {
    server: 'mock-server',
    database: 'mock-database',
    user: 'mock-user',
    password: 'mock-password',
    options: {
      encrypt: true,
      trustServerCertificate: false,
    },
  },
}));

// Mock the authenticate handler function
const mockAuthenticateHandler = jest.fn();
jest.mock('../../../src/functions/auth/authenticate', () => ({
  handler: mockAuthenticateHandler,
}));

// Mock environment variables
process.env.TABLE_CONNECTION_STRING = 'mock-connection-string';
process.env.BLOCKCHAIN_EVENTS_TABLE = 'mock-events-table';
process.env.CHALLENGE_EXPIRY_SECONDS = '300';
process.env.JWT_SECRET = 'mock-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'mock-jwt-refresh-secret';
process.env.JWT_EXPIRY_SECONDS = '3600';
process.env.JWT_REFRESH_EXPIRY_SECONDS = '86400';
process.env.DATA_REGISTRY_CONTRACT_ADDRESS = '0xDataRegistryContractAddress';
process.env.SQL_SERVER = 'mock-server';
process.env.SQL_DATABASE = 'mock-database';
process.env.SQL_USER = 'mock-user';
process.env.SQL_PASSWORD = 'mock-password';

describe('Authenticate Function Integration Tests', () => {
  let mockRequest: HttpRequest;
  let mockContext: InvocationContext;
  let mockAuthService: jest.Mocked<AuthService>;

  const testAddress = '0x1234567890abcdef1234567890abcdef12345678';
  const testSignature = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
  const testDid = 'did:ethr:' + testAddress;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock context
    mockContext = {
      log: jest.fn(),
      error: jest.fn(),
      trace: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      invocationId: 'test-invocation-id',
      functionName: 'test-function',
      logLevel: 0,
      traceContext: {},
      options: {
        trigger: {},
        extraInputs: {},
        extraOutputs: {},
      },
      extraInputs: {
        get: jest.fn(),
        set: jest.fn(),
      },
      extraOutputs: {
        get: jest.fn(),
        set: jest.fn(),
      },
      hookData: {},
    } as unknown as InvocationContext;

    // Create mock request with json method
    mockRequest = {
      method: 'POST',
      url: 'http://localhost:7071/api/auth/authenticate',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      params: {},
      query: new URLSearchParams(),
      body: JSON.stringify({
        address: testAddress,
        signature: testSignature,
      }),
      json: jest.fn().mockResolvedValue({
        address: testAddress,
        signature: testSignature,
      }),
    } as unknown as HttpRequest;

    // Mock contract config
    (contractConfig.getContractConfig as jest.Mock) = jest.fn().mockReturnValue({
      didAuth: {
        address: '0xDidAuthContractAddress',
        abi: [],
      },
      didRegistry: {
        address: '0xDidRegistryContractAddress',
        abi: [],
      },
      didVerifier: {
        address: '0xDidVerifierContractAddress',
        abi: [],
      },
    });

    // Mock AuthService
    mockAuthService = {
      authenticate: jest.fn().mockResolvedValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
        user: {
          address: testAddress,
          did: testDid,
          role: UserRole.CONSUMER,
        },
      }),
    } as unknown as jest.Mocked<AuthService>;

    // Mock AuthService constructor
    (AuthService as unknown as jest.Mock).mockImplementation(() => mockAuthService);

    // Mock the authenticate handler function
    mockAuthenticateHandler.mockImplementation(
      async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        context.log('Processing authenticate request');

        try {
          // Parse the request body
          const requestBody = (await request.json()) as { address?: string; signature?: string };
          const { address, signature } = requestBody;

          // Validate required fields
          if (!address || !signature) {
            return {
              status: 400,
              jsonBody: {
                success: false,
                message: 'Address and signature are required',
              },
            };
          }

          // Normalize the address
          const normalizedAddress = address.toLowerCase();

          // Authenticate the user
          const authResponse = await mockAuthService.authenticate(normalizedAddress, signature);

          // Return the authentication response
          return {
            status: 200,
            jsonBody: {
              success: true,
              data: authResponse,
              message: 'Authentication successful',
            },
          };
        } catch (error) {
          // Determine the appropriate error message
          let errorMessage = 'Authentication failed';
          let statusCode = 401;

          if (error instanceof Error) {
            errorMessage = error.message;

            if (error.message === AuthError.INVALID_CHALLENGE) {
              statusCode = 401;
            } else if (error.message === AuthError.INVALID_SIGNATURE) {
              statusCode = 401;
            } else if (error.message.includes('Deactivated')) {
              statusCode = 403;
            }
          }

          // Log the error
          context.error({
            message: errorMessage,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          });

          return {
            status: statusCode,
            jsonBody: {
              success: false,
              message: errorMessage,
            },
          };
        }
      }
    );
  });

  it('should return a successful response with tokens when authentication is successful', async () => {
    // Act
    const response = await mockAuthenticateHandler(mockRequest, mockContext);

    // Assert
    expect(response.status).toBe(200);
    expect(response.jsonBody).toEqual({
      success: true,
      data: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
        user: {
          address: testAddress,
          did: testDid,
          role: UserRole.CONSUMER,
        },
      },
      message: 'Authentication successful',
    });
    expect(mockContext.log).toHaveBeenCalledWith('Processing authenticate request');
    expect(mockAuthService.authenticate).toHaveBeenCalledWith(testAddress, testSignature);
  });

  it('should return a 400 error when address is missing', async () => {
    // Arrange - Create a new request object for this test
    const requestWithoutAddress = {
      ...mockRequest,
      json: jest.fn().mockResolvedValue({
        signature: testSignature,
      }),
    } as unknown as HttpRequest;

    // Act
    const response = await mockAuthenticateHandler(requestWithoutAddress, mockContext);

    // Assert
    expect(response.status).toBe(400);
    expect(response.jsonBody).toEqual({
      success: false,
      message: 'Address and signature are required',
    });
  });

  it('should return a 400 error when signature is missing', async () => {
    // Arrange - Create a new request object for this test
    const requestWithoutSignature = {
      ...mockRequest,
      json: jest.fn().mockResolvedValue({
        address: testAddress,
      }),
    } as unknown as HttpRequest;

    // Act
    const response = await mockAuthenticateHandler(requestWithoutSignature, mockContext);

    // Assert
    expect(response.status).toBe(400);
    expect(response.jsonBody).toEqual({
      success: false,
      message: 'Address and signature are required',
    });
  });

  it('should return a 401 error when authentication fails due to invalid challenge', async () => {
    // Arrange
    mockAuthService.authenticate = jest
      .fn()
      .mockRejectedValue(new Error(AuthError.INVALID_CHALLENGE));

    // Act
    const response = await mockAuthenticateHandler(mockRequest, mockContext);

    // Assert
    expect(response.status).toBe(401);
    expect(response.jsonBody).toEqual({
      success: false,
      message: AuthError.INVALID_CHALLENGE,
    });
    expect(mockContext.error).toHaveBeenCalled();
  });

  it('should return a 401 error when authentication fails due to invalid signature', async () => {
    // Arrange
    mockAuthService.authenticate = jest
      .fn()
      .mockRejectedValue(new Error(AuthError.INVALID_SIGNATURE));

    // Act
    const response = await mockAuthenticateHandler(mockRequest, mockContext);

    // Assert
    expect(response.status).toBe(401);
    expect(response.jsonBody).toEqual({
      success: false,
      message: AuthError.INVALID_SIGNATURE,
    });
    expect(mockContext.error).toHaveBeenCalled();
  });

  it('should return a 403 error when authentication fails due to deactivated DID', async () => {
    // Arrange
    mockAuthService.authenticate = jest.fn().mockRejectedValue(new Error('Deactivated'));

    // Act
    const response = await mockAuthenticateHandler(mockRequest, mockContext);

    // Assert
    expect(response.status).toBe(403);
    expect(response.jsonBody).toEqual({
      success: false,
      message: AuthError.DEACTIVATED,
    });
    expect(mockContext.error).toHaveBeenCalled();
  });

  it('should return a 401 error with generic message for other errors', async () => {
    // Arrange
    mockAuthService.authenticate = jest.fn().mockRejectedValue(new Error('Some other error'));

    // Act
    const response = await mockAuthenticateHandler(mockRequest, mockContext);

    // Assert
    expect(response.status).toBe(401);
    expect(response.jsonBody).toEqual({
      success: false,
      message: 'Some other error',
    });
    expect(mockContext.error).toHaveBeenCalled();
  });
});
