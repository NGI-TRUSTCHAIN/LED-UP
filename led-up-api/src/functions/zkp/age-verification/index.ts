import { exec } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { promisify } from 'util';

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { BlobServiceClient } from '@azure/storage-blob';

import { ZKPVerificationRegistryService } from '../../../services';

// Promisify exec
const execAsync = promisify(exec);

// Azure Storage configuration
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || '';
const containerName = 'zkp-verification-keys';
const ageVerifierKeyBlob = 'age-verifier/verification.key';
const ageVerifierProvingKeyBlob = 'age-verifier/proving.key';

// Blockchain configuration
const registryContractAddress = process.env.ZKP_REGISTRY_CONTRACT_ADDRESS || '';
const registryContractAbi = [
  'function registerVerification(address subject, bytes32 verificationType, bytes32 verificationId, bool result, uint256 expirationTime, bytes calldata metadata) external',
  'function isVerifierAuthorized(address verifier, bytes32 verificationType) external view returns (bool)',
];

// Verification types
const AGE_VERIFICATION_TYPE = 'age';
const BIRTH_DATE_VERIFICATION_TYPE = 'birthdate';
const AGE_BRACKET_VERIFICATION_TYPE = 'agebracket';

interface AgeVerificationRequest {
  verificationType: number; // 1 = simple age, 2 = birth date, 3 = age bracket
  age?: number;
  birthDate?: number;
  currentDate?: number;
  threshold?: number;
  subject: string; // Ethereum address of the subject
  expirationDays?: number; // Number of days until the verification expires (0 = never)
  metadata?: Record<string, any>; // Additional metadata
}

/**
 * Azure Function for ZKP Age Verification
 * This function performs offchain verification and registers the result on-chain
 */
app.http('age-verification', {
  methods: ['POST'],
  authLevel: 'function',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    context.log('Age Verification function processing a request.');

    try {
      // Parse request body
      const requestBody = (await request.json()) as AgeVerificationRequest;
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
        requestBody.verificationType > 3
      ) {
        return {
          status: 400,
          body: JSON.stringify({ error: 'Valid verification type is required (1, 2, or 3)' }),
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
        };

        // Add specific metadata based on verification type
        if (requestBody.verificationType === 1) {
          metadata.threshold = requestBody.threshold;
        } else if (requestBody.verificationType === 2) {
          metadata.birthDate = requestBody.birthDate;
          metadata.currentDate = requestBody.currentDate;
          metadata.threshold = requestBody.threshold;
        } else if (requestBody.verificationType === 3) {
          metadata.bracketId = proofResult.result;
          metadata.bracketName = getBracketName(Number(proofResult.result));
        }

        // Register verification on-chain
        const registrationResult = await registryService.registerVerification(
          requestBody.subject,
          verificationType,
          proofResult.result === true || Number(proofResult.result) > 0,
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
      context.error('Error in age verification function:', error);
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
  const verificationKeyBlobClient = containerClient.getBlobClient(ageVerifierKeyBlob);
  await verificationKeyBlobClient.downloadToFile(path.join(tempDir, 'verification.key'));

  // Download proving key
  const provingKeyBlobClient = containerClient.getBlobClient(ageVerifierProvingKeyBlob);
  await provingKeyBlobClient.downloadToFile(path.join(tempDir, 'proving.key'));
}

/**
 * Generates a ZKP proof using ZoKrates
 */
async function generateProof(tempDir: string, request: AgeVerificationRequest): Promise<any> {
  // Create witness file based on verification type
  let witnessCommand = '';
  let verificationResult: boolean | number = false;

  if (request.verificationType === 1) {
    // Simple age verification
    if (request.age === undefined || request.threshold === undefined) {
      throw new Error('Age and threshold are required for simple age verification');
    }

    witnessCommand = `zokrates compute-witness -a ${request.age} ${request.threshold} 1`;
    verificationResult = request.age >= request.threshold;
  } else if (request.verificationType === 2) {
    // Birth date verification
    if (
      request.birthDate === undefined ||
      request.currentDate === undefined ||
      request.threshold === undefined
    ) {
      throw new Error(
        'Birth date, current date, and threshold are required for birth date verification'
      );
    }

    // Calculate age from birth date (YYYYMMDD format)
    const birthYear = Math.floor(request.birthDate / 10000);
    const birthMonth = Math.floor((request.birthDate % 10000) / 100);
    const birthDay = request.birthDate % 100;

    const currentYear = Math.floor(request.currentDate / 10000);
    const currentMonth = Math.floor((request.currentDate % 10000) / 100);
    const currentDay = request.currentDate % 100;

    let age = currentYear - birthYear;
    if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
      age--;
    }

    witnessCommand = `zokrates compute-witness -a ${request.birthDate} ${request.currentDate} ${request.threshold} 2`;
    verificationResult = age >= request.threshold;
  } else if (request.verificationType === 3) {
    // Age bracket verification
    if (request.age === undefined) {
      throw new Error('Age is required for age bracket verification');
    }

    let bracketId = 0;
    if (request.age < 18) {
      bracketId = 1; // Child (0-17)
    } else if (request.age < 65) {
      bracketId = 2; // Adult (18-64)
    } else {
      bracketId = 3; // Senior (65+)
    }

    witnessCommand = `zokrates compute-witness -a ${request.age} 0 3`;
    verificationResult = bracketId;
  } else {
    throw new Error('Invalid verification type');
  }

  // Execute ZoKrates commands
  await execAsync(`cd ${tempDir} && ${witnessCommand}`);
  await execAsync(`cd ${tempDir} && zokrates generate-proof`);

  // Read and parse the proof
  const proofJson = await fs.promises.readFile(path.join(tempDir, 'proof.json'), 'utf8');
  const proof = JSON.parse(proofJson);

  return {
    proof: {
      a: proof.proof.a,
      b: proof.proof.b,
      c: proof.proof.c,
    },
    inputs: proof.inputs,
    result: verificationResult,
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
      return AGE_VERIFICATION_TYPE;
    case 2:
      return BIRTH_DATE_VERIFICATION_TYPE;
    case 3:
      return AGE_BRACKET_VERIFICATION_TYPE;
    default:
      throw new Error('Invalid verification type');
  }
}

/**
 * Gets the bracket name based on the bracket ID
 */
function getBracketName(bracketId: number): string {
  switch (bracketId) {
    case 1:
      return 'Child (0-17)';
    case 2:
      return 'Adult (18-64)';
    case 3:
      return 'Senior (65+)';
    default:
      return 'Unknown';
  }
}
