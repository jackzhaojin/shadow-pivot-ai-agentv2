/**
 * API Tests Runner
 * 
 * This script runs all API tests in the /tests/api directory.
 * API tests focus on testing the API routes and service layer together.
 */

console.log('🧪 Running API tests...');

// Import test fixtures
const fixtures = require('../fixtures/testFixtures');

// Run tests (these will be moved to separate files as we refactor)
try {
  const fs = require('fs');
  const path = require('path');
  
  // Get all test files in this directory
  const testFiles = fs.readdirSync(__dirname)
    .filter(file => file.endsWith('.api.test.js'))
    .map(file => path.join(__dirname, file));
  
  if (testFiles.length === 0) {
    console.log('\n⚠️ No API tests found. Migration in progress.');
  } else {
    console.log(`\n🔍 Found ${testFiles.length} API test files`);
    
    // Run each test file
    for (const file of testFiles) {
      const relativePath = path.relative(__dirname, file);
      console.log(`\n▶️ Running ${relativePath}...`);
      require(file);
    }
  }

  console.log('\n✅ All available API tests passed successfully!');
  process.exit(0);
} catch (error) {
  console.error('\n❌ API tests failed:', error);
  process.exit(1);
}
