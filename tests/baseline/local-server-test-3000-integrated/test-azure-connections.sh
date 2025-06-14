#!/bin/bash

echo "🧪 Azure Connection Verification Script"
echo "========================================"

# Test if dev server is running
echo "📡 Testing development server..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Development server is running on localhost:3000"
else
    echo "❌ Development server is not accessible"
    exit 1
fi

# Test Azure Storage API
echo "📦 Testing Azure Storage connection..."
STORAGE_RESULT=$(curl -s http://localhost:3000/api/test-storage)
if echo "$STORAGE_RESULT" | grep -q '"success":true'; then
    echo "✅ Azure Storage connection successful"
else
    echo "❌ Azure Storage connection failed"
    echo "Response: $STORAGE_RESULT"
fi

# Test Azure AI API
echo "🤖 Testing Azure AI Foundry connection..."
AI_RESULT=$(curl -s http://localhost:3000/api/test-ai)
if echo "$AI_RESULT" | grep -q '"success":true'; then
    echo "✅ Azure AI Foundry connection successful"
else
    echo "❌ Azure AI Foundry connection failed"
    echo "Response: $AI_RESULT"
fi
# Test DefaultAzureCredential status via Node.js
echo "🔐 Testing DefaultAzureCredential authentication..."
TEST_AUTH_RESULT=$(cd "$(dirname "$0")/../.." && node -e "
const { DefaultAzureCredential } = require('@azure/identity');
const credential = new DefaultAzureCredential();
credential.getToken('https://vault.azure.net/.default')
  .then(() => console.log('SUCCESS'))
  .catch(err => console.log('ERROR:', err.message));
" 2>&1)

if echo "$TEST_AUTH_RESULT" | grep -q "SUCCESS"; then
    echo "✅ DefaultAzureCredential authentication successful"
else
    echo "❌ DefaultAzureCredential authentication failed"
    echo "Details: $TEST_AUTH_RESULT"
fi


echo ""
echo "🎉 Azure Connection Testing Complete!"
echo "📱 Interactive tests available at: http://localhost:3000/test-azure"
