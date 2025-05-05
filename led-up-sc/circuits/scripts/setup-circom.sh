#!/bin/bash

# Exit on error
set -e

echo "Setting up Circom circuits..."

# Check if Rust is installed
if ! command -v rustc &> /dev/null; then
    echo "Installing Rust..."
    curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
    source $HOME/.cargo/env
fi

# Check if circom is installed
if ! command -v circom &> /dev/null; then
    echo "Installing circom..."
    git clone https://github.com/iden3/circom.git
    cd circom
    cargo build --release
    cargo install --path circom
    cd ..
fi

# Install yarn dependencies
echo "Installing yarn dependencies..."
yarn add -D circomlib@latest snarkjs@latest

# Check if pot12_final.ptau exists, if not download it
if [ ! -f "../ptau/pot12_final.ptau" ]; then
    echo "Downloading Powers of Tau file (pot12_final.ptau)..."
    mkdir -p ../ptau
    curl -o ../ptau/pot12_final.ptau https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_12.ptau
fi

# Create output directories
echo "Creating output directories..."
mkdir -p ../out-files

# Compile circuits
echo "Compiling AgeVerifier..."
circom ../AgeVerifier.circom \
    --r1cs \
    --wasm \
    --sym \
    --c \
    --output ../out-files

echo "Compiling FhirVerifier..."
circom ../FhirVerifier.circom \
    --r1cs \
    --wasm \
    --sym \
    --c \
    --output ../out-files

echo "Compiling HashVerifier..."
circom ../HashVerifier.circom \
    --r1cs \
    --wasm \
    --sym \
    --c \
    --output ../out-files

# Generate proving keys
echo "Generating proving keys..."
yarn snarkjs groth16 setup \
    ../out-files/AgeVerifier.r1cs \
    ../ptau/pot12_final.ptau \
    ../out-files/AgeVerifier_0001.zkey

yarn snarkjs groth16 setup \
    ../out-files/FhirVerifier.r1cs \
    ../ptau/pot12_final.ptau \
    ../out-files/FhirVerifier_0001.zkey

yarn snarkjs groth16 setup \
    ../out-files/HashVerifier.r1cs \
    ../ptau/pot12_final.ptau \
    ../out-files/HashVerifier_0001.zkey

# Generate verification keys
echo "Generating verification keys..."
yarn snarkjs zkey export verificationkey \
    ../out-files/AgeVerifier_0001.zkey \
    ../out-files/verification_key_AgeVerifier.json

yarn snarkjs zkey export verificationkey \
    ../out-files/FhirVerifier_0001.zkey \
    ../out-files/verification_key_FhirVerifier.json

yarn snarkjs zkey export verificationkey \
    ../out-files/HashVerifier_0001.zkey \
    ../out-files/verification_key_HashVerifier.json

# Generate Solidity verifiers
echo "Generating Solidity verifiers..."
yarn snarkjs zkey export solidityverifier \
    ../out-files/AgeVerifier_0001.zkey \
    ../out-files/AgeVerifier.sol

yarn snarkjs zkey export solidityverifier \
    ../out-files/FhirVerifier_0001.zkey \
    ../out-files/FhirVerifier.sol

yarn snarkjs zkey export solidityverifier \
    ../out-files/HashVerifier_0001.zkey \
    ../out-files/HashVerifier.sol

echo "Setup completed successfully!" 
