import { exec } from 'child_process';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { promisify } from 'util';

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { BlobServiceClient } from '@azure/storage-blob';
import { ethers, isAddress } from 'ethers';

import { ZKPVerificationRegistryService } from '../../../services';

/**
 * @fileoverview Azure Function for FHIR Resource Verification
 * This module handles the verification of FHIR resources using Zero-Knowledge Proofs (ZKPs).
 * It supports three verification modes: Basic, Selective Disclosure, and Reference Validation.
 */

// Promisify exec
const execAsync = promisify(exec);

// Azure Storage configuration
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || '';
const containerName = process.env.ZKP_STORAGE_CONTAINER_NAME || 'zkp-verification-keys';
const fhirVerifierKeyBlob = process.env.FHIR_VERIFIER_KEY_PATH || 'fhir-verifier/verification.key';
const fhirVerifierProvingKeyBlob =
  process.env.FHIR_VERIFIER_PROVING_KEY_PATH || 'fhir-verifier/proving.key';

// Blockchain configuration
const registryContractAddress = process.env.ZKP_REGISTRY_CONTRACT_ADDRESS || '';
const registryContractAbi = [
  'function registerVerification(address subject, bytes32 verificationType, bytes32 verificationId, bool result, uint256 expirationTime, bytes calldata metadata) external',
  'function isVerifierAuthorized(address verifier, bytes32 verificationType) external view returns (bool)',
];

// Verification types - use ethers utils to create bytes32 values
const FHIR_VERIFICATION_TYPE = ethers.encodeBytes32String('fhir');
const FHIR_SELECTIVE_DISCLOSURE_TYPE = ethers.encodeBytes32String('fhir-selective');
const FHIR_REFERENCE_VALIDATION_TYPE = ethers.encodeBytes32String('fhir-reference');

/**
 * Resource types in FHIR
 * These correspond to the main FHIR resource types used in healthcare data
 */
enum ResourceType {
  Patient = 0,
  Observation = 1,
  MedicationRequest = 2,
  Condition = 3,
  Procedure = 4,
  Encounter = 5,
  DiagnosticReport = 6,
  CarePlan = 7,
  Immunization = 8,
  AllergyIntolerance = 9,
  Device = 10,
  Organization = 11,
  Practitioner = 12,
  Location = 13,
  Medication = 14,
  Coverage = 15,
}

/**
 * Verification modes supported by the system
 */
enum VerificationMode {
  Basic = 1,
  SelectiveDisclosure = 2,
  ReferenceValidation = 3,
}

/**
 * Interface for FHIR verification request
 */
