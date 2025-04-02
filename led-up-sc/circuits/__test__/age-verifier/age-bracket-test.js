const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Convert a date to Unix timestamp (seconds since epoch)
function dateToTimestamp(year, month, day) {
  return Math.floor(new Date(year, month - 1, day).getTime() / 1000);
}

// Convert years to seconds
function yearsToSeconds(years) {
  return years * 31536000; // 365 days in seconds
}

// Current date as Unix timestamp
const CURRENT_DATE = dateToTimestamp(2025, 3, 19); // March 19, 2025

// Test cases for Age Bracket Verification (verificationType = 3)
const tests = [
  {
    name: 'Age Bracket - Child',
    input: {
      birthDate: dateToTimestamp(2015, 1, 1), // January 1, 2015 (10 years old in 2025)
      currentDate: CURRENT_DATE, // March 19, 2025
      threshold: yearsToSeconds(18), // Not used for age bracket verification
      verificationType: 3,
    },
    expectedResult: 11, // AGE_BRACKET_CHILD
  },
  {
    name: 'Age Bracket - Adult',
    input: {
      birthDate: dateToTimestamp(1995, 1, 1), // January 1, 1995 (30 years old in 2025)
      currentDate: CURRENT_DATE, // March 19, 2025
      threshold: yearsToSeconds(18), // Not used for age bracket verification
      verificationType: 3,
    },
    expectedResult: 12, // AGE_BRACKET_ADULT
  },
  {
    name: 'Age Bracket - Senior',
    input: {
      birthDate: dateToTimestamp(1955, 1, 1), // January 1, 1955 (70 years old in 2025)
      currentDate: CURRENT_DATE, // March 19, 2025
      threshold: yearsToSeconds(18), // Not used for age bracket verification
      verificationType: 3,
    },
    expectedResult: 13, // AGE_BRACKET_SENIOR
  },
];

async function runTests() {
  console.log('Starting Age Bracket Verification Tests...');

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

      fs.writeFileSync('input.json', inputData);
      console.log(`Input: ${inputData}`);

      // Calculate expected age in years for display
      const ageInSeconds = test.input.currentDate - test.input.birthDate;
      const ageInYears = Math.floor(ageInSeconds / 31536000);
      console.log(`Birth date: ${new Date(test.input.birthDate * 1000).toISOString().split('T')[0]}`);
      console.log(`Current date: ${new Date(test.input.currentDate * 1000).toISOString().split('T')[0]}`);
      console.log(`Calculated age: ${ageInYears} years`);

      // Generate witness using the compiled circuit
      execSync(
        `cd ${
          process.env.OUT_DIR || path.join(__dirname, '../../../circuits/out-files/age-verifier')
        } && node AgeVerifier_js/generate_witness.js AgeVerifier_js/AgeVerifier.wasm input.json witness.wtns`
      );

      // Extract the output from the witness
      const { stdout: witnessInfo } = execSync(
        `cd ${
          process.env.OUT_DIR || path.join(__dirname, '../../../circuits/out-files/age-verifier')
        } && snarkjs wtns export json witness.wtns witness.json`
      );
      const witnessData = JSON.parse(
        fs.readFileSync(
          path.join(
            process.env.OUT_DIR || path.join(__dirname, '../../../circuits/out-files/age-verifier'),
            'witness.json'
          ),
          'utf8'
        )
      );

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

runTests();
