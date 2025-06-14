// Mock AgentFlowProvider for testing
const React = require('react');

// Create a simple mock of the AgentFlowProvider context
const mockAgentFlowContext = {
  steps: ['Step 1', 'Step 2', 'Step 3'],
  currentStep: 0,
  completed: new Set([0]),
  executionTrace: { id: 'test-trace', events: [] },
  designConcepts: ['Concept A', 'Concept B'],
  setDesignConcepts: () => {},
  evaluationResults: [],
  setEvaluationResults: () => {},
  selectedConcept: null,
  setSelectedConcept: () => {},
  setCurrentStep: () => {},
  completeStep: () => {},
  startExecution: () => {},
  abort: () => {},
  aborted: false,
  errors: [],
  addError: () => {},
  failedStep: null,
  validatedSteps: new Set(),
  invalidatedSteps: new Set(),
  markStepValidated: () => {},
  markStepInvalidated: () => {}
};

// Mock the useAgentFlow hook to return our mock context
function useAgentFlow() {
  return mockAgentFlowContext;
}

// Export mocked functions
module.exports = {
  useAgentFlow,
  AgentFlowProvider: ({ children }) => React.createElement('div', null, children)
};
