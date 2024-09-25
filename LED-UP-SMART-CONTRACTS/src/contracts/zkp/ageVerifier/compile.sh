#!/bin/bash

zokrates compile -i ./ageCheck.zok -o ageCheck --r1cs snarkjs/AgeCheck.r1cs --verbose
zokrates setup -i ageCheck -b ark -s g16

npx snarkjs groth16 setup $(pwd)/snarkjs/AgeCheck.r1cs $(pwd)/snarkjs/powersOfTau28_hez_final_10.ptau $(pwd)/snarkjs/ageCheck.zkey

npx snarkjs zkey export verificationkey  $(pwd)/snarkjs/ageCheck.zkey  $(pwd)/snarkjs/verification_key.json



