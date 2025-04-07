import { HttpRequest, InvocationContext } from '@azure/functions';

import { handler } from '../../../src/functions/auth/authenticate';
import { AuthService } from '../../../src/services/auth/AuthService';
import { AuthRequest, AuthResponse, UserRole } from '../../../src/types/auth-types';
import * as challengeStore from '../../../src/utils/challenge-store';

// Mock the challenge store
jest.mock('../../../src/utils/challenge-store');

// Mock the services
jest.mock('../../../src/services/auth/AuthService');
jest.mock('../../../src/services/auth/DidAuthService');
jest.mock('../../../src/services/contracts/DidRegistryService');
jest.mock('../../../src/services/contracts/DidVerifierService');

describe('authenticate function integration', () => {
  let mockRequest: HttpRequest;
  let mockContext: InvocationContext;
  let mockAuthService: jest.Mocked<AuthService>;

  const testAddress = '0x1234567890abcdef1234567890abcdef12345678';
  const testSignature = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
  const testDid = 'did:ethr:' + testAddress;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock request with json method already mocked
    mockRequest = {
      method: 'POST',
      url: 'http://localhost:7071/api/auth/authenticate',
      headers: {},
      query: {},
      params: {},
      json: jest.fn().mockResolvedValue({}),
    } as unknown as HttpRequest;

    // Create mock context
    mockContext = {
      log: jest.fn(),
      error: jest.fn(),
    } as unknown as InvocationContext;

    // Mock AuthService instance
    mockAuthService = {
      authenticate: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    // Mock the AuthService constructor
    (AuthService as jest.Mock).mockImplementation(() => mockAuthService);
  });

  it('should successfully authenticate a user with valid credentials', async () => {
    // Mock request body
    const mockRequestBody: AuthRequest = {
      address: testAddress,
      signature: testSignature,
    };
    (mockRequest.json as jest.Mock).mockResolvedValue(mockRequestBody);

    // Mock challenge store
    const challenge = 'test-challenge';
    (challengeStore.getChallenge as jest.Mock).mockReturnValue({
      challenge,
      expiresAt: Date.now() + 300000, // 5 minutes from now
    });
    (challengeStore.verifyChallenge as jest.Mock).mockReturnValue(true);

    // Mock successful authentication response
    const mockAuthResponse: AuthResponse = {
      accessToken: 'mockAccessToken',
      refreshToken: 'mockRefreshToken',
      expiresIn: 3600,
      user: {
        address: testAddress.toLowerCase(),
        role: UserRole.CONSUMER,
        did: testDid,
      },
    };
    mockAuthService.authenticate.mockResolvedValue(mockAuthResponse);

    // Call the handler
    const response = await handler(mockRequest, mockContext);

    // Verify the response
    expect(response.status).toBe(200);
    expect(response.jsonBody).toEqual({
      success: true,
      data: mockAuthResponse,
      message: 'Authentication successful',
    });

    // Verify service calls
    expect(mockAuthService.authenticate).toHaveBeenCalledWith(
      testAddress.toLowerCase(),
      testSignature
    );
    expect(mockContext.log).toHaveBeenCalledWith('Processing authenticate request');
  });

  it('should return 400 when address is missing', async () => {
    // Mock request body with missing address
    (mockRequest.json as jest.Mock).mockResolvedValue({
      signature: testSignature,
    });

    // Call the handler
    const response = await handler(mockRequest, mockContext);

    // Verify the response
    expect(response.status).toBe(400);
    expect(response.jsonBody).toEqual({
      success: false,
      message: 'Address and signature are required',
    });

    // Verify service was not called
    expect(mockAuthService.authenticate).not.toHaveBeenCalled();
  });

  it('should return 400 when signature is missing', async () => {
    // Mock request body with missing signature
    (mockRequest.json as jest.Mock).mockResolvedValue({
      address: testAddress,
    });

    // Call the handler
    const response = await handler(mockRequest, mockContext);

    // Verify the response
    expect(response.status).toBe(400);
    expect(response.jsonBody).toEqual({
      success: false,
      message: 'Address and signature are required',
    });

    // Verify service was not called
    expect(mockAuthService.authenticate).not.toHaveBeenCalled();
  });

  it('should return 401 when authentication fails with invalid signature', async () => {
    // Mock request body
    const mockRequestBody: AuthRequest = {
      address: testAddress,
      signature: '0xinvalidsignature',
    };
    (mockRequest.json as jest.Mock).mockResolvedValue(mockRequestBody);

    // Mock challenge store
    const challenge = 'test-challenge';
    (challengeStore.getChallenge as jest.Mock).mockReturnValue({
      challenge,
      expiresAt: Date.now() + 300000, // 5 minutes from now
    });
    (challengeStore.verifyChallenge as jest.Mock).mockReturnValue(true);

    // Mock authentication failure
    mockAuthService.authenticate.mockRejectedValue(new Error('Invalid signature'));

    // Call the handler
    const response = await handler(mockRequest, mockContext);

    // Verify the response
    expect(response.status).toBe(401);
    expect(response.jsonBody).toEqual({
      success: false,
      message: 'Invalid signature',
    });

    // Verify error was logged
    expect(mockContext.error).toHaveBeenCalled();
  });

  it('should return 401 when authentication fails with invalid challenge', async () => {
    // Mock request body
    const mockRequestBody: AuthRequest = {
      address: testAddress,
      signature: testSignature,
    };
    (mockRequest.json as jest.Mock).mockResolvedValue(mockRequestBody);

    // Mock challenge store to return null (no valid challenge)
    (challengeStore.getChallenge as jest.Mock).mockReturnValue(null);

    // Mock authentication failure
    mockAuthService.authenticate.mockRejectedValue(new Error('Invalid challenge'));

    // Call the handler
    const response = await handler(mockRequest, mockContext);

    // Verify the response
    expect(response.status).toBe(401);
    expect(response.jsonBody).toEqual({
      success: false,
      message: 'Invalid or expired challenge',
    });

    // Verify error was logged
    expect(mockContext.error).toHaveBeenCalled();
  });

  it('should return 403 when user account is deactivated', async () => {
    // Mock request body
    const mockRequestBody: AuthRequest = {
      address: testAddress,
      signature: testSignature,
    };
    (mockRequest.json as jest.Mock).mockResolvedValue(mockRequestBody);

    // Mock challenge store
    const challenge = 'test-challenge';
    (challengeStore.getChallenge as jest.Mock).mockReturnValue({
      challenge,
      expiresAt: Date.now() + 300000, // 5 minutes from now
    });
    (challengeStore.verifyChallenge as jest.Mock).mockReturnValue(true);

    // Mock authentication failure
    mockAuthService.authenticate.mockRejectedValue(new Error('Deactivated'));

    // Call the handler
    const response = await handler(mockRequest, mockContext);

    // Verify the response
    expect(response.status).toBe(403);
    expect(response.jsonBody).toEqual({
      success: false,
      message: 'User account is deactivated',
    });

    // Verify error was logged
    expect(mockContext.error).toHaveBeenCalled();
  });
});
