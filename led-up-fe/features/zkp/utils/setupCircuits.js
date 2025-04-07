/**
 * Script to copy Circom circuit files to the public directory
 * Run this script before building or starting the Next.js application
 */
const fs = require('fs');
const path = require('path');

// Source and destination paths
const sourcePath = path.resolve(__dirname, '../../../../led-up-sc/circuits/out-files');
const destPath = path.resolve(__dirname, '../../../public/circuits');

// Ensure destination directory exists
if (!fs.existsSync(destPath)) {
  fs.mkdirSync(destPath, { recursive: true });
  console.log(`Created directory: ${destPath}`);
}

// Files to copy
const filesToCopy = [
  // AgeVerifier files
  {
    src: path.join(sourcePath, 'age-verifier', 'AgeVerifier_js', 'AgeVerifier.wasm'),
    dest: path.join(destPath, 'AgeVerifier.wasm'),
  },
  {
    src: path.join(sourcePath, 'age-verifier', 'AgeVerifier_0001.zkey'),
    dest: path.join(destPath, 'AgeVerifier_0001.zkey'),
  },
  {
    src: path.join(sourcePath, 'age-verifier', 'verification_key_AgeVerifier.json'),
    dest: path.join(destPath, 'verification_key_AgeVerifier.json'),
  },

  // FhirVerifier files
  {
    src: path.join(sourcePath, 'fhir-verifier', 'FhirVerifier_js', 'FhirVerifier.wasm'),
    dest: path.join(destPath, 'FhirVerifier.wasm'),
  },
  {
    src: path.join(sourcePath, 'fhir-verifier', 'FhirVerifier_0001.zkey'),
    dest: path.join(destPath, 'FhirVerifier_0001.zkey'),
  },
  {
    src: path.join(sourcePath, 'fhir-verifier', 'verification_key_FhirVerifier.json'),
    dest: path.join(destPath, 'verification_key_FhirVerifier.json'),
  },

  // HashVerifier files
  {
    src: path.join(sourcePath, 'hash-verifier', 'HashVerifier_js', 'HashVerifier.wasm'),
    dest: path.join(destPath, 'HashVerifier.wasm'),
  },
  {
    src: path.join(sourcePath, 'hash-verifier', 'HashVerifier_0001.zkey'),
    dest: path.join(destPath, 'HashVerifier_0001.zkey'),
  },
  {
    src: path.join(sourcePath, 'hash-verifier', 'verification_key_HashVerifier.json'),
    dest: path.join(destPath, 'verification_key_HashVerifier.json'),
  },
];

// Copy each file
filesToCopy.forEach((file) => {
  try {
    if (fs.existsSync(file.src)) {
      fs.copyFileSync(file.src, file.dest);
      console.log(`Copied: ${file.src} -> ${file.dest}`);
    } else {
      console.error(`Source file not found: ${file.src}`);
    }
  } catch (error) {
    console.error(`Error copying ${file.src}: ${error.message}`);
  }
});

console.log('Circuit files copy completed!');
