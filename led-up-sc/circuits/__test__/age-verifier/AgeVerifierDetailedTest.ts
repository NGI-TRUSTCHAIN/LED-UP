import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Result Codes for clarity
enum ResultCode {
  // Simple Age Verification
  SIMPLE_AGE_SUCCESS = 14,
  SIMPLE_AGE_BELOW_THRESHOLD = 21,

  // Birth Date Verification
  BIRTH_DATE_SUCCESS = 19,
  BIRTH_DATE_BELOW_THRESHOLD = 22,
  BIRTH_DATE_INVALID = 23,

  // Age Bracket Verification
  AGE_BRACKET_CHILD = 11,
  AGE_BRACKET_ADULT = 12,
  AGE_BRACKET_SENIOR = 13,
}

// Verification Types
enum VerificationType {
  SIMPLE_AGE = 1,
  BIRTH_DATE = 2,
  AGE_BRACKET = 3,
}

// Utility functions
function dateToTimestamp(year: number, month: number, day: number): number {
  return Math.floor(new Date(year, month - 1, day).getTime() / 1000);
}

function yearsToSeconds(years: number): number {
  return years * 31536000; // 365 days in seconds
}

// Current date as Unix timestamp
const CURRENT_DATE = dateToTimestamp(2025, 3, 19); // March 19, 2025

// Verification Type Info
interface VerificationTypeInfo {
  name: string;
  tests: TestCase[];
  passed: number;
  failed: number;
}

// Test case interface
interface TestCase {
  name: string;
  input: {
    birthDate: number;
    currentDate: number;
    threshold: number;
    verificationType: VerificationType;
  };
  expectedResult: ResultCode;
}

// Test cases - grouped by verification type
const testsByType: Record<VerificationType, VerificationTypeInfo> = {
  [VerificationType.SIMPLE_AGE]: {
    name: 'Simple Age Verification',
    tests: [
      {
        name: 'Simple Age - Above Threshold',
        input: {
          birthDate: dateToTimestamp(2004, 1, 1), // January 1, 2004 (21 years old in 2025)
          currentDate: CURRENT_DATE, // March 19, 2025
          threshold: yearsToSeconds(18), // 18 years in seconds
          verificationType: VerificationType.SIMPLE_AGE,
        },
        expectedResult: ResultCode.SIMPLE_AGE_SUCCESS,
      },
      {
        name: 'Simple Age - Below Threshold',
        input: {
          birthDate: dateToTimestamp(2009, 1, 1), // January 1, 2009 (16 years old in 2025)
          currentDate: CURRENT_DATE, // March 19, 2025
          threshold: yearsToSeconds(18), // 18 years in seconds
          verificationType: VerificationType.SIMPLE_AGE,
        },
        expectedResult: ResultCode.SIMPLE_AGE_BELOW_THRESHOLD,
      },
    ],
    passed: 0,
    failed: 0,
  },

  [VerificationType.BIRTH_DATE]: {
    name: 'Birth Date Verification',
    tests: [
      {
        name: 'Birth Date - Valid Above Threshold',
        input: {
          birthDate: dateToTimestamp(2000, 3, 19), // March 19, 2000 (25 years old in 2025)
          currentDate: CURRENT_DATE, // March 19, 2025
          threshold: yearsToSeconds(18), // 18 years in seconds
          verificationType: VerificationType.BIRTH_DATE,
        },
        expectedResult: ResultCode.BIRTH_DATE_SUCCESS,
      },
      {
        name: 'Birth Date - Valid Below Threshold',
        input: {
          birthDate: dateToTimestamp(2010, 3, 19), // March 19, 2010 (15 years old in 2025)
          currentDate: CURRENT_DATE, // March 19, 2025
          threshold: yearsToSeconds(18), // 18 years in seconds
          verificationType: VerificationType.BIRTH_DATE,
        },
        expectedResult: ResultCode.BIRTH_DATE_BELOW_THRESHOLD,
      },
      {
        name: 'Birth Date - Invalid Date',
        input: {
          birthDate: dateToTimestamp(2030, 1, 1), // January 1, 2030 (future date)
          currentDate: CURRENT_DATE, // March 19, 2025
          threshold: yearsToSeconds(18), // 18 years in seconds
          verificationType: VerificationType.BIRTH_DATE,
        },
        expectedResult: ResultCode.BIRTH_DATE_INVALID,
      },
    ],
    passed: 0,
    failed: 0,
  },

  [VerificationType.AGE_BRACKET]: {
    name: 'Age Bracket Verification',
    tests: [
      {
        name: 'Age Bracket - Child',
        input: {
          birthDate: dateToTimestamp(2015, 1, 1), // January 1, 2015 (10 years old in 2025)
          currentDate: CURRENT_DATE, // March 19, 2025
          threshold: yearsToSeconds(18), // Not used for age bracket
          verificationType: VerificationType.AGE_BRACKET,
        },
        expectedResult: ResultCode.AGE_BRACKET_CHILD,
      },
      {
        name: 'Age Bracket - Adult',
        input: {
          birthDate: dateToTimestamp(1990, 1, 1), // January 1, 1990 (35 years old in 2025)
          currentDate: CURRENT_DATE, // March 19, 2025
          threshold: yearsToSeconds(18), // Not used for age bracket
          verificationType: VerificationType.AGE_BRACKET,
        },
        expectedResult: ResultCode.AGE_BRACKET_ADULT,
      },
      {
        name: 'Age Bracket - Senior',
        input: {
          birthDate: dateToTimestamp(1955, 1, 1), // January 1, 1955 (70 years old in 2025)
          currentDate: CURRENT_DATE, // March 19, 2025
          threshold: yearsToSeconds(18), // Not used for age bracket
          verificationType: VerificationType.AGE_BRACKET,
        },
        expectedResult: ResultCode.AGE_BRACKET_SENIOR,
      },
    ],
    passed: 0,
    failed: 0,
  },
};

