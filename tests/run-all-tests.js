const { runDaoTests } = require('./run-dao-tests');
const { runServiceTests } = require('./run-services-tests');
const { runUiTests } = require('./run-ui-tests');
const { runE2ETests } = require('./run-e2e-tests');

function runAllTests() {
  runDaoTests();
  runServiceTests();
  runUiTests();
  runE2ETests();
}

if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests };
