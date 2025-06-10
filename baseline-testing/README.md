# Baseline Testing

This folder contains all baseline system tests for the TSLA AI UI Agent project. These tests verify core Azure integrations and system functionality.

## Prerequisites

Before running the tests, ensure you have:

1. **Node.js** installed and in your PATH
2. **Azure CLI** installed and authenticated (`az login`) **or** service principal environment variables set (`AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_CLIENT_SECRET`)
3. **Development server** running for API tests (`npm run dev`)

## Test Scripts

### `run-all-tests.sh` (Main Test Runner)
Runs all baseline tests in sequence and provides a comprehensive report.

```bash
./baseline-testing/run-all-tests.sh
```

### Individual Tests

#### `azure-auth-test.js`
Tests Azure authentication using DefaultAzureCredential. This verifies that:
- Azure credentials are properly configured
- Token can be obtained for Azure services
- Basic authentication flow works

```bash
node baseline-testing/azure-auth-test.js
```

#### `test-azure-connections.sh`
Tests Azure service connections through the application's API endpoints:
- Azure Storage API connection
- Azure AI Foundry API connection
- Development server accessibility

```bash
./baseline-testing/test-azure-connections.sh
```

#### `test-ssr-integration.sh`
Tests server-side rendering integration:
- Main page loads correctly
- API routes are accessible
- HTTP status codes are correct

```bash
./baseline-testing/test-ssr-integration.sh
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
./baseline-testing/run-all-tests.sh
```

### Run only authentication test
```bash
az login
node baseline-testing/azure-auth-test.js
```

### Quick authentication check
```bash
# Simple one-liner for authentication testing
az login
cd /c/code/shadow-pivot-ai-agentv2 && node baseline-testing/azure-auth-test.js
```

### Quick connection check
```bash
# Requires dev server running
./baseline-testing/test-azure-connections.sh
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
