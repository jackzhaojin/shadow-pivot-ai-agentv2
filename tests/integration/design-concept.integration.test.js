/**
 * Design Concept Generation Integration Tests
 * 
 * Tests the generation of design concepts using AI services.
 * These tests require valid Azure credentials configured.
 */

const assert = require('assert');
const { generateDesignConcepts } = require('../designConcept');
const fixtures = require('../fixtures/testFixtures');

console.log('\n🧪 Running Design Concept Generation integration tests...');

/**
 * Test case: Should generate design concepts using AI
 */
async function testDesignConceptGeneration() {
  console.log('  ⏳ Testing design concept generation with prompt system...');
  
  const testBrief = 'Create a dashboard UI for monitoring system performance metrics';
  console.log(`  📝 Using test brief: "${testBrief}"`);
  
  try {
    const result = await generateDesignConcepts(testBrief);
    
    // Verify result is an array
    assert.ok(Array.isArray(result), 'Result should be an array');
    console.log('  ✓ Result is an array');
    
    // Verify we have multiple concepts (at least 3)
    assert.ok(result.length >= 3, `Expected at least 3 design concepts, got ${result.length}`);
    console.log(`  ✓ Generated ${result.length} design concepts (expected >= 3)`);
    
    // Display the concepts (shortened for log readability)
    console.log('\n  📊 Generated design concepts:');
    result.forEach((concept, index) => {
      const shortConcept = concept.length > 50 ? concept.substring(0, 50) + '...' : concept;
      console.log(`  [${index + 1}] ${shortConcept}`);
    });
    
    console.log('\n  ✅ Design concept generation successful');
    return result;
  } catch (error) {
    console.error(`  ❌ Design concept generation failed: ${error.message}`);
    throw error;
  }
}

// Run the tests
(async function() {
  try {
    await testDesignConceptGeneration();
    console.log('✅ All Design Concept Generation tests completed successfully');
    
    // Don't exit here since this file will be required by the test runner
  } catch (error) {
    console.error(`❌ Design Concept Generation tests failed: ${error.message}`);
    throw error;
  }
})();
