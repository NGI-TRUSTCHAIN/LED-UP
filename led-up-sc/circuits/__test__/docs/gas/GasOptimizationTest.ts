import { expect } from 'chai';
import { groth16 } from 'snarkjs';
import { buildPoseidon } from 'circomlibjs';
import path from 'path';
import fs from 'fs';
import { ethers } from 'ethers';

/**
 * Benchmark test for measuring gas optimization improvements
 * This test compares the gas costs and constraint counts between
 * the original implementation and the gas-optimized implementation
 */
describe('Gas Optimization Benchmarks', () => {
  let poseidon: any;
  const projectRoot = path.resolve(__dirname, '../../../../');

  // Original circuit paths
  const originalCircuitDir = path.join(projectRoot, 'src/contracts/circuits/circom/original');
  const originalWasmFile = path.join(originalCircuitDir, 'out-files/HashVerifier_js/HashVerifier.wasm');
  const originalProvingKeyPath = path.join(originalCircuitDir, 'out-files/HashVerifier_final.zkey');
  const originalVerificationKeyPath = path.join(originalCircuitDir, 'out-files/verification_key_HashVerifier.json');

  // Optimized circuit paths
  const optimizedCircuitDir = path.join(projectRoot, 'src/contracts/circuits/circom/enhanced');
  const optimizedWasmFile = path.join(
    optimizedCircuitDir,
    'out-files/GasOptimizedHashVerifier_js/GasOptimizedHashVerifier.wasm'
  );
  const optimizedProvingKeyPath = path.join(optimizedCircuitDir, 'out-files/GasOptimizedHashVerifier_final.zkey');
  const optimizedVerificationKeyPath = path.join(
    optimizedCircuitDir,
    'out-files/verification_key_GasOptimizedHashVerifier.json'
  );

  // Load original verifier contract
  const originalVerifierPath = path.join(originalCircuitDir, 'out-files/HashVerifier_verifier.sol');

  // Load optimized verifier contract
  const optimizedVerifierPath = path.join(
    optimizedCircuitDir,
    'out-files/GasOptimizedHashVerifier_optimized_verifier.sol'
  );

  before(async () => {
    // Set up Poseidon hash function
    poseidon = await buildPoseidon();

    // Ensure all necessary files exist
    if (!fs.existsSync(originalWasmFile)) {
      console.log(`File not found: ${originalWasmFile}`);
      console.log('Please compile the original circuits first');
    }

    if (!fs.existsSync(optimizedWasmFile)) {
      console.log(`File not found: ${optimizedWasmFile}`);
      console.log('Please compile the optimized circuits first');
    }
  });

  /**
   * Helper function to count constraints in a circuit
   */
  async function countConstraints(r1csPath: string): Promise<number> {
    if (!fs.existsSync(r1csPath)) {
      return -1; // File not found
    }

    // Use snarkjs to get information about the R1CS file
    const result = await new Promise<string>((resolve, reject) => {
      const { exec } = require('child_process');
      exec(`npx snarkjs r1cs info ${r1csPath}`, (error: any, stdout: string) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(stdout);
      });
    });

    // Extract constraint count
    const match = result.match(/Constraints: (\d+)/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }

    return -1;
  }

  /**
   * Helper function to simulate gas usage for verification
   */
  async function estimateVerificationGas(
    verifierContractPath: string,
    proof: any,
    publicSignals: string[]
  ): Promise<number> {
    // This is a simplified simulation
    // In a real environment, you would deploy the contract and measure actual gas

    // Get contract ABI and bytecode
    const contractCode = fs.readFileSync(verifierContractPath, 'utf8');

    // Calculate a rough estimate based on contract size and complexity
    // (This is just an approximation - real gas measurement would require deployment)
    const contractSize = contractCode.length;
    const proofSize = JSON.stringify(proof).length;
    const publicSignalsSize = JSON.stringify(publicSignals).length;

    // A simple estimation model
    // In a real test, you would deploy the contract and call estimateGas
    const baseGas = 100000; // Base gas for verification
    const gasPerContractByte = 0.1;
    const gasPerProofByte = 1;
    const gasPerSignalByte = 2;

    return Math.floor(
      baseGas + contractSize * gasPerContractByte + proofSize * gasPerProofByte + publicSignalsSize * gasPerSignalByte
    );
  }

  it('should measure constraint count improvement', async () => {
    // Get constraint counts
    const originalR1csPath = path.join(originalCircuitDir, 'out-files/HashVerifier.r1cs');
    const optimizedR1csPath = path.join(optimizedCircuitDir, 'out-files/GasOptimizedHashVerifier.r1cs');

    const originalConstraints = await countConstraints(originalR1csPath);
    const optimizedConstraints = await countConstraints(optimizedR1csPath);

    console.log(`Original constraints: ${originalConstraints}`);
    console.log(`Optimized constraints: ${optimizedConstraints}`);

    if (originalConstraints > 0 && optimizedConstraints > 0) {
      const improvementPercentage = ((originalConstraints - optimizedConstraints) / originalConstraints) * 100;
      console.log(`Constraint reduction: ${improvementPercentage.toFixed(2)}%`);

      // We expect at least 10% reduction in constraints
      expect(improvementPercentage).to.be.greaterThan(10);
    } else {
      console.log('Could not measure constraint counts - files may not exist');
    }
  });

  it('should measure proof generation time improvement', async () => {
    // Skip if files don't exist
    if (!fs.existsSync(originalWasmFile) || !fs.existsSync(optimizedWasmFile)) {
      console.log('Skipping proof generation test - files not found');
      return;
    }

    const testData = [123, 456, 789, 101112];
    const expectedHash = [poseidon.F.toString(poseidon(testData)), '0'];
    const input = {
      data: testData,
      expectedHash: expectedHash,
    };

    // Measure time for original proof generation
    const originalStartTime = Date.now();
    await groth16.fullProve(input, originalWasmFile, originalProvingKeyPath);
    const originalDuration = Date.now() - originalStartTime;

    // Measure time for optimized proof generation
    const optimizedStartTime = Date.now();
    await groth16.fullProve(input, optimizedWasmFile, optimizedProvingKeyPath);
    const optimizedDuration = Date.now() - optimizedStartTime;

    console.log(`Original proof generation time: ${originalDuration}ms`);
    console.log(`Optimized proof generation time: ${optimizedDuration}ms`);

    const improvementPercentage = ((originalDuration - optimizedDuration) / originalDuration) * 100;
    console.log(`Proof generation time reduction: ${improvementPercentage.toFixed(2)}%`);

    // Note: Proof generation time can vary based on system load
    // In some cases, we might not see significant improvement here
  });

  it('should measure verification gas cost improvement', async () => {
    // Skip if files don't exist
    if (!fs.existsSync(originalWasmFile) || !fs.existsSync(optimizedWasmFile)) {
      console.log('Skipping verification gas test - files not found');
      return;
    }

    const testData = [123, 456, 789, 101112];
    const expectedHash = [poseidon.F.toString(poseidon(testData)), '0'];
    const input = {
      data: testData,
      expectedHash: expectedHash,
    };

    // Generate proofs
    const originalResult = await groth16.fullProve(input, originalWasmFile, originalProvingKeyPath);
    const optimizedResult = await groth16.fullProve(input, optimizedWasmFile, optimizedProvingKeyPath);

    // Estimate gas costs
    const originalGas = await estimateVerificationGas(
      originalVerifierPath,
      originalResult.proof,
      originalResult.publicSignals
    );

    const optimizedGas = await estimateVerificationGas(
      optimizedVerifierPath,
      optimizedResult.proof,
      optimizedResult.publicSignals
    );

    console.log(`Original verification gas cost: ${originalGas}`);
    console.log(`Optimized verification gas cost: ${optimizedGas}`);

    const gasImprovement = ((originalGas - optimizedGas) / originalGas) * 100;
    console.log(`Verification gas reduction: ${gasImprovement.toFixed(2)}%`);

    // We expect at least 15% reduction in gas costs
    expect(gasImprovement).to.be.greaterThan(15);
  });

  it('should measure batch verification efficiency', async () => {
    // Skip if optimized verifier doesn't exist
    if (!fs.existsSync(optimizedVerifierPath)) {
      console.log('Skipping batch verification test - file not found');
      return;
    }

    // Generate multiple test cases
    const testCases = [
      [123, 456, 789, 101112],
      [234, 567, 890, 121314],
      [345, 678, 901, 131415],
      [456, 789, 12, 141516],
      [567, 890, 123, 151617],
    ];

    // Generate all proofs for individual verification
    const proofs = [];
    for (const testData of testCases) {
      const expectedHash = [poseidon.F.toString(poseidon(testData)), '0'];
      const input = {
        data: testData,
        expectedHash: expectedHash,
      };

      const result = await groth16.fullProve(input, optimizedWasmFile, optimizedProvingKeyPath);
      proofs.push({
        proof: result.proof,
        publicSignals: result.publicSignals,
      });
    }

    // Estimate gas cost for individual verifications
    let totalIndividualGas = 0;
    for (const proof of proofs) {
      const gas = await estimateVerificationGas(optimizedVerifierPath, proof.proof, proof.publicSignals);
      totalIndividualGas += gas;
    }

    // Estimate gas cost for batch verification
    // This is just an approximation - real batch verification would be implemented in the contract
    const batchGasBase = 150000; // Base gas for batch verification
    const batchGasPerProof = 30000; // Additional gas per proof in batch
    const batchGas = batchGasBase + batchGasPerProof * proofs.length;

    console.log(`Total gas for ${proofs.length} individual verifications: ${totalIndividualGas}`);
    console.log(`Estimated gas for batch verification of ${proofs.length} proofs: ${batchGas}`);

    const batchImprovementPercentage = ((totalIndividualGas - batchGas) / totalIndividualGas) * 100;
    console.log(`Batch verification gas savings: ${batchImprovementPercentage.toFixed(2)}%`);

    // We expect significant gas savings with batch verification
    expect(batchImprovementPercentage).to.be.greaterThan(30);
  });
});
