# Test Helpers and Utilities

## Overview
This document outlines reusable test utilities, custom commands, and helper functions for Cypress testing.

## Custom Commands

### Flow Control Commands
```javascript
/**
 * Starts the basic AI agent flow with a creative brief
 * @param {string} brief - The creative brief text
 */
Cypress.Commands.add('startBasicFlow', (brief) => {
  cy.visit('/agent')
  cy.get('[data-testid="creative-brief-input"]').type(brief)
  cy.get('[data-testid="start-flow-button"]').click()
})

/**
 * Waits for a specific step to complete
 * @param {number} stepIndex - The step index (0-6)
 */
Cypress.Commands.add('waitForStepCompletion', (stepIndex) => {
  cy.get(`[data-testid="step-icon-${stepIndex}"]`)
    .should('have.class', 'completed')
    .should('not.have.class', 'processing')
})

/**
 * Verifies step is in processing state
 * @param {number} stepIndex - The step index (0-6)
 */
Cypress.Commands.add('verifyStepProcessing', (stepIndex) => {
  cy.get(`[data-testid="step-icon-${stepIndex}"]`)
    .should('have.class', 'processing')
    .should('not.have.class', 'completed')
})

/**
 * Aborts the current flow execution
 */
Cypress.Commands.add('abortFlow', () => {
  cy.get('[data-testid="abort-flow-button"]').click()
  cy.get('[data-testid="flow-aborted-message"]').should('be.visible')
})
```

### Step Interaction Commands
```javascript
/**
 * Clicks on a step to view its details
 * @param {number} stepIndex - The step index (0-6)
 */
Cypress.Commands.add('viewStepDetails', (stepIndex) => {
  cy.get(`[data-testid="step-clickable-${stepIndex}"]`).click()
  cy.get(`[data-testid="step-result-panel-${stepIndex}"]`).should('be.visible')
})

/**
 * Validates a step as correct
 * @param {number} stepIndex - The step index (0-6)
 */
Cypress.Commands.add('validateStep', (stepIndex) => {
  cy.viewStepDetails(stepIndex)
  cy.get('[data-testid="validate-step-button"]').click()
  cy.get('[data-testid="step-validation-success"]').should('be.visible')
})

/**
 * Invalidates a step with feedback
 * @param {number} stepIndex - The step index (0-6)
 * @param {string} feedback - Feedback text for invalidation
 */
Cypress.Commands.add('invalidateStep', (stepIndex, feedback) => {
  cy.viewStepDetails(stepIndex)
  cy.get('[data-testid="invalidate-step-button"]').click()
  cy.get('[data-testid="invalidation-feedback"]').type(feedback)
  cy.get('[data-testid="submit-invalidation"]').click()
})
```

