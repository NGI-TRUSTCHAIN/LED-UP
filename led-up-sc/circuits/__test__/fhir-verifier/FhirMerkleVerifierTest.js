// const { expect } = require('chai');
// const path = require('path');
// const wasm_tester = require('circom_tester').wasm;
// const { FhirMerkleDatabase } = require('../utils/merkleTree');

// describe('FhirMerkleVerifier Circuit Test', function () {
//   // These tests can take some time to run
//   this.timeout(100000);

//   let circuit;
//   let fhirDb;
//   let merkleRoot;

//   // Sample FHIR resources
//   const validResourceType = 5; // e.g., 5 = Patient
//   const invalidResourceType = 20; // Outside valid range

//   // Sample resource data (8 fields)
//   const validResourceData = [1, 2, 3, 4, 5, 6, 7, 8];

//   // Initialize test environment
//   before(async () => {
//     // Initialize mock FHIR database with Merkle tree
//     fhirDb = new FhirMerkleDatabase(10); // Height = 10 for test purposes
//     await fhirDb.initialize();

//     // Add sample resources to the database
//     await fhirDb.addResource(validResourceType, validResourceData, 'resource1');
//     await fhirDb.addResource(7, [10, 20, 30, 40, 50, 60, 70, 80], 'resource2');
//     await fhirDb.addResource(12, [11, 22, 33, 44, 55, 66, 77, 88], 'resource3');

//     // Get the Merkle root
//     merkleRoot = fhirDb.getRoot();

//     // Load the circuit
//     circuit = await wasm_tester(path.join(__dirname, '../../FhirMerkleVerifier.circom'));
//   });

//   // Test cases
//   it('should validate a valid resource type (Mode 1)', async () => {
//     const input = {
//       resourceType: validResourceType,
//       resourceData: validResourceData,
//       root: merkleRoot,
//       pathElements: Array(10).fill('0'),
//       pathIndices: Array(10).fill(0),
//       verificationMode: 1, // Type validation only
//     };

//     const witness = await circuit.calculateWitness(input);
//     await circuit.checkConstraints(witness);

//     // Expected result: Success (1)
//     expect(witness[1]).to.equal(1n);
//   });

//   it('should reject an invalid resource type (Mode 1)', async () => {
//     const input = {
//       resourceType: invalidResourceType,
//       resourceData: validResourceData,
//       root: merkleRoot,
//       pathElements: Array(10).fill('0'),
//       pathIndices: Array(10).fill(0),
//       verificationMode: 1, // Type validation only
//     };

//     const witness = await circuit.calculateWitness(input);
//     await circuit.checkConstraints(witness);

//     // Expected result: Type Error (2)
//     expect(witness[1]).to.equal(2n);
//   });

//   it('should validate an existing resource (Mode 2)', async () => {
//     // Get proof for an existing resource
//     const proof = fhirDb.getProof('resource1');

//     const input = {
//       resourceType: validResourceType,
//       resourceData: validResourceData,
//       root: merkleRoot,
//       pathElements: proof.pathElements,
//       pathIndices: proof.pathIndices,
//       verificationMode: 2, // Existence validation only
//     };

//     const witness = await circuit.calculateWitness(input);
//     await circuit.checkConstraints(witness);

//     // Expected result: Success (1)
//     expect(witness[1]).to.equal(1n);
//   });

//   it('should reject a non-existent resource (Mode 2)', async () => {
//     // Get proof for an existing resource but modify the data
//     const proof = fhirDb.getProof('resource1');
//     const modifiedResourceData = [...validResourceData];
//     modifiedResourceData[0] = 999; // Modify one field to make it non-existent

//     const input = {
//       resourceType: validResourceType,
//       resourceData: modifiedResourceData,
//       root: merkleRoot,
//       pathElements: proof.pathElements,
//       pathIndices: proof.pathIndices,
//       verificationMode: 2, // Existence validation only
//     };

//     const witness = await circuit.calculateWitness(input);
//     await circuit.checkConstraints(witness);

//     // Expected result: Existence Error (3)
//     expect(witness[1]).to.equal(3n);
//   });

//   it('should validate a valid resource in complete mode (Mode 3)', async () => {
//     // Get proof for an existing resource
//     const proof = fhirDb.getProof('resource1');

//     const input = {
//       resourceType: validResourceType,
//       resourceData: validResourceData,
//       root: merkleRoot,
//       pathElements: proof.pathElements,
//       pathIndices: proof.pathIndices,
//       verificationMode: 3, // Complete validation (type + existence)
//     };

//     const witness = await circuit.calculateWitness(input);
//     await circuit.checkConstraints(witness);

//     // Expected result: Success (1)
//     expect(witness[1]).to.equal(1n);
//   });

//   it('should reject a resource with invalid type in complete mode (Mode 3)', async () => {
//     // Get proof for an existing resource but use invalid type
//     const proof = fhirDb.getProof('resource1');

//     const input = {
//       resourceType: invalidResourceType,
//       resourceData: validResourceData,
//       root: merkleRoot,
//       pathElements: proof.pathElements,
//       pathIndices: proof.pathIndices,
//       verificationMode: 3, // Complete validation (type + existence)
//     };

//     const witness = await circuit.calculateWitness(input);
//     await circuit.checkConstraints(witness);

//     // Expected result: Type Error (2)
//     expect(witness[1]).to.equal(2n);
//   });

//   it('should reject a non-existent resource in complete mode (Mode 3)', async () => {
//     // Get proof for an existing resource but modify the data
//     const proof = fhirDb.getProof('resource1');
//     const modifiedResourceData = [...validResourceData];
//     modifiedResourceData[0] = 999; // Modify one field to make it non-existent

//     const input = {
//       resourceType: validResourceType,
//       resourceData: modifiedResourceData,
//       root: merkleRoot,
//       pathElements: proof.pathElements,
//       pathIndices: proof.pathIndices,
//       verificationMode: 3, // Complete validation (type + existence)
//     };

//     const witness = await circuit.calculateWitness(input);
//     await circuit.checkConstraints(witness);

//     // Expected result: Existence Error (3)
//     expect(witness[1]).to.equal(3n);
//   });

//   it('should reject an invalid verification mode', async () => {
//     // Get proof for an existing resource
//     const proof = fhirDb.getProof('resource1');

//     const input = {
//       resourceType: validResourceType,
//       resourceData: validResourceData,
//       root: merkleRoot,
//       pathElements: proof.pathElements,
//       pathIndices: proof.pathIndices,
//       verificationMode: 5, // Invalid mode
//     };

//     const witness = await circuit.calculateWitness(input);
//     await circuit.checkConstraints(witness);

//     // Expected result: Invalid Mode Error (4)
//     expect(witness[1]).to.equal(4n);
//   });
// });

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Get output directory
const outDir = process.env.OUT_DIR || path.join(__dirname, '../../../circuits/out-files/fhir-verifier');
const inputPath = path.join(outDir, 'input.json');
const witnessPath = path.join(outDir, 'witness.wtns');
const witnessJsonPath = path.join(outDir, 'witness.json');

// Generate witness using the compiled circuit
execSync(
  `cd ${outDir} && node FhirVerifier_js/generate_witness.js FhirVerifier_js/FhirVerifier.wasm input.json witness.wtns`
);

// Extract the output from the witness
const { stdout: witnessInfo } = execSync(`cd ${outDir} && snarkjs wtns export json witness.wtns witness.json`);
const witnessData = JSON.parse(fs.readFileSync(witnessJsonPath, 'utf8'));
