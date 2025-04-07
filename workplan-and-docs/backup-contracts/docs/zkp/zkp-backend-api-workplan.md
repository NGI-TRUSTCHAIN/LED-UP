# ZKP Backend API Implementation Plan

## Overview

This document outlines the implementation plan for creating a secure, scalable backend API for off-chain Zero-Knowledge Proof (ZKP) verification. The API will provide the same verification functionality as the on-chain smart contracts but will execute the verification process off-chain to reduce gas costs and improve performance.

## Architecture

### High-Level Architecture

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│             │     │                 │     │                 │     │                 │
│  Frontend   │────▶│  Azure Function │────▶│  ZKP Verifier   │────▶│  Blockchain     │
│  Application│     │  API            │     │  Service        │     │  (Optional)     │
│             │     │                 │     │                 │     │                 │
└─────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
                            │                       │
                            ▼                       ▼
                    ┌─────────────────┐     ┌─────────────────┐
                    │                 │     │                 │
                    │  Azure Key Vault│     │  Azure Storage  │
                    │  (Secrets)      │     │  (Verification  │
                    │                 │     │   Keys)         │
                    └─────────────────┘     └─────────────────┘
```

### Components

1. **Frontend Application**: Client application that generates ZKPs and sends them to the API for verification
2. **Azure Function API**: Serverless API endpoints that receive ZKP verification requests
3. **ZKP Verifier Service**: Core service that performs the actual verification of ZKPs
4. **Azure Key Vault**: Secure storage for API keys and secrets
5. **Azure Storage**: Storage for verification keys and other persistent data
6. **Blockchain (Optional)**: For storing verification results or proof hashes on-chain

## Implementation Plan

### Phase 1: Setup and Infrastructure

#### 1.1 Project Setup

- Create a new Azure Functions project using TypeScript
- Set up project structure with proper separation of concerns:
  ```
  /
  ├── src/
  │   ├── functions/           # Azure Functions endpoints
  │   ├── services/            # Business logic services
  │   │   └── zkp/             # ZKP verification services
  │   ├── models/              # Data models and DTOs
  │   ├── utils/               # Utility functions
  │   └── config/              # Configuration
  ├── test/                    # Unit and integration tests
  ├── keys/                    # Verification keys (for development only)
  └── scripts/                 # Deployment and utility scripts
  ```

#### 1.2 Infrastructure Setup

- Set up Azure Key Vault for storing secrets
- Set up Azure Blob Storage for storing verification keys
- Configure Azure Functions with proper authentication and authorization
- Set up CI/CD pipeline for automated deployment

### Phase 2: Core ZKP Verification Implementation

#### 2.1 ZKP Verification Service

Create a service that can verify ZKPs using the same logic as the smart contracts:

```typescript
// src/services/zkp/verifier.ts
export interface ZKPVerificationRequest {
  proofType: string; // e.g., "AGE_VERIFIER"
  proof: {
    a: [string, string]; // G1Point
    b: [[string, string], [string, string]]; // G2Point
    c: [string, string]; // G1Point
  };
  inputs: string[]; // Public inputs
}

export interface ZKPVerificationResult {
  isValid: boolean;
  verificationId?: string; // Optional ID for tracking
  timestamp: number;
}

export class ZKPVerifier {
  async verify(request: ZKPVerificationRequest): Promise<ZKPVerificationResult> {
    // 1. Load the appropriate verification key based on proofType
    // 2. Perform the verification using snarkjs or similar library
    // 3. Return the result
  }
}
```

#### 2.2 Verification Key Management

Create a service to manage verification keys:

```typescript
// src/services/zkp/keyManager.ts
export class VerificationKeyManager {
  async getVerificationKey(verifierType: string): Promise<any> {
    // Retrieve the verification key from Azure Blob Storage
    // or Azure Key Vault based on the verifier type
  }

  async storeVerificationKey(verifierType: string, key: any): Promise<void> {
    // Store a new verification key in Azure Blob Storage
    // or Azure Key Vault
  }
}
```

#### 2.3 Proof Hash Registry (Optional)

If we want to store proof hashes on-chain:

```typescript
// src/services/zkp/proofRegistry.ts
export class ProofHashRegistry {
  async storeProofHash(proofHash: string): Promise<string> {
    // Store the proof hash on-chain using ethers.js
    // Return the transaction hash
  }