### API Mocking Utilities
```javascript
/**
 * Sets up successful API mocks for the complete flow
 */
Cypress.Commands.add('mockSuccessfulFlow', () => {
  // Step 0: Design Concept Generation
  cy.intercept('POST', '/api/agent/generate-design-concepts', {
    statusCode: 200,
    body: {
      concepts: [
        "Modern minimalist dashboard with clean typography",
        "Data visualization focused interface with charts",
        "User-centric design with intuitive navigation"
      ]
    }
  }).as('generateConcepts')

  // Step 1: Design Evaluation
  cy.intercept('POST', '/api/agent/evaluate-designs', {
    statusCode: 200,
    body: {
      evaluations: [
        { concept: "Modern minimalist dashboard", score: 8.5, reason: "Clean and professional" },
        { concept: "Data visualization focused", score: 9.2, reason: "Excellent for analytics" },
        { concept: "User-centric design", score: 7.8, reason: "Good usability focus" }
      ]
    }
  }).as('evaluateDesigns')

  // Step 3: Figma Spec Generation
  cy.intercept('POST', '/api/agent/generate-figma-specs', {
    statusCode: 200,
    body: {
      specs: [
        { name: "Dashboard Spec A", description: "Primary dashboard layout" },
        { name: "Dashboard Spec B", description: "Alternative layout" },
        { name: "Dashboard Spec C", description: "Minimal variant" }
      ]
    }
  }).as('generateFigmaSpecs')

  // Step 4: Figma Spec Evaluation
  cy.intercept('POST', '/api/agent/evaluate-figma-specs', {
    statusCode: 200,
    body: {
      evaluationResults: [
        { specId: "Dashboard Spec A", overallScore: 8.5, issues: [] },
        { specId: "Dashboard Spec B", overallScore: 7.8, issues: [] },
        { specId: "Dashboard Spec C", overallScore: 9.1, issues: [] }
      ]
    }
  }).as('evaluateFigmaSpecs')

  // Step 5: Figma Spec Selection
  cy.intercept('POST', '/api/agent/select-figma-spec', {
    statusCode: 200,
    body: {
      success: true,
      selectedSpec: { name: "Dashboard Spec C", description: "Minimal variant" },
      reasoning: "Highest overall score with minimal issues"
    }
  }).as('selectFigmaSpec')

  // Step 6: Download
  cy.intercept('POST', '/api/agent/download-figma-spec', {
    statusCode: 200,
    body: { downloadUrl: '/mock-download.zip' }
  }).as('downloadFigmaSpec')
})

/**
 * Sets up error mocks for specific steps
 * @param {number} stepIndex - The step to mock as failing
 * @param {string} errorMessage - The error message to return
 */
Cypress.Commands.add('mockStepError', (stepIndex, errorMessage) => {
  const endpoints = [
    '/api/agent/generate-design-concepts',
    '/api/agent/evaluate-designs',
    null, // Step 2 is auto-advance
    '/api/agent/generate-figma-specs',
    '/api/agent/evaluate-figma-specs',
    '/api/agent/select-figma-spec',
    '/api/agent/download-figma-spec'
  ]

  if (endpoints[stepIndex]) {
    cy.intercept('POST', endpoints[stepIndex], {
      statusCode: 500,
      body: { error: errorMessage }
    }).as(`step${stepIndex}Error`)
  }
})
```

### Data Fixtures
```javascript
/**
 * Common test data for creative briefs
 */
export const testBriefs = {
  simple: "Create a modern dashboard",
  detailed: "Design a comprehensive analytics dashboard with charts, KPIs, and user management features. Use a modern dark theme with blue accents.",
  minimal: "Button component",
  complex: "Build a complete e-commerce platform with product catalog, shopping cart, user authentication, payment processing, and admin panel. Include responsive design for mobile and desktop.",
  edge: "   ", // Whitespace only
  long: "a".repeat(1000), // Very long input
  special: "Test with special chars: <script>alert('xss')</script> & éñtïtíés"
}

/**
 * Expected step names for validation
 */
export const stepNames = [
  'Design Concept Generation',
  'Design Evaluation', 
  'Spec Selection / Confirmation',
  'Figma Spec Generation (3 Parallel)',
  'Figma Spec Evaluation & Quality Assurance',
  'Figma Spec Selection & Evaluation',
  'Download Figma Specification'
]

/**
 * Common timeout values
 */
export const timeouts = {
  stepCompletion: 30000,
  apiResponse: 10000,
  uiTransition: 2000,
  download: 15000
}
```

