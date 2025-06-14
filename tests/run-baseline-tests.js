const { spawnSync } = require('child_process');
const path = require('path');

/**
 * Runs baseline tests to verify authentication and Azure connections.
 * These tests are fundamental and should be run before other test suites.
 */
function runBaselineTests() {
  console.log('\n🔍 Running Baseline Tests...');
  
  // Run Azure authentication test
  const azureAuthTestPath = path.join(__dirname, 'baseline', 'azure-auth-test.js');
  console.log(`\n📋 Running Azure Authentication Test: ${azureAuthTestPath}`);
  
  const result = spawnSync('node', [azureAuthTestPath], { 
    stdio: 'inherit',
    shell: true
  });

  if (result.status !== 0) {
    console.error('❌ Baseline tests failed. Please check your Azure credentials and connection.');
    process.exit(1);
  }
  
  console.log('✅ Baseline tests completed successfully.\n');
  return true;
}

// Allow running directly or as a module
if (require.main === module) {
  runBaselineTests();
}

module.exports = { runBaselineTests };
