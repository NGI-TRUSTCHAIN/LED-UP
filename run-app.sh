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

# # Function to print usage information
# print_usage() {
#     echo "Usage: $0 <alchemy_api_key>"
#     echo "Example: $0 your_alchemy_api_key"
#     exit 1
# }

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

# Function to open a command in a new terminal window
open_in_terminal() {
    local title=$1
    local cmd=$2
    local working_dir=$3
    
    # Create a script to run in the new terminal
    TMP_SCRIPT=$(mktemp /tmp/led-up-XXXXXX.sh)
    cat > "$TMP_SCRIPT" << EOF
#!/bin/bash
cd "$working_dir" || exit 1
echo -e "\033[1;34m====== $title ======\033[0m"
echo -e "\033[0;33mRunning: $cmd\033[0m"
echo -e "\033[0;33mWorking directory: $(pwd)\033[0m"
echo -e "\033[0;33m==========================================\033[0m"
$cmd
# Keep terminal open after command completes
echo -e "\033[0;31m$title process has exited. Press Enter to close this terminal.\033[0m"
read
EOF
    
    chmod +x "$TMP_SCRIPT"
    
    # List of terminal emulators to try
    terminal_cmds=(
        "x-terminal-emulator -e"
        "gnome-terminal -- bash -c"
        "konsole --new-tab -e"
        "xterm -T '$title' -e"
        "terminator -e"
        "mate-terminal --title='$title' -e"
        "tilix -e"
        "kitty -T '$title'"
    )
    
    # Try each terminal emulator until one works
    for term_cmd in "${terminal_cmds[@]}"; do
        term_bin=$(echo "$term_cmd" | awk '{print $1}')
        if command -v "$term_bin" > /dev/null 2>&1; then
            # Format the command based on terminal requirements
            if [[ "$term_cmd" == *"kitty"* ]]; then
                $term_bin "$TMP_SCRIPT" > /dev/null 2>&1 &
            else
                $term_cmd "'$TMP_SCRIPT'" > /dev/null 2>&1 &
            fi
            
            # If the command succeeded
            if [ $? -eq 0 ]; then
                print_status "$GREEN" "✅ Started $title in new terminal window using $term_bin"
                # Save the PID of the terminal for cleanup
                echo $! >> /tmp/led-up-terminals-$$.pids
                return 0
            fi
        fi
    done
    
    # If all terminal emulators failed, fall back to running in background
    print_status "$YELLOW" "⚠️ Could not open new terminal window. Running $title in the background."
    (cd "$working_dir" && $cmd) &
    echo $! >> /tmp/led-up-bg-$$.pids
    return 0
}

# # Check if API key is provided
# if [ -z "$1" ]; then
#     print_status "$RED" "❌ Error: Alchemy API key is required"
#     print_usage
# fi

# # Validate API key format (basic validation for 32 character string)
# if [[ ! $1 =~ ^[a-zA-Z0-9]{32}$ ]]; then
#     print_status "$RED" "❌ Error: Invalid Alchemy API key format"
#     print_usage
# fi

# ALCHEMY_API_KEY=$1

