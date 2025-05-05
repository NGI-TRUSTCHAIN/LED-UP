#!/bin/bash

# Set colors for better output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Change to the project root directory
cd "$(dirname "$0")/../.."
PROJECT_ROOT=$(pwd)

echo -e "${BLUE}=== HashVerifier Circuit Tests ===${NC}"
echo -e "${BLUE}=== Running in directory: $(pwd) ===${NC}"

# Check if required files exist
echo -e "\n${BLUE}Checking for required files...${NC}"
OUT_DIR="${PROJECT_ROOT}/circuits/out-files/hash-verifier"
WASM_FILE="${OUT_DIR}/HashVerifier_js/HashVerifier.wasm"
ZKEY_FILE="${OUT_DIR}/HashVerifier_0001.zkey"
VKEY_FILE="${OUT_DIR}/verification_key_HashVerifier.json"
PTAU_FILE="${PROJECT_ROOT}/circuits/ptau/pot12_final.ptau"

if [ ! -f "$WASM_FILE" ]; then
    echo -e "${RED}Error: Circuit WASM file not found at ${WASM_FILE}${NC}"
    echo -e "${YELLOW}Have you run the setup script? Try running:${NC}"
    echo -e "${YELLOW}./scripts/setup-hash-verifier.sh${NC}"
    exit 1
fi

if [ ! -f "$ZKEY_FILE" ]; then
    echo -e "${RED}Error: zkey file not found at ${ZKEY_FILE}${NC}"
    echo -e "${YELLOW}Have you run the setup script? Try running:${NC}"
    echo -e "${YELLOW}./scripts/setup-hash-verifier.sh${NC}"
    exit 1
fi

if [ ! -f "$VKEY_FILE" ]; then
    echo -e "${RED}Error: Verification key file not found at ${VKEY_FILE}${NC}"
    echo -e "${YELLOW}Have you run the setup script? Try running:${NC}"
    echo -e "${YELLOW}./scripts/setup-hash-verifier.sh${NC}"
    exit 1
fi

if [ ! -f "$PTAU_FILE" ]; then
    echo -e "${RED}Error: Powers of Tau file not found at ${PTAU_FILE}${NC}"
    echo -e "${YELLOW}Have you run the setup script? Try running:${NC}"
    echo -e "${YELLOW}./scripts/setup-hash-verifier.sh${NC}"
    exit 1
fi

echo -e "${GREEN}Required files found.${NC}"

# Function to run TypeScript tests and track results
run_test() {
    local test_file=$1
    local test_name=$2
    
    echo -e "\n${CYAN}=== Running $test_name Tests ===${NC}"
    
    # Ensure we're in the test directory
    cd "${PROJECT_ROOT}/circuits/__test__"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing dependencies...${NC}"
        yarn install || npm install
    fi
    
    # Run the test with output directory
    echo -e "${BLUE}Executing $test_name test...${NC}"
    OUT_DIR=$OUT_DIR npx ts-node $test_file
    TEST_STATUS=$?
    
    # Go back to project root
    cd "${PROJECT_ROOT}"
    
    # Return status
    if [ $TEST_STATUS -eq 0 ]; then
        echo -e "${GREEN}✅ $test_name tests passed!${NC}"
        return 0
    else
        echo -e "${RED}❌ $test_name tests failed.${NC}"
        return 1
    fi
}

# Record start time
START_TIME=$(date +%s)

# Run HashVerifier tests
HASH_VERIFIER_STATUS=0
run_test "hash-verifier/HashVerifierTest.ts" "HashVerifier"
HASH_VERIFIER_STATUS=$?

# Run other test files if they exist
if [ -f "${PROJECT_ROOT}/circuits/__test__/hash-verifier/HashVerifierTest1.ts" ]; then
    run_test "hash-verifier/HashVerifierTest1.ts" "HashVerifier Additional"
    if [ $? -ne 0 ]; then
        HASH_VERIFIER_STATUS=1
    fi
fi

# Calculate end time and duration
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

# Clean up any witness files
rm -f ${OUT_DIR}/*.wtns ${OUT_DIR}/*.json

# Print final summary
echo -e "\n${BLUE}====== FINAL TEST SUMMARY ======${NC}"
echo -e "Test execution time: ${MINUTES} minutes ${SECONDS} seconds"

# Final overall status
echo -e "\nOverall Status:"
if [ $HASH_VERIFIER_STATUS -eq 0 ]; then
    echo -e "${GREEN}✅ ALL HASH VERIFIER TESTS PASSED SUCCESSFULLY! ✅${NC}"
    echo -e "${GREEN}The HashVerifier circuit correctly handles all cases:${NC}"
    echo -e "${GREEN}1. Success - valid inputs and hash match${NC}"
    echo -e "${GREEN}2. Invalid input - has zero in data${NC}"
    echo -e "${GREEN}3. Hash mismatch - valid inputs but hash doesn't match${NC}"
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED. Please check the output above for details. ❌${NC}"
    exit 1
fi 