  async verifyProofHash(proofHash: string): Promise<boolean> {
    // Verify if the proof hash exists on-chain
  }
}
```

### Phase 3: API Endpoints Implementation

#### 3.1 Verification Endpoint

```typescript
// src/functions/verifyProof.ts
import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { ZKPVerifier, ZKPVerificationRequest } from '../services/zkp/verifier';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  const logger = context.log;
  logger.info('Verify ZKP function processed a request.');

  try {
    // 1. Validate request
    const request: ZKPVerificationRequest = req.body;
    if (!request || !request.proofType || !request.proof || !request.inputs) {
      context.res = {
        status: 400,
        body: { error: 'Invalid request. Missing required fields.' },
      };
      return;
    }

    // 2. Verify the proof
    const verifier = new ZKPVerifier();
    const result = await verifier.verify(request);

    // 3. Return the result
    context.res = {
      status: 200,
      body: result,
    };
  } catch (error) {
    logger.error(`Error verifying proof: ${error.message}`);
    context.res = {
      status: 500,
      body: { error: 'An error occurred while verifying the proof.' },
    };
  }
};

export default httpTrigger;
```

#### 3.2 Age Verification Endpoint

```typescript
// src/functions/verifyAge.ts
import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { ZKPVerifier } from '../services/zkp/verifier';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  const logger = context.log;
  logger.info('Verify Age ZKP function processed a request.');

  try {
    // 1. Validate request
    const { proof, threshold } = req.body;
    if (!proof || !threshold) {
      context.res = {
        status: 400,
        body: { error: 'Invalid request. Missing proof or threshold.' },
      };
      return;
    }

    // 2. Prepare verification request
    const request = {
      proofType: 'AGE_VERIFIER',
      proof: proof,
      inputs: [threshold.toString()],
    };

    // 3. Verify the proof
    const verifier = new ZKPVerifier();
    const result = await verifier.verify(request);

    // 4. Return the result
    context.res = {
      status: 200,
      body: {
        isValid: result.isValid,
        threshold: threshold,
        verificationId: result.verificationId,
        timestamp: result.timestamp,
      },
    };
  } catch (error) {
    logger.error(`Error verifying age proof: ${error.message}`);
    context.res = {
      status: 500,
      body: { error: 'An error occurred while verifying the age proof.' },
    };
  }
};

export default httpTrigger;
```

### Phase 4: Security Implementation

#### 4.1 Authentication and Authorization

- Implement Azure AD B2C or another authentication provider
- Set up role-based access control (RBAC) for API endpoints
- Configure API Management policies for rate limiting and IP filtering

#### 4.2 Secure Communication

- Ensure all API endpoints use HTTPS
- Implement proper CORS policies
- Use Azure Private Link for secure communication between services

#### 4.3 Key Management

- Implement key rotation policies for verification keys
- Set up access controls for key management operations
- Configure audit logging for all key access operations

### Phase 5: Testing and Validation

#### 5.1 Unit Testing

- Write unit tests for all core services and utilities
- Implement test fixtures for verification keys and proofs
- Set up automated test runs in CI/CD pipeline

#### 5.2 Integration Testing

- Test the complete verification flow from API to verification service
- Test error handling and edge cases
- Validate performance under load

#### 5.3 Security Testing

- Perform penetration testing on API endpoints
- Validate authentication and authorization mechanisms
- Test for common vulnerabilities (OWASP Top 10)

### Phase 6: Deployment and Monitoring

#### 6.1 Deployment

- Set up staging and production environments
- Configure deployment slots for zero-downtime deployments
- Implement infrastructure as code (IaC) using Azure Resource Manager (ARM) templates or Terraform

#### 6.2 Monitoring and Logging

- Set up Application Insights for monitoring
- Configure alerting for critical errors and performance issues
- Implement structured logging for all operations

#### 6.3 Documentation

- Create API documentation using OpenAPI/Swagger
- Document deployment and operation procedures
- Create user guides for frontend integration

## Technical Implementation Details

### ZKP Verification Implementation

The core verification logic will be implemented using the `snarkjs` library, which provides JavaScript/TypeScript functions for verifying ZKPs:

```typescript
// src/services/zkp/verifier.ts (implementation)
import * as snarkjs from 'snarkjs';
import { VerificationKeyManager } from './keyManager';

export class ZKPVerifier {
  private keyManager: VerificationKeyManager;

  constructor() {
    this.keyManager = new VerificationKeyManager();
  }

