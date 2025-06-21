# Section 1: Basic Flow Testing

## Overview
Tests the fundamental user journey from creative brief input through the initial steps of the AI agent flow.

## Priority: HIGH
This section covers the most critical user path that must work correctly.

## Test Scenarios

### 1.1 Initial Page Load and Form Display
**User Story**: As a user visiting the AI agent page, I can see the creative brief input form so that I can start the AI generation process.

**Test Steps**:
1. Visit the agent page (`/agent`)
2. Verify page loads successfully
3. Verify creative brief textarea is visible and enabled
4. Verify start button is present but disabled (empty input)
5. Verify user GUID is displayed
6. Verify page title and description are correct

**Selectors Needed**:
- `[data-testid="creative-brief-input"]`
- `[data-testid="start-flow-button"]`
- `[data-testid="user-guid-display"]`

**Assertions**:
```javascript
cy.get('[data-testid="creative-brief-input"]').should('be.visible').should('be.enabled')
cy.get('[data-testid="start-flow-button"]').should('be.disabled')
cy.contains('Public Demo: Instantly transform your ideas')
```

### 1.2 Creative Brief Input and Validation
**User Story**: As a user entering a creative brief, I can type in the textarea and see the start button become enabled so that I can proceed with my request.

**Test Steps**:
1. Start from loaded page
2. Type a creative brief into textarea
3. Verify start button becomes enabled
4. Clear textarea
5. Verify start button becomes disabled again
6. Enter different creative brief variations

**Test Data**:
```javascript
const testBriefs = [
  "Create a modern dashboard for analytics",
  "Design a shopping cart component with dark theme",
  "Build a user profile page with avatar upload"
];
```

**Assertions**:
```javascript
cy.get('[data-testid="creative-brief-input"]').type(brief)
cy.get('[data-testid="start-flow-button"]').should('be.enabled')
```

### 1.3 Flow Initiation and Step 0 Execution
**User Story**: As a user starting the AI agent flow, I can click the start button and see the flow begin with step 0 (Design Concept Generation) so that I know the system is processing my request.

**Test Steps**:
1. Enter a valid creative brief
2. Click the start flow button
3. Verify UI transitions from input form to progress timeline
4. Verify Step 0 begins processing (loading state)
5. Wait for Step 0 to complete
6. Verify Step 0 shows completed status
7. Verify design concepts are generated

**API Mocking Strategy**:
```javascript
// Mock successful design concept generation
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
```

**Assertions**:
```javascript
cy.get('[data-testid="progress-timeline"]').should('be.visible')
cy.get('[data-testid="step-icon-0"]').should('have.class', 'processing')
cy.wait('@generateConcepts')
cy.get('[data-testid="step-icon-0"]').should('have.class', 'completed')
```

### 1.4 Step 1 Automatic Progression
**User Story**: As a user watching the flow progress, I can see Step 1 (Design Evaluation) begin automatically after Step 0 completes so that the process continues seamlessly.

**Test Steps**:
1. Continue from completed Step 0
2. Verify Step 1 begins automatically
3. Verify Step 1 processes the generated concepts
4. Wait for Step 1 completion
5. Verify evaluation results are displayed
6. Verify best concept is selected

**API Mocking Strategy**:
```javascript
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
```

### 1.5 Step 2 Auto-Advancement
**User Story**: As a user watching the automated flow, I can see Step 2 (Spec Selection) complete automatically since the best concept is already selected so that the flow continues to Figma generation.

**Test Steps**:
1. Continue from completed Step 1
2. Verify Step 2 completes automatically (no user input needed)
3. Verify the best-scoring concept is selected
4. Verify flow advances to Step 3

**Assertions**:
```javascript
cy.get('[data-testid="step-icon-2"]').should('have.class', 'completed')
cy.get('[data-testid="selected-concept"]').should('contain', 'Data visualization focused')
```

### 1.6 Error Handling in Basic Flow
**User Story**: As a user experiencing errors in the basic flow, I can see clear error messages and understand what went wrong so that I can take appropriate action.

**Test Steps**:
1. Test API failure scenarios for each step
2. Verify error states are displayed correctly
3. Verify error messages are user-friendly
4. Test recovery mechanisms

**API Error Mocking**:
```javascript
cy.intercept('POST', '/api/agent/generate-design-concepts', {
  statusCode: 500,
  body: { error: 'Service temporarily unavailable' }
}).as('generateConceptsError')
```

## Implementation Notes

### Prerequisites
Before implementing these tests, add these `data-testid` attributes to components:

**StepExecutor.tsx**:
```typescript
<textarea data-testid="creative-brief-input" />
<button data-testid="start-flow-button" />
<div data-testid="user-guid-display" />
```

**AgentFlowTimeline.tsx**:
```typescript
<div data-testid="progress-timeline" />
<div data-testid="step-icon-{index}" />
<div data-testid="step-title-{index}" />
```

### Test Structure
```
cypress/e2e/01-basic-flow/
├── 01-page-load.cy.js
├── 02-creative-brief-input.cy.js
├── 03-flow-initiation.cy.js
├── 04-step-progression.cy.js
└── 05-basic-error-handling.cy.js
```

### Custom Commands
Create reusable commands for this section:
```javascript
// cypress/support/commands.js
Cypress.Commands.add('startBasicFlow', (brief) => {
  cy.visit('/agent')
  cy.get('[data-testid="creative-brief-input"]').type(brief)
  cy.get('[data-testid="start-flow-button"]').click()
})

Cypress.Commands.add('waitForStepCompletion', (stepIndex) => {
  cy.get(`[data-testid="step-icon-${stepIndex}"]`).should('have.class', 'completed')
})
```

## Success Criteria
- [ ] All basic flow scenarios pass consistently
- [ ] Error handling works for API failures
- [ ] User can successfully start and progress through first 3 steps
- [ ] All UI states are properly tested and validated
- [ ] Performance is acceptable (< 2 seconds for step transitions)

## Next Section Dependencies
Section 2 (Step Progression) depends on:
- All basic flow tests passing
- API mocking strategies established
- Core selectors implemented
- Error handling patterns validated