interface FHIRVerificationRequest {
  /** Verification mode (1=basic, 2=selective disclosure, 3=reference validation) */
  verificationMode: VerificationMode;
  /** FHIR resource type (0-15 for different resource types) */
  resourceType: ResourceType;
  /** 8 field values representing the resource data */
  resourceData: number[];
  /** The expected hash (2 parts for uint256[2]) */
  expectedHash: string[];
  /** 8 values (0 or 1) for selective disclosure mode */
  disclosureMask?: number[];
  /** For reference validation mode */
  referencedResourceType?: ResourceType;
  /** 8 field values for reference validation mode */
  referencedResourceData?: number[];
  /** Ethereum address of the subject */
  subject: string;
  /** Number of days until the verification expires (0 = never) */
  expirationDays?: number;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Interface for the verification response
 */
interface FHIRVerificationResponse {
  success: boolean;
  proof: any;
  verificationId: string;
  txHash: string;
  resourceType: string;
  verificationMode: string;
  expirationTime: string;
  timestamp: string;
  metadata: Record<string, any>;
}

/**
 * Azure Function for FHIR Resource Verification
 * This function generates and verifies ZKP proofs for FHIR resources and registers
 * the verification result on-chain.
 */
app.http('fhirVerification', {
  methods: ['POST'],
  authLevel: 'function',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const requestId = crypto.randomUUID();

    context.info('Processing FHIR verification request');

    try {
      // Parse request body
      const requestData = (await request.json()) as FHIRVerificationRequest;
      context.debug(
        { requestType: requestData.resourceType, mode: requestData.verificationMode },
        'Request data received'
      );

      // Validate request
      const validationError = validateRequest(requestData);
      if (validationError) {
        context.warn({ error: validationError }, 'Validation error');
        return {
          status: 400,
          body: JSON.stringify({ error: validationError }),
          headers: {
            'Content-Type': 'application/json',
          },
        };
      }

      // Check if the registry contract address is configured
      if (!registryContractAddress) {
        context.error('ZKP registry contract address not configured');
        return {
          status: 500,
          body: JSON.stringify({ error: 'ZKP registry contract not configured on the server' }),
          headers: {
            'Content-Type': 'application/json',
          },
        };
      }

      // Check if Azure Storage connection string is configured
      if (!connectionString) {
        context.error('Azure Storage connection string not configured');
        return {
          status: 500,
          body: JSON.stringify({ error: 'Storage configuration missing on the server' }),
          headers: {
            'Content-Type': 'application/json',
          },
        };
      }

      // Create a temporary directory for ZoKrates files
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `fhir-verification-${requestId}-`));
      context.debug(`Created temporary directory: ${tempDir}`);

      try {
        // Download verification and proving keys from Azure Blob Storage
        const { verificationKeyPath, provingKeyPath } = await downloadVerificationKeys(
          connectionString,
          containerName,
          fhirVerifierKeyBlob,
          fhirVerifierProvingKeyBlob,
          tempDir,
          context
        );

        context.debug(`Downloaded verification and proving keys`);
        context.debug(`Verification key path: ${verificationKeyPath}`);
        context.debug(`Proving key path: ${provingKeyPath}`);

        // Prepare ZoKrates arguments based on verification mode
        const zokratesArgs = prepareZokratesArgs(requestData);
        context.debug('Prepared ZoKrates arguments');

        // Generate ZKP proof
        const proofData = await generateZKPProof(tempDir, zokratesArgs, context);
        context.info('Successfully generated ZKP proof');

        // Determine verification type based on mode
        const verificationType = getVerificationType(requestData.verificationMode);

        // Register the verification result on-chain
        const verificationResult = await registerVerificationOnChain(
          requestData,
          verificationType,
          context
        );

        const txHash = verificationResult.transactionReceipt.hash;
        context.info(`Registered verification result on-chain: ${txHash}`);

        // Prepare the response
        const response: FHIRVerificationResponse = {
          success: true,
          proof: proofData,
          verificationId: verificationResult.verificationId,
          txHash,
          resourceType: getResourceTypeString(requestData.resourceType),
          verificationMode: getVerificationModeString(requestData.verificationMode),
          expirationTime: getExpirationTimeString(requestData.expirationDays || 0),
          timestamp: new Date().toISOString(),
          metadata: {
            requestId,
            timestamp: Date.now(),
            resourceType: getResourceTypeString(requestData.resourceType),
            verificationMode: getVerificationModeString(requestData.verificationMode),
            ...requestData.metadata,
          },
        };

        return {
          status: 200,
          body: JSON.stringify(response),
          headers: {
            'Content-Type': 'application/json',
          },
        };
      } finally {
        // Clean up temporary directory
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
          context.debug(`Cleaned up temporary directory: ${tempDir}`);
        } catch (cleanupError) {
          context.warn({ error: cleanupError }, 'Failed to clean up temporary directory');
        }
      }
    } catch (error: any) {
      context.error({ error: error.message, stack: error.stack }, 'Error in FHIR verification');

      return {
        status: 500,
        body: JSON.stringify({
          error: 'An error occurred during FHIR verification',
          message: error.message,
          requestId,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }
  },
});

/**
 * Validates the FHIR verification request
 * @param requestData The request data to validate
 * @returns Error message if validation fails, undefined if validation succeeds
 */
