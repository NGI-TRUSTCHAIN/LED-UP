#!/bin/bash

# Color definitions for better visibility
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color
BLUE='\033[0;34m'

# Function to print colored status messages
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to print usage information
print_usage() {
    echo "Usage: $0 <alchemy_api_key>"
    echo "Example: $0 your_alchemy_api_key"
    exit 1
}

# Function to validate API environment variables
validate_api_env() {
    local settings_file="led-up-api/local.settings.json"
    print_status "$BLUE" "🔍 Checking API environment variables..."
    
    if [ ! -f "$settings_file" ]; then
        handle_error "local.settings.json not found in led-up-api directory"
    fi

    # Required API environment variables
    local required_vars=(
        "OWNER_ADDRESS"
        "PATIENT_ADDRESS"
        "PATIENT_PRIVATE_KEY"
        "OWNER_PRIVATE_KEY"
        "RPC_URL"
        "ALCHEMY_API_KEY"
        "INFURA_API_KEY"
        "ENCRYPTION_KEY"
        "JWT_SECRET"
        "JWT_REFRESH_SECRET"
        "SqlConnectionString"
        "DB_NAME"
        "DB_PORT"
        "DB_SERVER"
        "DB_USERNAME"
        "DB_PASSWORD"
        "KEY_VAULT_URL"
        "TABLE_ACCOUNT_ENDPOINT"
        "TABLE_ACCOUNT_KEY"
        "TABLE_ACCOUNT_NAME"
        "TABLE_CONNECTION_STRING"
        "SYNC_STATE_TABLE"
        "DEFAULT_PARTITION_KEY"
        "SYNC_STATE_ROW_KEY"
        "PINATA_JWT"
        "PINATA_API_KEY"
        "PINATA_API_SECRET"
        "PINATA_API_JWT"
        "IPFS_GATEWAY_URL"
        "DEPLOYMENT_STORAGE_CONNECTION_STRING"
        "DID_REGISTRY_CONTRACT_ADDRESS"
        "DID_ACCESS_CONTROL_CONTRACT_ADDRESS"
        "DID_VERIFIER_CONTRACT_ADDRESS"
        "DID_ISSUER_CONTRACT_ADDRESS"
        "DID_AUTH_CONTRACT_ADDRESS"
        "TOKEN_CONTRACT_ADDRESS"
        "DATA_REGISTRY_CONTRACT_ADDRESS"
        "COMPENSATION_CONTRACT_ADDRESS"
        "CONSENT_MANAGEMENT_CONTRACT_ADDRESS"
    )

    local missing_vars=()
    for var in "${required_vars[@]}"; do
        if ! grep -q "\"$var\":" "$settings_file"; then
            missing_vars+=("$var")
        fi
    done

    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_status "$RED" "❌ Missing required API environment variables:"
        printf '%s\n' "${missing_vars[@]}"
        return 1
    fi

    print_status "$GREEN" "✅ API environment variables validated successfully"
    return 0
}

