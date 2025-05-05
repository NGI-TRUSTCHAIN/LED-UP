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
led-up-sc/
├── src/                 # Source code
│   ├── contracts/       # Smart contract implementations
│   │   ├── zkp/         # ZK verifier contracts
│   ├── interfaces/      # Contract interfaces
│   └── library/         # Shared libraries
├── circuits/            # ZK circuit implementations
│   ├── __test__/        # Circuit test files
│   ├── out-files/       # Generated circuit outputs
│   ├── ptau/            # Trusted setup files
│   └── scripts/         # Circuit utility scripts
├── interfaces/          # TypeScript interfaces
├── test/                # Test files
│   ├── hardhat/         # Hardhat-based tests
│   └── foundry/         # Foundry-based tests
├── scripts/             # Utility scripts
├── ignition/            # Hardhat Ignition deployment modules
├── types/               # TypeScript type definitions
├── lib/                 # Libraries (Foundry)
├── artifacts/           # Compiled contract artifacts
├── typechain-types/     # Generated TypeScript types
├── factories/           # Generated contract factories
└── coverage/            # Code coverage reports
```

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Circom 2.1.4+ (for ZK circuits)
- SnarkJS 0.7+ (for ZK proofs)
- Foundry (for testing with Forge)

### Installation

```shell
# Install dependencies
npm install
# or
yarn install

# Setup Foundry (if using Foundry)
forge install
```

### Compilation

```shell
# Compile smart contracts with Hardhat
npm run compile
# or
yarn compile

# Compile with Foundry
forge build

# Build optimized circuits
npm run build:circuits
# or
yarn build:circuits
```

## Testing

This project includes a comprehensive test suite for the DID Registry contract and ZK circuits.

### Running Tests

```shell
# Run Hardhat tests
npm run test:hardhat
# or
yarn test:hardhat

# Run Foundry tests
forge test

# Run tests with gas reporting
npm run test:gas
# or
yarn test:gas

# Run test coverage
npm run coverage
# or
yarn coverage
```

### Running ZK Circuit Tests

```shell
# Run circuit tests
npm run test:circuits
# or
yarn test:circuits
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

# Deploy using Foundry
forge script scripts/Deploy.s.sol --rpc-url <RPC_URL> --private-key <PRIVATE_KEY>
```

## License

This project is licensed under the AGPL License. See the [LICENSE](./LICENSE) file for details.
