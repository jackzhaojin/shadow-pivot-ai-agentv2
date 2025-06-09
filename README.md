# TSLA AI UI Agent

A Next.js application for AI-powered agent workflows with Azure integration, designed for deployment-first development.

## Project Overview

- **Framework**: Next.js 15.1.8 with App Router
- **Cloud Platform**: Microsoft Azure
- **Authentication**: Azure Managed Identity with DefaultAzureCredential
- **AI Services**: Azure AI Foundry (OpenAI GPT-4o-mini)
- **Storage**: Azure Blob Storage
- **Deployment**: Docker + GitHub Actions + Azure App Service

## Quick Start

### Prerequisites

1. **Azure CLI** - Install and authenticate:
   ```bash
   az login
   ```

2. **Node.js** - Version 18+ required

3. **Docker** (optional, for containerization)

### Local Development Setup

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd shadow-pivot-ai-agentv2
   npm install
   ```

2. **Configure environment variables**:
   
   Create `.env.local` (already included in the project):
   ```bash
   # Azure Storage Configuration
   AZURE_STORAGE_ACCOUNT_NAME=shadowpivotaiagentstrg
   
   # Azure AI Foundry Configuration
   AZURE_OPENAI_ENDPOINT=https://story-generation-v1.openai.azure.com/
   AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o-mini-deployment
   
   # Development Environment
   NODE_ENV=development
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**: [http://localhost:3000](http://localhost:3000)

## Azure Integration Testing

This project includes comprehensive Azure connection testing capabilities.

### Interactive Test Interface

Visit [http://localhost:3000/test-azure](http://localhost:3000/test-azure) to access the interactive Azure testing interface, which provides:

- **Real-time connection testing** for Azure Storage and AI Foundry
- **Detailed success/failure reporting** with error diagnostics
- **Environment configuration verification**
- **Step-by-step testing instructions**

### API Endpoints for Testing

#### Azure Storage Test
```bash
curl http://localhost:3000/api/test-storage
```
Tests:
- ✅ Storage account accessibility
- ✅ Container existence (`executions`)
- ✅ Blob upload/download/delete operations
- ✅ DefaultAzureCredential authentication

#### Azure AI Foundry Test
```bash
curl http://localhost:3000/api/test-ai
```
Tests:
- ✅ AI service endpoint connectivity
- ✅ GPT-4o-mini model deployment access
- ✅ Chat completion functionality
- ✅ Managed identity authentication

### Automated Testing Script

Run the comprehensive test suite:
```bash
bash test-azure-connections.sh
```

This script verifies:
- Development server accessibility
- Azure Storage connection
- Azure AI Foundry connection  
- Azure CLI authentication status

### Helper Libraries

**Azure Storage Client** (`lib/storageClient.ts`):
```typescript
import { getBlobServiceClient, getExecutionsContainer } from '@/lib/storageClient';
```

**Azure AI Client** (`lib/aiClient.ts`):
```typescript
import { getAIClient } from '@/lib/aiClient';
```

## Azure Services Configuration

### Required Azure Resources

1. **Azure Storage Account**: `shadowpivotaiagentstrg`
   - Container: `executions` (private access)
   - Authentication: Storage Blob Data Contributor role

2. **Azure AI Foundry**: 
   - Workspace with OpenAI integration
   - Model: GPT-4o-mini deployment
   - Authentication: Cognitive Services User role

3. **Managed Identity**:
   - User-assigned managed identity
   - Assigned to Azure App Service
   - Permissions for both Storage and AI services

### Authentication Method

This project uses **DefaultAzureCredential** which automatically handles:
- ✅ **Local Development**: Azure CLI authentication (`az login`)
- ✅ **Production**: Managed Identity authentication
- ✅ **No API Keys Required**: Seamless credential management

## Deployment

### Docker Containerization

Build and test locally:
```bash
docker build -t shadow-pivot-ai-agentv2 .
docker run -p 3000:3000 shadow-pivot-ai-agentv2
```

### GitHub Actions CI/CD

Automated deployment pipeline:
- **Trigger**: Push to `main` branch
- **Registry**: GitHub Container Registry (GHCR)
- **Target**: Azure App Service with container support
- **Authentication**: OIDC with Azure

## Project Structure

```
app/
├── api/
│   ├── test-storage/route.ts    # Azure Storage testing endpoint
│   └── test-ai/route.ts         # Azure AI Foundry testing endpoint
├── test-azure/page.tsx          # Interactive testing interface
lib/
├── storageClient.ts             # Azure Storage helpers
└── aiClient.ts                  # Azure AI client helpers
```

## Testing & Validation

### Must Pass Before Deployment

1. **Local Azure connections working**:
   ```bash
   curl http://localhost:3000/api/test-storage
   curl http://localhost:3000/api/test-ai
   ```

2. **Interactive tests passing**: Visit `/test-azure` and verify all connections

3. **Azure CLI authenticated**: `az account show` returns your subscription

4. **Docker build successful**: Container runs without errors

## Troubleshooting

### Common Issues

**"DefaultAzureCredential failed"**:
- Run `az login` and verify authentication
- Check `az account show` displays correct subscription

**"Storage account not found"**:
- Verify storage account name in environment variables
- Check RBAC permissions in Azure Portal

**"Insufficient permissions"**:
- Ensure proper role assignments:
  - Storage Blob Data Contributor (Storage Account)
  - Cognitive Services User (AI Services)

### Debug Commands

```bash
# Check Azure authentication
az account show

# Test storage access via CLI
az storage blob list --account-name shadowpivotaiagentstrg --container-name executions --auth-mode login

# View container logs (if deployed)
az webapp log tail --name shadow-pivot-ai-agentv2 --resource-group ShadowPivot
```

## Development Workflow

1. **Make changes** to your code
2. **Test Azure connections** via `/test-azure`
3. **Verify API endpoints** work correctly
4. **Test Docker build** (if needed)
5. **Push to GitHub** for automated deployment

## Documentation

- **Infrastructure Setup**: See `infrastructure.md`
- **Project Management**: See `project-management.mdc` 
- **AI Agent PRD**: See `docs/ai-agent/prd.md`

---

**Status**: ✅ Azure integration testing complete, ready for deployment pipeline testing

