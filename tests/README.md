# Test Architecture

## Overview

This testing architecture provides a comprehensive testing strategy for the Shadow Pivot AI Agent. Tests are organized into clear categories based on their purpose, dependencies, and execution requirements.

## Test Categories

### 1. Unit Tests (`/tests/unit`)
- **Purpose**: Test pure business logic with no external dependencies
- **Dependencies**: None (uses mocking for external services)
- **Examples**: Utility functions, data transforms, algorithm validation
- **Command**: `npm run test:unit`

### 2. Integration Tests (`/tests/integration`)
- **Purpose**: Test integration with external services and data access
- **Dependencies**: Azure services, DefaultAzureCredential
- **Examples**: Storage operations, AI client communication
- **Command**: `npm run test:integration`

### 3. API Tests (`/tests/api`)
- **Purpose**: Test API routes and service layer together
- **Dependencies**: Server-side logic, API routes
- **Examples**: API response validation, error handling
- **Command**: `npm run test:api`

### 4. UI Tests (`/tests/ui`)
- **Purpose**: Test UI components with NextJS dependencies
- **Dependencies**: React components, state management
- **Examples**: Component rendering, user interactions
- **Command**: `npm run test:ui`

### 5. End-to-End Tests (`/tests/e2e`)
- **Purpose**: Test complete user journeys
- **Dependencies**: Full application running
- **Examples**: Multi-step workflows, real user scenarios
- **Command**: `npm run test:e2e`

## Test Data Management

### Test Fixtures (`/tests/fixtures`)
- **Purpose**: Provide reusable test data and utilities
- **Examples**: Mock responses, test helpers, shared setup/teardown
- **Usage**: Import from any test category

## Running Tests

### All Tests
```bash
npm run test
```

### By Category
```bash
npm run test:unit
npm run test:integration
npm run test:api
npm run test:ui
npm run test:e2e
```

### Legacy Test Scripts
The legacy test scripts are maintained for backward compatibility and will be gradually migrated to the new structure.

## Test Naming Conventions

- **Unit Tests**: `*.unit.test.js`
- **Integration Tests**: `*.integration.test.js`
- **API Tests**: `*.api.test.js`
- **UI Tests**: `*.ui.test.js`
- **End-to-End Tests**: `*.e2e.test.js`

## Writing New Tests

When creating new tests:
1. Identify the appropriate test category
2. Follow the naming convention
3. Use fixtures for shared test data
4. Keep tests focused and independent
5. Document any special setup requirements
