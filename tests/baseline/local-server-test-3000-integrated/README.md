# Local Server Test 3000 Integrated

This folder contains tests that require the development server to be running on localhost:3000. These tests verify the web application's API endpoints and page functionality.

## Tests Included:

- **local-3000-tests.sh** - Main test runner for all server-dependent tests
- **test-azure-connections.sh** - Tests Azure API endpoints via HTTP
- **test-ssr-integration.sh** - Tests server-side rendering integration

## How to Run:

### Start the development server first:
```bash
npm run dev
```

### Then run the tests:
```bash
# Run all server tests
./tests/baseline/local-3000-tests.sh

# Run individual tests
./tests/baseline/local-server-test-3000-integrated/test-azure-connections.sh
./tests/baseline/local-server-test-3000-integrated/test-ssr-integration.sh
```

## Requirements:

- Node.js installed
- Development server running on port 3000 (`npm run dev`)
- Azure credentials configured
- curl command available

## What These Tests Verify:

- Main page loads successfully (HTTP 200)
- Azure Storage API endpoint works (`/api/test-storage`)
- Azure AI API endpoint works (`/api/test-ai`)
- Agent test connection API works (`/api/agent/test-connection`)
- All major pages load correctly:
  - Chat page (`/chat`)
  - Dashboard page (`/dashboard`)
  - Test Azure page (`/test-azure`)
  - Agent page (`/agent`)
- Server-side rendering integration
- End-to-end API functionality

These tests verify that the full web application stack is working correctly, including the Next.js server, API routes, and Azure integrations through the web interface.
