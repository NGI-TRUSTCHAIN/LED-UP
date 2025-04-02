import { HttpRequest, InvocationContext } from '@azure/functions';

import { handler } from '../../../src/functions/auth/checkDidActive';
import { AuthService } from '../../../src/services/auth/AuthService';
import { CheckDidActiveRequest } from '../../../src/types/auth-types';

// Mock the services
jest.mock('../../../src/services/auth/AuthService');
jest.mock('../../../src/services/auth/DidAuthService');
jest.mock('../../../src/services/contracts/DidRegistryService');
jest.mock('../../../src/services/contracts/DidVerifierService');

describe('checkDidActive function integration', () => {
  let mockRequest: HttpRequest;
  let mockContext: InvocationContext;
  let mockAuthService: jest.Mocked<AuthService>;

  const testDid = 'did:ethr:0x1234567890abcdef1234567890abcdef12345678';

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock request
    mockRequest = {
      method: 'POST',
      url: 'http://localhost:7071/api/auth/did-status',
      headers: {
        authorization: 'Bearer valid-token',
      },
      query: {},
      params: {},
      json: jest.fn(),
    } as unknown as HttpRequest;

    // Create mock context
    mockContext = {
      log: jest.fn(),
      error: jest.fn(),
    } as unknown as InvocationContext;

    // Mock AuthService instance
    mockAuthService = {
      isDidActive: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    // Mock the AuthService constructor
    (AuthService as jest.Mock).mockImplementation(() => mockAuthService);
  });

  it('should return active status when DID is active', async () => {
    // Mock request body
    const mockRequestBody: CheckDidActiveRequest = {
      did: testDid,
    };
    (mockRequest.json as jest.Mock).mockResolvedValue(mockRequestBody);

    // Mock AuthService.isDidActive to return true
    mockAuthService.isDidActive.mockResolvedValue(true);

    // Call the handler
    const response = await handler(mockRequest, mockContext);

    // Verify the response
    expect(response.status).toBe(200);
    expect(response.jsonBody).toEqual({
      active: true,
    });

    // Verify service calls
    expect(mockAuthService.isDidActive).toHaveBeenCalledWith(testDid);
    expect(mockContext.log).toHaveBeenCalled();
  });

  it('should return inactive status when DID is not active', async () => {
    // Mock request body
    const mockRequestBody: CheckDidActiveRequest = {
      did: testDid,
    };
    (mockRequest.json as jest.Mock).mockResolvedValue(mockRequestBody);

    // Mock AuthService.isDidActive to return false
    mockAuthService.isDidActive.mockResolvedValue(false);

    // Call the handler
    const response = await handler(mockRequest, mockContext);

    // Verify the response
    expect(response.status).toBe(200);
    expect(response.jsonBody).toEqual({
      active: false,
    });

    // Verify service calls
    expect(mockAuthService.isDidActive).toHaveBeenCalledWith(testDid);
    expect(mockContext.log).toHaveBeenCalled();
  });

  it('should return 400 when DID is missing', async () => {
    // Mock request body with missing DID
    (mockRequest.json as jest.Mock).mockResolvedValue({});

    // Call the handler
    const response = await handler(mockRequest, mockContext);

    // Verify the response
    expect(response.status).toBe(400);
    expect(response.jsonBody).toEqual({
      error: 'Bad Request',
      message: 'DID is required',
    });

    // Verify service was not called
    expect(mockAuthService.isDidActive).not.toHaveBeenCalled();
  });

  it('should return 500 when service throws an error', async () => {
    // Mock request body
    const mockRequestBody: CheckDidActiveRequest = {
      did: testDid,
    };
    (mockRequest.json as jest.Mock).mockResolvedValue(mockRequestBody);

    // Mock AuthService.isDidActive to throw an error
    const errorMessage = 'Failed to check DID status';
    mockAuthService.isDidActive.mockRejectedValue(new Error(errorMessage));

    // Call the handler
    const response = await handler(mockRequest, mockContext);

    // Verify the response
    expect(response.status).toBe(500);
    expect(response.jsonBody).toEqual({
      error: 'Internal Server Error',
      message: errorMessage,
    });

    // Verify error was logged
    expect(mockContext.error).toHaveBeenCalled();
  });

  it('should return 401 when authorization header is missing', async () => {
    // Create a new request without authorization header
    const requestWithoutAuth = {
      ...mockRequest,
      headers: {},
    } as unknown as HttpRequest;

    // Mock request body
    const mockRequestBody: CheckDidActiveRequest = {
      did: testDid,
    };
    (requestWithoutAuth.json as jest.Mock).mockResolvedValue(mockRequestBody);

    // Call the handler
    const response = await handler(requestWithoutAuth, mockContext);

    // Verify the response
    expect(response.status).toBe(401);
    expect(response.jsonBody).toEqual({
      error: 'Unauthorized',
      message: 'Authorization header is required',
    });

    // Verify service was not called
    expect(mockAuthService.isDidActive).not.toHaveBeenCalled();
  });

  it('should handle contract interaction errors gracefully', async () => {
    // Mock request body
    const mockRequestBody: CheckDidActiveRequest = {
      did: testDid,
    };
    (mockRequest.json as jest.Mock).mockResolvedValue(mockRequestBody);

    // Mock AuthService.isDidActive to propagate a contract error
    mockAuthService.isDidActive.mockRejectedValue(new Error('Contract interaction failed'));

    // Call the handler
    const response = await handler(mockRequest, mockContext);

    // Verify the response
    expect(response.status).toBe(500);
    expect(response.jsonBody).toEqual({
      error: 'Internal Server Error',
      message: 'Contract interaction failed',
    });

    // Verify error was logged
    expect(mockContext.error).toHaveBeenCalled();
  });
});
