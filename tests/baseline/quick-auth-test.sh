#!/bin/bash

echo "🔐 Quick Azure Authentication Test"
echo "=================================="
echo ""

# Get the directory of this script and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

# Check prerequisites
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    exit 1
fi

echo "✅ Prerequisites met"
echo "   - Node.js: $(node --version)"
echo "   - Authentication: DefaultAzureCredential (Service Principal or Managed Identity)"
echo ""

# Run the authentication test
echo "🚀 Running Azure authentication test..."
echo ""

cd "$PROJECT_ROOT" && node tests/baseline/local-node-tests/azure-auth-test.js

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Authentication test completed successfully!"
    echo "💡 To run all tests including API tests, use: ./tests/baseline/run-all-tests.sh"
else
    echo ""
    echo "❌ Authentication test failed"
    exit 1
fi
