const { execFileSync } = require('child_process');
const path = require('path');

function runUiTests() {
  const files = [
    'agent-flow-refactor.test.js',
    'agent-flow-ux.test.js',
    'spec-selection-ui-integration.test.js',
    'step-results-review.test.js',
    'ValidationPanel.test.tsx',
    'agent-flow-validation.test.tsx'
  ];
  files.forEach(f => {
    const testPath = path.join(__dirname, 'ui', f);
    execFileSync('node', ['-r', 'ts-node/register', '-r', 'tsconfig-paths/register', testPath], {
      stdio: 'inherit',
      env: { ...process.env, TS_NODE_COMPILER_OPTIONS: '{"module":"commonjs","jsx":"react"}' }
    });
  });
}

if (require.main === module) {
  runUiTests();
}

module.exports = { runUiTests };
