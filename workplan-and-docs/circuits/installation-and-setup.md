# Installation and Setup Guide for Circom Circuits

## Overview

This guide details the steps required to set up the development environment, compile the Circom circuits, and generate the necessary artifacts (keys, verifier contracts) for generating and verifying zero-knowledge proofs.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Download Powers of Tau](#download-powers-of-tau)
4. [Circuit Compilation and Setup](#circuit-compilation-and-setup)
   - [Using Individual Setup Scripts](#using-individual-setup-scripts)
   - [Understanding the Setup Process](#understanding-the-setup-process)
5. [Running Tests](#running-tests)

## Prerequisites

- **Node.js**: Version 16 or higher (check with `node -v`).
- **npm** or **yarn**: Package manager for Node.js.
- **Bash Shell**: For running setup scripts (Linux, macOS, or WSL on Windows).
- **Rust & Cargo**: Required for the **Circom** compiler (follow official Rust installation guide).
- **Standard Build Tools**: `build-essential` (Debian/Ubuntu) or equivalent for compiling dependencies.

## Environment Setup

1.  **Install Circom Compiler**:
    The `circuits/scripts/setup-circom.sh` script automates the installation of **Circom** and related tools like **snarkjs**.

    ```bash
    cd circuits/scripts
    ./setup-circom.sh
    ```

    This script clones the Circom repository, builds it using **Cargo**, and installs **snarkjs** globally via **npm**. Ensure **Cargo** and **npm** are correctly installed and configured in your PATH.

2.  **Install Node.js Dependencies**:
    Navigate to the test directory (`circuits/__test__`) and install the necessary packages.
    ```bash
    cd circuits/__test__
    yarn install  # or npm install
    ```

## Download Powers of Tau (Phase 1 Setup)

Zero-knowledge proofs using **Groth16** require a trusted setup. **Phase 1 (Powers of Tau)** is universal and needs to be performed once. The `circuits/scripts/download-ptau.sh` script downloads a pre-generated Powers of Tau file suitable for the complexity of these circuits.

```bash
cd circuits/scripts
./download-ptau.sh 20 # The argument '20' corresponds to 2^20 constraints
```

This will download the `powersOfTau28_hez_final_20.ptau` file into the `circuits/ptau/` directory (creating it if necessary). Ensure you have sufficient disk space and a stable internet connection.

## Circuit Compilation and Setup (Phase 2 Setup)

This phase compiles the `.circom` files and performs the circuit-specific trusted setup (**Phase 2**) to generate proving and verification keys.

### Using Individual Setup Scripts

The `circuits/scripts/` directory contains specific setup scripts for each main circuit. These scripts typically automate the compilation, key generation, and verifier contract generation steps.

Run the desired script from the `circuits/scripts/` directory:

- **For Age Verifier:**
  ```bash
  ./setup-age-verifier.sh
  ```
- **For Hash Verifier:**
  ```bash
  ./setup-hash-verifier.sh
  ```
- **For FHIR Verifier (Standard):**
  ```bash
  ./setup-fhir-verifier.sh
  ```
- **For FHIR Verifier (Alternative/Version 2):**
  ```bash
  ./setup-fhir-verifier2.sh
  ```
- **For FHIR Merkle Verifier:**
  ```bash
  ./setup-fhir-merkle-verifier.sh
  ```

These scripts will:

1.  Compile the corresponding `.circom` file (e.g., `AgeVerifier.circom`) into **R1CS** and **Wasm** formats, placing them in the `circuits/out/` directory.
2.  Generate the circuit-specific proving key (`.zkey`) using the downloaded `.ptau` file and a contribution (often using a default entropy or allowing for contributions).
3.  Extract the verification key (`verification_key.json`) from the `.zkey` file.
4.  Generate a **Solidity verifier contract** (`Verifier.sol`) based on the verification key.

Artifacts are typically placed in circuit-specific subdirectories within `circuits/out/` (e.g., `circuits/out/age-verifier/`).

### Understanding the Setup Process

The individual setup scripts likely utilize **snarkjs** commands or potentially the `circuits/scripts/setup-circuits.js` script (if it acts as a helper/orchestrator) to perform the following core **snarkjs** steps:

1.  **Compile Circuit**:
    ```bash
    circom <circuit_file>.circom --r1cs --wasm --output circuits/out/<circuit_name>
    ```
2.  **Generate ZKey (Initial - Phase 2 Setup)**:
    ```bash
    snarkjs groth16 setup circuits/out/<circuit_name>/<circuit_file>.r1cs circuits/ptau/powersOfTau28_hez_final_20.ptau circuits/out/<circuit_name>/circuit_0000.zkey
    ```
3.  **Contribute Randomness (Example)**:
    ```bash
    snarkjs zkey contribute circuits/out/<circuit_name>/circuit_0000.zkey circuits/out/<circuit_name>/circuit_final.zkey -v -e="some random text"
    ```
    _(Note: Production setups require secure multi-party computation ceremonies for this step)_.
4.  **Export Verification Key**:
    ```bash
    snarkjs zkey export verificationkey circuits/out/<circuit_name>/circuit_final.zkey circuits/out/<circuit_name>/verification_key.json
    ```
5.  **Generate Solidity Verifier**:
    ```bash
    snarkjs zkey export solidityverifier circuits/out/<circuit_name>/circuit_final.zkey circuits/out/<circuit_name>/Verifier.sol
    ```

Refer to the specific `.sh` scripts and the `setup-circuits.js` file for the exact commands and parameters used.

## Running Tests

After setting up a circuit, you can run its corresponding tests to ensure correctness. The test scripts are located in `circuits/scripts/` and typically execute test suites found in `circuits/__test__/`.

Example (running Age Verifier tests):

```bash
cd circuits/scripts
./run-all-age-verifier-tests.sh # Or a more specific test script if available
```

Consult the individual `run-*.sh` scripts for details on how tests are executed (often using **Node.js** and test frameworks like **Mocha** or **Jest** defined in `circuits/__test__/package.json`).
