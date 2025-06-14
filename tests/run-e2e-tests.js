const { execFileSync } = require('child_process');
const path = require('path');

function runE2ETests() {
  const files = [
    'spec-selection-e2e.test.js',
    'end-to-end-bugfix.js'
  ];
  files.forEach(f => {
    const testPath = path.join(__dirname, 'e2e', f);
    execFileSync('node', [testPath], { stdio: 'inherit' });
  });
}

if (require.main === module) {
  runE2ETests();
}

module.exports = { runE2ETests };
