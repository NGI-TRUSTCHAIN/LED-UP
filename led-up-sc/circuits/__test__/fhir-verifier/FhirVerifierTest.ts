import * as path from 'path';
import * as fs from 'fs';
import { generateProof, verifyProof } from '../../../../../MainLedUp/did/didregistry/circuits/utils/zkpUtils';
import { execSync } from 'child_process';

console.log('Running FhirVerifier Circuit Tests');

// Path configuration
const projectRoot = path.resolve(__dirname, '../../..');
const outDir = process.env.OUT_DIR || path.join(projectRoot, 'circuits/out-files/fhir-verifier');
const wasmPath = path.join(outDir, 'FhirVerifier_js/FhirVerifier.wasm');
const zkeyPath = path.join(outDir, 'FhirVerifier_0001.zkey');
const vkeyPath = path.join(outDir, 'verification_key_FhirVerifier.json');

async function runTest(testName: string, input: any, expectedResultCode: number) {
  console.log(`\nTest: ${testName}`);
  console.log(`Testing with input: ${JSON.stringify(input, null, 2)}`);

  console.log(`Generating proof using wasm: ${wasmPath}`);
  console.log(`Using zkey: ${zkeyPath}`);

  try {
    // Create input file
    fs.writeFileSync(path.join(outDir, 'input.json'), JSON.stringify(input));

    // Generate witness using the compiled circuit
    execSync(
      `cd ${outDir} && node FhirVerifier_js/generate_witness.js FhirVerifier_js/FhirVerifier.wasm input.json witness.wtns`
    );

    // Extract the output from the witness
    execSync(`cd ${outDir} && snarkjs wtns export json witness.wtns witness.json`);
    const witnessData = JSON.parse(fs.readFileSync(path.join(outDir, 'witness.json'), 'utf8'));

    // Generate a proof
    const { proof, publicSignals } = await generateProof(input, wasmPath, zkeyPath);

    // Verify the proof
    console.log(`Verifying proof using verification key: ${vkeyPath}`);
    const isValid = await verifyProof(proof, publicSignals, vkeyPath);
    console.log(proof);
    console.log(publicSignals);

    // Extract the result code from public signals
    const resultCode = parseInt(publicSignals[0]);
    console.log(`Result code: ${resultCode}, Expected: ${expectedResultCode}`);

    // Check if the result matches the expected result
    if (resultCode !== expectedResultCode) {
      console.log(`❌ Result code mismatch: Expected ${expectedResultCode}, got ${resultCode}`);
      console.log('❌ Test failed');
      return false;
    } else {
      console.log('✅ Test passed successfully');
      console.log('✅ Test passed');
      return true;
    }
  } catch (error) {
    console.error(`Error in test ${testName}:`, error);
    console.log('❌ Test failed due to error');
    return false;
  }
}

async function runAllTests() {
  // Test case 1: Valid Resource Type Verification
  const test1 = await runTest(
    'Resource Type Verification - Valid',
    {
      resourceData: [12345, 67890, 13579, 24680, 98765, 43210, 11223, 44556],
      resourceType: 1,
      expectedHash: [0, 0],
      verificationMode: 1,
    },
    1
  );

  // Test case 2: Invalid Resource Type Verification
  const test2 = await runTest(
    'Resource Type Verification - Invalid',
    {
      resourceData: [12345, 67890, 13579, 24680, 98765, 43210, 11223, 44556],
      resourceType: 99,
      expectedHash: [0, 0],
      verificationMode: 1,
    },
    2
  );

  // Test case 3: Valid Hash Verification
  const test3 = await runTest(
    'Hash Verification - Valid',
    {
      resourceData: [12345, 67890, 13579, 24680, 98765, 43210, 11223, 44556],
      resourceType: 1,
      expectedHash: ['1796527974942811177779686228864301369667515173275935237830539062059572725738', '0'],
      verificationMode: 2,
    },
    1
  );

  // Test case 4: Invalid Hash Verification
  const test4 = await runTest(
    'Hash Verification - Invalid',
    {
      resourceData: [12345, 67890, 13579, 24680, 98765, 43210, 11223, 44556],
      resourceType: 1,
      expectedHash: [987654321, 0],
      verificationMode: 2,
    },
    3
  );

  // Test case 5: Valid Fields Verification
  const test5 = await runTest(
    'Fields Verification - Valid',
    {
      resourceData: [1, 12345, 67890, 0, 0, 0, 0, 0],
      resourceType: 1,
      expectedHash: [0, 0],
      verificationMode: 3,
    },
    4
  );

  // Test case 6: Invalid Fields Verification
  const test6 = await runTest(
    'Fields Verification - Invalid',
    {
      resourceData: [1, 0, 0, 0, 0, 0, 0, 0],
      resourceType: 1,
      expectedHash: [0, 0],
      verificationMode: 3,
    },
    4
  );

  // Test case 7: Valid Complete Verification
  const test7 = await runTest(
    'Complete Verification - Valid',
    {
      resourceData: [1, 12345, 67890, 13579, 24680, 98765, 43210, 11223],
      resourceType: 1,
      expectedHash: ['646388368051392880309143366483323584001388503373219339842553141614422076941', '0'],
      verificationMode: 4,
    },
    1
  );

  // Check if all tests passed
  if (test1 && test2 && test3 && test4 && test5 && test6 && test7) {
    console.log('\n✅ All tests passed successfully!');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed. Please check the output above for details.');
    process.exit(1);
  }
}

// Run all tests
runAllTests().catch((error) => {
  console.error('Error running tests:', error);
  process.exit(1);
});
