#!/bin/bash

echo "🚀 Redirecting to Node.js-based monitoring..."
echo "=============================================="
echo ""
echo "⚠️  This script has been refactored to use DefaultAzureCredential instead of Azure CLI"
echo "   Running the Node.js version instead..."
echo ""

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Run the Node.js monitoring script
node "$SCRIPT_DIR/tests/baseline/local-node-tests/monitor-deployment.js"
