const { runBaselineTests } = require('./run-baseline-tests');
const { runDaoTests } = require('./run-dao-tests');
const { runServiceTests } = require('./run-services-tests');
const { runEndpointTests } = require('./run-endpoint-tests');
const { runUiTests } = require('./run-ui-tests');
// Exclude E2E tests as they require the server to be running

function runAllTestsExceptE2E() {
  runBaselineTests();
  runDaoTests();
  runServiceTests();
  runEndpointTests();
  runUiTests();
  // Skip E2E tests
  console.log('ℹ️ Skipping E2E tests as they require the server to be running on port 3000');
}

if (require.main === module) {
  runAllTestsExceptE2E();
}

module.exports = { runAllTestsExceptE2E };
