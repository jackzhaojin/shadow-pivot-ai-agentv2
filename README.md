# TSLA AI UI Agent

A Next.js application for AI-powered agent workflows with Azure integration, designed for deployment-first development. The project follows a structured release approach with clearly defined scope and progression.

## Project Release Structure

This project is organized into multiple releases with focused scope:

### **Release 1.0 (MVP) - Launched**
- **Scope**: Figma spec generation and download only (no code generation, no persistent storage)
- **Status**: ✅ Completed
- **Documentation**: [PRD-1.0.md](prd-1.0.md) | [Release-1.0.mdc](release-1.0.mdc)

### **Release 1.1 (Stabilization) - Current Focus**
- **Scope**: Cypress testing, React state fixes, code refactoring
- **Status**: Active Development
- **Documentation**: [Release-1.1.mdc](release-1.1.mdc)

### **Release 1.2 (Session Management) - Future**
- **Scope**: User session persistence, Azure Blob Storage, session history
- **Status**: Planning  
- **Documentation**: [Release-1.2.mdc](release-1.2.mdc)

### **Release 1.3 (Code Generation) - Future**
- **Scope**: Code generation, upload/download code samples, similarity matching
- **Status**: Planning
- **Documentation**: [Release-1.3.mdc](release-1.3.mdc)

### **Backlog - Future Releases**
- **Scope**: GitHub integration, enterprise features, advanced AI capabilities
- **Documentation**: [PRD-Backlog.md](prd-backlog.md) | [Release-Backlog.mdc](release-backlog.mdc)

## AI Development Approach

This project is **100% AI agent coded** with no copy-paste code. We use a mix of local GitHub Copilot agents alongside Claude, GPT, Gemini, and Codex cloud-based agents for all implementation work.

### Development Role Distribution

| **AI Agents Will Handle** | **Human Maintainer Will Handle** |
|---------------------------|-----------------------------------|
| ✅ **All Code Implementation** | 📝 **Minor Markdown Adjustments** |
| • TypeScript/JavaScript code | • Minor edits to project plan (.mdc files), PRD specifications |
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
- **Storage**: Azure Blob Storage (Release 1.2+)
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

# Release Management Files
prd.md                   # Project overview and release structure
prd-1.0.md              # Release 1.0 (MVP) product requirements
prd-backlog.md          # Future features backlog
release-1.0.mdc         # Release 1.0 (MVP) task management and progress
release-1.1.mdc         # Release 1.1 (Stabilization) task management
release-1.2.mdc         # Release 1.2 (Session Management) task management  
release-1.3.mdc         # Release 1.3 (Code Generation) task management
release-backlog.mdc     # Future releases task backlog

infrastructure.md       # Azure infrastructure setup guide
AGENTS.md               # Repository guidelines for contributors
```

## Development Workflow

1. **Make changes** to your code.
2. **Test Azure connections** locally (see [Azure Integration Guide](./docs/AZURE_INTEGRATION.md)).
3. **Verify API endpoints** work correctly.
4. **Test Docker build** (if needed, see [Deployment Guide](./docs/DEPLOYMENT.md)).
5. **Push to GitHub** for automated deployment.

## Documentation

For more detailed information, please refer to the following documents:

### **Release-Specific Documents**
- **[Project Overview (prd.md)](./prd.md)**: High-level project structure and release roadmap
- **[Release 1.0 MVP Requirements (prd-1.0.md)](./prd-1.0.md)**: Detailed MVP product requirements (current focus)
- **[Release 1.0 Task Management (release-1.0.mdc)](./release-1.0.mdc)**: MVP task breakdown, phases, and progress
- **[Release 1.1 Stabilization (release-1.1.mdc)](./release-1.1.mdc)**: Cypress testing, React state fixes, refactoring
- **[Release 1.2 Session Management (release-1.2.mdc)](./release-1.2.mdc)**: User sessions, persistent storage, file management
- **[Release 1.3 Code Generation (release-1.3.mdc)](./release-1.3.mdc)**: Code generation, upload/download, similarity matching

### **Backlog and Future Planning**
- **[PRD Backlog (prd-backlog.md)](./prd-backlog.md)**: All advanced features not assigned to specific releases
- **[Release Backlog (release-backlog.mdc)](./release-backlog.mdc)**: Comprehensive task backlog for future enhancements

### **Development Guidelines**
- **[Repository Guidelines (AGENTS.md)](./AGENTS.md)**: Guidelines for contributing to this repository

### **Technical Guides**
- **[Azure Infrastructure Setup](./infrastructure.md)**: Guide to setting up necessary Azure resources
- **[Azure Integration Guide](./docs/AZURE_INTEGRATION.md)**: Details on Azure service configuration and testing
- **[Deployment Guide](./docs/DEPLOYMENT.md)**: Information on Docker and GitHub Actions CI/CD
- **[Troubleshooting Guide](./docs/TROUBLESHOOTING.md)**: Solutions for common issues
- **[App Router Overview](./docs/app-router-overview.md)**: Information about the Next.js App Router
- **[Technical Documentation Index](./docs/technical/README.md)**: Implementation guides and key issue resolutions
- **[Technical Blueprint](./docs/technical/blueprint/README.md)**: Overview of architecture and core patterns
- **[Core Capabilities](./docs/technical/blueprint/core-capabilities.md)**: Summary of design decisions and system layers

### **Development & Testing Specifics**
- **Test Structure:**
  - `tests/baseline/`: Basic Azure authentication tests
  - `tests/dao/`: DAO layer tests for Azure and AI client integration
  - `tests/services/`: Service logic tests (user GUID, spec selection, execution)
  - `tests/endpoints/`: External API and endpoint tests
  - `tests/ui/`: UI component tests for the agent flow and interfaces
  - `tests/e2e/`: End-to-end integration tests
- **Test Commands:** `npm run test:all` runs the full suite. Individual groups: `npm run test:baseline`, `npm run test:dao`, `npm run test:services`, `npm run test:endpoints`, `npm run test:ui`, and `npm run test:e2e`.

### **Development Logs & Notes** (primarily for historical context)
- **[Session Logs](./docs/ai-log/)**: Contains logs from various development sessions
- **[SSR Integration Notes](./docs/session-1-4b-ssr-integration.md)**

---

**Current Status**: Release 1.1 (Stabilization) - Active Development
**Current Focus**: Cypress testing and React state stabilization
**Next Milestone**: Complete stabilization tasks with comprehensive test coverage

