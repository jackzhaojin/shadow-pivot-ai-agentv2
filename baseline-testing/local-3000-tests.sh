#!/bin/bash

echo "🌐 Local Port 3000 Tests"
echo "========================"
echo "Tests that require the development server running on localhost:3000"
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

# Check if curl is available
if ! command -v curl &> /dev/null; then
    echo -e "${RED}❌ curl is not installed or not in PATH${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites met${NC}"
echo "   - Node.js: $(node --version)"
echo "   - curl: Available"
echo ""

# Check if development server is running
echo "📡 Checking development server..."
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Development server is running on localhost:3000${NC}"
else
    echo -e "${RED}❌ Development server is not accessible on localhost:3000${NC}"
    echo ""
    echo -e "${YELLOW}💡 To start the development server, run:${NC}"
    echo "   npm run dev"
    echo ""
    echo -e "${YELLOW}⏳ Then run this test script again.${NC}"
    exit 1
fi

echo ""

# Run the tests
echo "🚀 Starting port 3000 tests..."
echo ""

# Test 1: Main Page Load
run_test "main-page" \
    "curl -s -w '%{http_code}' http://localhost:3000 -o /dev/null | grep -q '200'" \
    "Main Page Load Test"

# Test 2: Azure Storage API
run_test "storage-api" \
    "curl -s http://localhost:3000/api/test-storage | grep -q '\"success\":true'" \
    "Azure Storage API Test"

# Skip AI-specific API tests in Codex or if Azure OpenAI endpoint unreachable
if [ -n "$CODEX_ENV_NODE_VERSION" ] || ! curl -m 5 -s https://story-generation-v1.openai.azure.com/ > /dev/null; then
    echo -e "${YELLOW}⚠️  Skipping ai-api and agent-test-connection tests due to Codex environment or unreachable Azure OpenAI endpoint${NC}"
else
    # Test 3: Azure AI API
    run_test "ai-api" \
        "curl -s http://localhost:3000/api/test-ai | grep -q '\"success\":true'" \
        "Azure AI API Test"

    # Test 4: Agent Test Connection API
    run_test "agent-test-connection" \
        "curl -s http://localhost:3000/api/agent/test-connection | grep -q '\"success\":true'" \
        "Agent Test Connection API"
fi

# Test 5: Chat Page Load
run_test "chat-page" \
    "curl -s -w '%{http_code}' http://localhost:3000/chat -o /dev/null | grep -q '200'" \
    "Chat Page Load Test"

# Test 6: Dashboard Page Load
run_test "dashboard-page" \
    "curl -s -w '%{http_code}' http://localhost:3000/dashboard -o /dev/null | grep -q '200'" \
    "Dashboard Page Load Test"

# Test 7: Test Azure Page Load
run_test "test-azure-page" \
    "curl -s -w '%{http_code}' http://localhost:3000/test-azure -o /dev/null | grep -q '200'" \
    "Test Azure Page Load Test"

# Test 8: Agent Page Load
run_test "agent-page" \
    "curl -s -w '%{http_code}' http://localhost:3000/agent -o /dev/null | grep -q '200'" \
    "Agent Page Load Test"

# Test 9: Azure Connections Test (using script from subfolder)
run_test "azure-connections" \
    "bash '$SCRIPT_DIR/local-server-test-3000-integrated/test-azure-connections.sh'" \
    "Azure API Connections Integration Test"

# Test 10: SSR Integration Test (using script from subfolder)
run_test "ssr-integration" \
    "bash '$SCRIPT_DIR/local-server-test-3000-integrated/test-ssr-integration.sh'" \
    "Server-Side Rendering Integration Test"

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
    echo -e "${YELLOW}💡 Make sure:${NC}"
    echo "   - Development server is running: npm run dev"
    echo "   - Azure credentials are properly configured"
    echo "   - All API routes are functional"
    exit 1
else
    echo ""
    echo -e "${GREEN}🎉 All port 3000 tests passed successfully!${NC}"
    echo -e "${BLUE}💡 Interactive tests also available at: http://localhost:3000/test-azure${NC}"
fi
