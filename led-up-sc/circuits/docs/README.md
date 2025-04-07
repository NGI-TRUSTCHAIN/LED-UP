# Enhanced Circom Verifiers

This directory contains Circom implementations of the enhanced verifiers for the LED-UP system. The implementations provide improved functionality and better modularity compared to the original ZoKrates versions.

## Circuits

### 1. Age Verifier (`AgeVerifier.circom`)

Enhanced age verification circuit with support for:

- Simple age verification (age > threshold)
- Birth date verification (calculated age > threshold)
- Age bracket verification (child, adult, senior)

#### Components

- `DateUtils`: Handles date parsing and manipulation
- `AgeBracketChecker`: Determines age bracket (child, adult, senior)
- `DateValidator`: Validates date format and ranges
- `AgeCalculator`: Calculates age from birth date and current date

#### Inputs

- `age`: Age value
- `birthDate`: Birth date in YYYYMMDD format
- `currentDate`: Current date in YYYYMMDD format
- `threshold`: Age threshold
- `verificationType`: Type of verification (1: simple, 2: birth date, 3: bracket)

#### Outputs

- `result`: Verification result code

### 2. FHIR Verifier (`FhirVerifier.circom`)

Enhanced FHIR verification circuit with support for:

- Extended resource types (16 types)
- Enhanced field validation
- Hash verification

#### Components

- `ResourceTypeValidator`: Validates FHIR resource types
- `FieldValidator`: Validates required fields based on resource type
- `HashCalculator`: Calculates hash using Poseidon

#### Inputs

- `resourceData[8]`: Resource data array
- `resourceType`: FHIR resource type
- `expectedHash[2]`: Expected hash value
- `verificationMode`: Verification mode

#### Outputs

- `result`: Verification result code

### 3. Hash Verifier (`HashVerifier.circom`)

Enhanced hash verification circuit with support for:

- SHA-256 hashing using Poseidon
- Simple hash verification

#### Components

- `HashCalculator`: Calculates hash using Poseidon

#### Inputs

- `data[4]`: Input data array
- `expectedHash[2]`: Expected hash value

#### Outputs

- `result`: Verification result (1: valid, 0: invalid)

## Usage

1. Install dependencies:

```bash
npm install circomlib
```

2. Compile circuits:

```bash
circom AgeVerifier.circom --r1cs --wasm --sym
circom FhirVerifier.circom --r1cs --wasm --sym
circom HashVerifier.circom --r1cs --wasm --sym
```

3. Generate proofs:

```bash
# Using snarkjs
snarkjs groth16 fullprove input.json AgeVerifier_js/AgeVerifier.wasm AgeVerifier_0001.zkey proof.json public.json
```

## Testing

Run tests using the provided test suite:

```bash
npm test
```

## Security Considerations

1. All circuits use Poseidon hash function for better security and efficiency
2. Input validation is performed at multiple levels
3. Field arithmetic is used to prevent overflow
4. Modular design allows for easy updates and maintenance

## Performance

The Circom implementations offer several advantages over the ZoKrates versions:

- Better modularity and reusability
- More efficient constraint generation
- Improved developer experience
- Better integration with modern ZK tooling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