### Assertion Helpers
```javascript
/**
 * Verifies the complete step timeline is displayed correctly
 */
Cypress.Commands.add('verifyTimelineStructure', () => {
  cy.get('[data-testid="progress-timeline"]').should('be.visible')
  
  stepNames.forEach((stepName, index) => {
    cy.get(`[data-testid="step-title-${index}"]`).should('contain.text', stepName.split(' (')[0])
    cy.get(`[data-testid="step-icon-${index}"]`).should('be.visible')
  })
})

/**
 * Verifies error handling is working correctly
 * @param {string} expectedErrorMessage - Expected error message
 */
Cypress.Commands.add('verifyErrorHandling', (expectedErrorMessage) => {
  cy.get('[data-testid="error-handler"]').should('be.visible')
  cy.get('[data-testid="error-message"]').should('contain.text', expectedErrorMessage)
  cy.get('[data-testid="error-dismiss"]').should('be.visible')
})

/**
 * Verifies parallel processing display
 */
Cypress.Commands.add('verifyParallelProcessing', () => {
  // Should show exactly 3 parallel processing boxes
  cy.get('[data-testid="figma-generation-grid"]').should('be.visible')
  cy.get('[data-testid^="figma-generation-box-"]').should('have.length', 3)
  
  // Each box should show status
  for (let i = 0; i < 3; i++) {
    cy.get(`[data-testid="figma-generation-status-${i}"]`).should('be.visible')
    cy.get(`[data-testid="figma-generation-progress-${i}"]`).should('be.visible')
  }
})
```

### Performance Testing Utilities
```javascript
/**
 * Measures and asserts on step completion time
 * @param {number} stepIndex - The step to measure
 * @param {number} maxTimeMs - Maximum acceptable time in milliseconds
 */
Cypress.Commands.add('measureStepTime', (stepIndex, maxTimeMs) => {
  const startTime = Date.now()
  
  cy.waitForStepCompletion(stepIndex).then(() => {
    const duration = Date.now() - startTime
    expect(duration).to.be.lessThan(maxTimeMs)
    cy.log(`Step ${stepIndex} completed in ${duration}ms`)
  })
})

/**
 * Monitors network requests for performance
 */
Cypress.Commands.add('startPerformanceMonitoring', () => {
  cy.window().then((win) => {
    win.performance.mark('test-start')
  })
})

Cypress.Commands.add('endPerformanceMonitoring', (testName) => {
  cy.window().then((win) => {
    win.performance.mark('test-end')
    win.performance.measure(testName, 'test-start', 'test-end')
    
    const measures = win.performance.getEntriesByType('measure')
    const testMeasure = measures.find(m => m.name === testName)
    
    if (testMeasure) {
      cy.log(`${testName} took ${testMeasure.duration}ms`)
    }
  })
})
```

## Setup and Configuration

### Before Each Test
```javascript
beforeEach(() => {
  // Clear any existing state
  cy.clearLocalStorage()
  cy.clearCookies()
  
  // Set viewport for consistent testing
  cy.viewport(1280, 720)
  
  // Set up default timeouts
  Cypress.config('defaultCommandTimeout', timeouts.apiResponse)
  Cypress.config('requestTimeout', timeouts.apiResponse)
})
```

### After Each Test
```javascript
afterEach(() => {
  // Clean up any ongoing requests
  cy.then(() => {
    cy.window().then((win) => {
      // Cancel any pending timeouts or intervals
      win.location.reload()
    })
  })
})
```

## Usage Examples

### Basic Flow Test
```javascript
describe('Basic Flow', () => {
  it('should complete steps 0-2 successfully', () => {
    cy.mockSuccessfulFlow()
    cy.startBasicFlow(testBriefs.simple)
    
    cy.waitForStepCompletion(0)
    cy.waitForStepCompletion(1)
    cy.waitForStepCompletion(2)
    
    cy.verifyTimelineStructure()
  })
})
```

### Error Handling Test
```javascript
describe('Error Handling', () => {
  it('should handle Step 1 API failure gracefully', () => {
    cy.mockStepError(1, 'Design evaluation service unavailable')
    cy.startBasicFlow(testBriefs.simple)
    
    cy.waitForStepCompletion(0)
    cy.verifyErrorHandling('Design evaluation service unavailable')
  })
})
```

### Interactive Test
```javascript
describe('Step Interaction', () => {
  it('should allow step validation', () => {
    cy.mockSuccessfulFlow()
    cy.startBasicFlow(testBriefs.detailed)
    
    cy.waitForStepCompletion(1)
    cy.validateStep(1)
    
    cy.get('[data-testid="step-validation-indicator-1"]')
      .should('have.class', 'validated')
  })
})
```
