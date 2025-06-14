/**
 * Design Evaluation Integration Tests
 * 
 * Tests the evaluation of design concepts using AI services.
 * These tests require valid Azure credentials configured.
 */

const assert = require('assert');
const { evaluateDesigns } = require('../designEvaluation');
const fixtures = require('../fixtures/testFixtures');

console.log('\n🧪 Running Design Evaluation integration tests...');

/**
 * Test case: Should evaluate design concepts using AI
 */
async function testDesignEvaluation() {
  console.log('  ⏳ Testing design evaluation with prompt system...');
  
  const testConcepts = [
    'A minimalist dashboard featuring a dark theme with real-time graphs that utilize smooth animations.',
    'A card-based layout where each performance metric is presented in a separate card with expandable sections.',
    'A modular dashboard using a grid layout, allowing users to customize the arrangement of widgets.'
  ];
  
  const testBrief = 'Create a dashboard for system monitoring';
  console.log(`  📝 Evaluating ${testConcepts.length} design concepts...`);
  
  try {
    const result = await evaluateDesigns(testConcepts, testBrief);
    
    // Verify result is an array
    assert.ok(Array.isArray(result), 'Result should be an array');
    console.log('  ✓ Result is an array');
    
    // Check we have evaluations for all concepts
    assert.strictEqual(result.length, testConcepts.length, 
      `Expected ${testConcepts.length} evaluations, got ${result.length}`);
    console.log(`  ✓ Generated evaluations for all ${testConcepts.length} concepts`);
    
    // Verify the structure of each evaluation result
    result.forEach((r, i) => {
      assert.ok(typeof r.concept === 'string', `Concept ${i} should be a string`);
      assert.ok(typeof r.score === 'number', `Score for concept ${i} should be a number`);
      assert.ok(r.score >= 0 && r.score <= 10, 
        `Score for concept ${i} should be between 0 and 10, got ${r.score}`);
      assert.ok(Array.isArray(r.strengths), `Strengths for concept ${i} should be an array`);
      assert.ok(Array.isArray(r.weaknesses), `Weaknesses for concept ${i} should be an array`);
      assert.ok(typeof r.reasoning === 'string', `Reasoning for concept ${i} should be a string`);
    });
    console.log('  ✓ All evaluations have the correct structure');
    
    // Display evaluation summaries
    console.log('\n  📊 Evaluation results:');
    result.forEach((r, i) => {
      console.log(`  [${i + 1}] Score: ${r.score.toFixed(1)}, Strengths: ${r.strengths.length}, Weaknesses: ${r.weaknesses.length}`);
    });
    
    console.log('\n  ✅ Design evaluation successful');
    return result;
  } catch (error) {
    console.error(`  ❌ Design evaluation failed: ${error.message}`);
    throw error;
  }
}

// Run the tests
(async function() {
  try {
    await testDesignEvaluation();
    console.log('✅ All Design Evaluation tests completed successfully');
    
    // Don't exit here since this file will be required by the test runner
  } catch (error) {
    console.error(`❌ Design Evaluation tests failed: ${error.message}`);
    throw error;
  }
})();
