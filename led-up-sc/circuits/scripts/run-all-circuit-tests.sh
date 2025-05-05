#!/bin/bash

# Set colors for better output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Don't exit on error, we want to run all tests
set +e

# Change to the project root directory
cd "$(dirname "$0")/../.."
PROJECT_ROOT=$(pwd)

echo -e "${BLUE}=== ZKP Circuit Tests ===${NC}"
echo -e "${BLUE}=== Running in directory: $(pwd) ===${NC}"

# Check if required files exist
echo -e "\n${BLUE}Checking for required files...${NC}"
WASM_DIR="${PROJECT_ROOT}/out-files"

if [ ! -d "$WASM_DIR" ]; then
    echo -e "${RED}Error: Circuit output directory not found at ${WASM_DIR}${NC}"
    echo -e "${YELLOW}Have you compiled the circuits? Try running:${NC}"
    echo -e "${YELLOW}cd ${PROJECT_ROOT} && ./scripts/setup-circom.sh${NC}"
    exit 1
fi

echo -e "${GREEN}Required files found.${NC}"

# Install dependencies if needed
if [ "$1" == "--install" ] || [ "$1" == "-i" ]; then
    echo -e "\n${BLUE}Installing dependencies...${NC}"
    yarn install
fi

# Initialize variables to track test results
age_verifier_test_result=0
age_verifier_test1_result=0
age_verifier_mocha_result=0
hash_verifier_result=0

# Run AgeVerifier tests
echo -e "\n${BLUE}=== Running AgeVerifier Tests ===${NC}"
echo -e "\n${BLUE}=== Test 1: AgeVerifierTest.ts ===${NC}"
npx ts-node --transpile-only __test__/age-verifier/AgeVerifierTest.ts
age_verifier_test_result=$?

echo -e "\n${BLUE}=== Test 2: AgeVerifierTest1.ts ===${NC}"
npx ts-node --transpile-only __test__/age-verifier/AgeVerifierTest1.ts
age_verifier_test1_result=$?

echo -e "\n${BLUE}=== Test 3: AgeVerifier.test.ts (Mocha) ===${NC}"
npx mocha -r ts-node/register __test__/age-verifier/AgeVerifier.test.ts
age_verifier_mocha_result=$?

# Run HashVerifier test
echo -e "\n${BLUE}=== Running HashVerifier Tests ===${NC}"
npx ts-node --transpile-only __test__/hash-verifier/HashVerifierTest.ts
hash_verifier_result=$

# Print summary
echo -e "\n${BLUE}=== Test Summary ===${NC}"
if [ $age_verifier_test_result -eq 0 ]; then
    echo -e "AgeVerifierTest Tests: ${GREEN}✅ PASSED${NC}"
else
    echo -e "AgeVerifierTest Tests: ${RED}❌ FAILED${NC}"
fi

if [ $age_verifier_test1_result -eq 0 ]; then
    echo -e "AgeVerifierTest1 Tests: ${GREEN}✅ PASSED${NC}"
else
    echo -e "AgeVerifierTest1 Tests: ${RED}❌ FAILED${NC}"
fi

if [ $age_verifier_mocha_result -eq 0 ]; then
    echo -e "AgeVerifier.test (Mocha) Tests: ${GREEN}✅ PASSED${NC}"
else
    echo -e "AgeVerifier.test (Mocha) Tests: ${RED}❌ FAILED${NC}"
fi

if [ $hash_verifier_result -eq 0 ]; then
    echo -e "HashVerifier Tests: ${GREEN}✅ PASSED${NC}"
else
    echo -e "HashVerifier Tests: ${RED}❌ FAILED${NC}"
fi


# Calculate overall result
if [ $age_verifier_test_result -eq 0 ] && [ $age_verifier_test1_result -eq 0 ] && [ $age_verifier_mocha_result -eq 0 ] && [ $hash_verifier_result -eq 0 ]; then
    echo -e "\n${GREEN}✅ All tests passed successfully!${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed. Please check the output above for details.${NC}"
    exit 1
fi

