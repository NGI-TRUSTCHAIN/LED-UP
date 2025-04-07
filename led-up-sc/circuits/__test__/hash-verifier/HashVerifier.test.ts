import { expect } from 'chai';
import { buildPoseidon } from 'circomlibjs';
import { groth16 } from 'snarkjs';
import path from 'path';
import fs from 'fs';

describe('HashVerifier', () => {
  let wasmFile: string;
  let provingKeyPath: string;
  let verificationKey: any;
  let poseidon: any;

  before(async () => {
    // Set paths relative to the project root
    const projectRoot = path.resolve(__dirname, '../../');
    const outDir = process.env.OUT_DIR || path.join(projectRoot, 'out-files/hash-verifier');

    // Load circuit files
    wasmFile = path.join(outDir, 'HashVerifier_js/HashVerifier.wasm');
    provingKeyPath = path.join(outDir, 'HashVerifier_0001.zkey');
    const verificationKeyPath = path.join(outDir, 'verification_key_HashVerifier.json');

    // Check if required files exist
    if (!fs.existsSync(wasmFile)) {
      console.error(`WASM file not found at: ${wasmFile}`);
      console.error('Please compile the circuit first using ./scripts/setup-hash-verifier.sh');
      process.exit(1);
    }

    // Initialize Poseidon
    poseidon = await buildPoseidon();

    // Load verification key
    verificationKey = JSON.parse(fs.readFileSync(verificationKeyPath, 'utf8'));

    console.log('Files loaded successfully:');
    console.log('WASM file:', fs.existsSync(wasmFile));
    console.log('Proving key:', fs.existsSync(provingKeyPath));
    console.log('Verification key:', verificationKey !== null);
  });

  it('should verify correct hash', async () => {
    // Generate test data
    const testData = [123, 456, 789, 101112];

    // Calculate expected hash using Poseidon
    const expectedHash = poseidon.F.toString(poseidon(testData));
    console.log('Expected hash:', expectedHash);

    const input = {
      data: testData,
      expectedHash: [expectedHash, 0],
    };

    try {
      const { proof, publicSignals } = await groth16.fullProve(input, wasmFile, provingKeyPath);

      console.log('Proof generated successfully');
      console.log('Public signals:', publicSignals);

      const isValid = await groth16.verify(verificationKey, publicSignals, proof);

      expect(isValid).to.be.true;
      expect(publicSignals[0]).to.equal('1'); // 1 means valid
    } catch (error) {
      console.error('Error during proof generation or verification:', error);
      throw error;
    }
  });

  it('should reject incorrect hash', async () => {
    // Generate test data
    const testData = [123, 456, 789, 101112];

    // Use incorrect hash
    const incorrectHash = '12345678901234567890';

    const input = {
      data: testData,
      expectedHash: [incorrectHash, 0],
    };

    try {
      const { proof, publicSignals } = await groth16.fullProve(input, wasmFile, provingKeyPath);

      console.log('Proof generated successfully');
      console.log('Public signals:', publicSignals);

      const isValid = await groth16.verify(verificationKey, publicSignals, proof);

      expect(isValid).to.be.true;
      expect(publicSignals[0]).to.equal('0'); // 0 means invalid
    } catch (error) {
      console.error('Error during proof generation or verification:', error);
      throw error;
    }
  });
});
