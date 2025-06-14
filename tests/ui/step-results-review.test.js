const assert = require('assert');
const React = require('react');
const ReactDOMServer = require('react-dom/server');

const StepResultPanel = require('../../features/ai/components/flow/StepResultPanel').default;
const { createStepResultsManager } = require('../../lib/utils/stepResults');

function testToggleLogic() {
  const mgr = createStepResultsManager();
  mgr.toggleStep(0);
  assert.ok(mgr.isOpen(0), 'Step should be open after toggle');
  mgr.toggleStep(0);
  assert.ok(!mgr.isOpen(0), 'Step should close after second toggle');
}

function testPanelRender() {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(StepResultPanel, {
      stepIndex: 0,
      brief: 'Test brief',
      designConcepts: ['A', 'B'],
      evaluationResults: [],
      selectedConcept: null
    })
  );
  assert.ok(html.includes('Design Concepts'), 'Panel should render title');
  assert.ok(html.includes('Test brief'), 'Panel should show brief');
  assert.ok(html.includes('A') && html.includes('B'), 'Panel should list concepts');
}

function runAll() {
  testToggleLogic();
  testPanelRender();
  console.log('✅ Step results review tests passed');
}

if (require.main === module) {
  runAll();
}

module.exports = { runAll };
