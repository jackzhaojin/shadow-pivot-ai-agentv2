# Local Node Tests

This folder contains tests that only require Node.js and Azure credentials to run. These tests do not require a development server to be running.

## Tests Included:

- **azure-auth-test.js** - Tests Azure authentication using DefaultAzureCredential
- **quick-auth-test.sh** - Quick authentication verification script
- **local-node-integrated-tests.sh** - Main test runner for all Node.js-only tests
- **monitor-deployment.js** - Azure deployment monitoring using Azure SDKs

## How to Run:

### Run all Node.js tests:
```bash
./tests/baseline/local-node-integrated-tests.sh
```

### Run individual tests:
```bash
# Quick auth test
./tests/baseline/local-node-tests/quick-auth-test.sh

# Authentication test directly
node tests/baseline/local-node-tests/azure-auth-test.js

# Deployment monitoring
npm run monitor-deployment
```

## Requirements:

- Node.js installed
- Azure credentials configured via environment variables:
  - `AZURE_CLIENT_ID`
  - `AZURE_CLIENT_SECRET`
  - `AZURE_TENANT_ID`
  - `AZURE_SUBSCRIPTION_ID` (for deployment monitoring)

## What These Tests Verify:

- DefaultAzureCredential authentication works
- Azure AI client connection
- User GUID generation
- Design concepts generation
- Design evaluation functionality
- Direct Azure SDK operations

These tests are ideal for CI/CD environments and quick verification that Azure credentials and core functionality work without needing to start a web server.
