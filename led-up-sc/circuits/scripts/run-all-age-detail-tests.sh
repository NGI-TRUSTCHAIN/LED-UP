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

echo -e "${BLUE}=== Detailed AgeVerifier Circuit Tests ===${NC}"
echo -e "${BLUE}=== Running in directory: $(pwd) ===${NC}"

# Check if required files exist
echo -e "\n${BLUE}Checking for required files...${NC}"
OUT_DIR="${PROJECT_ROOT}/circuits/out-files/age-verifier"
WASM_FILE="${OUT_DIR}/AgeVerifier_js/AgeVerifier.wasm"
ZKEY_FILE="${OUT_DIR}/AgeVerifier_0001.zkey"
VKEY_FILE="${OUT_DIR}/verification_key_AgeVerifier.json"

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

if [ "$SETUP_SUCCESS" = false ]; then
    echo -e "${RED}Required files are missing. Please run setup-age-verifier.sh first.${NC}"
    exit 1
fi

echo -e "${GREEN}Required files found.${NC}"

# Function to run tests and track results
run_tests() {
    local test_file=$1
    local test_name=$2
    
    echo -e "\n${CYAN}=== Running $test_name Tests ===${NC}"
    
    # Run the test file with environment variable for output directory
    OUT_DIR=$OUT_DIR output=$(node $test_file)
    
    # Print the output
    echo -e "$output"
    
    # Count the number of passes and failures
    local passed_count=$(echo "$output" | grep -c "PASSED ✅")
    local failed_count=$(echo "$output" | grep -c "FAILED ❌")
    local total_count=$((passed_count + failed_count))
    
    echo -e "\n${BLUE}$test_name Summary:${NC}"
    echo -e "Total tests: $total_count"
    echo -e "Passed tests: ${GREEN}$passed_count${NC}"
    echo -e "Failed tests: ${RED}$failed_count${NC}"
    
    # Return status
    if [ $failed_count -eq 0 ] && [ $passed_count -gt 0 ]; then
        return 0
    else
        return 1
    fi
}

# Run all test categories
simple_age_result=0
birth_date_result=0
age_bracket_result=0

run_tests "../__test__/age-verifier/simple-test.js" "Simple Age Verification"
simple_age_result=$?

run_tests "../__test__/age-verifier/birth-date-test.js" "Birth Date Verification"
birth_date_result=$?

run_tests "../__test__/age-verifier/age-bracket-test.js" "Age Bracket Verification"
age_bracket_result=$?

# Print overall summary
echo -e "\n${BLUE}=== Overall Test Summary ===${NC}"
if [ $simple_age_result -eq 0 ]; then
    echo -e "Simple Age Verification: ${GREEN}✅ PASSED${NC}"
else
    echo -e "Simple Age Verification: ${RED}❌ FAILED${NC}"
fi

if [ $birth_date_result -eq 0 ]; then
    echo -e "Birth Date Verification: ${GREEN}✅ PASSED${NC}"
else
    echo -e "Birth Date Verification: ${RED}❌ FAILED${NC}"
fi

if [ $age_bracket_result -eq 0 ]; then
    echo -e "Age Bracket Verification: ${GREEN}✅ PASSED${NC}"
else
    echo -e "Age Bracket Verification: ${RED}❌ FAILED${NC}"
fi

# Calculate overall result
if [ $simple_age_result -eq 0 ] && [ $birth_date_result -eq 0 ] && [ $age_bracket_result -eq 0 ]; then
    echo -e "\n${GREEN}✅ All verification methods tested successfully!${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some verification methods failed. Please check the output above for details.${NC}"
    exit 1
fi

# Cleanup temp files
rm -f simple-age-test.js birth-date-test.js age-bracket-test.js input.json witness.json witness.wtns 
