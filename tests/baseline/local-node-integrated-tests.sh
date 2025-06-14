#!/bin/bash

echo "🧪 Local Node.js Integrated Tests"
echo "================================="
echo "Tests that only require Node.js and Azure credentials"
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
echo "🚀 Starting Node.js integrated tests..."
echo ""

# Helper to determine if Azure OpenAI endpoint is reachable
check_openai_access() {
    local endpoint="${AZURE_OPENAI_ENDPOINT:-https://story-generation-v1.openai.azure.com/}"
    curl -m 5 -s -o /dev/null "$endpoint" && return 0
    return 1
}

# Test 1: Quick Azure Authentication (using script from subfolder)
run_test "quick-auth" \
    "bash '$SCRIPT_DIR/local-node-tests/quick-auth-test.sh'" \
    "Quick Azure Authentication Test"

# Test 2: Azure Authentication (using script from subfolder)
run_test "azure-auth" \
    "node '$SCRIPT_DIR/local-node-tests/azure-auth-test.js'" \
    "Azure Authentication Test"

# Test 3: DAO Layer Tests
run_test "dao-tests" \
    "cd '$PROJECT_ROOT' && npm run test:dao" \
    "DAO Layer Tests"

# Test 4: Service Layer Tests
run_test "service-tests" \
    "cd '$PROJECT_ROOT' && npm run test:services" \
    "Service Layer Tests"

# Test 5: Endpoint Tests (may skip OpenAI dependent tests)
if [ -n "$CODEX_ENV_NODE_VERSION" ] || ! check_openai_access; then
    echo -e "${YELLOW}⚠️  Skipping endpoint tests due to Codex environment or unreachable Azure OpenAI endpoint${NC}"
    run_test "endpoint-tests" \
        "cd '$PROJECT_ROOT' && CODEX_ENV_NODE_VERSION=1 npm run test:endpoints" \
        "Endpoint Tests (skipped)"
else
    run_test "endpoint-tests" \
        "cd '$PROJECT_ROOT' && npm run test:endpoints" \
        "Endpoint Tests"
fi

# Test 5: UI Component Tests
run_test "ui-tests" \
    "cd '$PROJECT_ROOT' && npm run test:ui" \
    "UI Component Tests"

# Test 7: DefaultAzureCredential Direct Test
run_test "credential-direct" \
    "cd '$PROJECT_ROOT' && node -e \"
const { DefaultAzureCredential } = require('@azure/identity');
const credential = new DefaultAzureCredential();
credential.getToken('https://vault.azure.net/.default')
  .then(() => console.log('✅ DefaultAzureCredential test successful'))
  .catch(err => { console.error('❌ DefaultAzureCredential test failed:', err.message); process.exit(1); });
\"" \
    "DefaultAzureCredential Direct Test"

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
    echo -e "${YELLOW}💡 Make sure you have proper Azure credentials configured:${NC}"
    echo "   - AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID"
    exit 1
else
    echo ""
    echo -e "${GREEN}🎉 All Node.js integrated tests passed successfully!${NC}"
    echo -e "${BLUE}💡 To run tests that require the dev server, use: ./tests/baseline/local-3000-tests.sh${NC}"
fi
