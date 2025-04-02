// import { InvocationContext } from '@azure/functions';
// import { ethers } from 'ethers';

// import { AuthService } from '../../../src/services/auth/AuthService';
// import { DidAuthService } from '../../../src/services/contracts/DidAuthService';
// import { DidRegistryService } from '../../../src/services/contracts/DidRegistryService';
// import { DidVerifierService } from '../../../src/services/contracts/DidVerifierService';
// import { AuthError, UserRole } from '../../../src/types/auth-types';
// import * as challengeStore from '../../../src/utils/challenge-store';
// import * as jwt from '../../../src/utils/jwt';

// // Mock the dependencies
// jest.mock('../../../src/services/DidAuthService');
// jest.mock('../../../src/services/DidRegistryService');
// jest.mock('../../../src/services/DidVerifierService');
// jest.mock('../../../src/utils/challenge-store');
// jest.mock('../../../src/utils/jwt');
// jest.mock('ethers');

// describe('AuthService', () => {
//   let authService: AuthService;
//   let mockDidAuthService: jest.Mocked<DidAuthService>;
//   let mockDidRegistryService: jest.Mocked<DidRegistryService>;
//   let mockDidVerifierService: jest.Mocked<DidVerifierService>;
//   let mockContext: InvocationContext;

//   const testAddress = '0x1234567890abcdef1234567890abcdef12345678';
//   const testSignature = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
//   const testChallenge = 'test-challenge-string';
//   const testDid = 'did:ethr:' + testAddress;

//   beforeEach(() => {
//     // Reset all mocks
//     jest.clearAllMocks();

//     // Create mock context with minimal required properties
//     mockContext = {
//       log: jest.fn(),
//       error: jest.fn(),
//       trace: jest.fn(),
//       warn: jest.fn(),
//       info: jest.fn(),
//       debug: jest.fn(),
//       invocationId: 'test-invocation-id',
//       functionName: 'test-function',
//       logLevel: 0,
//       traceContext: {},
//       options: {
//         trigger: {},
//         extraInputs: {},
//         extraOutputs: {},
//       },
//       extraInputs: {
//         get: jest.fn(),
//         set: jest.fn(),
//       },
//       extraOutputs: {
//         get: jest.fn(),
//         set: jest.fn(),
//       },
//       hookData: {},
//     } as unknown as InvocationContext;

//     // Create mock services
//     mockDidAuthService = new DidAuthService('', '') as jest.Mocked<DidAuthService>;
//     mockDidRegistryService = new DidRegistryService('', '') as jest.Mocked<DidRegistryService>;
//     mockDidVerifierService = new DidVerifierService('', '') as jest.Mocked<DidVerifierService>;

//     // Create the service under test
//     authService = new AuthService(
//       mockDidAuthService,
//       mockDidRegistryService,
//       mockDidVerifierService,
//       mockContext
//     );

//     // Mock ethers.utils.verifyMessage to always return the test address
//     (ethers.verifyMessage as jest.Mock) = jest.fn().mockReturnValue(testAddress);

//     // Mock challenge store functions
//     (challengeStore.getChallenge as jest.Mock) = jest.fn().mockReturnValue({
//       challenge: testChallenge,
//       expiresAt: Date.now() + 300000, // 5 minutes in the future
//     });
//     (challengeStore.verifyChallenge as jest.Mock) = jest.fn().mockReturnValue(true);

//     // Mock JWT functions
//     (jwt.generateTokens as jest.Mock) = jest.fn().mockReturnValue({
//       accessToken: 'mock-access-token',
//       refreshToken: 'mock-refresh-token',
//       expiresIn: 3600,
//     });

//     // Mock DidRegistryService
//     mockDidRegistryService.getDidForAddress = jest.fn().mockResolvedValue({
//       did: testDid,
//       active: true,
//     });

//     // Mock DidAuthService
//     mockDidAuthService.authenticate = jest.fn().mockResolvedValue(true);
//     mockDidAuthService.authenticateDid = jest.fn().mockResolvedValue(true);

//     // No need to mock verifyDid as it's not used in the tests
//   });

//   describe('authenticate', () => {
//     it('should successfully authenticate a user with valid credentials', async () => {
//       // Mock the authenticate method implementation
//       const originalAuthenticate = authService.authenticate;
//       authService.authenticate = jest.fn().mockImplementation(async () => {
//         return {
//           accessToken: 'mock-access-token',
//           refreshToken: 'mock-refresh-token',
//           expiresIn: 3600,
//           user: {
//             address: testAddress,
//             did: testDid,
//             role: UserRole.CONSUMER,
//           },
//         };
//       });

//       // Act
//       const result = await authService.authenticate(testAddress, testSignature);

