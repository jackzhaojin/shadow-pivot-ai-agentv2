# Azure Integration Guide

This document details the Azure services integration for the TSLA AI UI Agent project.

## Azure Services Configuration

### Required Azure Resources

1.  **Azure Storage Account**: `shadowpivotaiagentstrg`
    *   Container: `executions` (private access)
    *   Authentication: Storage Blob Data Contributor role

2.  **Azure AI Foundry**:
    *   Workspace with OpenAI integration
    *   Model: GPT-4o-mini deployment
    *   Authentication: Cognitive Services User role

3.  **Managed Identity**:
    *   User-assigned managed identity
    *   Assigned to Azure App Service
    *   Permissions for both Storage and AI services

### Authentication Method

This project uses **DefaultAzureCredential** which automatically handles:

*   ✅ **Local Development**: Azure CLI authentication (`az login`)
*   ✅ **Production**: Managed Identity authentication
*   ✅ **No API Keys Required**: Seamless credential management

## Azure Integration Testing

This project includes comprehensive Azure connection testing capabilities.

### Interactive Test Interface

Visit `http://localhost:3000/test-azure` to access the interactive Azure testing interface, which provides:

*   **Real-time connection testing** for Azure Storage and AI Foundry
*   **Detailed success/failure reporting** with error diagnostics
*   **Environment configuration verification**
*   **Step-by-step testing instructions**

### API Endpoints for Testing

#### Azure Storage Test

```bash
curl http://localhost:3000/api/test-storage
```

Tests:

*   ✅ Storage account accessibility
*   ✅ Container existence (`executions`)
*   ✅ Blob upload/download/delete operations
*   ✅ DefaultAzureCredential authentication

#### Azure AI Foundry Test

```bash
curl http://localhost:3000/api/test-ai
curl http://localhost:3000/api/agent/test-connection
```

Tests:

*   ✅ AI service endpoint connectivity
*   ✅ GPT-4o-mini model deployment access
*   ✅ Chat completion functionality
*   ✅ Managed identity authentication

### Automated Testing Script

Run the comprehensive test suite:

```bash
bash test-azure-connections.sh
```

This script verifies:

*   Development server accessibility
*   Azure Storage connection
*   Azure AI Foundry connection
*   Azure CLI authentication status

### Helper Libraries

**Azure Storage Client** (`lib/daos/storageClient.ts`):

```typescript
import { getBlobServiceClient, getExecutionsContainer } from '@/lib/daos/storageClient';
```

**Azure AI Client** (`lib/daos/aiClient.ts`):

```typescript
import { getAIClient } from '@/lib/daos/aiClient';
```
