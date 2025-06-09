#!/bin/bash

echo "🔐 Quick Azure Authentication Test"
echo "=================================="
echo ""

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Check prerequisites
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    exit 1
fi

if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed or not in PATH"
    exit 1
fi

if ! az account show &> /dev/null; then
    echo "⚠️  Azure CLI not authenticated. Please run 'az login' first."
    exit 1
fi

echo "✅ Prerequisites met"
echo "   - Node.js: $(node --version)"
echo "   - Azure CLI authenticated"
echo ""

# Run the authentication test
echo "🚀 Running Azure authentication test..."
echo ""

cd "$PROJECT_ROOT" && node baseline-testing/azure-auth-test.js

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Authentication test completed successfully!"
    echo "💡 To run all tests including API tests, use: ./baseline-testing/run-all-tests.sh"
else
    echo ""
    echo "❌ Authentication test failed"
    exit 1
fi