# Function to check if a process is running on a port
check_port() {
    local port=$1
    if lsof -i :$port > /dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to clear processes using a specific port
clear_port() {
    local port=$1
    local processes=$(lsof -ti:$port 2>/dev/null)
    
    if [ ! -z "$processes" ]; then
        print_status "$YELLOW" "🔄 Port $port is in use. Clearing processes: $processes"
        for pid in $processes; do
            pkill -P $pid 2>/dev/null || true
            kill -9 $pid 2>/dev/null || true
        done
        sleep 2
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

# Function to cleanup terminals and processes on script exit
cleanup() {
    print_status "$YELLOW" "🧹 Cleaning up processes..."
    
    # Kill all terminal windows we opened
    if [ -f "/tmp/led-up-terminals-$$.pids" ]; then
        while read pid; do
            echo "Killing terminal window (PID: $pid)"
            kill -9 $pid 2>/dev/null || true
        done < "/tmp/led-up-terminals-$$.pids"
        rm -f "/tmp/led-up-terminals-$$.pids"
    fi
    
    # Kill all background processes we started
    if [ -f "/tmp/led-up-bg-$$.pids" ]; then
        while read pid; do
            echo "Killing background process (PID: $pid)"
            pkill -P $pid 2>/dev/null || true
            kill -9 $pid 2>/dev/null || true
        done < "/tmp/led-up-bg-$$.pids"
        rm -f "/tmp/led-up-bg-$$.pids"
    fi
    
    # Kill processes by port
    HARDHAT_PROCESSES=$(lsof -ti:8545 2>/dev/null)
    API_PROCESSES=$(lsof -ti:7071 2>/dev/null)
    FRONTEND_PROCESSES=$(lsof -ti:3000 2>/dev/null)
    
    # Kill any remaining processes using these ports
    if [ ! -z "$HARDHAT_PROCESSES" ]; then
        echo "Killing processes on port 8545: $HARDHAT_PROCESSES"
        kill -9 $HARDHAT_PROCESSES 2>/dev/null || true
    fi
    
    if [ ! -z "$API_PROCESSES" ]; then
        echo "Killing processes on port 7071: $API_PROCESSES"
        kill -9 $API_PROCESSES 2>/dev/null || true
    fi
    
    if [ ! -z "$FRONTEND_PROCESSES" ]; then
        echo "Killing processes on port 3000: $FRONTEND_PROCESSES"
        for pid in $FRONTEND_PROCESSES; do
            pkill -P $pid 2>/dev/null || true
            kill -9 $pid 2>/dev/null || true
        done
    fi
    
    # Clean up temporary scripts
    rm -f /tmp/led-up-*.sh 2>/dev/null || true
    
    print_status "$GREEN" "✅ Cleanup completed"
    exit 0  # Ensure we exit after cleanup
}

# Set up cleanup trap for multiple signals
trap cleanup EXIT INT TERM

# Create files to store PIDs
touch /tmp/led-up-terminals-$$.pids
touch /tmp/led-up-bg-$$.pids

# Store the project root directory
PROJECT_ROOT=$(pwd)

# Validate environment variables before starting services
validate_api_env || handle_error "API environment validation failed"
validate_frontend_env || handle_error "Frontend environment validation failed"

# Clean up any existing processes first
clear_port 8545
clear_port 7071
clear_port 3000

# Start Hardhat node
print_status "$BLUE" "🔄 Preparing to start Hardhat node..."
cd led-up-sc || handle_error "Could not find led-up-sc directory"

# Check if node_modules exists, if not run yarn install
if [ ! -d "node_modules" ]; then
    print_status "$YELLOW" "📦 Installing dependencies for smart contracts..."
    yarn install || handle_error "Failed to install dependencies in led-up-sc"
fi

# Start Hardhat node with forking in a new terminal
print_status "$BLUE" "🔗 Starting Hardhat node with mainnet fork in a new terminal..."
# HARDHAT_CMD="npx hardhat node --fork \"https://eth-mainnet.g.alchemy.com/v2/$ALCHEMY_API_KEY\" --network hardhat"
HARDHAT_CMD="npx hardhat node --network hardhat"
open_in_terminal "Hardhat Node" "$HARDHAT_CMD" "$PROJECT_ROOT/led-up-sc"

# Wait for Hardhat node to be ready (default Hardhat port is 8545)
wait_for_service 8545 "Hardhat node" || handle_error "Hardhat node failed to start"

# Deploy smart contracts
print_status "$BLUE" "📄 Deploying smart contracts..."
(cd "$PROJECT_ROOT/led-up-sc" && npx hardhat run scripts/hardhat/deploy.ts --network localhost) || handle_error "Smart contract deployment failed"

# Start API server
cd "$PROJECT_ROOT" || handle_error "Could not return to project root"
cd led-up-api || handle_error "Could not find led-up-api directory"

# Check if node_modules exists, if not run yarn install
if [ ! -d "node_modules" ]; then
    print_status "$YELLOW" "📦 Installing dependencies for API..."
    yarn install || handle_error "Failed to install dependencies in led-up-api"
fi

# Start API server in a new terminal
print_status "$BLUE" "🚀 Starting API server in a new terminal..."
API_CMD="yarn dev"
open_in_terminal "API Server" "$API_CMD" "$PROJECT_ROOT/led-up-api"

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

# Start Next.js in the current terminal (not in a new one)
print_status "$BLUE" "🌟 Starting main application in the current terminal..."
print_status "$YELLOW" "Press Ctrl+C to stop all applications"
print_status "$GREEN" "✨ Running Next.js frontend (PORT=3000)..."

# Run the Next.js app in the foreground
cd "$PROJECT_ROOT/led-up-fe" && PORT=3000 yarn dev --port 3000
