const assert = require('assert');
const React = require('react');
const ReactDOMServer = require('react-dom/server');

// Import the components
const ValidationPanel = require('../../features/ai/components/flow/ValidationPanel').default;
const { AgentFlowProvider } = require('../../providers/AgentFlowProvider');

// Mock execution utilities
const executionUtils = require('../../utils/execution');
executionUtils.createExecutionTrace = () => ({ id: 'test-trace-id', events: [] });
executionUtils.logEvent = () => {};

function testValidationPanelRendering() {
  // Test that the ValidationPanel component renders with basic props
  let onValidationCompleteCalled = false;
  const mockOnValidationComplete = () => { onValidationCompleteCalled = true; };
  
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(
      AgentFlowProvider,
      null,
      React.createElement(ValidationPanel, {
        stepIndex: 0,
        onValidationComplete: mockOnValidationComplete
      })
    )
  );

  // Check that key elements are rendered
  assert.ok(html.includes('Step Validation'), 'Panel should include the heading');
  assert.ok(html.includes('Is this step result valid and acceptable?'), 'Panel should include the question text');
  assert.ok(html.includes('Valid'), 'Panel should include Valid button');
  assert.ok(html.includes('Invalid'), 'Panel should include Invalid button');
  assert.ok(html.includes('feedback'), 'Panel should mention feedback requirement');
}

// Execute the tests
try {
  testValidationPanelRendering();
  console.log('✅ ValidationPanel rendering test passed');
} catch (err) {
  console.error('❌ ValidationPanel rendering test failed:', err.message);
  process.exit(1);
}