function validateRequest(requestData: FHIRVerificationRequest): string | undefined {
  // Check required fields
  if (
    !requestData ||
    requestData.resourceType === undefined ||
    !requestData.resourceData ||
    !requestData.expectedHash ||
    !requestData.subject ||
    !requestData.verificationMode
  ) {
    return 'Invalid request. Missing required fields.';
  }

  // Validate resource type
  if (requestData.resourceType < 0 || requestData.resourceType > 15) {
    return 'Invalid resource type. Must be between 0 (Patient) and 15 (Coverage).';
  }

  // Validate verification mode
  if (requestData.verificationMode < 1 || requestData.verificationMode > 3) {
    return 'Invalid verification mode. Must be 1 (Basic), 2 (Selective Disclosure), or 3 (Reference Validation).';
  }

  // Validate resource data
  if (!Array.isArray(requestData.resourceData) || requestData.resourceData.length !== 8) {
    return 'Resource data must be an array of 8 numbers.';
  }

  // Validate expected hash
  if (!Array.isArray(requestData.expectedHash) || requestData.expectedHash.length !== 2) {
    return 'Expected hash must be an array of 2 strings.';
  }

  // Validate Ethereum address
  if (!isAddress(requestData.subject)) {
    return 'Subject must be a valid Ethereum address.';
  }

  // Mode-specific validation
  if (requestData.verificationMode === VerificationMode.SelectiveDisclosure) {
    if (
      !requestData.disclosureMask ||
      !Array.isArray(requestData.disclosureMask) ||
      requestData.disclosureMask.length !== 8
    ) {
      return 'Selective disclosure mode requires a disclosure mask array of 8 values (0 or 1).';
    }
  }

  if (requestData.verificationMode === VerificationMode.ReferenceValidation) {
    if (
      requestData.referencedResourceType === undefined ||
      !requestData.referencedResourceData ||
      !Array.isArray(requestData.referencedResourceData) ||
      requestData.referencedResourceData.length !== 8
    ) {
      return 'Reference validation mode requires a referenced resource type and referenced resource data array of 8 values.';
    }

    if (requestData.referencedResourceType < 0 || requestData.referencedResourceType > 15) {
      return 'Referenced resource type must be between 0 (Patient) and 15 (Coverage).';
    }
  }

  // Validate expiration days
  if (
    requestData.expirationDays !== undefined &&
    (requestData.expirationDays < 0 || !Number.isInteger(requestData.expirationDays))
  ) {
    return 'Expiration days must be a non-negative integer.';
  }

  return undefined;
}

/**
 * Downloads verification and proving keys from Azure Blob Storage
 */
async function downloadVerificationKeys(
  connectionString: string,
  containerName: string,
  verificationKeyBlobName: string,
  provingKeyBlobName: string,
  tempDir: string,
  logger: any
): Promise<{ verificationKeyPath: string; provingKeyPath: string }> {
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const verificationKeyClient = containerClient.getBlockBlobClient(verificationKeyBlobName);
    const provingKeyClient = containerClient.getBlockBlobClient(provingKeyBlobName);

    const verificationKeyPath = path.join(tempDir, 'verification.key');
    const provingKeyPath = path.join(tempDir, 'proving.key');

    await verificationKeyClient.downloadToFile(verificationKeyPath);
    await provingKeyClient.downloadToFile(provingKeyPath);

    logger.debug('Downloaded verification and proving keys');

    return { verificationKeyPath, provingKeyPath };
  } catch (error: any) {
    logger.error({ error: error.message }, 'Failed to download verification keys');
    throw new Error(`Failed to download verification keys: ${error.message}`);
  }
}

/**
 * Prepares ZoKrates arguments based on verification mode
 */
function prepareZokratesArgs(requestData: FHIRVerificationRequest): number[] {
  let zokratesArgs = [
    ...requestData.resourceData,
    requestData.resourceType + 1, // Add 1 to match ZoKrates enum (1-based)
    parseInt(requestData.expectedHash[0]),
    parseInt(requestData.expectedHash[1]),
  ];

  // Add mode-specific arguments
  if (requestData.verificationMode === VerificationMode.SelectiveDisclosure) {
    zokratesArgs = [
      ...zokratesArgs,
      ...(requestData.disclosureMask || Array(8).fill(1)),
      requestData.verificationMode,
    ];
  } else if (requestData.verificationMode === VerificationMode.ReferenceValidation) {
    zokratesArgs = [
      ...zokratesArgs,
      ...Array(8).fill(0), // Default disclosure mask
      requestData.verificationMode,
      ...(requestData.referencedResourceData || Array(8).fill(0)),
      (requestData.referencedResourceType || 0) + 1, // Add 1 to match ZoKrates enum (1-based)
    ];
  } else {
    // Basic validation
    zokratesArgs = [
      ...zokratesArgs,
      ...Array(8).fill(1), // Default disclosure mask (disclose all)
      requestData.verificationMode,
      ...Array(8).fill(0), // Default referenced resource data
      0, // Default referenced resource type
    ];
  }

  return zokratesArgs;
}

