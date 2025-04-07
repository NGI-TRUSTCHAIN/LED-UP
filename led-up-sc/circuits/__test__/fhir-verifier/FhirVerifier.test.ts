import { expect } from 'chai';
import { buildPoseidon } from 'circomlibjs';
import { groth16 } from 'snarkjs';
import path from 'path';
import fs from 'fs';

describe('FhirVerifier', () => {
  let wasmFile: string;
  let provingKeyPath: string;
  let verificationKey: any;
  let poseidon: any;

  before(async () => {
    // Set paths relative to the project root
    const projectRoot = path.resolve(__dirname, '../../../');

    // Load circuit files
    wasmFile = path.join(projectRoot, 'circuits/out-files/fhir-verifier/FhirVerifier_js/FhirVerifier.wasm');
    provingKeyPath = path.join(projectRoot, 'circuits/out-files/fhir-verifier/FhirVerifier_0001.zkey');
    const verificationKeyPath = path.join(
      projectRoot,
      'circuits/out-files/fhir-verifier/verification_key_FhirVerifier.json'
    );

    // Initialize Poseidon
    poseidon = await buildPoseidon();

    // Load verification key
    verificationKey = JSON.parse(fs.readFileSync(verificationKeyPath, 'utf8'));

    console.log('Files loaded successfully:');
    console.log('WASM file:', fs.existsSync(wasmFile));
    console.log('Proving key:', fs.existsSync(provingKeyPath));
    console.log('Verification key:', verificationKey !== null);
  });

  it('should verify valid Patient resource', async () => {
    // Resource type 1 = Patient
    const resourceType = 1;

    // Patient data with identifier and name
    const resourceData = [
      123, // Some identifier for the resource
      456, // Identifier field (non-zero)
      789, // Name field (non-zero)
      0, // Empty field
      0, // Empty field
      0, // Empty field
      0, // Empty field
      0, // Empty field
    ];

    // Calculate expected hash using Poseidon
    const hash1 = poseidon([resourceData[0], resourceData[1], resourceData[2], resourceData[3]]);
    const hash2 = poseidon([resourceData[4], resourceData[5], resourceData[6], resourceData[7]]);
    const finalHash = poseidon([hash1, hash2, 0, 0]);
    const expectedHash = [poseidon.F.toString(finalHash), 0];

    console.log('Expected hash:', expectedHash);

    const input = {
      resourceData: resourceData,
      resourceType: resourceType,
      expectedHash: expectedHash,
      verificationMode: 1, // Standard verification mode
    };

    try {
      const { proof, publicSignals } = await groth16.fullProve(input, wasmFile, provingKeyPath);

      console.log('Proof generated successfully');
      console.log('Public signals:', publicSignals);

      const isValid = await groth16.verify(verificationKey, publicSignals, proof);

      expect(isValid).to.be.true;
      expect(publicSignals[0]).to.equal('1'); // 1 means success
    } catch (error) {
      console.error('Error during proof generation or verification:', error);
      throw error;
    }
  });

  it('should verify valid Observation resource', async () => {
    // Resource type 2 = Observation
    const resourceType = 2;

    // Observation data with subject, code, and value
    const resourceData = [
      123, // Some identifier for the resource
      456, // Subject field (non-zero)
      789, // Code field (non-zero)
      101, // Value field (non-zero)
      0, // Empty field
      0, // Empty field
      0, // Empty field
      0, // Empty field
    ];

    // Calculate expected hash using Poseidon
    const hash1 = poseidon([resourceData[0], resourceData[1], resourceData[2], resourceData[3]]);
    const hash2 = poseidon([resourceData[4], resourceData[5], resourceData[6], resourceData[7]]);
    const finalHash = poseidon([hash1, hash2, 0, 0]);
    const expectedHash = [poseidon.F.toString(finalHash), 0];

    console.log('Expected hash:', expectedHash);

    const input = {
      resourceData: resourceData,
      resourceType: resourceType,
      expectedHash: expectedHash,
      verificationMode: 1, // Standard verification mode
    };

    try {
      const { proof, publicSignals } = await groth16.fullProve(input, wasmFile, provingKeyPath);

      console.log('Proof generated successfully');
      console.log('Public signals:', publicSignals);

      const isValid = await groth16.verify(verificationKey, publicSignals, proof);

      expect(isValid).to.be.true;
      expect(publicSignals[0]).to.equal('1'); // 1 means success
    } catch (error) {
      console.error('Error during proof generation or verification:', error);
      throw error;
    }
  });

  it('should reject invalid resource type', async () => {
    // Invalid resource type (greater than 16)
    const resourceType = 20;

    const resourceData = [
      123, // Some identifier for the resource
      456, // Some field (non-zero)
      789, // Some field (non-zero)
      0, // Empty field
      0, // Empty field
      0, // Empty field
      0, // Empty field
      0, // Empty field
    ];

    // Calculate expected hash using Poseidon
    const hash1 = poseidon([resourceData[0], resourceData[1], resourceData[2], resourceData[3]]);
    const hash2 = poseidon([resourceData[4], resourceData[5], resourceData[6], resourceData[7]]);
    const finalHash = poseidon([hash1, hash2, 0, 0]);
    const expectedHash = [poseidon.F.toString(finalHash), 0];

    const input = {
      resourceData: resourceData,
      resourceType: resourceType,
      expectedHash: expectedHash,
      verificationMode: 1, // Standard verification mode
    };

    try {
      const { proof, publicSignals } = await groth16.fullProve(input, wasmFile, provingKeyPath);

      console.log('Proof generated successfully');
      console.log('Public signals:', publicSignals);

      const isValid = await groth16.verify(verificationKey, publicSignals, proof);

      expect(isValid).to.be.true;
      expect(publicSignals[0]).to.equal('2'); // 2 means type error
    } catch (error) {
      console.error('Error during proof generation or verification:', error);
      throw error;
    }
  });

  it('should reject invalid hash', async () => {
    // Resource type 1 = Patient
    const resourceType = 1;

    // Patient data with identifier and name
    const resourceData = [
      123, // Some identifier for the resource
      456, // Identifier field (non-zero)
      789, // Name field (non-zero)
      0, // Empty field
      0, // Empty field
      0, // Empty field
      0, // Empty field
      0, // Empty field
    ];

    // Use incorrect hash
    const incorrectHash = ['12345678901234567890', 0];

    const input = {
      resourceData: resourceData,
      resourceType: resourceType,
      expectedHash: incorrectHash,
      verificationMode: 1, // Standard verification mode
    };

    try {
      const { proof, publicSignals } = await groth16.fullProve(input, wasmFile, provingKeyPath);

      console.log('Proof generated successfully');
      console.log('Public signals:', publicSignals);

      const isValid = await groth16.verify(verificationKey, publicSignals, proof);

      expect(isValid).to.be.true;
      expect(publicSignals[0]).to.equal('3'); // 3 means hash error
    } catch (error) {
      console.error('Error during proof generation or verification:', error);
      throw error;
    }
  });
});
