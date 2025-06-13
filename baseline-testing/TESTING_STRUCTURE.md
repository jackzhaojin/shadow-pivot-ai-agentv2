# Baseline Testing Structure

## Overview

The baseline testing system has been restructured into 3 main runners that provide comprehensive testing for the Shadow Pivot AI Agent application.

## Test Runners

### 1. `run-all-tests.sh` (Main Entry Point)
**Purpose**: Orchestrates all testing by running the two specialized test suites

**What it does**:
- Runs Node.js integrated tests first (no server required)
- Runs server-dependent tests second (requires dev server)
- Provides overall test suite summary
- Exit code indicates overall success/failure

**Usage**:
```bash
./baseline-testing/run-all-tests.sh
```

### 2. `local-node-integrated-tests.sh` (Node.js Only Tests)
**Purpose**: Tests that only require Node.js and Azure credentials (no development server)

**Tests executed**:
- Quick Azure Authentication Test (`local-node-tests/quick-auth-test.sh`)
- Azure Authentication Test (`local-node-tests/azure-auth-test.js`)
- Azure AI Client Direct Connection Test (npm script)
- User GUID Generation Test (npm script)
- Design Concepts Generation Test (npm script)
- Design Evaluation Test (npm script)
- DefaultAzureCredential Direct Test (inline Node.js)

**Usage**:
```bash
./baseline-testing/local-node-integrated-tests.sh
```

### 3. `local-3000-tests.sh` (Server-Dependent Tests)
**Purpose**: Tests that require the development server running on localhost:3000

**Tests executed**:
- Main Page Load Test (curl)
- Azure Storage API Test (curl)
- Azure AI API Test (curl)
- Agent Test Connection API (curl)
- Chat Page Load Test (curl)
- Dashboard Page Load Test (curl)
- Test Azure Page Load Test (curl)
- Agent Page Load Test (curl)
- Azure API Connections Integration Test (`local-server-test-3000-integrated/test-azure-connections.sh`)
- Server-Side Rendering Integration Test (`local-server-test-3000-integrated/test-ssr-integration.sh`)

**Usage**:
```bash
# First start the dev server
npm run dev

# Then run the tests in another terminal
./baseline-testing/local-3000-tests.sh
```

## Subfolder Organization

### `local-node-tests/`
Contains Node.js scripts that test Azure connectivity without requiring the web server:
- `quick-auth-test.sh` - Quick Azure authentication verification
- `azure-auth-test.js` - Detailed Azure authentication test

### `local-server-test-3000-integrated/`
Contains scripts that test server-side integration:
- `test-azure-connections.sh` - Comprehensive Azure API connection testing
- `test-ssr-integration.sh` - Server-side rendering integration testing

## Test Flow

```
run-all-tests.sh
├── local-node-integrated-tests.sh
│   ├── local-node-tests/quick-auth-test.sh
│   ├── local-node-tests/azure-auth-test.js
│   ├── npm run test:ai-connection
│   ├── npm run test:user-guid
│   ├── npm run test:design-concepts
│   ├── npm run test:design-evaluation
│   └── DefaultAzureCredential inline test
└── local-3000-tests.sh
    ├── HTTP endpoint tests (curl)
    ├── local-server-test-3000-integrated/test-azure-connections.sh
    └── local-server-test-3000-integrated/test-ssr-integration.sh
```

## Benefits

1. **Modular**: Each runner has a specific purpose and can be run independently
2. **Dependency-aware**: Server tests are separate from Node.js-only tests
3. **Organized**: Tests are grouped by their requirements and execution context
4. **Comprehensive**: Covers authentication, API endpoints, UI pages, and integration
5. **Maintainable**: Easy to add new tests to the appropriate category

## Common Issues

1. **Server tests fail**: Ensure dev server is running with `npm run dev`
2. **Authentication fails**: Verify Azure credentials are properly configured (AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID)

## Environment Variables Required

For full functionality, ensure these are set:
- `AZURE_CLIENT_ID` - Service Principal Client ID
- `AZURE_CLIENT_SECRET` - Service Principal Secret
- `AZURE_TENANT_ID` - Azure Tenant ID
