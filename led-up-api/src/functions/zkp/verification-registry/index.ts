import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { ZKPVerificationRegistryService } from '../../../services';

// Blockchain configuration
const registryContractAddress = process.env.ZKP_REGISTRY_CONTRACT_ADDRESS || '';

const registryContractAbi = [
  'function getVerification(bytes32 verificationId) external view returns (address subject, bytes32 verificationType, bool result, uint256 timestamp, uint256 expirationTime, bytes memory metadata)',
  'function isVerificationValid(bytes32 verificationId) external view returns (bool)',
  'function getSubjectVerifications(address subject) external view returns (bytes32[] memory)',
  'function isVerifierAuthorized(address verifier, bytes32 verificationType) external view returns (bool)',
  'function isAdministrator(address admin) external view returns (bool)',
];

// Define interfaces for request bodies
interface BaseRequestBody {
  action: string;
}

interface RegisterVerificationRequest extends BaseRequestBody {
  subject: string;
  verificationType: string;
  result: boolean | number;
  expirationTime?: number;
  metadata?: Record<string, any>;
}

interface RevokeVerificationRequest extends BaseRequestBody {
  verificationId: string;
}

interface VerifierAuthorizationRequest extends BaseRequestBody {
  verifier: string;
  verificationType: string;
}

interface AdministratorRequest extends BaseRequestBody {
  admin: string;
}

/**
 * Azure Function for ZKP Verification Registry
 * This function allows querying verification results from the registry
 */
