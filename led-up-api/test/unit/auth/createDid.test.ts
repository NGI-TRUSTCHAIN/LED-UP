import { HttpRequest, InvocationContext } from '@azure/functions';

import { handler } from '../../../src/functions/auth/createDid';
import { DidResolverService } from '../../../src/services/auth/DidResolverService';
import { DidRegistryService } from '../../../src/services/contracts/DidRegistryService';
import { CreateDidRequest } from '../../../src/types/did-types';

// Mock the services
jest.mock('../../../src/services/auth/DidRegistryService');
jest.mock('../../../src/services/auth/DidResolverService');

describe('createDid function', () => {
  let mockRequest: HttpRequest;
  let mockContext: InvocationContext;
  let mockDidRegistryService: jest.Mocked<DidRegistryService>;
  let mockDidResolverService: jest.Mocked<DidResolverService>;

  const testAddress = '0x1234567890abcdef1234567890abcdef12345678';
  const testDid = 'did:ethr:' + testAddress;
  const testDidDocument = {
    '@context': ['https://www.w3.org/ns/did/v1'],
    id: testDid,
    controller: [testDid],
    verificationMethod: [
      {
        id: `${testDid}#keys-1`,
        type: 'EcdsaSecp256k1VerificationKey2019',
        controller: testDid,
        publicKeyMultibase: 'z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH',
      },
    ],
    authentication: [`${testDid}#keys-1`],
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock request
    mockRequest = {
      method: 'POST',
      url: 'http://localhost:7071/api/did/create',
      headers: {},
      query: {},
      params: {},
      json: jest.fn(),
    } as unknown as HttpRequest;

    // Create mock context
    mockContext = {
      log: jest.fn(),
      error: jest.fn(),
    } as unknown as InvocationContext;

    // Mock DidRegistryService instance
    mockDidRegistryService = {
      getDidForAddress: jest.fn(),
      registerDid: jest.fn(),
    } as unknown as jest.Mocked<DidRegistryService>;

    // Mock DidResolverService instance
    mockDidResolverService = {
      createDid: jest.fn(),
      createDidDocument: jest.fn(),
    } as unknown as jest.Mocked<DidResolverService>;

    // Mock the service constructors
    (DidRegistryService as jest.Mock).mockImplementation(() => mockDidRegistryService);
    (DidResolverService as jest.Mock).mockImplementation(() => mockDidResolverService);
  });

  it('should create a new DID successfully', async () => {
    // Mock request body
    const mockRequestBody: CreateDidRequest = {
      address: testAddress,
    };
    (mockRequest.json as jest.Mock).mockResolvedValue(mockRequestBody);

    // Mock DidRegistryService.getDidForAddress to return null (no existing DID)
    mockDidRegistryService.getDidForAddress.mockRejectedValue(new Error('DID not found'));

    // Mock DidResolverService.createDid to return a DID
    mockDidResolverService.createDid.mockReturnValue(testDid);

    // Mock DidResolverService.createDidDocument to return a DID document
    mockDidResolverService.createDidDocument.mockReturnValue(testDidDocument);

    // Mock DidRegistryService.registerDid to return true
    mockDidRegistryService.registerDid.mockResolvedValue({ success: true } as any);

    // Call the handler
    const response = await handler(mockRequest, mockContext);

    // Verify the response
    expect(response.status).toBe(201);
    expect(response.jsonBody).toEqual({
      success: true,
      data: {
        did: testDid,
        didDocument: testDidDocument,
      },
      message: 'DID created successfully',
    });

    // Verify service calls
    expect(mockDidRegistryService.getDidForAddress).toHaveBeenCalledWith(testAddress.toLowerCase());
    expect(mockDidResolverService.createDid).toHaveBeenCalledWith(testAddress.toLowerCase());
    expect(mockDidResolverService.createDidDocument).toHaveBeenCalledWith(
      testDid,
      testAddress.toLowerCase()
    );
    expect(mockDidRegistryService.registerDid).toHaveBeenCalledWith(
      testDid,
      JSON.stringify(testDidDocument),
      expect.any(String)
    );
    expect(mockContext.log).toHaveBeenCalled();
  });

  it('should return existing DID if one already exists', async () => {
    // Mock request body
    const mockRequestBody: CreateDidRequest = {
      address: testAddress,
    };
    (mockRequest.json as jest.Mock).mockResolvedValue(mockRequestBody);

    // Mock DidRegistryService.getDidForAddress to return an existing DID
    mockDidRegistryService.getDidForAddress.mockResolvedValue({
      did: testDid,
      document: JSON.stringify(testDidDocument),
    });

    // Call the handler
    const response = await handler(mockRequest, mockContext);

    // Verify the response
    expect(response.status).toBe(200);
    expect(response.jsonBody).toEqual({
      success: true,
      data: {
        did: testDid,
        didDocument: {
          did: testDid,
          document: JSON.stringify(testDidDocument),
        },
      },
      message: 'DID already exists for this address',
    });

    // Verify service calls
    expect(mockDidRegistryService.getDidForAddress).toHaveBeenCalledWith(testAddress.toLowerCase());
    expect(mockDidResolverService.createDid).not.toHaveBeenCalled();
    expect(mockDidResolverService.createDidDocument).not.toHaveBeenCalled();
    expect(mockDidRegistryService.registerDid).not.toHaveBeenCalled();
  });

  it('should return 400 when address is missing', async () => {
    // Mock request body with missing address
    (mockRequest.json as jest.Mock).mockResolvedValue({});

    // Call the handler
    const response = await handler(mockRequest, mockContext);

    // Verify the response
    expect(response.status).toBe(400);
    expect(response.jsonBody).toEqual({
      success: false,
      message: 'Address is required',
    });

    // Verify service was not called
    expect(mockDidRegistryService.getDidForAddress).not.toHaveBeenCalled();
    expect(mockDidResolverService.createDid).not.toHaveBeenCalled();
    expect(mockDidResolverService.createDidDocument).not.toHaveBeenCalled();
    expect(mockDidRegistryService.registerDid).not.toHaveBeenCalled();
  });

  it('should return 500 when DID registration fails', async () => {
    // Mock request body
    const mockRequestBody: CreateDidRequest = {
      address: testAddress,
    };
    (mockRequest.json as jest.Mock).mockResolvedValue(mockRequestBody);

    // Mock DidRegistryService.getDidForAddress to return null (no existing DID)
    mockDidRegistryService.getDidForAddress.mockRejectedValue(new Error('DID not found'));

    // Mock DidResolverService.createDid to return a DID
    mockDidResolverService.createDid.mockReturnValue(testDid);

    // Mock DidResolverService.createDidDocument to return a DID document
    mockDidResolverService.createDidDocument.mockReturnValue(testDidDocument);

    // Mock DidRegistryService.registerDid to return false
    mockDidRegistryService.registerDid.mockResolvedValue({ success: false } as any);

    // Call the handler
    const response = await handler(mockRequest, mockContext);

    // Verify the response
    expect(response.status).toBe(500);

    expect(response.jsonBody).toEqual({
      success: false,
      message: 'Failed to register DID on the blockchain',
    });

    // Verify service calls
    expect(mockDidRegistryService.getDidForAddress).toHaveBeenCalledWith(testAddress.toLowerCase());
    expect(mockDidResolverService.createDid).toHaveBeenCalledWith(testAddress.toLowerCase());
    expect(mockDidResolverService.createDidDocument).toHaveBeenCalledWith(
      testDid,
      testAddress.toLowerCase()
    );
    expect(mockDidRegistryService.registerDid).toHaveBeenCalledWith(
      testDid,
      JSON.stringify(testDidDocument),
      expect.any(String)
    );
  });

  it('should return 500 when DID registration throws an error', async () => {
    // Mock request body
    const mockRequestBody: CreateDidRequest = {
      address: testAddress,
    };
    (mockRequest.json as jest.Mock).mockResolvedValue(mockRequestBody);

    // Mock DidRegistryService.getDidForAddress to return null (no existing DID)
    mockDidRegistryService.getDidForAddress.mockRejectedValue(new Error('DID not found'));

    // Mock DidResolverService.createDid to return a DID
    mockDidResolverService.createDid.mockReturnValue(testDid);

    // Mock DidResolverService.createDidDocument to return a DID document
    mockDidResolverService.createDidDocument.mockReturnValue(testDidDocument);

    // Mock DidRegistryService.registerDid to throw an error
    const errorMessage = 'Failed to register DID';
    mockDidRegistryService.registerDid.mockRejectedValue(new Error(errorMessage));

    // Call the handler
    const response = await handler(mockRequest, mockContext);

    // Verify the response
    expect(response.status).toBe(500);
    expect(response.jsonBody).toEqual({
      success: false,
      message: errorMessage,
    });

    // Verify error was logged
    expect(mockContext.error).toHaveBeenCalled();
  });

  it('should handle unexpected errors', async () => {
    // Mock request body
    const mockRequestBody: CreateDidRequest = {
      address: testAddress,
    };
    (mockRequest.json as jest.Mock).mockResolvedValue(mockRequestBody);

    // Mock DidRegistryService.getDidForAddress to throw an unexpected error
    const errorMessage = 'Unexpected error';
    mockDidRegistryService.getDidForAddress.mockRejectedValue(new Error(errorMessage));

    // Mock DidResolverService.createDid to throw an error
    mockDidResolverService.createDid.mockImplementation(() => {
      throw new Error(errorMessage);
    });

    // Call the handler
    const response = await handler(mockRequest, mockContext);

    // Verify the response
    expect(response.status).toBe(400);
    expect(response.jsonBody).toEqual({
      success: false,
      message: errorMessage,
    });

    // Verify error was logged
    expect(mockContext.error).toHaveBeenCalled();
  });
});