  async verify(request: ZKPVerificationRequest): Promise<ZKPVerificationResult> {
    // 1. Get the verification key
    const vKey = await this.keyManager.getVerificationKey(request.proofType);

    // 2. Convert proof format if necessary
    const proof = {
      pi_a: request.proof.a,
      pi_b: request.proof.b,
      pi_c: request.proof.c,
    };

    // 3. Verify the proof
    const isValid = await snarkjs.groth16.verify(vKey, request.inputs, proof);

    // 4. Generate a verification ID (UUID)
    const verificationId = crypto.randomUUID();

    // 5. Return the result
    return {
      isValid,
      verificationId,
      timestamp: Date.now(),
    };
  }
}
```

### Verification Key Storage

Verification keys will be stored in Azure Blob Storage with proper access controls:

```typescript
// src/services/zkp/keyManager.ts (implementation)
import { BlobServiceClient } from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';

export class VerificationKeyManager {
  private blobServiceClient: BlobServiceClient;
  private containerName: string = 'verification-keys';

  constructor() {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  }

  async getVerificationKey(verifierType: string): Promise<any> {
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    const blobClient = containerClient.getBlobClient(`${verifierType}.json`);

    const downloadResponse = await blobClient.download();
    const keyData = await streamToString(downloadResponse.readableStreamBody);

    return JSON.parse(keyData);
  }

  async storeVerificationKey(verifierType: string, key: any): Promise<void> {
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    await containerClient.createIfNotExists();

    const blobClient = containerClient.getBlobClient(`${verifierType}.json`);
    const keyData = JSON.stringify(key);

    await blobClient.upload(keyData, keyData.length);
  }
}

// Helper function to convert stream to string
async function streamToString(readableStream: NodeJS.ReadableStream): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on('data', (data) => {
      chunks.push(data.toString());
    });
    readableStream.on('end', () => {
      resolve(chunks.join(''));
    });
    readableStream.on('error', reject);
  });
}
```

### On-Chain Proof Hash Storage (Optional)

If we want to store proof hashes on-chain for additional verification:

```typescript
// src/services/zkp/proofRegistry.ts (implementation)
import { ethers } from 'ethers';
import { createHash } from 'crypto';

export class ProofHashRegistry {
  private provider: ethers.providers.Provider;
  private contract: ethers.Contract;
  private signer: ethers.Signer;

  constructor() {
    // Initialize ethers provider and contract
    const providerUrl = process.env.ETHEREUM_PROVIDER_URL;
    this.provider = new ethers.providers.JsonRpcProvider(providerUrl);

    const privateKey = process.env.ETHEREUM_PRIVATE_KEY;
    this.signer = new ethers.Wallet(privateKey, this.provider);

    const contractAddress = process.env.PROOF_REGISTRY_CONTRACT_ADDRESS;
    const contractAbi = [
      'function storeProof(bytes32 proofHash) external',
      'function verifyProof(bytes32 proofHash) external view returns (bool)',
    ];

    this.contract = new ethers.Contract(contractAddress, contractAbi, this.signer);
  }

  async generateProofHash(proof: any, inputs: string[]): Promise<string> {
    // Create a deterministic string representation of the proof and inputs
    const proofString = JSON.stringify({ proof, inputs });

    // Generate SHA-256 hash
    return '0x' + createHash('sha256').update(proofString).digest('hex');
  }

  async storeProofHash(proofHash: string): Promise<string> {
    // Store the proof hash on-chain
    const tx = await this.contract.storeProof(proofHash);
    await tx.wait();

    return tx.hash;
  }

  async verifyProofHash(proofHash: string): Promise<boolean> {
    // Verify if the proof hash exists on-chain
    return await this.contract.verifyProof(proofHash);
  }
}
```

## Enhanced Implementation with zokrates-js

To provide a more comprehensive implementation, we can use `zokrates-js` directly for verification. This approach gives us more control over the verification process and allows us to work with ZoKrates programs directly.

### 1. ZoKrates Integration Service

```typescript
// src/services/zkp/zokratesService.ts
import { initialize } from 'zokrates-js';
import { VerificationKeyManager } from './keyManager';

export interface ZoKratesVerificationRequest {
  proofType: string;
  proof: {
    a: [string, string];
    b: [[string, string], [string, string]];
    c: [string, string];
  };
  inputs: string[];
}

export class ZoKratesService {
  private keyManager: VerificationKeyManager;
  private zokratesProvider: any;
  private initialized: boolean = false;

  constructor() {
    this.keyManager = new VerificationKeyManager();
    this.initializeZoKrates();
  }

  private async initializeZoKrates(): Promise<void> {
    if (!this.initialized) {
      this.zokratesProvider = await initialize();
      this.initialized = true;
    }
  }

