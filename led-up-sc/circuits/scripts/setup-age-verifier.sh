#!/bin/bash

# Set colors for better output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Age Verifier Circuit Setup Script ===${NC}"

# Get the project root directory and circuits directory
SCRIPT_DIR=$(dirname "$0")
CIRCUITS_DIR=$(cd "$SCRIPT_DIR/.." && pwd)
echo -e "${BLUE}Working in directory: ${CIRCUITS_DIR}${NC}"

# Create the output directories if they don't exist
OUT_DIR="${CIRCUITS_DIR}/out-files/age-verifier"
PTAU_DIR="${CIRCUITS_DIR}/ptau"
mkdir -p ${OUT_DIR}/AgeVerifier_js

# Step 1: Compile the circuit
echo -e "${BLUE}Step 1: Compiling Age Verifier circuit...${NC}"
cd ${CIRCUITS_DIR}
circom AgeVerifier.circom --r1cs --wasm --sym --c -o ${OUT_DIR} -l ./__test__/node_modules

if [ $? -ne 0 ]; then
    echo -e "${RED}Circuit compilation failed. Exiting.${NC}"
    exit 1
else
    echo -e "${GREEN}Circuit compiled successfully.${NC}"
fi

# Step 2: Moving the WASM file to the expected location
echo -e "${BLUE}Step 2: Moving WASM file to correct location...${NC}"
mv ${OUT_DIR}/AgeVerifier_js/AgeVerifier.wasm ${OUT_DIR}/AgeVerifier_js/

# Step 3: Check for Powers of Tau file
echo -e "${BLUE}Step 3: Checking Powers of Tau file...${NC}"
PTAU_FILE="${PTAU_DIR}/pot12_final.ptau"

if [ ! -f "$PTAU_FILE" ]; then
    echo -e "${RED}Powers of Tau file not found at: ${PTAU_FILE}${NC}"
    echo -e "${RED}Please ensure the pot12_final.ptau file exists in the circuits/ptau directory${NC}"
    exit 1
else
    echo -e "${GREEN}Found Powers of Tau file.${NC}"
fi

# Step 4: Generate the zkey files
echo -e "${BLUE}Step 4: Generating zkey files...${NC}"
cd ${OUT_DIR}
snarkjs groth16 setup AgeVerifier.r1cs ${PTAU_FILE} AgeVerifier_0000.zkey
snarkjs zkey contribute AgeVerifier_0000.zkey AgeVerifier_0001.zkey --name="1st Contributor" -v -e="more random entropy"

# Step 5: Export the verification key
echo -e "${BLUE}Step 5: Exporting verification key...${NC}"
snarkjs zkey export verificationkey AgeVerifier_0001.zkey verification_key_AgeVerifier.json

# Final check to make sure all required files exist
echo -e "${BLUE}Checking if all required files exist...${NC}"
WASM_FILE="${OUT_DIR}/AgeVerifier_js/AgeVerifier.wasm"
ZKEY_FILE="${OUT_DIR}/AgeVerifier_0001.zkey"
VKEY_FILE="${OUT_DIR}/verification_key_AgeVerifier.json"

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
    echo -e "${RED}Setup failed. Some required files are missing.${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Setup completed successfully! All required files are in place.${NC}"
    echo -e "${GREEN}Generated files:${NC}"
    echo -e "${GREEN}  - ${ZKEY_FILE}${NC}"
    echo -e "${GREEN}  - ${VKEY_FILE}${NC}"
    echo -e "${GREEN}  - ${WASM_FILE}${NC}"
    echo -e "${GREEN}  - Using PTAU file: ${PTAU_FILE}${NC}"
    echo -e "\n${GREEN}You can now run the Age Verifier tests using:${NC}"
    echo -e "${YELLOW}./scripts/run-all-age-verifier-tests.sh${NC}"
fi 
