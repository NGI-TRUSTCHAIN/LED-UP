import { CircuitTestFramework } from '../CircuitTestFramework';
import * as path from 'path';
import * as assert from 'assert';
import { calculatePoseidonHash, splitHashForCircuit } from '../utils/poseidon';
import { HashVerificationResult } from '../utils/types';
import fs from 'fs';

// Path configuration
const projectRoot = path.resolve(__dirname, '../../');
const outDir = process.env.OUT_DIR || path.join(projectRoot, 'out-files/hash-verifier');
const wasmPath = path.join(outDir, 'HashVerifier_js/HashVerifier.wasm');
const zkeyPath = path.join(outDir, 'HashVerifier_0001.zkey');
const verificationKeyPath = path.join(outDir, 'verification_key_HashVerifier.json');

// Check if required files exist
if (!fs.existsSync(wasmPath)) {
  console.error(`WASM file not found at: ${wasmPath}`);
  console.error('Please compile the circuit first using ./scripts/setup-hash-verifier.sh');
  process.exit(1);
}

describe('HashVerifier Circuit Tests', function () {
  // Increase timeout for proof generation (Mocha default is 2000ms)
  this.timeout(60000);

  // Test case 1: Valid hash verification
  it('should verify valid hash correctly', async function () {
    const data = [123456n, 654321n, 111111n, 999999n];
    const hash = await calculatePoseidonHash(data.map(Number));
    const [low, high] = splitHashForCircuit(hash);

    const input = {
      data,
      expectedHash: [low, high],
    };

    const result = await CircuitTestFramework.testCircuit(
      input,
      HashVerificationResult.SUCCESS,
      wasmPath,
      zkeyPath,
      verificationKeyPath
    );

    assert.strictEqual(result, true, 'Valid hash verification failed');
  });

  // Test case 2: Invalid input verification (zero in data)
  it('should reject input with zeros', async function () {
    const data = [123456n, 0n, 111111n, 999999n];
    const hash = await calculatePoseidonHash(data.map(Number));
    const [low, high] = splitHashForCircuit(hash);

    const input = {
      data,
      expectedHash: [low, high],
    };

    const result = await CircuitTestFramework.testCircuit(
      input,
      HashVerificationResult.INVALID_INPUT,
      wasmPath,
      zkeyPath,
      verificationKeyPath
    );

    assert.strictEqual(result, true, 'Invalid input verification failed');
  });

  // Test case 3: Hash mismatch verification
  it('should detect hash mismatch', async function () {
    const data = [123456n, 654321n, 111111n, 999999n];

    const input = {
      data,
      expectedHash: [987654321n, 0n], // Incorrect hash
    };

    const result = await CircuitTestFramework.testCircuit(
      input,
      HashVerificationResult.HASH_MISMATCH,
      wasmPath,
      zkeyPath,
      verificationKeyPath
    );

    assert.strictEqual(result, true, 'Hash mismatch verification failed');
  });

  // Test case 4: All zeros input
  it('should reject all-zero input', async function () {
    const data = [0n, 0n, 0n, 0n];
    const hash = await calculatePoseidonHash(data.map(Number));
    const [low, high] = splitHashForCircuit(hash);

    const input = {
      data,
      expectedHash: [low, high],
    };

    const result = await CircuitTestFramework.testCircuit(
      input,
      HashVerificationResult.INVALID_INPUT,
      wasmPath,
      zkeyPath,
      verificationKeyPath
    );

    assert.strictEqual(result, true, 'All-zero input verification failed');
  });

  // Test case 5: Large values
  it('should handle large values correctly', async function () {
    const data = [1000000n, 2000000n, 3000000n, 4000000n];
    const hash = await calculatePoseidonHash(data.map(Number));
    const [low, high] = splitHashForCircuit(hash);

    const input = {
      data,
      expectedHash: [low, high],
    };

    const result = await CircuitTestFramework.testCircuit(
      input,
      HashVerificationResult.SUCCESS,
      wasmPath,
      zkeyPath,
      verificationKeyPath
    );

    assert.strictEqual(result, true, 'Large values verification failed');
  });

  // Test case 6: Boundary values (near field size)
  it('should handle boundary values correctly', async function () {
    // Use string representation for very large numbers
    const data = [
      BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495607'), // field size - 10
      BigInt('10944121435919637611123202872628637544274182200208017171849102093287904247808'), // ~field size / 2
      BigInt('5472060717959818805561601436314318772137091100104008585924551046643952123904'), // ~field size / 4
      BigInt('2736030358979909402780800718157159386068545550052004292962275523321976061952'), // ~field size / 8
    ];

    const hash = await calculatePoseidonHash(data.map(Number));
    const [low, high] = splitHashForCircuit(hash);

    const input = {
      data,
      expectedHash: [low, high],
    };

    const result = await CircuitTestFramework.testCircuit(
      input,
      HashVerificationResult.SUCCESS,
      wasmPath,
      zkeyPath,
      verificationKeyPath
    );

    assert.strictEqual(result, true, 'Boundary values verification failed');
  });
});
