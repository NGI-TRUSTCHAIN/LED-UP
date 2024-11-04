#!/bin/bash

zokrates compile -i ./hashCheck.zok -o hashCheck --r1cs snarkjs/hashCheck.r1cs --verbose
zokrates setup -i hashCheck -b ark -s g16

npx snarkjs groth16 setup $(pwd)/snarkjs/hashCheck.r1cs $(pwd)/snarkjs/powersOfTau28_hez_final_18.ptau $(pwd)/snarkjs/hashCheck.zkey

npx snarkjs zkey export verificationkey  $(pwd)/snarkjs/hashCheck.zkey  $(pwd)/snarkjs/verification_key.json



# Sample Command Line 
# zokrates compile -i hashCheck.zok
# zokrates setup
# zokrates compute-witness -a 1234 5678 9012 3456 242738482787324818092317501628658271637
# zokrates generate-proof
# zokrates verify
# zokrates export-verifier
# /home/baloz/uV/Learning/blockchain/hardhat/age-verifier-zkp/client-nextjs/zkp/hashVerifier/compile.sh

