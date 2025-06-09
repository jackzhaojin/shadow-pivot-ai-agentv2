#!/bin/bash

# Test script for Azure SSR integration
echo "Testing Azure SSR Integration..."

# Check if development server is running
if curl -s http://localhost:3001 > /dev/null; then
    echo "✅ Development server is running on port 3001"
else
    echo "❌ Development server is not accessible"
    exit 1
fi

# Test the main page loads
echo "Testing main page..."
RESPONSE=$(curl -s -w "%{http_code}" http://localhost:3001 -o /dev/null)
if [ "$RESPONSE" = "200" ]; then
    echo "✅ Main page loads successfully (HTTP 200)"
else
    echo "❌ Main page failed to load (HTTP $RESPONSE)"
fi

# Test API routes
echo "Testing API routes..."

# Test storage API
STORAGE_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:3001/api/test-storage -o /dev/null)
if [ "$STORAGE_RESPONSE" = "200" ]; then
    echo "✅ Storage API route accessible (HTTP 200)"
else
    echo "❌ Storage API route failed (HTTP $STORAGE_RESPONSE)"
fi

# Test AI API
AI_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:3001/api/test-ai -H "Content-Type: application/json" -d '{"message":"test"}' -o /dev/null)
if [ "$AI_RESPONSE" = "200" ]; then
    echo "✅ AI API route accessible (HTTP 200)"
else
    echo "❌ AI API route failed (HTTP $AI_RESPONSE)"
fi

echo "Azure SSR Integration test complete!"
