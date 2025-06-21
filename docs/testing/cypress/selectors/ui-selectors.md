# UI Selectors Reference

## Overview
This document provides a comprehensive reference for UI selectors used in Cypress tests. Based on code analysis, most elements will need `data-testid` attributes added.

## Current State Analysis
**⚠️ IMPORTANT**: The current codebase has minimal `data-testid` attributes. Most selectors will need to be added to components before testing.

## Required Selector Additions

### StepExecutor Component
```typescript
// Creative Brief Input Form
<textarea data-testid="creative-brief-input" />
<button data-testid="start-flow-button" />

// Abort Button
<button data-testid="abort-flow-button" />

// Download Button
<button data-testid="download-figma-spec-button" />
```

### AgentFlowTimeline Component
```typescript
// Step Timeline Items
<div data-testid="step-timeline-item-{index}" />
<div data-testid="step-icon-{index}" />
<div data-testid="step-title-{index}" />
<div data-testid="step-status-{index}" />

// Step Interaction
<div data-testid="step-clickable-{index}" />
<button data-testid="step-toggle-details-{index}" />
```

### StepResultPanel Component
```typescript
// Panel Container
<div data-testid="step-result-panel-{stepIndex}" />

// Panel Controls
<button data-testid="step-result-toggle-details" />
<button data-testid="step-result-close" />

// Validation Controls
<div data-testid="validation-panel" />
<button data-testid="validate-step-button" />
<button data-testid="invalidate-step-button" />
<textarea data-testid="invalidation-feedback" />
```

### FigmaGenerationGrid Component
```typescript
// Grid Container
<div data-testid="figma-generation-grid" />

// Individual Generation Boxes
<div data-testid="figma-generation-box-{index}" />
<div data-testid="figma-generation-status-{index}" />
<div data-testid="figma-generation-progress-{index}" />
```

### FigmaEvaluationResults Component
```typescript
// Results Container
<div data-testid="figma-evaluation-results" />

// Individual Evaluation Items
<div data-testid="figma-evaluation-item-{index}" />
<div data-testid="figma-evaluation-score-{index}" />
<div data-testid="figma-evaluation-issues-{index}" />
```

### ErrorHandler Component
```typescript
// Error Container
<div data-testid="error-handler" />
<div data-testid="error-message-{index}" />
<button data-testid="error-dismiss-{index}" />
```

### ProgressIndicator Component
```typescript
// Progress Container
<div data-testid="progress-indicator" />
<div data-testid="progress-current-step" />
<div data-testid="progress-execution-trace" />
```

## Existing Selectors
Based on code analysis, these selectors are already available:

### Navigation and Layout
```typescript
// Main navigation (if present)
// Header elements
// Footer elements
```

### Form Elements
```typescript
// Most form elements use standard HTML attributes
// Input fields, buttons, textareas
```

## CSS Class Selectors (Fallback)
When `data-testid` is not available, these CSS classes can be used:

### Tailwind Classes
```css
/* Step status indicators */
.text-emerald-700 /* Completed steps */
.text-blue-600 /* Current step */
.text-gray-400 /* Waiting steps */
.text-red-600 /* Failed steps */

/* Interactive elements */
.cursor-pointer /* Clickable elements */
.hover\\:bg-gray-50 /* Hoverable elements */

/* State indicators */
.animate-spin /* Loading spinners */
.animate-pulse /* Pulsing elements */
```

### Component-specific Classes
```css
/* Timeline components */
.rounded-xl.border /* Step containers */
.bg-white.rounded-2xl.shadow-lg /* Main panels */

/* Button styles */
.bg-gradient-to-r.from-blue-600.to-purple-600 /* Primary buttons */
.bg-red-600.hover\\:bg-red-700 /* Danger buttons */
```

## Usage Guidelines

### Selector Priority
1. **Preferred**: `data-testid` attributes (most reliable)
2. **Acceptable**: `data-cy` attributes (Cypress-specific)
3. **Fallback**: CSS classes (less reliable, may change)
4. **Last Resort**: Element types with text content

### Example Usage
```javascript
// Preferred approach
cy.get('[data-testid="creative-brief-input"]')

// Fallback approach
cy.get('textarea').first()
cy.contains('button', 'Start AI Agent Flow')

// Combined approach for reliability
cy.get('[data-testid="start-flow-button"]')
  .should('contain.text', 'Start AI Agent Flow')
```

### Dynamic Selectors
```javascript
// For indexed elements
const stepIndex = 2;
cy.get(`[data-testid="step-timeline-item-${stepIndex}"]`)

// For dynamic content
cy.get('[data-testid^="figma-generation-box-"]') // Starts with
cy.get('[data-testid*="evaluation-item"]') // Contains
```

## Implementation Notes

### Adding data-testid Attributes
When implementing tests, add these attributes to components:
1. Start with the most critical user journey elements
2. Add selectors progressively as tests are written
3. Use semantic, descriptive names
4. Include index or ID for dynamic lists

### Maintenance
- Keep this document updated as selectors are added
- Include selector additions in component pull requests
- Document any breaking changes to existing selectors
- Validate selectors work across different screen sizes
