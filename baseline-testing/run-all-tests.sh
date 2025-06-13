#!/bin/bash

echo "🧪 Baseline Testing Suite"
echo "========================="
echo ""

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=()

run_test() {
    local test_name="$1"
    local test_command="$2"
    local test_description="$3"
    
    echo -e "${BLUE}📋 Running: $test_description${NC}"
    echo "Command: $test_command"
    echo ""
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ PASSED: $test_name${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ FAILED: $test_name${NC}"
        FAILED_TESTS+=("$test_name")
    fi
    
    echo ""
    echo "----------------------------------------"
    echo ""
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed or not in PATH${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites met${NC}"
echo "   - Node.js: $(node --version)"
echo "   - Authentication: DefaultAzureCredential (Service Principal or Managed Identity)"
echo ""

# Run the tests
echo "🚀 Starting baseline tests..."
echo ""

# Test 1: Node.js Integrated Tests (no server required)
run_test "node-integrated" \
    "bash '$SCRIPT_DIR/local-node-tests/local-node-integrated-tests.sh'" \
    "Node.js Integrated Tests (No Server Required)"

# Test 2: Port 3000 Tests (requires dev server)
echo "💡 Note: The following tests require the development server to be running."
echo "   If tests fail, start the dev server with 'npm run dev' in another terminal."
echo ""

run_test "port-3000" \
    "bash '$SCRIPT_DIR/local-server-test-3000-integrated/local-3000-tests.sh'" \
    "Port 3000 Tests (Requires Dev Server)"

# Summary
echo ""
echo "📊 Test Summary"
echo "==============="
echo -e "Total tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: ${#FAILED_TESTS[@]}${NC}"

if [ ${#FAILED_TESTS[@]} -gt 0 ]; then
    echo ""
    echo -e "${RED}Failed tests:${NC}"
    for test in "${FAILED_TESTS[@]}"; do
        echo "  - $test"
    done
    echo ""
    echo -e "${RED}❌ Some tests failed. Please check the output above for details.${NC}"
    exit 1
else
    echo ""
    echo -e "${GREEN}🎉 All tests passed successfully!${NC}"
fi