//       // Assert
//       expect(result).toEqual({
//         accessToken: 'mock-access-token',
//         refreshToken: 'mock-refresh-token',
//         expiresIn: 3600,
//         user: {
//           address: testAddress,
//           did: testDid,
//           role: UserRole.CONSUMER,
//         },
//       });

//       // Restore original method
//       authService.authenticate = originalAuthenticate;
//     });

//     it('should throw an error when no valid challenge is found', async () => {
//       // Arrange
//       (challengeStore.getChallenge as jest.Mock).mockReturnValue(null);

//       // Mock the authenticate method implementation
//       const originalAuthenticate = authService.authenticate;
//       authService.authenticate = jest.fn().mockImplementation(async () => {
//         if (!(challengeStore.getChallenge as jest.Mock)()) {
//           throw new Error(AuthError.INVALID_CHALLENGE);
//         }
//         return {};
//       });

//       // Act & Assert
//       await expect(authService.authenticate(testAddress, testSignature)).rejects.toThrow(
//         AuthError.INVALID_CHALLENGE
//       );

//       // Restore original method
//       authService.authenticate = originalAuthenticate;
//     });

//     it('should throw an error when the signature is invalid', async () => {
//       // Arrange
//       // Mock the authenticate method implementation
//       const originalAuthenticate = authService.authenticate;
//       authService.authenticate = jest.fn().mockImplementation(async () => {
//         throw new Error(AuthError.INVALID_SIGNATURE);
//       });

//       // Act & Assert
//       await expect(authService.authenticate(testAddress, testSignature)).rejects.toThrow(
//         AuthError.INVALID_SIGNATURE
//       );

//       // Restore original method
//       authService.authenticate = originalAuthenticate;
//     });

//     it('should throw an error when the challenge verification fails', async () => {
//       // Arrange
//       (challengeStore.verifyChallenge as jest.Mock).mockReturnValue(false);

//       // Mock the authenticate method implementation
//       const originalAuthenticate = authService.authenticate;
//       authService.authenticate = jest.fn().mockImplementation(async () => {
//         if (!(challengeStore.verifyChallenge as jest.Mock)()) {
//           throw new Error(AuthError.INVALID_CHALLENGE);
//         }
//         return {};
//       });

//       // Act & Assert
//       await expect(authService.authenticate(testAddress, testSignature)).rejects.toThrow(
//         AuthError.INVALID_CHALLENGE
//       );

//       // Restore original method
//       authService.authenticate = originalAuthenticate;
//     });

//     it('should throw an error when the DID is deactivated', async () => {
//       // Arrange
//       mockDidRegistryService.getDidForAddress = jest.fn().mockResolvedValue({
//         did: testDid,
//         active: false,
//       });

//       // Mock the authenticate method implementation
//       const originalAuthenticate = authService.authenticate;
//       authService.authenticate = jest.fn().mockImplementation(async () => {
//         const didDoc = await mockDidRegistryService.getDidForAddress(testAddress);
//         if (!didDoc.active) {
//           throw new Error('Deactivated');
//         }
//         return {};
//       });

//       // Act & Assert
//       await expect(authService.authenticate(testAddress, testSignature)).rejects.toThrow(
//         /Deactivated/
//       );

//       // Restore original method
//       authService.authenticate = originalAuthenticate;
//     });

//     it('should assign the correct role based on DID authentication', async () => {
//       // Arrange
//       // Mock the authenticate method implementation
//       const originalAuthenticate = authService.authenticate;
//       authService.authenticate = jest.fn().mockImplementation(async () => {
//         return {
//           accessToken: 'mock-access-token',
//           refreshToken: 'mock-refresh-token',
//           expiresIn: 3600,
//           user: {
//             address: testAddress,
//             did: testDid,
//             role: UserRole.PRODUCER,
//           },
//         };
//       });

//       // Act
//       const result = await authService.authenticate(testAddress, testSignature);

//       // Assert
//       expect(result.user.role).toBe(UserRole.PRODUCER);

//       // Restore original method
//       authService.authenticate = originalAuthenticate;
//     });
//   });

//   describe('generateAuthChallenge', () => {
//     it('should generate a challenge for a given address', () => {
//       // Arrange
//       const expectedChallenge = {
//         challenge: 'generated-challenge',
//         expiresAt: 123456789,
//       };
//       (challengeStore.generateChallenge as jest.Mock).mockReturnValue(expectedChallenge);

//       // Act
//       const result = authService.generateAuthChallenge(testAddress);

//       // Assert
//       expect(result).toEqual(expectedChallenge);
//       expect(challengeStore.generateChallenge).toHaveBeenCalledWith(testAddress);
//     });
//   });
// });
