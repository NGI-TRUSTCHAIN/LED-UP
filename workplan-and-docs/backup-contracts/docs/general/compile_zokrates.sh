#!/bin/bash

# Print the current PATH
echo "Current PATH: $PATH"

# Try to find zokrates
which zokrates || echo "ZoKrates not found in PATH"

# Try to compile directly
echo "Attempting to compile..."
zokrates compile -i src/contracts/circuits/enhancedHashVerifier/enhancedHashCheck.zok || echo "Direct compilation failed"

# Create output directory
mkdir -p src/contracts/circuits/enhancedHashVerifier/output

# Try with Docker if available
echo "Attempting to compile with Docker..."
docker run -v $PWD:/home/zokrates/code -w /home/zokrates/code zokrates/zokrates:latest zokrates compile -i src/contracts/circuits/enhancedHashVerifier/enhancedHashCheck.zok -o src/contracts/circuits/enhancedHashVerifier/output/out || echo "Docker compilation failed"

echo "Script completed" 
