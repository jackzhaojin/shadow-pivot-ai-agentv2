const { execFileSync } = require('child_process');
const path = require('path');

function runDaoTests() {
  const testPath = path.join(__dirname, 'dao', 'ai-connection.test.js');
  execFileSync('node', [testPath], { stdio: 'inherit' });
}

if (require.main === module) {
  runDaoTests();
}

module.exports = { runDaoTests };
