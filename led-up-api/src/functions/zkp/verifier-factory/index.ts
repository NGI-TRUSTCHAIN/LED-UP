import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { ZKPVerifierFactoryService } from '../../../services';

// Blockchain configuration
const factoryContractAddress = process.env.ZKP_VERIFIER_FACTORY_CONTRACT_ADDRESS || '';

const factoryContractAbi = [
  'function deployAgeVerifier(address verifierAddress) external returns (address)',
  'function deployHashVerifier(address verifierAddress) external returns (address)',
  'function deployEnhancedHashVerifier(address verifierAddress) external returns (address)',
  'function deployFHIRVerifier(address verifierAddress) external returns (address)',
  'function getVerifier(bytes32 verifierType) external view returns (address)',
  'event VerifierDeployed(bytes32 indexed verifierType, address verifierAddress)',
];

// Define interfaces for request bodies
interface BaseRequestBody {
  action: string;
}

interface DeployVerifierRequest extends BaseRequestBody {
  verifierAddress: string;
}

interface GetVerifierRequest extends BaseRequestBody {
  verifierType: string;
}

/**
 * Azure Function for ZKP Verifier Factory
 * This function allows deploying and managing ZKP verifier contracts
 */
app.http('verifierFactory', {
  methods: ['GET', 'POST'],
  authLevel: 'function',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    context.log('Verifier Factory function processing a request.');

    try {
      // Initialize factory service
      const factoryService = new ZKPVerifierFactoryService(
        factoryContractAddress,
        factoryContractAbi
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
          case 'getVerifier': {
            const verifierType = params.get('verifierType');
            if (!verifierType) {
              return {
                status: 400,
                body: JSON.stringify({ error: 'Verifier type is required' }),
              };
            }

            const verifierAddress = await factoryService.getVerifier(verifierType);
            return {
              status: 200,
              body: JSON.stringify({ verifierAddress }),
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
          case 'deployAgeVerifier': {
            const { verifierAddress } = requestBody as DeployVerifierRequest;

            if (!verifierAddress) {
              return {
                status: 400,
                body: JSON.stringify({ error: 'Verifier address is required' }),
              };
            }

            const deployedAddress = await factoryService.deployAgeVerifier(verifierAddress);

            return {
              status: 200,
              body: JSON.stringify({
                success: true,
                verifierAddress: deployedAddress,
              }),
            };
          }

          case 'deployHashVerifier': {
            const { verifierAddress } = requestBody as DeployVerifierRequest;

            if (!verifierAddress) {
              return {
                status: 400,
                body: JSON.stringify({ error: 'Verifier address is required' }),
              };
            }

            const deployedAddress = await factoryService.deployHashVerifier(verifierAddress);

            return {
              status: 200,
              body: JSON.stringify({
                success: true,
                verifierAddress: deployedAddress,
              }),
            };
          }

          case 'deployEnhancedHashVerifier': {
            const { verifierAddress } = requestBody as DeployVerifierRequest;

            if (!verifierAddress) {
              return {
                status: 400,
                body: JSON.stringify({ error: 'Verifier address is required' }),
              };
            }

            const deployedAddress =
              await factoryService.deployEnhancedHashVerifier(verifierAddress);

            return {
              status: 200,
              body: JSON.stringify({
                success: true,
                verifierAddress: deployedAddress,
              }),
            };
          }

          case 'deployFHIRVerifier': {
            const { verifierAddress } = requestBody as DeployVerifierRequest;

            if (!verifierAddress) {
              return {
                status: 400,
                body: JSON.stringify({ error: 'Verifier address is required' }),
              };
            }

            const deployedAddress = await factoryService.deployFHIRVerifier(verifierAddress);

            return {
              status: 200,
              body: JSON.stringify({
                success: true,
                verifierAddress: deployedAddress,
              }),
            };
          }

          case 'getVerifier': {
            const { verifierType } = requestBody as GetVerifierRequest;

            if (!verifierType) {
              return {
                status: 400,
                body: JSON.stringify({ error: 'Verifier type is required' }),
              };
            }

            const verifierAddress = await factoryService.getVerifier(verifierType);

            return {
              status: 200,
              body: JSON.stringify({ verifierAddress }),
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
      context.error('Error in verifier factory function:', error);
      return {
        status: 500,
        body: JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      };
    }
  },
});
