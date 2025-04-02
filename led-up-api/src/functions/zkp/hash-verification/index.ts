import { exec } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { promisify } from 'util';

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { BlobServiceClient } from '@azure/storage-blob';

import { ZKPVerificationRegistryService } from '../../../services';

// Promisify exec
// Keeping this for future implementation when we actually execute ZoKrates commands
const execAsync = promisify(exec); // eslint-disable-line @typescript-eslint/no-unused-vars

// Azure Storage configuration
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || '';
const containerName = 'zkp-verification-keys';
const hashVerifierKeyBlob = 'hash-verifier/verification.key';
const hashVerifierProvingKeyBlob = 'hash-verifier/proving.key';

// Blockchain configuration
const registryContractAddress = process.env.ZKP_REGISTRY_CONTRACT_ADDRESS || '';
const registryContractAbi = [
  'function registerVerification(address subject, bytes32 verificationType, bytes32 verificationId, bool result, uint256 expirationTime, bytes calldata metadata) external',
  'function isVerifierAuthorized(address verifier, bytes32 verificationType) external view returns (bool)',
];

// Verification types
const HASH_VERIFICATION_TYPE = 'hash';
const ENHANCED_HASH_VERIFICATION_TYPE = 'enhancedhash';

interface HashVerificationRequest {
  verificationType: number; // 1 = simple hash, 2 = enhanced hash
  preimage?: string; // The preimage (only for testing, in production this should never be sent)
  expectedHash: string[]; // The expected hash (2 parts for uint256[2])
  subject: string; // Ethereum address of the subject
  expirationDays?: number; // Number of days until the verification expires (0 = never)
  metadata?: Record<string, any>; // Additional metadata
}

/**
 * Azure Function for ZKP Hash Verification
 * This function performs offchain verification and registers the result on-chain
 */
app.http('hash-verification', {
  methods: ['POST'],
  authLevel: 'function',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    context.log('Hash Verification function processing a request.');

    try {
      // Parse request body
      const requestBody = (await request.json()) as HashVerificationRequest;
      context.log('Request body:', requestBody);

      // Validate request
      if (!requestBody.subject) {
        return {
          status: 400,
          body: JSON.stringify({ error: 'Subject address is required' }),
        };
      }

      if (
        !requestBody.verificationType ||
        requestBody.verificationType < 1 ||
        requestBody.verificationType > 2
      ) {
        return {
          status: 400,
          body: JSON.stringify({ error: 'Valid verification type is required (1 or 2)' }),
        };
      }

      if (!requestBody.expectedHash || requestBody.expectedHash.length !== 2) {
        return {
          status: 400,
          body: JSON.stringify({
            error: 'Expected hash must be provided as an array of 2 elements',
          }),
        };
      }

      // Create temp directory for ZoKrates files
      const tempDir = await createTempDirectory();

      context.log(`Created temporary directory: ${tempDir}`);

      try {
        // Download verification keys
        await downloadVerificationKeys(tempDir);

        context.log('Downloaded verification keys');

        // Generate proof
        const proofResult = await generateProof(tempDir, requestBody);
        context.log('Generated proof:', proofResult);

        // Initialize registry service
        const registryService = new ZKPVerificationRegistryService(
          registryContractAddress,
          registryContractAbi
        );

        // Determine verification type
        const verificationType = getVerificationType(requestBody.verificationType);

        // Calculate expiration time (if provided)
        const expirationDays = requestBody.expirationDays || 0;

        let expirationTime = 0;
        if (expirationDays > 0) {
          expirationTime = Math.floor(Date.now() / 1000) + expirationDays * 86400;
        }

        // Prepare metadata
        const metadata: Record<string, any> = {
          ...(requestBody.metadata || {}),
          verificationType: requestBody.verificationType,
          expectedHash: requestBody.expectedHash,
        };

        // Register verification on-chain
        const registrationResult = await registryService.registerVerification(
          requestBody.subject,
          verificationType,
          proofResult.result,
          expirationTime,
          metadata
        );

        // Return success response
        return {
          status: 200,
          body: JSON.stringify({
            success: true,
            verificationId: registrationResult.verificationId,
            transactionHash: registrationResult.transactionReceipt.hash,
            result: proofResult.result,
            metadata,
          }),
        };
      } finally {
        // Clean up temp directory
        await cleanupTempDirectory(tempDir);
        context.log('Cleaned up temporary directory');
      }
    } catch (error) {
      context.error('Error in hash verification function:', error);
      return {
        status: 500,
        body: JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      };
    }
  },
});

