const { execFileSync } = require('child_process');
const path = require('path');

function runValidationTests() {
  const files = [
    'validation-panel.test.js',
    'agent-flow-validation.test.js'
  ];
  
  console.log('🧪 Running Validation Feature Tests...\n');
  
  files.forEach(f => {
    const testPath = path.join(__dirname, 'ui', f);
    execFileSync('node', [testPath], {
      stdio: 'inherit'
    });
  });
  
  console.log('\n✅ All validation feature tests passed!');
  console.log('📋 Task 3.4 validation complete');
}

if (require.main === module) {
  runValidationTests();
}

module.exports = { runValidationTests };
