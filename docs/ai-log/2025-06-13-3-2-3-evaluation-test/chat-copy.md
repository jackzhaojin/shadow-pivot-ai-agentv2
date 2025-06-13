Baseline test for 3.2.3 design evaluation step.

Ran `baseline-testing/test-azure-connections.sh` while the dev server was running.
Output:

```
🧪 Azure Connection Verification Script
========================================
📡 Testing development server...
✅ Development server is running on localhost:3000
📦 Testing Azure Storage connection...
✅ Azure Storage connection successful
🤖 Testing Azure AI Foundry connection...
❌ Azure AI Foundry connection failed
Response: {"success":false,"error":"Connection error.","errorType":"Error","details":{"endpoint":"https://story-generation-v1.openai.azure.com/","deployment":"gpt-4o-mini-deployment","authMethod":"DefaultAzureCredential"}}
🔐 Testing Azure CLI authentication...
❌ Azure CLI not authenticated - run 'az login'

🎉 Azure Connection Testing Complete!
📱 Interactive tests available at: http://localhost:3000/test-azure
```

The script shows the environment cannot connect to Azure AI and is not authenticated. The same connection error appears when running the design evaluation tests.