  async verifyProof(request: ZoKratesVerificationRequest): Promise<boolean> {
    // Ensure ZoKrates is initialized
    if (!this.initialized) {
      await this.initializeZoKrates();
    }

    // Get the verification key
    const verificationKey = await this.keyManager.getVerificationKey(request.proofType);

    // Format the proof for ZoKrates
    const proof = {
      proof: {
        a: request.proof.a,
        b: request.proof.b,
        c: request.proof.c,
      },
      inputs: request.inputs,
    };

    // Verify the proof
    return this.zokratesProvider.verify(verificationKey, proof);
  }

  async generateVerificationKey(program: Uint8Array): Promise<any> {
    // Ensure ZoKrates is initialized
    if (!this.initialized) {
      await this.initializeZoKrates();
    }

    // Compile the program
    const artifacts = this.zokratesProvider.compile(program);

    // Perform the setup
    const { verificationKey } = this.zokratesProvider.setup(artifacts.program);

    return verificationKey;
  }
}
```

### 2. Age Verification with ZoKrates

```typescript
// src/services/zkp/ageVerifier.ts
import { ZoKratesService } from './zokratesService';

export interface AgeVerificationRequest {
  proof: {
    a: [string, string];
    b: [[string, string], [string, string]];
    c: [string, string];
  };
  threshold: number;
}

export class AgeVerifier {
  private zokratesService: ZoKratesService;

  constructor() {
    this.zokratesService = new ZoKratesService();
  }

  async verifyAge(request: AgeVerificationRequest): Promise<boolean> {
    const zkpRequest = {
      proofType: 'AGE_VERIFIER',
      proof: request.proof,
      inputs: [request.threshold.toString()],
    };

    return await this.zokratesService.verifyProof(zkpRequest);
  }
}
```

### 3. Hash Verification with ZoKrates

```typescript
// src/services/zkp/hashVerifier.ts
import { ZoKratesService } from './zokratesService';

export interface HashVerificationRequest {
  proof: {
    a: [string, string];
    b: [[string, string], [string, string]];
    c: [string, string];
  };
  expectedHash: [string, string]; // Two-part hash representation
}

export class HashVerifier {
  private zokratesService: ZoKratesService;

  constructor() {
    this.zokratesService = new ZoKratesService();
  }

  async verifyHash(request: HashVerificationRequest): Promise<boolean> {
    const zkpRequest = {
      proofType: 'HASH_VERIFIER',
      proof: request.proof,
      inputs: [request.expectedHash[0], request.expectedHash[1]],
    };

    return await this.zokratesService.verifyProof(zkpRequest);
  }
}
```

### 4. FHIR Resource Verification with ZoKrates

```typescript
// src/services/zkp/fhirVerifier.ts
import { ZoKratesService } from './zokratesService';

// Enum to match the contract's ResourceType
export enum ResourceType {
  Patient = 0,
  Observation = 1,
  MedicationRequest = 2,
  Condition = 3,
}

export interface FHIRVerificationRequest {
  proof: {
    a: [string, string];
    b: [[string, string], [string, string]];
    c: [string, string];
  };
  resourceType: ResourceType;
  expectedHash: [string, string]; // Two-part hash representation
  requiredField: number;
}

export class FHIRVerifier {
  private zokratesService: ZoKratesService;

  constructor() {
    this.zokratesService = new ZoKratesService();
  }

  async verifyFHIRResource(request: FHIRVerificationRequest): Promise<boolean> {
    // Add 1 to match ZoKrates enum (1-based) as in the smart contract
    const resourceTypeValue = request.resourceType + 1;

    const zkpRequest = {
      proofType: 'FHIR_VERIFIER',
      proof: request.proof,
      inputs: [
        resourceTypeValue.toString(),
        request.expectedHash[0],
        request.expectedHash[1],
        request.requiredField.toString(),
      ],
    };

    return await this.zokratesService.verifyProof(zkpRequest);
  }

  // Helper method to get resource type string
  getResourceTypeString(resourceType: ResourceType): string {
    switch (resourceType) {
      case ResourceType.Patient:
        return 'Patient';
      case ResourceType.Observation:
        return 'Observation';
      case ResourceType.MedicationRequest:
        return 'MedicationRequest';
      case ResourceType.Condition:
        return 'Condition';
      default:
        throw new Error('Invalid resource type');
    }
  }
}
```

### 5. Proof Generation Helpers

```typescript
// src/services/zkp/proofGenerator.ts
import { initialize } from 'zokrates-js';
import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { ResourceType } from './fhirVerifier';

export class ProofGenerator {
  private zokratesProvider: any;
  private initialized: boolean = false;

  constructor() {
    this.initializeZoKrates();
  }

  private async initializeZoKrates(): Promise<void> {
    if (!this.initialized) {
      this.zokratesProvider = await initialize();
      this.initialized = true;
    }
  }

