/**
 * UI Tests Runner
 * 
 * This script runs all UI tests in the /tests/ui directory.
 * UI tests focus on testing React components with NextJS dependencies.
 */

console.log('🧪 Running UI tests...');

// Import test fixtures
const fixtures = require('../fixtures/testFixtures');

// Run tests (these will be moved to separate files as we refactor)
try {
  const fs = require('fs');
  const path = require('path');
  
  // Get all test files in this directory
  const testFiles = fs.readdirSync(__dirname)
    .filter(file => file.endsWith('.ui.test.js'))
    .map(file => path.join(__dirname, file));
  
  if (testFiles.length === 0) {
    console.log('\n⚠️ No UI tests found. Migration in progress.');
  } else {
    console.log(`\n🔍 Found ${testFiles.length} UI test files`);
    
    // Run each test file
    for (const file of testFiles) {
      const relativePath = path.relative(__dirname, file);
      console.log(`\n▶️ Running ${relativePath}...`);
      require(file);
    }
  }

  console.log('\n✅ All available UI tests passed successfully!');
  process.exit(0);
} catch (error) {
  console.error('\n❌ UI tests failed:', error);
  process.exit(1);
}
