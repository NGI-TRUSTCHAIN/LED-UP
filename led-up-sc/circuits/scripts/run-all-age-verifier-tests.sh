#!/bin/bash

# Set colors for better output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Change to the project root directory
cd "$(dirname "$0")/../.."
PROJECT_ROOT=$(pwd)

echo -e "${BLUE}=== AgeVerifier Circuit Comprehensive Test Suite ====${NC}"
echo -e "${BLUE}=== Running in directory: $(pwd) ===${NC}"

# Variable to track overall test status
OVERALL_STATUS=0

# Check if required files exist
echo -e "\n${BLUE}Checking for required files...${NC}"
OUT_DIR="${PROJECT_ROOT}/circuits/out-files/age-verifier"
WASM_FILE="${OUT_DIR}/AgeVerifier_js/AgeVerifier.wasm"
ZKEY_FILE="${OUT_DIR}/AgeVerifier_0001.zkey"
VKEY_FILE="${OUT_DIR}/verification_key_AgeVerifier.json"
WITNESS_GEN="${OUT_DIR}/AgeVerifier_js/generate_witness.js"

# Initialize success flag
SETUP_SUCCESS=true

if [ ! -f "$WASM_FILE" ]; then
    echo -e "${RED}Error: Circuit WASM file not found at ${WASM_FILE}${NC}"
    echo -e "${YELLOW}Have you run the setup script? Try running:${NC}"
    echo -e "${YELLOW}./scripts/setup-age-verifier.sh${NC}"
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

if [ ! -f "$WITNESS_GEN" ]; then
    echo -e "${RED}Missing witness generator: ${WITNESS_GEN}${NC}"
    SETUP_SUCCESS=false
else
    echo -e "${GREEN}✅ Witness generator exists.${NC}"
fi

if [ "$SETUP_SUCCESS" = false ]; then
    echo -e "${RED}Required files are missing. Please run setup-age-verifier.sh first.${NC}"
    exit 1
fi

# Record start time
START_TIME=$(date +%s)

# PART 1: Run original JavaScript test (simple-test.js)
echo -e "\n${PURPLE}=== PART 1: Running Original JavaScript Test (simple-test.js) ===${NC}"

if [ ! -f "${PROJECT_ROOT}/circuits/__test__/age-verifier/simple-test.js" ]; then
    echo -e "${YELLOW}Warning: simple-test.js not found at ${PROJECT_ROOT}/circuits/__test__/age-verifier/simple-test.js. Skipping original JavaScript test.${NC}"
    JS_TEST_STATUS=0
else
    echo -e "${BLUE}Running simple-test.js...${NC}"
    
    # Pass the output directory to the test
    OUT_DIR=$OUT_DIR node circuits/__test__/age-verifier/simple-test.js
    JS_TEST_STATUS=$?
    
    if [ $JS_TEST_STATUS -ne 0 ]; then
        echo -e "${RED}❌ Original JavaScript test failed.${NC}"
        OVERALL_STATUS=1
    else
        echo -e "${GREEN}✅ Original JavaScript test passed!${NC}"
    fi
fi

# PART 2: Run TypeScript simple test
echo -e "\n${PURPLE}=== PART 2: Running TypeScript Simple Test ===${NC}"

# Check if TypeScript test files exist
TS_SIMPLE_TEST="${PROJECT_ROOT}/circuits/__test__/age-verifier/AgeVerifierSimpleTest.ts"

if [ ! -f "$TS_SIMPLE_TEST" ]; then
    echo -e "${YELLOW}Warning: TypeScript simple test not found at ${TS_SIMPLE_TEST}. Skipping.${NC}"
    TS_SIMPLE_STATUS=0
else
    echo -e "${BLUE}Running TypeScript simple test...${NC}"
    
    # Ensure we're in the test directory
    cd "${PROJECT_ROOT}/circuits/__test__"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing dependencies...${NC}"
        yarn install
    fi
    
    # Run the test with output directory
    echo -e "${BLUE}Executing TypeScript simple test...${NC}"
    OUT_DIR=$OUT_DIR npx ts-node age-verifier/AgeVerifierSimpleTest.ts
    TS_SIMPLE_STATUS=$?
    
    if [ $TS_SIMPLE_STATUS -ne 0 ]; then
        echo -e "${RED}❌ TypeScript simple test failed.${NC}"
        OVERALL_STATUS=1
    else
        echo -e "${GREEN}✅ TypeScript simple test passed!${NC}"
    fi
    
    # Go back to project root
    cd "${PROJECT_ROOT}"
fi

# PART 3: Run TypeScript detailed test
echo -e "\n${PURPLE}=== PART 3: Running TypeScript Detailed Test ===${NC}"

