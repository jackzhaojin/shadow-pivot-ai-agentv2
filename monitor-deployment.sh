#!/bin/bash

echo "🚀 Monitoring End-to-End Deployment Testing"
echo "=============================================="

# Check if we're logged into Azure
if ! az account show &>/dev/null; then
    echo "❌ Not logged into Azure. Please run 'az login' first."
    exit 1
fi

echo "📋 Current Azure App Service Status:"
az webapp show --name shadow-pivot-ai-agentv2 --resource-group ShadowPivot --query "{name:name,state:state,defaultHostName:defaultHostName,lastModified:lastModifiedTimeUtc}" --output table

echo ""
echo "🐳 Current Container Configuration:"
az webapp config container show --name shadow-pivot-ai-agentv2 --resource-group ShadowPivot --query "[?name=='DOCKER_CUSTOM_IMAGE_NAME'].value" --output tsv

echo ""
echo "📊 Deployment Status:"
echo "App URL: https://shadow-pivot-ai-agentv2-fpfzhqgyeqdpdwce.eastus2-01.azurewebsites.net"
echo "GitHub Actions: https://github.com/jackzhaojin/shadow-pivot-ai-agentv2/actions"

echo ""
echo "🔍 Testing App Accessibility..."
if curl -s -o /dev/null -w "%{http_code}" https://shadow-pivot-ai-agentv2-fpfzhqgyeqdpdwce.eastus2-01.azurewebsites.net | grep -q "200"; then
    echo "✅ App is accessible (HTTP 200)"
else
    echo "⚠️  App may not be accessible or still starting up"
fi

echo ""
echo "📝 Recent App Service Logs (last 10 lines):"
az webapp log tail --name shadow-pivot-ai-agentv2 --resource-group ShadowPivot --provider application --timeout 5 2>/dev/null || echo "⚠️  Logs not available or timeout"
