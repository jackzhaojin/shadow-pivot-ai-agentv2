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

## Project Structure Overview

```
app/                     # Next.js App Router: pages, API routes
├── api/                 # API endpoints (e.g., Azure testing)
├── test-azure/          # Interactive Azure testing UI
lib/                     # Core logic: Azure clients, utilities
components/              # Reusable React components
features/                # Feature-specific modules
docs/                    # Project documentation
  ├── ai-agent/          # AI Agent specific documents (e.g., PRD)
  ├── ai-log/            # Logs from AI agent development sessions
  └── ...                # Other documentation files
infrastructure.md       # Azure infrastructure setup guide
project-management.mdc   # Task management and phase planning
AGENTS.md                # Repository guidelines for contributors
...                      # Other configuration files (Docker, Next.js, TS, etc.)
```

## Development Workflow

1. **Make changes** to your code.
2. **Test Azure connections** locally (see [Azure Integration Guide](./docs/AZURE_INTEGRATION.md)).
3. **Verify API endpoints** work correctly.
4. **Test Docker build** (if needed, see [Deployment Guide](./docs/DEPLOYMENT.md)).
5. **Push to GitHub** for automated deployment.

## Documentation

For more detailed information, please refer to the following documents:

- **Core Project Documents**
  - [AI Agent PRD](./docs/ai-agent/prd.md): Product Requirements for the AI Agent.
  - [Project Management](./project-management.mdc): Task breakdown, phases, and progress.
  - [Repository Guidelines (AGENTS.md)](./AGENTS.md): Guidelines for contributing to this repository.
- **Technical Guides**
  - [Azure Infrastructure Setup](./infrastructure.md): Guide to setting up necessary Azure resources.
  - [Azure Integration Guide](./docs/AZURE_INTEGRATION.md): Details on Azure service configuration and testing.
  - [Deployment Guide](./docs/DEPLOYMENT.md): Information on Docker and GitHub Actions CI/CD.
  - [Troubleshooting Guide](./docs/TROUBLESHOOTING.md): Solutions for common issues.
  - [App Router Overview](./docs/app-router-overview.md): Information about the Next.js App Router.
- **Development & Testing Specifics**
  - [Baseline Testing README](./baseline-testing/README.md): Information on baseline testing scripts.
- **Development Logs & Notes** (primarily for historical context)
  - [Session Logs](./docs/ai-log/): Contains logs from various development sessions.
  - [SSR Integration Notes](./docs/session-1-4b-ssr-integration.md)

---

**Status**: ✅ Full CI/CD pipeline operational. Core feature development (Phase 3) is active.

