const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const path = require('path');

// Convert date to Unix timestamp
function dateToTimestamp(year, month, day) {
  return Math.floor(new Date(year, month - 1, day).getTime() / 1000);
}

// Convert years to seconds
function yearsToSeconds(years) {
  return years * 31536000; // 365 days in seconds
}

// Test cases
const tests = [
  // Type 1: Simple Age Verification Tests
  {
    name: 'Simple Age - Above Threshold',
    input: {
      birthDate: dateToTimestamp(2000, 1, 1), // Jan 1, 2000
      currentDate: dateToTimestamp(2023, 1, 1), // Jan 1, 2023 (~23 years)
      threshold: yearsToSeconds(18), // 18 years in seconds
      verificationType: 1,
    },
    expectedResult: 14, // Above threshold
    thresholdYears: 18, // For display
  },
  {
    name: 'Simple Age - Below Threshold',
    input: {
      birthDate: dateToTimestamp(2010, 1, 1), // Jan 1, 2010
      currentDate: dateToTimestamp(2023, 1, 1), // Jan 1, 2023 (~13 years)
      threshold: yearsToSeconds(18), // 18 years in seconds
      verificationType: 1,
    },
    expectedResult: 21, // Below threshold
    thresholdYears: 18, // For display
  },

  // Type 2: Birth Date Verification Tests
  {
    name: 'Birth Date - Valid Above Threshold',
    input: {
      birthDate: dateToTimestamp(2000, 1, 1), // Jan 1, 2000
      currentDate: dateToTimestamp(2023, 1, 1), // Jan 1, 2023 (~23 years)
      threshold: yearsToSeconds(18), // 18 years in seconds
      verificationType: 2,
    },
    expectedResult: 19, // Valid & above threshold
    thresholdYears: 18, // For display
  },
  {
    name: 'Birth Date - Valid Below Threshold',
    input: {
      birthDate: dateToTimestamp(2010, 1, 1), // Jan 1, 2010
      currentDate: dateToTimestamp(2023, 1, 1), // Jan 1, 2023 (~13 years)
      threshold: yearsToSeconds(18), // 18 years in seconds
      verificationType: 2,
    },
    expectedResult: 22, // Valid & below threshold
    thresholdYears: 18, // For display
  },
  {
    name: 'Birth Date - Invalid (Future)',
    input: {
      birthDate: dateToTimestamp(2030, 1, 1), // Jan 1, 2030 (future)
      currentDate: dateToTimestamp(2023, 1, 1), // Jan 1, 2023
      threshold: yearsToSeconds(18), // 18 years in seconds
      verificationType: 2,
    },
    expectedResult: 23, // Invalid date
    thresholdYears: 18, // For display
  },

  // Type 3: Age Bracket Verification Tests
  {
    name: 'Age Bracket - Child',
    input: {
      birthDate: dateToTimestamp(2010, 1, 1), // Jan 1, 2010 (13 years old)
      currentDate: dateToTimestamp(2023, 1, 1), // Jan 1, 2023
      threshold: yearsToSeconds(18), // Not used for age bracket
      verificationType: 3,
    },
    expectedResult: 11, // Child bracket (0-17)
    thresholdYears: 'N/A', // Not used for age bracket
  },
  {
    name: 'Age Bracket - Adult',
    input: {
      birthDate: dateToTimestamp(1980, 1, 1), // Jan 1, 1980 (43 years old)
      currentDate: dateToTimestamp(2023, 1, 1), // Jan 1, 2023
      threshold: yearsToSeconds(18), // Not used for age bracket
      verificationType: 3,
    },
    expectedResult: 12, // Adult bracket (18-64)
    thresholdYears: 'N/A', // Not used for age bracket
  },
  {
    name: 'Age Bracket - Senior',
    input: {
      birthDate: dateToTimestamp(1950, 1, 1), // Jan 1, 1950 (73 years old)
      currentDate: dateToTimestamp(2023, 1, 1), // Jan 1, 2023
      threshold: yearsToSeconds(18), // Not used for age bracket
      verificationType: 3,
    },
    expectedResult: 13, // Senior bracket (65+)
    thresholdYears: 'N/A', // Not used for age bracket
  },
];

async function runTests() {
  console.log('Starting complete age verification tests...');

  // Create directories for test files if they don't exist
  const testDir = path.join(__dirname, '../../out-files');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  const outDir = process.env.OUT_DIR || path.join(__dirname, '../../../circuits/out-files/age-verifier');
  const inputPath = path.join(outDir, 'input.json');
  const witnessPath = path.join(outDir, 'witness.wtns');
  const witnessJsonPath = path.join(outDir, 'witness.json');

  try {
    for (const test of tests) {
      console.log(`\nRunning test: ${test.name}`);

      // Create input file
      const inputData = JSON.stringify({
        birthDate: test.input.birthDate.toString(),
        currentDate: test.input.currentDate.toString(),
        threshold: test.input.threshold.toString(),
        verificationType: test.input.verificationType.toString(),
      });

      fs.writeFileSync(inputPath, inputData);
      console.log(`Input: ${inputData}`);

      // Convert timestamps to human-readable dates for display
      const birthDate = new Date(test.input.birthDate * 1000);
      const currentDate = new Date(test.input.currentDate * 1000);

      console.log(`Birth date: ${birthDate.toISOString().split('T')[0]}`);
      console.log(`Current date: ${currentDate.toISOString().split('T')[0]}`);
      console.log(`Verification type: ${test.input.verificationType}`);
      console.log(`Threshold: ${test.thresholdYears}`);

      // Calculate expected age
      const ageInSeconds = test.input.currentDate - test.input.birthDate;
      const ageInYears = Math.floor(ageInSeconds / 31536000); // 31536000 seconds = 1 year
      console.log(`Calculated age: ${ageInYears} years (${ageInSeconds} seconds)`);

      // Generate witness using the compiled circuit
      await exec(
        `cd ${outDir} && node AgeVerifier_js/generate_witness.js AgeVerifier_js/AgeVerifier.wasm ${inputPath} ${witnessPath}`
      );

      // Extract the output from the witness
      const { stdout: witnessInfo } = await exec(
        `cd ${outDir} && snarkjs wtns export json ${witnessPath} ${witnessJsonPath}`
      );
      const witnessData = JSON.parse(fs.readFileSync(witnessJsonPath, 'utf8'));

      // Print more of the witness
      console.log('Witness data (first 10 values):');
      for (let i = 0; i < 10 && i < witnessData.length; i++) {
        console.log(`[${i}]: ${witnessData[i]}`);
      }

      // Output is the second value in the witness array (index 1)
      const result = witnessData[1];

      console.log(`Result: ${result}`);
      console.log(`Expected: ${test.expectedResult}`);
      console.log(`Test ${result == test.expectedResult ? 'PASSED ✅' : 'FAILED ❌'}`);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

runTests().catch(console.error);
