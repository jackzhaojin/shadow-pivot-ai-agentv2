# Baseline Testing Suite

This directory contains comprehensive tests for the Shadow Pivot AI Agent application, organized into two main categories:

## Test Organization

Tests that only require Node.js and Azure credentials. No development server needed.
- `azure-auth-test.js` - Azure authentication testing and credential verification
- `quick-auth-test.sh` - Quick credential verification script

## Full Test Suite Structure

The complete test suite is organized in the parent `tests` directory:

### 📁 tests/baseline/
Basic environment and authentication verification tests.

### 📁 tests/dao/ 
Data Access Object layer tests:
- `ai-connection.test.js` - Tests for AI client connections
- `aiClient.js` - AI client testing utilities

### 📁 tests/services/
Service layer logic tests:
- `user-guid.test.js` - User GUID generation and management
- `spec-selection.test.js` - Spec selection service logic
- `execution.test.js` - Execution tracking services
- `download.test.js` - Artifact download functionality

### 📁 tests/endpoints/
API endpoint tests:
- `designConcept.js` - Design concept generation endpoints
- `designEvaluation.js` - Design evaluation endpoints

### 📁 tests/ui/
UI component tests:
- `agent-flow-ux.test.js` - Agent flow UI/UX tests
- `agent-flow-refactor.test.js` - Component refactoring tests
- `spec-selection-ui-integration.test.js` - Spec selection UI tests

### 📁 tests/e2e/
End-to-end integration tests:
- `spec-selection-e2e.test.js` - Full spec selection workflow
- `end-to-end-bugfix.js` - Bug-fix verification tests

## Quick Start

### Verify Azure Authentication:
```bash
node tests/baseline/azure-auth-test.js
```

### Run Baseline Tests Only:
```bash
npm run test:baseline
```

### Run All Tests:
```bash
npm run test:all
```

### Run Specific Test Categories:
```bash
# DAO layer tests
npm run test:dao

# Service logic tests
npm run test:services

# API endpoint tests  
npm run test:endpoints

# UI component tests
npm run test:ui

# End-to-end tests (requires dev server)
npm run test:e2e
```

## Prerequisites

- Node.js 18+
- Azure credentials configured via environment variables:
  - `AZURE_CLIENT_ID`
  - `AZURE_CLIENT_SECRET`
  - `AZURE_TENANT_ID`
  - `AZURE_SUBSCRIPTION_ID`

## Authentication

All tests use **DefaultAzureCredential** - no Azure CLI required. This works reliably in all environments including Codex.

## Test Scripts

### `run-all-tests.sh` (Main Test Runner)
Runs all baseline tests in sequence and provides a comprehensive report.

```bash
./tests/baseline/run-all-tests.sh
```

### Individual Tests

#### `azure-auth-test.js`
Tests Azure authentication using DefaultAzureCredential. This verifies that:
- Azure credentials are properly configured
- Token can be obtained for Azure services
- Basic authentication flow works

```bash
node tests/baseline/local-node-tests/azure-auth-test.js
```

#### `test-azure-connections.sh`
Tests Azure service connections through the application's API endpoints:
- Azure Storage API connection
- Azure AI Foundry API connection
- Development server accessibility

```bash
./tests/baseline/local-server-test-3000-integrated/test-azure-connections.sh
```

#### `test-ssr-integration.sh`
Tests server-side rendering integration:
- Main page loads correctly
- API routes are accessible
- HTTP status codes are correct

```bash
./tests/baseline/local-server-test-3000-integrated/test-ssr-integration.sh
```

## Configuration

### Azure Key Vault Testing
To test Azure Key Vault access, edit `azure-auth-test.js` and update the `url` variable:

```javascript
const url = "https://your-keyvault-name.vault.azure.net/";
```

### Port Configuration
The tests assume the development server runs on:
- Port 3000 for `test-azure-connections.sh`
- Port 3001 for `test-ssr-integration.sh`

Update the port numbers in the respective scripts if your setup differs.

## Usage Examples

### Run all tests
```bash
# Make sure you're logged into Azure
az login

# Start the development server (in another terminal)
npm run dev

# Run all baseline tests
./tests/baseline/run-all-tests.sh
```

### Run only authentication test
```bash
az login
node tests/baseline/local-node-tests/azure-auth-test.js
```

### Quick authentication check
```bash
# Simple one-liner for authentication testing
az login
cd /c/code/shadow-pivot-ai-agentv2 && node tests/baseline/local-node-tests/azure-auth-test.js
```

### Quick connection check
```bash
# Requires dev server running
./tests/baseline/local-server-test-3000-integrated/test-azure-connections.sh
```

## Continuous Integration

These tests are designed to work in CI/CD environments like GitHub Actions or Azure DevOps. The main requirements are:
- Azure service principal authentication (for CI)
- Node.js environment
- Azure CLI installed

## Troubleshooting

### "Azure CLI not authenticated"
Run `az login` and follow the authentication prompts.

### "Development server is not accessible"
Start the development server with `npm run dev` before running API tests.

### "Azure authentication failed"
Check your Azure credentials:
- Local development: Ensure `az login` is completed
- CI/CD: Verify service principal configuration
- Environment variables: Check `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`, `AZURE_TENANT_ID`

### Node.js module errors
Run `npm install` to ensure all dependencies are installed.

## Test Philosophy

These baseline tests focus on:
- **Authentication**: Verifying Azure credential flow
- **Connectivity**: Testing service reachability
- **Integration**: Ensuring components work together
- **Reliability**: Providing quick feedback on system health

Tests are designed to be:
- **Fast**: Complete in under 30 seconds
- **Reliable**: Minimal external dependencies
- **Informative**: Clear error messages and status reporting
- **Portable**: Work in local and CI environments
