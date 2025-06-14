#!/usr/bin/env node

/**
 * Master Test Runner
 * 
 * This script orchestrates running all test categories in sequence.
 * It provides a single entry point for comprehensive testing.
 */

console.log('🧪 Shadow Pivot AI Agent Test Suite');
console.log('====================================\n');

// Track results
const results = {
  unit: { success: false, startTime: 0, endTime: 0 },
  integration: { success: false, startTime: 0, endTime: 0 },
  api: { success: false, startTime: 0, endTime: 0 },
  ui: { success: false, startTime: 0, endTime: 0 },
  e2e: { success: false, startTime: 0, endTime: 0 }
};

/**
 * Execute a child process and return its result
 */
async function runProcess(command, args) {
  return new Promise((resolve, reject) => {
    const { spawn } = require('child_process');
    const process = spawn(command, args, { stdio: 'inherit' });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    
    process.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Run a specific test category
 */
async function runTestCategory(category, command, args) {
  console.log(`\n🧪 Running ${category} tests...\n`);
  
  results[category].startTime = Date.now();
  
  try {
    results[category].success = await runProcess(command, args);
    results[category].endTime = Date.now();
    
    const duration = (results[category].endTime - results[category].startTime) / 1000;
    
    if (results[category].success) {
      console.log(`\n✅ ${category} tests completed successfully in ${duration.toFixed(2)}s`);
    } else {
      console.log(`\n❌ ${category} tests failed after ${duration.toFixed(2)}s`);
    }
    
    return results[category].success;
  } catch (error) {
    results[category].endTime = Date.now();
    console.error(`\n❌ Error running ${category} tests: ${error.message}`);
    results[category].success = false;
    return false;
  }
}

/**
 * Print final test results summary
 */
function printSummary() {
  console.log('\n📊 Test Results Summary');
  console.log('====================');
  
  let allSuccess = true;
  let totalDuration = 0;
  
  for (const [category, result] of Object.entries(results)) {
    if (result.startTime > 0) {
      const duration = (result.endTime - result.startTime) / 1000;
      totalDuration += duration;
      
      console.log(`${result.success ? '✅' : '❌'} ${category} tests: ${result.success ? 'PASSED' : 'FAILED'} (${duration.toFixed(2)}s)`);
      
      if (!result.success) {
        allSuccess = false;
      }
    }
  }
  
  console.log('\n====================================');
  console.log(`${allSuccess ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  console.log(`Total time: ${totalDuration.toFixed(2)}s`);
  console.log('====================================\n');
  
  return allSuccess;
}

/**
 * Main test execution flow
 */
async function runTests() {
  // Run unit tests first
  await runTestCategory('unit', 'node', ['tests/unit/run-unit-tests.js']);
  
  // Run integration tests
  await runTestCategory('integration', 'node', ['tests/integration/run-integration-tests.js']);
  
  // Run API tests
  await runTestCategory('api', 'node', ['tests/api/run-api-tests.js']);
  
  // Run UI tests
  await runTestCategory('ui', 'node', ['tests/ui/run-ui-tests.js']);
  
  // Run E2E tests
  await runTestCategory('e2e', 'node', ['tests/e2e/run-e2e-tests.js']);
  
  // Print summary
  const allSuccess = printSummary();
  
  // Exit with appropriate code
  process.exit(allSuccess ? 0 : 1);
}

// Start test execution
runTests().catch(error => {
  console.error(`❌ Fatal error during test execution: ${error.message}`);
  process.exit(1);
});