# Function to validate Frontend environment variables
validate_frontend_env() {
    local env_file="led-up-fe/.env.local"
    print_status "$BLUE" "🔍 Checking Frontend environment variables..."
    
    if [ ! -f "$env_file" ]; then
        handle_error ".env.local not found in led-up-fe directory"
    fi

    # Required Frontend environment variables
    local required_vars=(
        "NEXT_PUBLIC_AZURE_API_URL"
        "NEXT_PUBLIC_API_URL"
        "NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID"
        "NEXT_PUBLIC_SEPOLIA_RPC_URL"
        "NEXT_PUBLIC_PINATA_API_KEY"
        "NEXT_PUBLIC_PINATA_API_SECRET"
        "NEXT_PUBLIC_PINATA_API_JWT"
        "NEXT_PUBLIC_IPFS_GATEWAY_URL"
        "NEXT_PUBLIC_ENCRYPTION_KEY"
        "NEXT_PUBLIC_ALCHEMY_ID"
        "NEXT_PUBLIC_RPC_URL"
        "RPC_URL"
        "CHAIN_ID"
        "NEXT_PUBLIC_CHAIN_ID"
        "NEXT_PUBLIC_DID_REGISTRY_CONTRACT_ADDRESS"
        "DID_REGISTRY_CONTRACT_ADDRESS"
        "NEXT_PUBLIC_DID_ACCESS_CONTROL_CONTRACT_ADDRESS"
        "DID_ACCESS_CONTROL_CONTRACT_ADDRESS"
        "NEXT_PUBLIC_DID_VERIFIER_CONTRACT_ADDRESS"
        "DID_VERIFIER_CONTRACT_ADDRESS"
        "NEXT_PUBLIC_DID_ISSUER_CONTRACT_ADDRESS"
        "DID_ISSUER_CONTRACT_ADDRESS"
        "NEXT_PUBLIC_DID_AUTH_CONTRACT_ADDRESS"
        "DID_AUTH_CONTRACT_ADDRESS"
        "NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS"
        "TOKEN_CONTRACT_ADDRESS"
        "NEXT_PUBLIC_DATA_REGISTRY_CONTRACT_ADDRESS"
        "DATA_REGISTRY_CONTRACT_ADDRESS"
        "NEXT_PUBLIC_COMPENSATION_CONTRACT_ADDRESS"
        "COMPENSATION_CONTRACT_ADDRESS"
        "NEXT_PUBLIC_CONSENT_MANAGEMENT_CONTRACT_ADDRESS"
        "CONSENT_MANAGEMENT_CONTRACT_ADDRESS"
    )

    local missing_vars=()
    for var in "${required_vars[@]}"; do
        if ! grep -q "^$var=" "$env_file"; then
            missing_vars+=("$var")
        fi
    done

    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_status "$RED" "❌ Missing required Frontend environment variables:"
        printf '%s\n' "${missing_vars[@]}"
        return 1
    fi

    # Validate specific variable formats
    local rpc_url=$(grep "^NEXT_PUBLIC_RPC_URL=" "$env_file" | cut -d '=' -f2)
    if [[ ! $rpc_url =~ ^\"?http[s]?://[^[:space:]]+\"?$ ]]; then
        print_status "$RED" "❌ Invalid RPC_URL format"
        return 1
    fi

    print_status "$GREEN" "✅ Frontend environment variables validated successfully"
    return 0
}

# Check if API key is provided
if [ -z "$1" ]; then
    print_status "$RED" "❌ Error: Alchemy API key is required"
    print_usage
fi

# Validate API key format (basic validation for 32 character string)
if [[ ! $1 =~ ^[a-zA-Z0-9]{32}$ ]]; then
    print_status "$RED" "❌ Error: Invalid Alchemy API key format"
    print_usage
fi

ALCHEMY_API_KEY=$1

# Function to check if a process is running on a port
check_port() {
    local port=$1
    if lsof -i :$port > /dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to wait for a service to be ready
wait_for_service() {
    local port=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1

    while ! check_port $port; do
        if [ $attempt -gt $max_attempts ]; then
            print_status "$RED" "❌ Timeout waiting for $service_name to start on port $port"
            return 1
        fi
        print_status "$YELLOW" "⏳ Waiting for $service_name to start (attempt $attempt/$max_attempts)..."
        sleep 2
        ((attempt++))
    done
    print_status "$GREEN" "✅ $service_name is running on port $port"
    return 0
}

# Function to handle errors
handle_error() {
    print_status "$RED" "❌ Error: $1"
    exit 1
}

# Function to cleanup background processes on script exit
cleanup() {
    print_status "$YELLOW" "🧹 Cleaning up processes..."
    jobs -p | xargs -r kill -9
    exit 0
}

# Set up cleanup trap
trap cleanup EXIT INT TERM

# Store the project root directory
PROJECT_ROOT=$(pwd)

# Validate environment variables before starting services
validate_api_env || handle_error "API environment validation failed"
validate_frontend_env || handle_error "Frontend environment validation failed"

# Start Hardhat node
print_status "$BLUE" "🔄 Starting Hardhat node..."
cd led-up-sc || handle_error "Could not find led-up-sc directory"

# Check if node_modules exists, if not run yarn install
if [ ! -d "node_modules" ]; then
    print_status "$YELLOW" "📦 Installing dependencies for smart contracts..."
    yarn install || handle_error "Failed to install dependencies in led-up-sc"
fi

# Start Hardhat node with forking
print_status "$BLUE" "🔗 Starting Hardhat node with mainnet fork..."
npx hardhat node --fork "https://eth-mainnet.g.alchemy.com/v2/$ALCHEMY_API_KEY" &
HARDHAT_PID=$!

# Wait for Hardhat node to be ready (default Hardhat port is 8545)
wait_for_service 8545 "Hardhat node" || handle_error "Hardhat node failed to start"

# Deploy smart contracts
print_status "$BLUE" "📄 Deploying smart contracts..."
npx hardhat run scripts/hardhat/deploy.ts --network localhost || handle_error "Smart contract deployment failed"

# Start API server
cd "$PROJECT_ROOT" || handle_error "Could not return to project root"
cd led-up-api || handle_error "Could not find led-up-api directory"

# Check if node_modules exists, if not run yarn install
if [ ! -d "node_modules" ]; then
    print_status "$YELLOW" "📦 Installing dependencies for API..."
    yarn install || handle_error "Failed to install dependencies in led-up-api"
fi

print_status "$BLUE" "🚀 Starting API server..."
yarn dev &
API_PID=$!

# Wait for API server to be ready
wait_for_service 7071 "API server" || handle_error "API server failed to start"

# Start main application
cd "$PROJECT_ROOT" || handle_error "Could not return to project root"
cd led-up-fe || handle_error "Could not find led-up-fe directory"

# Check if node_modules exists, if not run yarn install
if [ ! -d "node_modules" ]; then
    print_status "$YELLOW" "📦 Installing dependencies for main application..."
    yarn install || handle_error "Failed to install dependencies in main application"
fi

print_status "$BLUE" "🌟 Starting main application..."
yarn dev &
MAIN_APP_PID=$!

# Wait for main application to be ready (assuming it runs on port 3000, adjust if different)
wait_for_service 3000 "Main application" || handle_error "Main application failed to start"

print_status "$GREEN" "✨ All applications are running!"
print_status "$YELLOW" "Press Ctrl+C to stop all applications"

# Wait for user interrupt
wait