  async generateAgeProof(age: number, threshold: number): Promise<any> {
    // Ensure ZoKrates is initialized
    if (!this.initialized) {
      await this.initializeZoKrates();
    }

    // Load the age verification program
    const source = fs.readFileSync(path.resolve(__dirname, '../../../zokrates/age_check.zok'), 'utf-8');

    // Compile the program
    const artifacts = this.zokratesProvider.compile(source);

    // Compute the witness
    const { witness } = this.zokratesProvider.computeWitness(artifacts, [age.toString(), threshold.toString()]);

    // Generate the proof
    const { proof, inputs } = this.zokratesProvider.generateProof(artifacts.program, witness);

    return { proof, inputs };
  }

  async generateHashProof(preimage: string, expectedHash: [string, string]): Promise<any> {
    // Ensure ZoKrates is initialized
    if (!this.initialized) {
      await this.initializeZoKrates();
    }

    // Load the hash verification program
    const source = fs.readFileSync(path.resolve(__dirname, '../../../zokrates/hash_check.zok'), 'utf-8');

    // Compile the program
    const artifacts = this.zokratesProvider.compile(source);

    // Convert preimage to field elements (simplified example)
    const preimageAsFieldElements = this.stringToFieldElements(preimage);

    // Compute the witness
    const { witness } = this.zokratesProvider.computeWitness(artifacts, [
      ...preimageAsFieldElements,
      expectedHash[0],
      expectedHash[1],
    ]);

    // Generate the proof
    const { proof, inputs } = this.zokratesProvider.generateProof(artifacts.program, witness);

    return { proof, inputs };
  }

  async generateFHIRProof(
    fhirResource: any,
    resourceType: ResourceType,
    expectedHash: [string, string],
    requiredField: number
  ): Promise<any> {
    // Ensure ZoKrates is initialized
    if (!this.initialized) {
      await this.initializeZoKrates();
    }

    // Load the FHIR verification program
    const source = fs.readFileSync(path.resolve(__dirname, '../../../zokrates/fhir_check.zok'), 'utf-8');

    // Compile the program
    const artifacts = this.zokratesProvider.compile(source);

    // Convert FHIR resource to field elements (simplified example)
    const resourceAsFieldElements = this.jsonToFieldElements(fhirResource);

    // Add 1 to match ZoKrates enum (1-based) as in the smart contract
    const resourceTypeValue = resourceType + 1;

    // Compute the witness
    const { witness } = this.zokratesProvider.computeWitness(artifacts, [
      ...resourceAsFieldElements,
      resourceTypeValue.toString(),
      expectedHash[0],
      expectedHash[1],
      requiredField.toString(),
    ]);

    // Generate the proof
    const { proof, inputs } = this.zokratesProvider.generateProof(artifacts.program, witness);

    return { proof, inputs };
  }

  // Helper method to convert string to field elements
  private stringToFieldElements(str: string): string[] {
    // This is a simplified implementation
    // In a real implementation, you would need to convert the string to field elements
    // based on the specific requirements of your ZoKrates program
    const bytes = Buffer.from(str, 'utf-8');
    return Array.from(bytes).map((b) => b.toString());
  }

  // Helper method to convert JSON to field elements
  private jsonToFieldElements(json: any): string[] {
    // This is a simplified implementation
    // In a real implementation, you would need to convert the JSON to field elements
    // based on the specific requirements of your ZoKrates program
    const jsonString = JSON.stringify(json);
    return this.stringToFieldElements(jsonString);
  }

  // Helper method to generate a two-part hash
  public generateTwoPartHash(data: string): [string, string] {
    // This is a simplified implementation
    // In a real implementation, you would need to generate a hash that matches
    // the hash function used in your ZoKrates program
    const hash = createHash('sha256').update(data).digest('hex');

    // Split the hash into two parts (simplified)
    const part1 = BigInt('0x' + hash.substring(0, 32)).toString();
    const part2 = BigInt('0x' + hash.substring(32, 64)).toString();

    return [part1, part2];
  }
}
```

### 6. Azure Function for Hash Verification

```typescript
// src/functions/verifyHash.ts
import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { HashVerifier } from '../services/zkp/hashVerifier';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  const logger = context.log;
  logger.info('Verify Hash ZKP function processed a request.');

  try {
    // 1. Validate request
    const { proof, expectedHash } = req.body;
    if (!proof || !expectedHash || !Array.isArray(expectedHash) || expectedHash.length !== 2) {
      context.res = {
        status: 400,
        body: { error: 'Invalid request. Missing proof or expectedHash (should be an array of 2 elements).' },
      };
      return;
    }

    // 2. Verify the hash proof
    const hashVerifier = new HashVerifier();
    const isValid = await hashVerifier.verifyHash({ proof, expectedHash });

    // 3. Return the result
    context.res = {
      status: 200,
      body: {
        isValid,
        expectedHash,
        timestamp: Date.now(),
      },
    };
  } catch (error) {
    logger.error(`Error verifying hash proof: ${error.message}`);
    context.res = {
      status: 500,
      body: { error: 'An error occurred while verifying the hash proof.' },
    };
  }
};

