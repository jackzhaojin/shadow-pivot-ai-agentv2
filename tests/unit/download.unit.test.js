/**
 * Download Utility Unit Tests
 * 
 * Tests the functionality of download utilities.
 * These are pure unit tests with no external dependencies.
 */

const assert = require('assert');
const { createArtifactZipPlaceholder } = require('../download');
const fixtures = require('../fixtures/testFixtures');

console.log('\n🧪 Running Download Utility unit tests...');

/**
 * Test case: Should create a valid artifact zip placeholder
 */
function testCreateArtifactZipPlaceholder() {
  console.log('  ⏳ Testing artifact zip placeholder creation...');
  
  const testData = { a: '1', b: '2', metadata: { type: 'test' } };
  const zip = createArtifactZipPlaceholder(testData);
  
  // Verify the placeholder is a valid JSON string
  try {
    const parsed = JSON.parse(zip);
    assert.strictEqual(parsed.a, '1', 'Expected property "a" to be "1"');
    assert.strictEqual(parsed.b, '2', 'Expected property "b" to be "2"');
    assert.deepStrictEqual(parsed.metadata, { type: 'test' }, 'Expected metadata to match');
    
    console.log('  ✓ Artifact zip placeholder created correctly');
  } catch (error) {
    console.error(`  ❌ JSON parsing failed: ${error.message}`);
    throw new Error('Failed to parse ZIP placeholder JSON');
  }
}

/**
 * Test case: Should handle complex nested objects
 */
function testComplexObjects() {
  console.log('  ⏳ Testing artifact zip placeholder with complex objects...');
  
  const testData = {
    execution: fixtures.helpers.createMockExecution(),
    concepts: fixtures.ai.designConceptOutputs,
    evaluations: fixtures.ai.designEvaluationResults
  };
  
  const zip = createArtifactZipPlaceholder(testData);
  
  // Verify the placeholder is a valid JSON string with complex objects
  try {
    const parsed = JSON.parse(zip);
    assert.ok(parsed.execution.id, 'Expected execution ID to be present');
    assert.ok(Array.isArray(parsed.concepts), 'Expected concepts to be an array');
    assert.ok(parsed.evaluations.concepts, 'Expected evaluations to have concepts');
    
    console.log('  ✓ Complex object handling works correctly');
  } catch (error) {
    console.error(`  ❌ Complex object test failed: ${error.message}`);
    throw error;
  }
}

// Run the tests
try {
  testCreateArtifactZipPlaceholder();
  testComplexObjects();
  console.log('✅ All Download Utility tests completed successfully');
  
  // Don't exit here since this file will be required by the test runner
} catch (error) {
  console.error(`❌ Download Utility tests failed: ${error.message}`);
  throw error;
}