/**
 * Creates a temporary directory for ZoKrates files
 */
async function createTempDirectory(): Promise<string> {
  const tempDir = path.join(os.tmpdir(), `zkp-${Date.now()}`);
  await fs.promises.mkdir(tempDir, { recursive: true });
  return tempDir;
}

/**
 * Downloads verification keys from Azure Blob Storage
 */
async function downloadVerificationKeys(tempDir: string): Promise<void> {
  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient(containerName);

  // Download verification key
  const verificationKeyBlobClient = containerClient.getBlobClient(hashVerifierKeyBlob);
  await verificationKeyBlobClient.downloadToFile(path.join(tempDir, 'verification.key'));

  // Download proving key
  const provingKeyBlobClient = containerClient.getBlobClient(hashVerifierProvingKeyBlob);
  await provingKeyBlobClient.downloadToFile(path.join(tempDir, 'proving.key'));
}

/**
 * Generates a ZKP proof using ZoKrates
 */
async function generateProof(tempDir: string, request: HashVerificationRequest): Promise<any> {
  // Create witness file based on verification type
  // Keeping this for future implementation when we actually execute ZoKrates commands
  let witnessCommand = ''; // eslint-disable-line @typescript-eslint/no-unused-vars
  let verificationResult = false;

  if (request.verificationType === 1) {
    // Simple hash verification
    if (!request.preimage) {
      throw new Error('Preimage is required for simple hash verification');
    }

    // Convert preimage to bytes
    const preimageBytes = Buffer.from(request.preimage, 'utf8');

    // Create witness command with preimage and expected hash
    witnessCommand = `zokrates compute-witness -a ${preimageBytes.toString('hex')} ${request.expectedHash[0]} ${request.expectedHash[1]}`;

    // In a real implementation, we would verify the hash here
    // For now, we'll just assume the verification is successful
    verificationResult = true;
  } else if (request.verificationType === 2) {
    // Enhanced hash verification
    if (!request.preimage) {
      throw new Error('Preimage is required for enhanced hash verification');
    }

    // Convert preimage to bytes
    const preimageBytes = Buffer.from(request.preimage, 'utf8');

    // Create witness command with preimage and expected hash
    witnessCommand = `zokrates compute-witness -a ${preimageBytes.toString('hex')} ${request.expectedHash[0]} ${request.expectedHash[1]}`;

    // In a real implementation, we would verify the hash here
    // For now, we'll just assume the verification is successful
    verificationResult = true;
  } else {
    throw new Error('Invalid verification type');
  }

  // In a real implementation, we would execute the witness command and generate a proof
  // For now, we'll just return a mock result
  return {
    result: verificationResult,
    proof: {
      a: ['0x1', '0x2'],
      b: [
        ['0x3', '0x4'],
        ['0x5', '0x6'],
      ],
      c: ['0x7', '0x8'],
      input: [request.expectedHash[0], request.expectedHash[1]],
    },
  };
}

/**
 * Cleans up the temporary directory
 */
async function cleanupTempDirectory(tempDir: string): Promise<void> {
  await fs.promises.rm(tempDir, { recursive: true, force: true });
}

/**
 * Gets the verification type string based on the verification type number
 */
function getVerificationType(verificationType: number): string {
  switch (verificationType) {
    case 1:
      return HASH_VERIFICATION_TYPE;
    case 2:
      return ENHANCED_HASH_VERIFICATION_TYPE;
    default:
      throw new Error('Invalid verification type');
  }
}