/**
 * Run a test case for the AgeVerifier circuit
 */
async function runTest(testCase: TestCase, projectRoot: string): Promise<boolean> {
  console.log(`\nRunning test: ${testCase.name}`);

  // Get the output directory from environment variable
  const outDir = process.env.OUT_DIR || path.join(projectRoot, 'circuits/out-files/age-verifier');

  // Create input file
  const inputData = JSON.stringify({
    birthDate: testCase.input.birthDate.toString(),
    currentDate: testCase.input.currentDate.toString(),
    threshold: testCase.input.threshold.toString(),
    verificationType: testCase.input.verificationType.toString(),
  });

  const inputPath = path.join(outDir, 'input.json');
  fs.writeFileSync(inputPath, inputData);
  console.log(`Input: ${inputData}`);

  // Display date information for debugging
  const birthDate = new Date(testCase.input.birthDate * 1000);
  const currentDate = new Date(testCase.input.currentDate * 1000);
  const ageInSeconds = testCase.input.currentDate - testCase.input.birthDate;
  const ageInYears = Math.floor(ageInSeconds / 31536000);

  console.log(`Birth date: ${birthDate.toISOString().split('T')[0]}`);
  console.log(`Current date: ${currentDate.toISOString().split('T')[0]}`);
  console.log(`Calculated age: ${ageInYears} years (${ageInSeconds} seconds)`);
  if (testCase.input.verificationType !== VerificationType.AGE_BRACKET) {
    console.log(`Threshold: ${testCase.input.threshold / 31536000} years (${testCase.input.threshold} seconds)`);
  }

  try {
    // Generate witness using the compiled circuit
    await execAsync(
      `cd ${outDir} && node AgeVerifier_js/generate_witness.js AgeVerifier_js/AgeVerifier.wasm input.json witness.wtns`
    );

    // Extract the output from the witness
    await execAsync(`cd ${outDir} && snarkjs wtns export json witness.wtns witness.json`);
    const witnessPath = path.join(outDir, 'witness.json');
    const witnessData = JSON.parse(fs.readFileSync(witnessPath, 'utf8'));

    // Output is the second value in the witness array (index 1)
    const result = witnessData[1];
    console.log(`Result: ${result}`);
    console.log(`Expected: ${testCase.expectedResult}`);

    // Compare the result with the expected value
    if (result === testCase.expectedResult.toString()) {
      console.log('Test PASSED ✅');
      return true;
    } else {
      console.log('Test FAILED ❌');
      console.log(`Expected ${testCase.expectedResult}, but got ${result}`);
      return false;
    }
  } catch (error) {
    console.error('Error during test execution:', error);
    return false;
  }
}

/**
 * Run all tests for a specific verification type
 */
async function runVerificationTypeTests(
  type: VerificationType,
  typeInfo: VerificationTypeInfo,
  projectRoot: string
): Promise<boolean> {
  console.log(`\n=== Running ${typeInfo.name} Tests ===`);
  console.log(`Starting ${typeInfo.name} Tests...`);

  for (const test of typeInfo.tests) {
    const success = await runTest(test, projectRoot);
    if (success) {
      typeInfo.passed++;
    } else {
      typeInfo.failed++;
    }
  }

  // Print verification type summary
  console.log(`\n${typeInfo.name} Summary:`);
  console.log(`Total tests: ${typeInfo.tests.length}`);
  console.log(`Passed tests: ${typeInfo.passed}`);
  console.log(`Failed tests: ${typeInfo.failed}`);

  return typeInfo.failed === 0;
}

/**
 * Main test function
 */
async function runAllTests() {
  console.log('Starting Detailed TypeScript Tests...');

  try {
    // Get the project root directory
    const projectRoot = path.resolve(__dirname, '../../../');

    // Test results for summary
    const testResults: Record<VerificationType, boolean> = {
      [VerificationType.SIMPLE_AGE]: false,
      [VerificationType.BIRTH_DATE]: false,
      [VerificationType.AGE_BRACKET]: false,
    };

    // Run tests for each verification type
    for (const [typeKey, typeInfo] of Object.entries(testsByType)) {
      const type = Number(typeKey) as VerificationType;
      testResults[type] = await runVerificationTypeTests(type, typeInfo, projectRoot);
    }

    // Overall summary
    console.log('\n=== Overall Test Summary ===');
    for (const [typeKey, typeInfo] of Object.entries(testsByType)) {
      const success = typeInfo.failed === 0;
      console.log(`${typeInfo.name}: ${success ? '✅ PASSED' : '❌ FAILED'}`);
    }

    const allPassed = Object.values(testResults).every((result) => result);
    if (allPassed) {
      console.log('\n✅ All verification methods tested successfully!');
      process.exit(0);
    } else {
      console.log('\n❌ Some verification methods failed tests!');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the tests
runAllTests().catch((error) => {
  console.error('Uncaught error:', error);
  process.exit(1);
});
