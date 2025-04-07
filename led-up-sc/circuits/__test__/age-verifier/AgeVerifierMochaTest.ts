import { expect } from 'chai';
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

describe('AgeVerifier Circuit Tests', function () {
  // Set timeout to allow for circuit execution
  this.timeout(10000);

  const projectRoot = path.resolve(__dirname, '../../../');
  const outDir = process.env.OUT_DIR || path.join(projectRoot, 'circuits/out-files/age-verifier');
  const wasmPath = path.join(outDir, 'AgeVerifier_js/AgeVerifier.wasm');

  before(function () {
    // Check if the required files exist
    if (!fs.existsSync(wasmPath)) {
      console.error(`WASM file not found at: ${wasmPath}`);
      console.error('Please compile the circuit first.');
      this.skip();
    }
  });

  // Helper function to run a test case and return the result
  async function runTestCase(testCase: TestCase): Promise<number> {
    const inputData = {
      birthDate: testCase.input.birthDate.toString(),
      currentDate: testCase.input.currentDate.toString(),
      threshold: testCase.input.threshold.toString(),
      verificationType: testCase.input.verificationType.toString(),
    };

    const inputPath = path.join(outDir, 'input.json');

    fs.writeFileSync(inputPath, JSON.stringify(inputData));

    // Generate witness
    await execAsync(
      `cd ${outDir} && node AgeVerifier_js/generate_witness.js AgeVerifier_js/AgeVerifier.wasm input.json witness.wtns`
    );

    // Export witness to JSON
    await execAsync(`cd ${outDir} && snarkjs wtns export json witness.wtns witness.json`);

    // Read and parse witness data
    const witnessPath = path.join(outDir, 'witness.json');
    const witnessData = JSON.parse(fs.readFileSync(witnessPath, 'utf8'));

    // Result is the second value in the witness array (index 1)
    return Number(witnessData[1]);
  }

  // Current date used in all tests
  const currentDate = dateToTimestamp(2025, 3, 19); // March 19, 2025

  describe('Simple Age Verification', function () {
    it('should verify age above threshold', async function () {
      const testCase: TestCase = {
        name: 'Simple Age - Above Threshold',
        input: {
          birthDate: dateToTimestamp(2004, 1, 1), // January 1, 2004 (21 years old in 2025)
          currentDate: currentDate,
          threshold: yearsToSeconds(18), // 18 years in seconds
          verificationType: VerificationType.SIMPLE_AGE,
        },
        expectedResult: ResultCode.SIMPLE_AGE_SUCCESS,
      };

      const result = await runTestCase(testCase);
      expect(result).to.equal(ResultCode.SIMPLE_AGE_SUCCESS);
    });

    it('should verify age below threshold', async function () {
      const testCase: TestCase = {
        name: 'Simple Age - Below Threshold',
        input: {
          birthDate: dateToTimestamp(2009, 1, 1), // January 1, 2009 (16 years old in 2025)
          currentDate: currentDate,
          threshold: yearsToSeconds(18), // 18 years in seconds
          verificationType: VerificationType.SIMPLE_AGE,
        },
        expectedResult: ResultCode.SIMPLE_AGE_BELOW_THRESHOLD,
      };

      const result = await runTestCase(testCase);
      expect(result).to.equal(ResultCode.SIMPLE_AGE_BELOW_THRESHOLD);
    });
  });

  describe('Birth Date Verification', function () {
    it('should verify birth date valid above threshold', async function () {
      const testCase: TestCase = {
        name: 'Birth Date - Valid Above Threshold',
        input: {
          birthDate: dateToTimestamp(2000, 3, 19), // March 19, 2000 (25 years old in 2025)
          currentDate: currentDate,
          threshold: yearsToSeconds(18), // 18 years in seconds
          verificationType: VerificationType.BIRTH_DATE,
        },
        expectedResult: ResultCode.BIRTH_DATE_SUCCESS,
      };

      const result = await runTestCase(testCase);
      expect(result).to.equal(ResultCode.BIRTH_DATE_SUCCESS);
    });

    it('should verify birth date valid below threshold', async function () {
      const testCase: TestCase = {
        name: 'Birth Date - Valid Below Threshold',
        input: {
          birthDate: dateToTimestamp(2010, 3, 19), // March 19, 2010 (15 years old in 2025)
          currentDate: currentDate,
          threshold: yearsToSeconds(18), // 18 years in seconds
          verificationType: VerificationType.BIRTH_DATE,
        },
        expectedResult: ResultCode.BIRTH_DATE_BELOW_THRESHOLD,
      };

      const result = await runTestCase(testCase);
      expect(result).to.equal(ResultCode.BIRTH_DATE_BELOW_THRESHOLD);
    });

    it('should verify birth date invalid (future date)', async function () {
      const testCase: TestCase = {
        name: 'Birth Date - Invalid (Future)',
        input: {
          birthDate: dateToTimestamp(2030, 1, 1), // January 1, 2030 (future date)
          currentDate: currentDate,
          threshold: yearsToSeconds(18), // 18 years in seconds
          verificationType: VerificationType.BIRTH_DATE,
        },
        expectedResult: ResultCode.BIRTH_DATE_INVALID,
      };

      const result = await runTestCase(testCase);
      expect(result).to.equal(ResultCode.BIRTH_DATE_INVALID);
    });
  });

  describe('Age Bracket Verification', function () {
    it('should classify as child (0-17)', async function () {
      const testCase: TestCase = {
        name: 'Age Bracket - Child',
        input: {
          birthDate: dateToTimestamp(2015, 1, 1), // January 1, 2015 (10 years old in 2025)
          currentDate: currentDate,
          threshold: yearsToSeconds(18), // Not used for age bracket
          verificationType: VerificationType.AGE_BRACKET,
        },
        expectedResult: ResultCode.AGE_BRACKET_CHILD,
      };

      const result = await runTestCase(testCase);
      expect(result).to.equal(ResultCode.AGE_BRACKET_CHILD);
    });

    it('should classify as adult (18-64)', async function () {
      const testCase: TestCase = {
        name: 'Age Bracket - Adult',
        input: {
          birthDate: dateToTimestamp(1990, 1, 1), // January 1, 1990 (35 years old in 2025)
          currentDate: currentDate,
          threshold: yearsToSeconds(18), // Not used for age bracket
          verificationType: VerificationType.AGE_BRACKET,
        },
        expectedResult: ResultCode.AGE_BRACKET_ADULT,
      };

      const result = await runTestCase(testCase);
      expect(result).to.equal(ResultCode.AGE_BRACKET_ADULT);
    });

    it('should classify as senior (65+)', async function () {
      const testCase: TestCase = {
        name: 'Age Bracket - Senior',
        input: {
          birthDate: dateToTimestamp(1955, 1, 1), // January 1, 1955 (70 years old in 2025)
          currentDate: currentDate,
          threshold: yearsToSeconds(18), // Not used for age bracket
          verificationType: VerificationType.AGE_BRACKET,
        },
        expectedResult: ResultCode.AGE_BRACKET_SENIOR,
      };

      const result = await runTestCase(testCase);
      expect(result).to.equal(ResultCode.AGE_BRACKET_SENIOR);
    });
  });
});