export default httpTrigger;
```

### 7. Azure Function for FHIR Resource Verification

```typescript
// src/functions/verifyFHIRResource.ts
import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { FHIRVerifier, ResourceType } from '../services/zkp/fhirVerifier';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  const logger = context.log;
  logger.info('Verify FHIR Resource ZKP function processed a request.');

  try {
    // 1. Validate request
    const { proof, resourceType, expectedHash, requiredField } = req.body;
    if (!proof || resourceType === undefined || !expectedHash || requiredField === undefined) {
      context.res = {
        status: 400,
        body: { error: 'Invalid request. Missing required fields.' },
      };
      return;
    }

    // Validate resource type
    if (resourceType < 0 || resourceType > 3) {
      context.res = {
        status: 400,
        body: {
          error:
            'Invalid resource type. Must be 0 (Patient), 1 (Observation), 2 (MedicationRequest), or 3 (Condition).',
        },
      };
      return;
    }

    // 2. Verify the FHIR resource
    const fhirVerifier = new FHIRVerifier();
    const isValid = await fhirVerifier.verifyFHIRResource({
      proof,
      resourceType,
      expectedHash,
      requiredField,
    });

    // 3. Return the result
    context.res = {
      status: 200,
      body: {
        isValid,
        resourceType: fhirVerifier.getResourceTypeString(resourceType),
        expectedHash,
        requiredField,
        timestamp: Date.now(),
      },
    };
  } catch (error) {
    logger.error(`Error verifying FHIR resource: ${error.message}`);
    context.res = {
      status: 500,
      body: { error: 'An error occurred while verifying the FHIR resource.' },
    };
  }
};

export default httpTrigger;
```

### 8. Sample ZoKrates Programs

#### Age Verification Program

```zokrates
// zokrates/age_check.zok
def main(private field age, field threshold) -> bool {
    bool result = age >= threshold;
    return result;
}
```

#### Hash Verification Program

```zokrates
// zokrates/hash_check.zok
// Import the sha256 hash function
from "EMBED" import sha256(u32[8]) -> u32[8];

// Convert bytes to u32 array for sha256
def bytes_to_u32_array(u8[32] bytes) -> u32[8] {
    u32[8] result = [0; 8];
    for u32 i in 0..8 {
        result[i] = (bytes[i*4] as u32) << 24 |
                    (bytes[i*4+1] as u32) << 16 |
                    (bytes[i*4+2] as u32) << 8 |
                    (bytes[i*4+3] as u32);
    }
    return result;
}

// Main function to verify a hash
def main(private u8[32] preimage, field[2] expected_hash) -> bool {
    // Convert preimage to u32 array
    u32[8] preimage_u32 = bytes_to_u32_array(preimage);

    // Compute hash
    u32[8] hash = sha256(preimage_u32);

    // Convert hash to field elements (simplified)
    field hash_part1 = (hash[0] as field) << 96 | (hash[1] as field) << 64 |
                       (hash[2] as field) << 32 | (hash[3] as field);
    field hash_part2 = (hash[4] as field) << 96 | (hash[5] as field) << 64 |
                       (hash[6] as field) << 32 | (hash[7] as field);

    // Verify hash matches expected hash
    return hash_part1 == expected_hash[0] && hash_part2 == expected_hash[1];
}
```

#### FHIR Resource Verification Program

```zokrates
// zokrates/fhir_check.zok
// Import the sha256 hash function
from "EMBED" import sha256(u32[8]) -> u32[8];

// Define resource types to match the contract
enum ResourceType {
    PATIENT = 1,
    OBSERVATION = 2,
    MEDICATION_REQUEST = 3,
    CONDITION = 4
}

// Convert bytes to u32 array for sha256
def bytes_to_u32_array(u8[32] bytes) -> u32[8] {
    u32[8] result = [0; 8];
    for u32 i in 0..8 {
        result[i] = (bytes[i*4] as u32) << 24 |
                    (bytes[i*4+1] as u32) << 16 |
                    (bytes[i*4+2] as u32) << 8 |
                    (bytes[i*4+3] as u32);
    }
    return result;
}

