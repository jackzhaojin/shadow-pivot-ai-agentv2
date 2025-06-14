Baseline test for 3.2.3 design evaluation step.

Ran `tests/baseline/local-server-test-3000-integrated/test-azure-connections.sh` while the dev server was running.
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

## New run after updating Azure permissions

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

Design evaluation test output:
```
npm warn Unknown env config "http-proxy". This will stop working in the next major version of npm.

> shadow-pivot-ai-agentv2@0.1.0 test:design-evaluation
> tsc lib/designEvaluation.ts --target ES2017 --module commonjs --esModuleInterop --outDir tests && node tests/design-evaluation.test.js

Design evaluation executed
/workspace/shadow-pivot-ai-agentv2/node_modules/openai/client.js:257
            throw new Errors.APIConnectionError({ cause: response });
                  ^

APIConnectionError: Connection error.
    at AzureOpenAI.makeRequest (/workspace/shadow-pivot-ai-agentv2/node_modules/openai/client.js:257:19)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async generateChatCompletion (/workspace/shadow-pivot-ai-agentv2/tests/aiClient.js:25:12)
    at async evaluateDesigns (/workspace/shadow-pivot-ai-agentv2/tests/designEvaluation.js:9:22)
    at async /workspace/shadow-pivot-ai-agentv2/tests/design-evaluation.test.js:5:18 {
  status: undefined,
  headers: undefined,
  requestID: undefined,
  error: undefined,
  code: undefined,
  param: undefined,
  type: undefined,
  cause: TypeError: fetch failed
      at node:internal/deps/undici/undici:13510:13
      at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
      at async AzureOpenAI.fetchWithTimeout (/workspace/shadow-pivot-ai-agentv2/node_modules/openai/client.js:333:20)
      at async AzureOpenAI.makeRequest (/workspace/shadow-pivot-ai-agentv2/node_modules/openai/client.js:224:26)
      at async generateChatCompletion (/workspace/shadow-pivot-ai-agentv2/tests/aiClient.js:25:12)
      at async evaluateDesigns (/workspace/shadow-pivot-ai-agentv2/tests/designEvaluation.js:9:22)
      at async /workspace/shadow-pivot-ai-agentv2/tests/design-evaluation.test.js:5:18 {
    [cause]: Error: connect ENETUNREACH 20.62.58.5:443 - Local (0.0.0.0:0)
        at internalConnect (node:net:1098:16)
        at defaultTriggerAsyncIdScope (node:internal/async_hooks:464:18)
        at GetAddrInfoReqWrap.emitLookup [as callback] (node:net:1497:9)
        at GetAddrInfoReqWrap.onlookupall [as oncomplete] (node:dns:132:8) {
      errno: -101,
      code: 'ENETUNREACH',
      syscall: 'connect',
      address: '20.62.58.5',
      port: 443
    }
  }
}

Node.js v20.19.2
```
