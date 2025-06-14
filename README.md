# TSLA AI UI Agent

A Next.js application for AI-powered agent workflows with Azure integration, designed for deployment-first development.

## AI Development Approach

This project is **100% AI agent coded** with no copy-paste code. We use a mix of local GitHub Copilot agents alongside Claude, GPT, Gemini, and Codex cloud-based agents for all implementation work.

### Development Role Distribution

| **AI Agents Will Handle** | **Human Maintainer Will Handle** |
|---------------------------|-----------------------------------|
| ✅ **All Code Implementation** | 📝 **Minor Markdown Adjustments** |
| • TypeScript/JavaScript code | • Minor edits to  project plan (.mdc files), PRD specifications |
| • React components and pages | • Minor edits to agent instructions |
| • API routes and backend logic | • Minor edits to other markdown documentation |
| • Azure integration code | |
| • Configuration files (Docker, Next.js, etc.) | |
| ✅ **Documentation & Test Automation** | 🧪 **Manual Testing** |
| • All documentation updates after features | • Local development testing |
| • Unit tests and integration tests | • Azure deployment verification |
| • Test fixtures and mocks | • End-to-end validation |
| • CI/CD pipeline configurations | |
| • Project documentation maintenance | |
| ✅ **Architecture & Implementation** | ⚙️ **Azure Resource Management** |
| • System design and code structure | • Manual Azure resource configuration |
| • Library selection and integration | • Infrastructure setup (no IaC) |
| • Performance optimizations | • Environment variable management |
| • Bug fixes and code improvements | • Deployment monitoring |

### Development Workflow

1. **Human**: Updates markdown specifications (PRD, project plan, agent instructions)
2. **AI**: Implements features based on updated specifications
3. **Human**: Tests functionality locally and on Azure
4. **AI**: Fixes any issues discovered during testing
5. **AI**: Validates fixes and updates project documentation
6. **Repeat**: Continue iterative development cycle

This approach ensures rapid development while maintaining clear separation of concerns - AI handles all coding complexity, validation, and documentation while humans focus on requirements, testing, and infrastructure management.

## Project Overview

- **Framework**: Next.js 15.1.8 with App Router
- **Cloud Platform**: Microsoft Azure
- **Authentication**: Azure Managed Identity with DefaultAzureCredential
- **AI Services**: Azure AI Foundry (OpenAI GPT-4o-mini)
- **Storage**: Azure Blob Storage
- **Deployment**: Docker + GitHub Actions + Azure App Service


## Quick Start

### Prerequisites

1. **Azure Authentication** - Set up Service Principal credentials:
   ```bash
   # Set environment variables for DefaultAzureCredential
   export AZURE_CLIENT_ID="your-client-id"
   export AZURE_CLIENT_SECRET="your-client-secret"
   export AZURE_TENANT_ID="your-tenant-id"
   export AZURE_SUBSCRIPTION_ID="your-subscription-id"
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
lib/                     # Core logic and services
├── daos/                # Data Access Objects for external services (Azure, storage)
├── services/            # Business logic for application features
├── utils/               # Utility functions and helpers
components/              # Reusable React components
features/                # Feature-specific modules
docs/                    # Project documentation
  ├── ai-agent/          # AI Agent specific documents (e.g., PRD)
  ├── ai-log/            # Logs from AI agent development sessions
  └── ...                # Other documentation files
infrastructure.md       # Azure infrastructure setup guide
release-1.0.mdc          # Release 1.0 (MVP) task management and progress
release-1.1.mdc          # Release 1.1 (Post-MVP) task management and planning
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
  - [AI Agent PRD](./prd.md): Product Requirements for the AI Agent.
  - [Release 1.0 Task Management](./release-1.0.mdc): MVP task breakdown, phases, and progress.
  - [Release 1.1 Task Management](./release-1.1.mdc): Post-MVP enhancements and advanced features.
  - [Repository Guidelines (AGENTS.md)](./AGENTS.md): Guidelines for contributing to this repository.
- **Technical Guides**
  - [Azure Infrastructure Setup](./infrastructure.md): Guide to setting up necessary Azure resources.
  - [Azure Integration Guide](./docs/AZURE_INTEGRATION.md): Details on Azure service configuration and testing.
  - [Deployment Guide](./docs/DEPLOYMENT.md): Information on Docker and GitHub Actions CI/CD.
  - [Troubleshooting Guide](./docs/TROUBLESHOOTING.md): Solutions for common issues.
  - [App Router Overview](./docs/app-router-overview.md): Information about the Next.js App Router.
- **Development & Testing Specifics**
  - [Baseline Testing README](./tests/baseline/README.md): Information on baseline testing scripts.
  - **Test Commands:** `npm run test:all` runs the full suite. Individual groups: `npm run test:dao`, `npm run test:services`, `npm run test:endpoints`, `npm run test:ui`, and `npm run test:e2e`.
- **Development Logs & Notes** (primarily for historical context)
  - [Session Logs](./docs/ai-log/): Contains logs from various development sessions.
  - [SSR Integration Notes](./docs/session-1-4b-ssr-integration.md)

---

**Status**: ✅ Full CI/CD pipeline operational. Core feature development (Phase 3) is active.