// Check if a FHIR resource has a required field
def has_required_field(u8[32] resource, u32 required_field) -> bool {
    // This is a simplified implementation
    // In a real implementation, you would need to parse the FHIR resource
    // and check if the required field exists
    return true;
}

// Main function to verify a FHIR resource
def main(private u8[32] resource, ResourceType resource_type, field[2] expected_hash, field required_field) -> bool {
    // Convert resource to u32 array
    u32[8] resource_u32 = bytes_to_u32_array(resource);

    // Compute hash
    u32[8] hash = sha256(resource_u32);

    // Convert hash to field elements (simplified)
    field hash_part1 = (hash[0] as field) << 96 | (hash[1] as field) << 64 |
                       (hash[2] as field) << 32 | (hash[3] as field);
    field hash_part2 = (hash[4] as field) << 96 | (hash[5] as field) << 64 |
                       (hash[6] as field) << 32 | (hash[7] as field);

    // Check if resource has required field
    bool has_field = has_required_field(resource, required_field as u32);

    // Verify hash matches expected hash and resource has required field
    return hash_part1 == expected_hash[0] && hash_part2 == expected_hash[1] && has_field;
}
```

### 9. Frontend Integration Examples

#### Hash Verification Example

```typescript
// Example of how a frontend might generate and submit a hash proof
import { initialize } from 'zokrates-js';
import { createHash } from 'crypto';

async function generateAndSubmitHashProof(preimage: string): Promise<boolean> {
  // Initialize ZoKrates
  const zokratesProvider = await initialize();

  // Generate the expected hash
  const hash = createHash('sha256').update(preimage).digest('hex');

  // Split the hash into two parts (simplified)
  const part1 = BigInt('0x' + hash.substring(0, 32)).toString();
  const part2 = BigInt('0x' + hash.substring(32, 64)).toString();
  const expectedHash = [part1, part2];

  // Load the hash verification program
  const source = `
    // Simplified hash verification program
    def main(private field preimage, field[2] expected_hash) -> bool {
        // In a real implementation, you would compute the hash of the preimage
        // and compare it with the expected hash
        return true;
    }
  `;

  // Compile the program
  const artifacts = zokratesProvider.compile(source);

  // Compute the witness
  const { witness } = zokratesProvider.computeWitness(artifacts, [preimage, expectedHash[0], expectedHash[1]]);

  // Generate the proof
  const { proof, inputs } = zokratesProvider.generateProof(artifacts.program, witness);

  // Submit the proof to the API
  const response = await fetch('https://your-api-url/api/verifyHash', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      proof: {
        a: proof.proof.a,
        b: proof.proof.b,
        c: proof.proof.c,
      },
      expectedHash,
    }),
  });

  const result = await response.json();
  return result.isValid;
}

// Usage
async function verifyDocument() {
  const documentContent = 'This is a confidential document';

  const isValid = await generateAndSubmitHashProof(documentContent);

  if (isValid) {
    console.log('Document verified: Hash matches the expected value');
  } else {
    console.log('Document verification failed: Hash does not match');
  }
}
```

#### FHIR Resource Verification Example

```typescript
// Example of how a frontend might generate and submit a FHIR resource proof
import { initialize } from 'zokrates-js';
import { createHash } from 'crypto';

// Enum to match the contract's ResourceType
enum ResourceType {
  Patient = 0,
  Observation = 1,
  MedicationRequest = 2,
  Condition = 3,
}

async function generateAndSubmitFHIRProof(
  fhirResource: any,
  resourceType: ResourceType,
  requiredField: number
): Promise<boolean> {
  // Initialize ZoKrates
  const zokratesProvider = await initialize();

  // Generate the expected hash
  const resourceString = JSON.stringify(fhirResource);
  const hash = createHash('sha256').update(resourceString).digest('hex');

  // Split the hash into two parts (simplified)
  const part1 = BigInt('0x' + hash.substring(0, 32)).toString();
  const part2 = BigInt('0x' + hash.substring(32, 64)).toString();
  const expectedHash = [part1, part2];

  // Load the FHIR verification program
  const source = `
    // Simplified FHIR verification program
    def main(private field resource, field resource_type, field[2] expected_hash, field required_field) -> bool {
        // In a real implementation, you would compute the hash of the resource
        // and check if the required field exists
        return true;
    }
  `;

  // Compile the program
  const artifacts = zokratesProvider.compile(source);

  // Add 1 to match ZoKrates enum (1-based) as in the smart contract
  const resourceTypeValue = resourceType + 1;

  // Compute the witness
  const { witness } = zokratesProvider.computeWitness(artifacts, [
    resourceString,
    resourceTypeValue.toString(),
    expectedHash[0],
    expectedHash[1],
    requiredField.toString(),
  ]);

  // Generate the proof
  const { proof, inputs } = zokratesProvider.generateProof(artifacts.program, witness);

  // Submit the proof to the API
  const response = await fetch('https://your-api-url/api/verifyFHIRResource', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      proof: {
        a: proof.proof.a,
        b: proof.proof.b,
        c: proof.proof.c,
      },
      resourceType,
      expectedHash,
      requiredField,
    }),
  });

  const result = await response.json();
  return result.isValid;
}

