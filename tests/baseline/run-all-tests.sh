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
TOTAL_SUITES=0
PASSED_SUITES=0
FAILED_SUITES=()

run_test_suite() {
    local suite_name="$1"
    local suite_script="$2"
    local suite_description="$3"
    
    echo -e "${BLUE}🏃 Running Test Suite: $suite_description${NC}"
    echo "Script: $suite_script"
    echo ""
    
    TOTAL_SUITES=$((TOTAL_SUITES + 1))
    
    if bash "$suite_script"; then
        echo -e "${GREEN}✅ SUITE PASSED: $suite_name${NC}"
        PASSED_SUITES=$((PASSED_SUITES + 1))
    else
        echo -e "${RED}❌ SUITE FAILED: $suite_name${NC}"
        FAILED_SUITES+=("$suite_name")
    fi
    
    echo ""
    echo "========================================"
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

# Run the test suites
echo "🚀 Starting baseline test suites..."
echo ""

# Run Node.js integrated tests (no server required)
run_test_suite "node-integrated" \
    "$SCRIPT_DIR/local-node-integrated-tests.sh" \
    "Node.js Integrated Tests (No Server Required)"

# Run server-dependent tests (requires dev server)
run_test_suite "server-3000" \
    "$SCRIPT_DIR/local-3000-tests.sh" \
    "Port 3000 Server Tests (Requires Dev Server)"

# Summary
echo ""
echo "📊 Test Suite Summary"
echo "===================="
echo -e "Total test suites: $TOTAL_SUITES"
echo -e "${GREEN}Passed suites: $PASSED_SUITES${NC}"
echo -e "${RED}Failed suites: ${#FAILED_SUITES[@]}${NC}"

if [ ${#FAILED_SUITES[@]} -gt 0 ]; then
    echo ""
    echo -e "${RED}Failed test suites:${NC}"
    for suite in "${FAILED_SUITES[@]}"; do
        echo "  - $suite"
    done
    echo ""
    echo -e "${RED}❌ Some test suites failed. Please check the output above for details.${NC}"
    echo -e "${YELLOW}💡 You can run individual test suites:${NC}"
    echo "   - Node.js tests: ./tests/baseline/local-node-integrated-tests.sh"
    echo "   - Server tests: ./tests/baseline/local-3000-tests.sh"
    exit 1
else
    echo ""
    echo -e "${GREEN}🎉 All test suites passed successfully!${NC}"
    echo -e "${BLUE}💡 Individual test suites available:${NC}"
    echo "   - Node.js tests: ./tests/baseline/local-node-integrated-tests.sh"
    echo "   - Server tests: ./tests/baseline/local-3000-tests.sh"
fi