/**
 * Generates a ZKP proof using ZoKrates
 */
async function generateZKPProof(
  tempDir: string,
  zokratesArgs: number[],
  logger: any
): Promise<any> {
  try {
    // Generate the proof using ZoKrates
    // In a production environment, you would use a more secure approach
    // such as a dedicated service or container for proof generation
    const zokratesCommand = `zokrates compute-witness -a ${zokratesArgs.join(' ')} && zokrates generate-proof`;
    await execAsync(zokratesCommand, { cwd: tempDir });

    logger.debug('Generated ZKP proof');

    // Read the generated proof
    const proofPath = path.join(tempDir, 'proof.json');
    return JSON.parse(fs.readFileSync(proofPath, 'utf8'));
  } catch (error: any) {
    logger.error({ error: error.message, command: 'zokrates' }, 'Failed to generate ZKP proof');
    throw new Error(`Failed to generate ZKP proof: ${error.message}`);
  }
}

/**
 * Determines the verification type based on mode
 */
function getVerificationType(mode: VerificationMode): string {
  switch (mode) {
    case VerificationMode.SelectiveDisclosure:
      return FHIR_SELECTIVE_DISCLOSURE_TYPE;
    case VerificationMode.ReferenceValidation:
      return FHIR_REFERENCE_VALIDATION_TYPE;
    default:
      return FHIR_VERIFICATION_TYPE;
  }
}

/**
 * Registers the verification result on-chain
 */
async function registerVerificationOnChain(
  requestData: FHIRVerificationRequest,
  verificationType: string,
  logger: any
): Promise<any> {
  try {
    // Create registry service
    const registryService = new ZKPVerificationRegistryService(
      registryContractAddress,
      registryContractAbi
    );

    // Calculate expiration time (0 = never expires)
    const expirationDays = requestData.expirationDays || 0;
    const expirationTime =
      expirationDays > 0 ? Math.floor(Date.now() / 1000) + expirationDays * 86400 : 0;

    // Prepare metadata
    const metadata = {
      timestamp: Date.now(),
      resourceType: getResourceTypeString(requestData.resourceType),
      verificationMode: getVerificationModeString(requestData.verificationMode),
      ...requestData.metadata,
    };

    // Register the verification result
    return await registryService.registerVerification(
      requestData.subject,
      verificationType,
      true, // result
      expirationTime,
      metadata
    );
  } catch (error: any) {
    logger.error({ error: error.message }, 'Failed to register verification on-chain');
    throw new Error(`Failed to register verification on-chain: ${error.message}`);
  }
}

/**
 * Returns the string representation of a resource type
 */
function getResourceTypeString(resourceType: ResourceType): string {
  const resourceTypes = [
    'Patient',
    'Observation',
    'MedicationRequest',
    'Condition',
    'Procedure',
    'Encounter',
    'DiagnosticReport',
    'CarePlan',
    'Immunization',
    'AllergyIntolerance',
    'Device',
    'Organization',
    'Practitioner',
    'Location',
    'Medication',
    'Coverage',
  ];

  return resourceTypes[resourceType] || 'Unknown';
}

/**
 * Returns the string representation of a verification mode
 */
function getVerificationModeString(mode: VerificationMode): string {
  switch (mode) {
    case VerificationMode.Basic:
      return 'Basic';
    case VerificationMode.SelectiveDisclosure:
      return 'SelectiveDisclosure';
    case VerificationMode.ReferenceValidation:
      return 'ReferenceValidation';
    default:
      return 'Unknown';
  }
}

/**
 * Returns the string representation of an expiration time
 */
function getExpirationTimeString(expirationDays: number): string {
  if (expirationDays <= 0) {
    return 'never';
  }

  const expirationTime = Math.floor(Date.now() / 1000) + expirationDays * 86400;
  return new Date(expirationTime * 1000).toISOString();
}
