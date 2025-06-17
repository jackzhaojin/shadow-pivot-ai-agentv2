#!/bin/bash

# Figma Evaluation Test Runner
# This script runs the Figma evaluation endpoint test against a running server

echo "🧪 Figma Evaluation API Test"
echo "=========================="
echo ""

# Check if server is already running
if curl -s http://localhost:3000/api/agent/test-connection > /dev/null 2>&1; then
    echo "✅ Server is running, starting test..."
    npm run test:figma-evaluation
else
    echo "❌ Server is not running on localhost:3000"
    echo ""
    echo "To run this test:"
    echo "1. Start the development server: npm run dev"
    echo "2. In another terminal, run: npm run test:figma-evaluation"
    echo ""
    echo "Or run this script again after starting the server."
    exit 1
fi
