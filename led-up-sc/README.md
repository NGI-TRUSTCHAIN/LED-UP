# DID Registry Smart Contract

This project implements a Decentralized Identifier (DID) Registry smart contract that allows for the registration, resolution, and management of DIDs on the blockchain. The contract is built using Solidity and the Hardhat development environment.

## Features

- DID registration with associated documents and public keys
- DID resolution to retrieve associated data
- DID document and public key updates
- DID deactivation
- Address to DID mapping
- Controller management for DIDs
- Gas-optimized Zero-Knowledge Proof circuits for enhanced privacy

## Project Structure

```
didregistry/
├── contracts/           # Smart contract source code
│   └── circuits/        # ZK circuit implementations
│       └── circom/      # Circom circuit definitions
│           └── enhanced/# Gas-optimized circuits
├── interfaces/          # Contract interfaces
├── test/                # Test files
│   ├── did/             # DID Registry tests
│   ├── zkp-test/        # Zero-Knowledge Proof tests
│   │   └── circom/      # Circom circuit tests
│   │       └── gas/     # Gas optimization benchmarks
│   ├── DidRegistry.test.ts         # Basic tests
│   └── DidRegistry.enhanced.test.ts # Comprehensive test suite
├── ignition/            # Hardhat Ignition deployment modules
├── scripts/             # Utility scripts
│   ├── run-tests.sh     # Test runner script
│   └── build-optimized-circuits.sh # Circuit build script
├── led-up-fe/           # Frontend components
│   └── features/        # Frontend features
│       └── circom/      # Circom circuit utilities
│           └── utils/   # Optimized utility functions
└── TESTING.md           # Detailed testing documentation
```

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Circom 2.1.4+ (for ZK circuits)
- SnarkJS 0.7+ (for ZK proofs)

### Installation

```shell
# Install dependencies
npm install
# or
yarn install
```

### Compilation

```shell
# Compile smart contracts
npm run compile
# or
yarn compile

# Build optimized circuits
npm run build:circuits
# or
yarn build:circuits
```

## Testing

This project includes a comprehensive test suite for the DID Registry contract and ZK circuits. For detailed information about testing, see [TESTING.md](./TESTING.md).

### Running Tests

```shell
# Run DID Registry tests
npm run test:did
# or
yarn test:did

# Run enhanced test suite
npm run test:did-enhanced
# or
yarn test:did-enhanced

# Run all smart contract tests
npm run test:all
# or
yarn test:all

# Run tests with gas reporting
npm run test:gas
npm run test:gas-enhanced
# or
yarn test:gas
yarn test:gas-enhanced

# Run test coverage
npm run coverage
npm run coverage:did
# or
yarn coverage
yarn coverage:did
```

### Running ZK Circuit Tests

```shell
# Run gas optimization tests
npm run test:circuit:gas
# or
yarn test:circuit:gas

# Run optimized hash tests
npm run test:circuit:hash
# or
yarn test:circuit:hash

# Run all circuit tests
npm run test:circuit:all
# or
yarn test:circuit:all
```

## Gas-Optimized Circom Circuits

This project includes gas-optimized implementations of Zero-Knowledge Proof circuits. The optimizations focus on reducing constraint count, gas costs, and improving overall efficiency.

### Optimization Areas

- **Optimized Hash Handling**: Efficient hash splitting and validation functions
- **Enhanced Error Reporting**: Gas-efficient error coding scheme
- **Multi-Hash Algorithm Support**: Lazy computation of hash functions
- **Circuit Compilation Optimization**: R1CS optimization and constraint reduction
- **Efficient Verification**: Gas-optimized verification contracts

### Expected Improvements

| Optimization Area           | Expected Gas Savings |
| --------------------------- | -------------------- |
| Hash Handling               | 30-40%               |
| Error Reporting             | 25%                  |
| Multi-Hash Support          | 45%                  |
| Circuit Design              | 15%                  |
| Smart Contract Verification | 30-50%               |
| Batch Verification          | 70%                  |

## Deployment

```shell
# Deploy using Hardhat
npm run deploy
# or
yarn deploy

# Deploy using Hardhat Ignition
npx hardhat ignition deploy ./ignition/modules/DidRegistry.ts
```

## License

This project is licensed under the AGPL License. See the [LICENSE](./LICENSE) file for details.