// Usage
async function verifyPatientRecord() {
  const patientRecord = {
    resourceType: 'Patient',
    id: 'example',
    name: [
      {
        family: 'Smith',
        given: ['John'],
      },
    ],
    gender: 'male',
    birthDate: '1970-01-01',
  };

  // Verify that the patient record has a birthDate field (field ID 4)
  const isValid = await generateAndSubmitFHIRProof(
    patientRecord,
    ResourceType.Patient,
    4 // Assuming 4 is the field ID for birthDate
  );

  if (isValid) {
    console.log('Patient record verified: Contains required birthDate field');
  } else {
    console.log('Patient record verification failed: Missing required field or hash mismatch');
  }
}
```

## Deployment and Configuration

### 1. Environment Variables

The following environment variables should be configured in the Azure Function App settings:

```
# Azure Storage
AZURE_STORAGE_CONNECTION_STRING=<your-storage-connection-string>

# Ethereum (Optional, for on-chain proof hash storage)
ETHEREUM_PROVIDER_URL=<your-ethereum-provider-url>
ETHEREUM_PRIVATE_KEY=<your-ethereum-private-key>
PROOF_REGISTRY_CONTRACT_ADDRESS=<your-contract-address>

# Authentication
AUTH_ISSUER=<your-auth-issuer>
AUTH_AUDIENCE=<your-auth-audience>
```

### 2. Deployment Script

```bash
#!/bin/bash
# deploy.sh

# Set variables
RESOURCE_GROUP="zkp-api-rg"
LOCATION="eastus"
STORAGE_ACCOUNT="zkpstorageacct"
FUNCTION_APP="zkp-api-function"
APP_SERVICE_PLAN="zkp-api-plan"

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create storage account
az storage account create --name $STORAGE_ACCOUNT --resource-group $RESOURCE_GROUP --location $LOCATION --sku Standard_LRS

# Create storage container for verification keys
az storage container create --name "verification-keys" --account-name $STORAGE_ACCOUNT

# Create App Service Plan
az appservice plan create --name $APP_SERVICE_PLAN --resource-group $RESOURCE_GROUP --location $LOCATION --sku B1

# Create Function App
az functionapp create --name $FUNCTION_APP --resource-group $RESOURCE_GROUP --storage-account $STORAGE_ACCOUNT --plan $APP_SERVICE_PLAN --runtime node --functions-version 4

# Deploy the function app
cd ../
npm run build
func azure functionapp publish $FUNCTION_APP
```

## Security Best Practices

### 1. Input Validation

- Validate all inputs using JSON schema validation
- Sanitize inputs to prevent injection attacks
- Implement proper error handling for invalid inputs

### 2. Authentication and Authorization

- Use Azure AD B2C or another identity provider for authentication
- Implement role-based access control (RBAC) for all API endpoints
- Use OAuth 2.0 with JWT tokens for API authentication

### 3. Secure Communication

- Use HTTPS for all API endpoints
- Implement proper CORS policies
- Use Azure Private Link for secure communication between services

### 4. Key Management

- Store verification keys in Azure Blob Storage with proper access controls
- Implement key rotation policies
- Use Azure Key Vault for storing secrets and API keys

### 5. Logging and Monitoring

- Implement structured logging for all operations
- Set up alerts for suspicious activities
- Configure audit logging for all key access operations

### 6. Rate Limiting and DDoS Protection

- Implement rate limiting for API endpoints
- Use Azure Front Door for DDoS protection
- Configure IP filtering for sensitive endpoints

## Conclusion

This implementation plan provides a comprehensive approach to building a secure, scalable backend API for off-chain ZKP verification. By following this plan, we can create a system that provides the same verification functionality as the on-chain smart contracts but with improved performance and reduced costs.

The next steps are to:

1. Set up the project infrastructure
2. Implement the core verification service
3. Create the API endpoints
4. Implement security measures
5. Test and validate the implementation
6. Deploy to production

Once implemented, this system will provide a robust foundation for ZKP verification that can be extended to support additional verifier types and use cases.