# Check if TypeScript detailed test file exists
TS_DETAILED_TEST="${PROJECT_ROOT}/circuits/__test__/age-verifier/AgeVerifierDetailedTest.ts"

if [ ! -f "$TS_DETAILED_TEST" ]; then
    echo -e "${YELLOW}Warning: TypeScript detailed test not found at ${TS_DETAILED_TEST}. Skipping.${NC}"
    TS_DETAILED_STATUS=0
else
    echo -e "${BLUE}Running TypeScript detailed test...${NC}"
    
    # Ensure we're in the test directory
    cd "${PROJECT_ROOT}/circuits/__test__"
    
    # Run the test with output directory
    echo -e "${BLUE}Executing TypeScript detailed test...${NC}"
    OUT_DIR=$OUT_DIR npx ts-node age-verifier/AgeVerifierDetailedTest.ts
    TS_DETAILED_STATUS=$?
    
    if [ $TS_DETAILED_STATUS -ne 0 ]; then
        echo -e "${RED}❌ TypeScript detailed test failed.${NC}"
        OVERALL_STATUS=1
    else
        echo -e "${GREEN}✅ TypeScript detailed test passed!${NC}"
    fi
    
    # Go back to project root
    cd "${PROJECT_ROOT}"
fi

# PART 4: Run Mocha TypeScript tests
echo -e "\n${PURPLE}=== PART 4: Running Mocha TypeScript Tests ===${NC}"

# Check if Mocha test file exists
MOCHA_TEST="${PROJECT_ROOT}/circuits/__test__/age-verifier/AgeVerifierMochaTest.ts"

if [ ! -f "$MOCHA_TEST" ]; then
    echo -e "${YELLOW}Warning: Mocha test not found at ${MOCHA_TEST}. Skipping.${NC}"
    MOCHA_STATUS=0
else
    echo -e "${BLUE}Running Mocha tests...${NC}"
    
    # Ensure we're in the test directory
    cd "${PROJECT_ROOT}/circuits/__test__"
    
    # Run the test with output directory
    echo -e "${BLUE}Executing Mocha tests...${NC}"
    OUT_DIR=$OUT_DIR npx mocha --require ts-node/register 'age-verifier/AgeVerifierMochaTest.ts' --timeout 30000
    MOCHA_STATUS=$?
    
    if [ $MOCHA_STATUS -ne 0 ]; then
        echo -e "${RED}❌ Mocha tests failed.${NC}"
        OVERALL_STATUS=1
    else
        echo -e "${GREEN}✅ Mocha tests passed!${NC}"
    fi
    
    # Go back to project root
    cd "${PROJECT_ROOT}"
fi

# Calculate end time and duration
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

# Clean up any witness files created during tests
rm -f ${OUT_DIR}/witness.wtns ${OUT_DIR}/witness.json ${OUT_DIR}/input.json

# Print final summary
echo -e "\n${BLUE}====== FINAL TEST SUMMARY ======${NC}"
echo -e "Test execution time: ${MINUTES} minutes ${SECONDS} seconds"

# Print status of each part
echo -e "\nTest Results:"
if [ -z "$JS_TEST_STATUS" ] || [ $JS_TEST_STATUS -eq 0 ]; then
    echo -e "1. Original JavaScript Test: ${GREEN}PASSED${NC}"
else
    echo -e "1. Original JavaScript Test: ${RED}FAILED${NC}"
fi

if [ -z "$TS_SIMPLE_STATUS" ] || [ $TS_SIMPLE_STATUS -eq 0 ]; then
    echo -e "2. TypeScript Simple Test: ${GREEN}PASSED${NC}"
else
    echo -e "2. TypeScript Simple Test: ${RED}FAILED${NC}"
fi

if [ -z "$TS_DETAILED_STATUS" ] || [ $TS_DETAILED_STATUS -eq 0 ]; then
    echo -e "3. TypeScript Detailed Test: ${GREEN}PASSED${NC}"
else
    echo -e "3. TypeScript Detailed Test: ${RED}FAILED${NC}"
fi

if [ -z "$MOCHA_STATUS" ] || [ $MOCHA_STATUS -eq 0 ]; then
    echo -e "4. Mocha TypeScript Tests: ${GREEN}PASSED${NC}"
else
    echo -e "4. Mocha TypeScript Tests: ${RED}FAILED${NC}"
fi

# Final overall status
echo -e "\nOverall Status:"
if [ $OVERALL_STATUS -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED SUCCESSFULLY! ✅${NC}"
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED. Please check the output above for details. ❌${NC}"
    exit 1
fi 
