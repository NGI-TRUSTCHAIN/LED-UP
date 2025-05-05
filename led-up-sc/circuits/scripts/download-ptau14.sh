#!/bin/bash

# Exit on error
set -e

echo "Downloading powers of tau file..."

# Create directory for powers of tau if it doesn't exist
mkdir -p ../ptau

# Download powers of tau file
wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_12.ptau \
    -O ../ptau/pot12_final.ptau

echo "Download completed successfully!" 