app.http('verificationRegistry', {
  methods: ['GET', 'POST'],
  authLevel: 'function',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    context.log('Verification Registry function processing a request.');

    try {
      // Initialize registry service
      const registryService = new ZKPVerificationRegistryService(
        registryContractAddress,
        registryContractAbi
      );

      // Handle different HTTP methods
      if (request.method === 'GET') {
        // Parse query parameters
        const params = new URL(request.url).searchParams;
        const action = params.get('action');

        if (!action) {
          return {
            status: 400,
            body: JSON.stringify({ error: 'Action parameter is required' }),
          };
        }

        // Handle different actions
        switch (action) {
          case 'getVerification': {
            const verificationId = params.get('verificationId');
            if (!verificationId) {
              return {
                status: 400,
                body: JSON.stringify({ error: 'Verification ID is required' }),
              };
            }

            const verification = await registryService.getVerification(verificationId);
            return {
              status: 200,
              body: JSON.stringify(verification),
            };
          }

          case 'isVerificationValid': {
            const verificationId = params.get('verificationId');
            if (!verificationId) {
              return {
                status: 400,
                body: JSON.stringify({ error: 'Verification ID is required' }),
              };
            }

            const isValid = await registryService.isVerificationValid(verificationId);
            return {
              status: 200,
              body: JSON.stringify({ isValid }),
            };
          }

          case 'getSubjectVerifications': {
            const subject = params.get('subject');
            if (!subject) {
              return {
                status: 400,
                body: JSON.stringify({ error: 'Subject address is required' }),
              };
            }

            const verifications = await registryService.getSubjectVerifications(subject);
            return {
              status: 200,
              body: JSON.stringify({ verifications }),
            };
          }

          case 'isVerifierAuthorized': {
            const verifier = params.get('verifier');
            const verificationType = params.get('verificationType');
            if (!verifier || !verificationType) {
              return {
                status: 400,
                body: JSON.stringify({
                  error: 'Verifier address and verification type are required',
                }),
              };
            }

            const isAuthorized = await registryService.isVerifierAuthorized(
              verifier,
              verificationType
            );
            return {
              status: 200,
              body: JSON.stringify({ isAuthorized }),
            };
          }

          case 'isAdministrator': {
            const admin = params.get('admin');
            if (!admin) {
              return {
                status: 400,
                body: JSON.stringify({ error: 'Admin address is required' }),
              };
            }

            const isAdmin = await registryService.isAdministrator(admin);
            return {
              status: 200,
              body: JSON.stringify({ isAdmin }),
            };
          }

          default:
            return {
              status: 400,
              body: JSON.stringify({ error: `Unknown action: ${action}` }),
            };
        }
      } else if (request.method === 'POST') {
        // Parse request body
        const requestBody = (await request.json()) as BaseRequestBody;
        const { action } = requestBody;

        if (!action) {
          return {
            status: 400,
            body: JSON.stringify({ error: 'Action parameter is required' }),
          };
        }

        // Handle different actions
        switch (action) {
          case 'registerVerification': {
            const { subject, verificationType, result, expirationTime, metadata } =
              requestBody as RegisterVerificationRequest;

            if (!subject || !verificationType) {
              return {
                status: 400,
                body: JSON.stringify({
                  error: 'Subject address and verification type are required',
                }),
              };
            }

            const registrationResult = await registryService.registerVerification(
              subject,
              verificationType,
              result === true || Number(result) > 0,
              expirationTime || 0,
              metadata || {}
            );

            return {
              status: 200,
              body: JSON.stringify({
                success: true,
                verificationId: registrationResult.verificationId,
                transactionHash: registrationResult.transactionReceipt.hash,
              }),
            };
          }

          case 'revokeVerification': {
            const { verificationId } = requestBody as RevokeVerificationRequest;

            if (!verificationId) {
              return {
                status: 400,
                body: JSON.stringify({ error: 'Verification ID is required' }),
              };
            }

            const revocationResult = await registryService.revokeVerification(verificationId);

            return {
              status: 200,
              body: JSON.stringify({
                success: true,
                transactionHash: revocationResult.hash,
              }),
            };
          }

          case 'authorizeVerifier': {
            const { verifier, verificationType } = requestBody as VerifierAuthorizationRequest;

            if (!verifier || !verificationType) {
              return {
                status: 400,
                body: JSON.stringify({
                  error: 'Verifier address and verification type are required',
                }),
              };
            }

            const authorizationResult = await registryService.authorizeVerifier(
              verifier,
              verificationType
            );

            return {
              status: 200,
              body: JSON.stringify({
                success: true,
                transactionHash: authorizationResult.hash,
              }),
            };
          }

          case 'revokeVerifierAuthorization': {
            const { verifier, verificationType } = requestBody as VerifierAuthorizationRequest;

            if (!verifier || !verificationType) {
              return {
                status: 400,
                body: JSON.stringify({
                  error: 'Verifier address and verification type are required',
                }),
              };
            }

            const revocationResult = await registryService.revokeVerifierAuthorization(
              verifier,
              verificationType
            );

            return {
              status: 200,
              body: JSON.stringify({
                success: true,
                transactionHash: revocationResult.hash,
              }),
            };
          }

          case 'addAdministrator': {
            const { admin } = requestBody as AdministratorRequest;

            if (!admin) {
              return {
                status: 400,
                body: JSON.stringify({ error: 'Admin address is required' }),
              };
            }

            const addResult = await registryService.addAdministrator(admin);

            return {
              status: 200,
              body: JSON.stringify({
                success: true,
                transactionHash: addResult.hash,
              }),
            };
          }

          case 'removeAdministrator': {
            const { admin } = requestBody as AdministratorRequest;

            if (!admin) {
              return {
                status: 400,
                body: JSON.stringify({ error: 'Admin address is required' }),
              };
            }

            const removeResult = await registryService.removeAdministrator(admin);

            return {
              status: 200,
              body: JSON.stringify({
                success: true,
                transactionHash: removeResult.hash,
              }),
            };
          }

          default:
            return {
              status: 400,
              body: JSON.stringify({ error: `Unknown action: ${action}` }),
            };
        }
      } else {
        return {
          status: 405,
          body: JSON.stringify({ error: 'Method not allowed' }),
        };
      }
    } catch (error) {
      context.error('Error in verification registry function:', error);
      return {
        status: 500,
        body: JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      };
    }
  },
});
