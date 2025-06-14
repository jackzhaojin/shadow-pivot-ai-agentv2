const assert = require('assert');

function createFlow() {
  let currentStep = -1;
  let completed = new Set();
  const steps = ['Design Concept Generation', 'Design Evaluation', 'Spec Selection / Confirmation'];

  const startExecution = () => {
    currentStep = 0;
    completed = new Set();
  };

  const completeStep = (i) => {
    completed.add(i);
    currentStep = i + 1;
  };

  const nextStep = async () => {
    if (currentStep < steps.length) {
      const finished = currentStep;
      await Promise.resolve();
      completeStep(finished);
      if (finished + 1 < 3) {
        await nextStep();
      }
    }
  };

  const startFlow = async () => {
    startExecution();
    await Promise.resolve();
    completeStep(0);
    await nextStep();
  };

  return {
    getCurrentStep: () => currentStep,
    getCompleted: () => completed,
    startFlow,
  };
}

(async function run() {
  const flow = createFlow();
  assert.strictEqual(flow.getCurrentStep(), -1, 'Initial state should not be processing');
  await flow.startFlow();
  assert.strictEqual(flow.getCurrentStep(), 3, 'Flow should auto progress through first three steps');
  const completed = flow.getCompleted();
  [0,1,2].forEach(i => assert.ok(completed.has(i), `Step ${i} should be completed`));
  console.log('Agent flow UX test passed');
})();
