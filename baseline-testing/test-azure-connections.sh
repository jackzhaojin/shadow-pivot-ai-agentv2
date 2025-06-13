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
# Test Azure CLI login status
echo "🔐 Testing Azure CLI authentication..."
if az account show > /dev/null 2>&1; then
    ACCOUNT_NAME=$(az account show --query 'name' -o tsv)
    echo "✅ Azure CLI authenticated as: $ACCOUNT_NAME"
else
    echo "❌ Azure CLI not authenticated - validate az cli credentials"
fi


echo ""
echo "🎉 Azure Connection Testing Complete!"
echo "📱 Interactive tests available at: http://localhost:3000/test-azure"
