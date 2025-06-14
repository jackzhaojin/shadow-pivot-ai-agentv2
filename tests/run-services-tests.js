const { execSync } = require('child_process');

function run(cmd) {
  execSync(cmd, { stdio: 'inherit', shell: true });
}

function runServiceTests() {
  run('npm run test:user-guid');
  run('npm run test:spec-selection');
  // Execution and download tests are simple logic checks
  run('node tests/services/execution.test.js');
  run('node tests/services/download.test.js');
}

if (require.main === module) {
  runServiceTests();
}

module.exports = { runServiceTests };
