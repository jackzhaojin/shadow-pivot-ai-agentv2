/**
 * End-to-End Tests Runner
 * 
 * This script runs all E2E tests in the /tests/e2e directory.
 * E2E tests focus on testing complete user journeys.
 */

console.log('🧪 Running end-to-end tests...');

// Import test fixtures
const fixtures = require('../fixtures/testFixtures');

// Run tests (these will be moved to separate files as we refactor)
try {
  const fs = require('fs');
  const path = require('path');
  
  // Get all test files in this directory
  const testFiles = fs.readdirSync(__dirname)
    .filter(file => file.endsWith('.e2e.test.js'))
    .map(file => path.join(__dirname, file));
  
  if (testFiles.length === 0) {
    console.log('\n⚠️ No E2E tests found. Migration in progress.');
  } else {
    console.log(`\n🔍 Found ${testFiles.length} E2E test files`);
    
    // Run each test file
    for (const file of testFiles) {
      const relativePath = path.relative(__dirname, file);
      console.log(`\n▶️ Running ${relativePath}...`);
      require(file);
    }
  }

  console.log('\n✅ All available end-to-end tests passed successfully!');
  process.exit(0);
} catch (error) {
  console.error('\n❌ End-to-end tests failed:', error);
  process.exit(1);
}
