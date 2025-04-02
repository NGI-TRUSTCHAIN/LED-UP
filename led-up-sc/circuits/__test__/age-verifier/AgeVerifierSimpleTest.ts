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

// Test cases
const tests: TestCase[] = [
  // Birth Date Verification Tests
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

  // Simple Age Verification Tests
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

  // Age Bracket Verification Tests
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
];

async function runTests() {
  console.log('Starting TypeScript tests...');
  let passedCount = 0;
  let failedCount = 0;

  try {
    // Get the project root directory and output directory
    const projectRoot = path.resolve(__dirname, '../../../');
    const outDir = process.env.OUT_DIR || path.join(projectRoot, 'circuits/out-files/age-verifier');

    for (const test of tests) {
      console.log(`\nRunning test: ${test.name}`);

      // Create input file
      const inputData = JSON.stringify({
        birthDate: test.input.birthDate.toString(),
        currentDate: test.input.currentDate.toString(),
        threshold: test.input.threshold.toString(),
        verificationType: test.input.verificationType.toString(),
      });

      const inputPath = path.join(outDir, 'input.json');
      fs.writeFileSync(inputPath, inputData);
      console.log(`Input: ${inputData}`);

      // Display date information for debugging
      const birthDate = new Date(test.input.birthDate * 1000);
      const currentDate = new Date(test.input.currentDate * 1000);
      const ageInSeconds = test.input.currentDate - test.input.birthDate;
      const ageInYears = Math.floor(ageInSeconds / 31536000);

      console.log(`Birth date: ${birthDate.toISOString().split('T')[0]}`);
      console.log(`Current date: ${currentDate.toISOString().split('T')[0]}`);
      console.log(`Calculated age: ${ageInYears} years (${ageInSeconds} seconds)`);
      if (test.input.verificationType !== VerificationType.AGE_BRACKET) {
        console.log(`Threshold: ${test.input.threshold / 31536000} years (${test.input.threshold} seconds)`);
      }

      // Generate witness using the compiled circuit
      try {
        await execAsync(
          `cd ${outDir} && node AgeVerifier_js/generate_witness.js AgeVerifier_js/AgeVerifier.wasm input.json witness.wtns`
        );

        // Extract the output from the witness
        await execAsync(`cd ${outDir} && snarkjs wtns export json witness.wtns witness.json`);
        const witnessPath = path.join(outDir, 'witness.json');
        const witnessData = JSON.parse(fs.readFileSync(witnessPath, 'utf8'));

        // Print the first 30 witness values for debugging
        console.log('Witness data (first 30 values):');
        for (let i = 0; i < 30 && i < witnessData.length; i++) {
          console.log(`[${i}]: ${witnessData[i]}`);
        }

        // Output is the second value in the witness array (index 1)
        const result = witnessData[1];

        console.log(`Result: ${result}`);
        console.log(`Expected: ${test.expectedResult}`);

        if (Number(result) === test.expectedResult) {
          console.log(`Test PASSED ✅`);
          passedCount++;
        } else {
          console.log(`Test FAILED ❌`);
          failedCount++;
        }
      } catch (error) {
        console.error('Error during test execution:', error);
        failedCount++;
      }
    }

    // Print summary
    console.log('\n=== Test Summary ===');
    console.log(`Total tests: ${tests.length}`);
    console.log(`Passed tests: ${passedCount}`);
    console.log(`Failed tests: ${failedCount}`);

    if (failedCount === 0) {
      console.log('\n✅ All tests passed successfully!');
      process.exit(0);
    } else {
      console.log('\n❌ Some tests failed!');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the tests
runTests().catch((error) => {
  console.error('Uncaught error:', error);
  process.exit(1);
});
