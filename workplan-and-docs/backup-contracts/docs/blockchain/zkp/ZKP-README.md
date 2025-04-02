# ZKP Health Data Verification System

This system provides Zero-Knowledge Proof (ZKP) verification for health data, allowing users to prove certain properties of their health data without revealing the data itself. The system includes three main verifiers:

1. **AgeVerifier**: Verifies that a person's age is greater than a specified threshold without revealing the actual age.
2. **HashVerifier**: Verifies that the hash of private health data matches an expected hash, ensuring data integrity.
3. **FHIRVerifier**: Verifies properties of FHIR (Fast Healthcare Interoperability Resources) data, such as resource type and required fields.

## System Architecture

The system consists of the following components:

- **ZoKrates Circuits**: The core ZKP circuits that define the verification logic.
- **Verifier Contracts**: Solidity contracts that verify ZKP proofs.
- **ZKP Registry**: A registry that manages all verifier contracts.
- **ZKP Verifier Factory**: A factory that deploys new verifier contracts.

## Setup and Deployment

### Prerequisites

- Node.js (v14+)
- ZoKrates CLI (v0.8.0+)
- Hardhat or Foundry for Ethereum development

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

### Compiling ZoKrates Circuits

1. Compile the AgeVerifier circuit:

   ```bash
   zokrates compile -i src/contracts/circuits/ageVerifier/ageCheck.zok -o ageCheck
   zokrates setup -i ageCheck
   zokrates export-verifier -o src/contracts/circuits/ageVerifier/verifier.sol
   ```

2. Compile the HashVerifier circuit:

   ```bash
   zokrates compile -i src/contracts/circuits/hashVerifier/hashCheck.zok -o hashCheck
   zokrates setup -i hashCheck
   zokrates export-verifier -o src/contracts/circuits/hashVerifier/verifier.sol
   ```

3. Compile the FHIRVerifier circuit:
   ```bash
   zokrates compile -i src/contracts/circuits/fhirVerifier/fhirCheck.zok -o fhirCheck
   zokrates setup -i fhirCheck
   zokrates export-verifier -o src/contracts/circuits/fhirVerifier/verifier.sol
   ```

### Deploying Smart Contracts

1. Deploy the ZKP Registry:

   ```bash
   npx hardhat run scripts/deploy-zkp-registry.js --network <network>
   ```

2. Deploy the ZKP Verifier Factory:

   ```bash
   npx hardhat run scripts/deploy-zkp-factory.js --network <network>
   ```

3. Deploy the ZoKrates-generated verifier contracts:

   ```bash
   npx hardhat run scripts/deploy-zokrates-verifiers.js --network <network>
   ```

4. Deploy the verifier contracts using the factory:
   ```bash
   npx hardhat run scripts/deploy-verifiers.js --network <network>
   ```

## Usage

### Generating Proofs

1. Generate a proof for age verification:

   ```bash
   # Create a witness file with the private age and public threshold
   echo "35 18" > age_input.txt

   # Generate the witness
   zokrates compute-witness -i ageCheck -o age_witness -a $(cat age_input.txt)

   # Generate the proof
   zokrates generate-proof -i ageCheck -w age_witness -p age_proof.json
   ```

2. Generate a proof for hash verification:

   ```bash
   # Create a witness file with the private data and public expected hash
   echo "1 2 3 4 12345678 87654321" > hash_input.txt

   # Generate the witness
   zokrates compute-witness -i hashCheck -o hash_witness -a $(cat hash_input.txt)

   # Generate the proof
   zokrates generate-proof -i hashCheck -w hash_witness -p hash_proof.json
   ```

3. Generate a proof for FHIR verification:

   ```bash
   # Create a witness file with the private resource data and public parameters
   echo "1 2 3 4 1 12345678 87654321 3" > fhir_input.txt

   # Generate the witness
   zokrates compute-witness -i fhirCheck -o fhir_witness -a $(cat fhir_input.txt)

   # Generate the proof
   zokrates generate-proof -i fhirCheck -w fhir_witness -p fhir_proof.json
   ```

### Verifying Proofs On-Chain

1. Verify an age proof:

   ```javascript
   // JavaScript example using ethers.js
   const ageVerifier = await ethers.getContractAt('AgeVerifier', ageVerifierAddress);

   // Parse the proof from the JSON file
   const proof = JSON.parse(fs.readFileSync('age_proof.json'));

   // Verify the proof
   const result = await ageVerifier.verifyAge(
     proof.proof.a,
     proof.proof.b,
     proof.proof.c,
     18 // Threshold
   );

   console.log('Age verification result:', result);
   ```

2. Verify a hash proof:

   ```javascript
   // JavaScript example using ethers.js
   const hashVerifier = await ethers.getContractAt('HashVerifier', hashVerifierAddress);

   // Parse the proof from the JSON file
   const proof = JSON.parse(fs.readFileSync('hash_proof.json'));

   // Verify the proof
   const result = await hashVerifier.verifyHash(
     proof.proof.a,
     proof.proof.b,
     proof.proof.c,
     [12345678, 87654321] // Expected hash
   );

   console.log('Hash verification result:', result);
   ```

3. Verify a FHIR proof:

   ```javascript
   // JavaScript example using ethers.js
   const fhirVerifier = await ethers.getContractAt('FHIRVerifier', fhirVerifierAddress);

   // Parse the proof from the JSON file
   const proof = JSON.parse(fs.readFileSync('fhir_proof.json'));

   // Verify the proof
   const result = await fhirVerifier.verifyFHIRResource(
     proof.proof.a,
     proof.proof.b,
     proof.proof.c,
     0, // ResourceType.Patient
     [12345678, 87654321], // Expected hash
     3 // Required field
   );

   console.log('FHIR verification result:', result);
   ```

## Gas Optimization

The contracts have been optimized for gas efficiency using the following techniques:

1. **Use of `calldata` instead of `memory`**: Function parameters use `calldata` where possible to reduce gas costs.
2. **Immutable variables**: Variables that don't change after contract deployment are marked as `immutable`.
3. **Efficient storage**: Using `bytes32` for identifiers instead of strings.
4. **Minimal storage operations**: Minimizing the number of storage operations to reduce gas costs.
5. **Circuit optimization**: ZoKrates circuits are designed to minimize the number of constraints.

## Security Considerations

1. **Access Control**: The ZKP Registry implements access control to ensure only authorized users can register or remove verifiers.
2. **Input Validation**: All inputs are validated to ensure they are within acceptable ranges.
3. **Error Handling**: Proper error handling is implemented to prevent unexpected behavior.
4. **Upgradeability**: The system is designed to be upgradeable by allowing new verifiers to be registered.

## Testing

Run the tests to ensure the system works as expected:

```bash
npx hardhat test
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
