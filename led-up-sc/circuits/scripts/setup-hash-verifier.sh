#!/bin/bash

# Set colors for better output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== HashVerifier Circuit Setup ===${NC}"

# Get the project root directory and circuits directory
SCRIPT_DIR=$(dirname "$0")
CIRCUITS_DIR=$(cd "$SCRIPT_DIR/.." && pwd)
echo -e "${BLUE}Working in directory: ${CIRCUITS_DIR}${NC}"

# Create directories if needed
OUT_DIR="${CIRCUITS_DIR}/out-files/hash-verifier"
PTAU_DIR="${CIRCUITS_DIR}/ptau"
mkdir -p ${OUT_DIR}/HashVerifier_js

# Step 1: Compile the circuit
echo -e "\n${BLUE}Step 1: Compiling HashVerifier circuit...${NC}"
cd ${CIRCUITS_DIR}
circom HashVerifier.circom --r1cs --wasm --sym -o ${OUT_DIR} -l ./__test__/node_modules

if [ $? -ne 0 ]; then
    echo -e "${RED}Circuit compilation failed. Exiting.${NC}"
    exit 1
else
    echo -e "${GREEN}Circuit compiled successfully.${NC}"
fi

# Check if required files exist
echo -e "\n${BLUE}Checking for required files...${NC}"
if [ ! -f "${OUT_DIR}/HashVerifier.r1cs" ]; then
    echo -e "${RED}Error: Circuit R1CS file not found even after compilation.${NC}"
    echo -e "${RED}There might be an issue with the circom compiler or the circuit file.${NC}"
    exit 1
fi

# Check for Powers of Tau file
PTAU_FILE="${PTAU_DIR}/pot12_final.ptau"
if [ ! -f "$PTAU_FILE" ]; then
    echo -e "${RED}Error: Powers of Tau file not found at: ${PTAU_FILE}${NC}"
    echo -e "${RED}Please ensure the pot12_final.ptau file exists in the circuits/ptau directory${NC}"
    exit 1
else
    echo -e "${GREEN}Powers of Tau file found.${NC}"
fi

echo -e "${GREEN}Required files found.${NC}"

# Phase 1: Generate initial zkey
echo -e "\n${CYAN}=== Phase 1: Generating initial zkey ===${NC}"
echo -e "${YELLOW}This may take a few minutes...${NC}"
cd ${OUT_DIR}
snarkjs groth16 setup HashVerifier.r1cs ${PTAU_FILE} HashVerifier_0000.zkey

# Phase 2: Contribute to ceremony
echo -e "\n${CYAN}=== Phase 2: Contributing to ceremony ===${NC}"
echo "circuit setup" | snarkjs zkey contribute HashVerifier_0000.zkey HashVerifier_0001.zkey --name="First contribution" -v

# Phase 3: Create final zkey
echo -e "\n${CYAN}=== Phase 3: Creating final zkey ===${NC}"
snarkjs zkey beacon HashVerifier_0001.zkey HashVerifier_0001.zkey 0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f 10 -n="Final Beacon phase2"

# Phase 4: Export verification key
echo -e "\n${CYAN}=== Phase 4: Exporting verification key ===${NC}"
snarkjs zkey export verificationkey HashVerifier_0001.zkey verification_key_HashVerifier.json

# Step 5: Move the WASM file to the expected location
echo -e "\n${BLUE}Step 5: Moving WASM file to correct location...${NC}"
mv ${OUT_DIR}/HashVerifier_js/HashVerifier.wasm ${OUT_DIR}/HashVerifier_js/

# Verify setup was successful
WASM_FILE="${OUT_DIR}/HashVerifier_js/HashVerifier.wasm"
ZKEY_FILE="${OUT_DIR}/HashVerifier_0001.zkey"
VKEY_FILE="${OUT_DIR}/verification_key_HashVerifier.json"

# Initialize success flag
SETUP_SUCCESS=true

if [ ! -f "$WASM_FILE" ]; then
    echo -e "${RED}Missing WASM file: ${WASM_FILE}${NC}"
    SETUP_SUCCESS=false
else
    echo -e "${GREEN}✅ WASM file exists.${NC}"
fi

if [ ! -f "$ZKEY_FILE" ]; then
    echo -e "${RED}Missing ZKEY file: ${ZKEY_FILE}${NC}"
    SETUP_SUCCESS=false
else
    echo -e "${GREEN}✅ ZKEY file exists.${NC}"
fi

if [ ! -f "$VKEY_FILE" ]; then
    echo -e "${RED}Missing verification key file: ${VKEY_FILE}${NC}"
    SETUP_SUCCESS=false
else
    echo -e "${GREEN}✅ Verification key file exists.${NC}"
fi

if [ ! -f "$PTAU_FILE" ]; then
    echo -e "${RED}Missing Powers of Tau file: ${PTAU_FILE}${NC}"
    SETUP_SUCCESS=false
else
    echo -e "${GREEN}✅ Powers of Tau file exists.${NC}"
fi

if [ "$SETUP_SUCCESS" = false ]; then
    echo -e "\n${RED}❌ HashVerifier circuit setup failed.${NC}"
    echo -e "${RED}Please check the output above for errors.${NC}"
    exit 1
else
    echo -e "\n${GREEN}✅ HashVerifier circuit setup completed successfully!${NC}"
    echo -e "${GREEN}Generated files:${NC}"
    echo -e "${GREEN}  - ${ZKEY_FILE}${NC}"
    echo -e "${GREEN}  - ${VKEY_FILE}${NC}"
    echo -e "${GREEN}  - ${WASM_FILE}${NC}"
    echo -e "${GREEN}  - Using PTAU file: ${PTAU_FILE}${NC}"
    echo -e "\n${YELLOW}You can now run the tests with:${NC}"
    echo -e "${YELLOW}./scripts/run-hash-verifier-tests.sh${NC}"
fi 
