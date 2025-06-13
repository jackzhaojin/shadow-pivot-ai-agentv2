const assert = require('assert');
const React = require('react');
const ReactDOMServer = require('react-dom/server');

const AgentFlowTimeline = require('../features/ai/components/flow/AgentFlowTimeline').default;
const ResultsDisplay = require('../features/ai/components/flow/ResultsDisplay').default;
const ErrorHandler = require('../features/ai/components/flow/ErrorHandler').default;
const ProgressIndicator = require('../features/ai/components/flow/ProgressIndicator').default;

function testTimelineRendering() {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(AgentFlowTimeline, {
      steps: ['A', 'B'],
      currentStep: 0,
      completed: new Set(),
      failedStep: null,
      aborted: false
    })
  );
  assert.ok(html.includes('A') && html.includes('B'), 'Timeline should render steps');
}

function testResultsDisplay() {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(ResultsDisplay, {
      designConcepts: ['One'],
      evaluationResults: [{ concept: 'One', score: 1 }],
      selectedConcept: 'One',
      executionTrace: null,
      showTimeline: false,
      setShowTimeline: () => {}
    })
  );
  assert.ok(html.includes('Design Concepts') && html.includes('Design Evaluation'), 'Results display should render sections');
}

function testErrorHandler() {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(ErrorHandler, { errors: ['oops'] })
  );
  assert.ok(html.includes('oops'), 'Error handler should list errors');
}

function testProgressIndicator() {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(ProgressIndicator, { aborted: true, currentStep: 0, stepsLength: 3, executionTrace: null })
  );
  assert.ok(html.includes('Flow Aborted'), 'Progress indicator should show aborted message');
}

function runAll() {
  testTimelineRendering();
  testResultsDisplay();
  testErrorHandler();
  testProgressIndicator();
  console.log('✅ Agent flow refactor component tests passed');
}

if (require.main === module) {
  runAll();
}

module.exports = { runAll };
