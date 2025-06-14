const assert = require('assert');
const { evaluateDesigns } = require('./designEvaluation');

(async function() {
  console.log('Testing design evaluation with prompt system...');
  
  const testConcepts = [
    'A minimalist dashboard featuring a dark theme with real-time graphs that utilize smooth animations.',
    'A card-based layout where each performance metric is presented in a separate card with expandable sections.',
    'A modular dashboard using a grid layout, allowing users to customize the arrangement of widgets.'
  ];
  
  const testBrief = 'Create a dashboard for system monitoring';
  
  try {
    console.log(`Evaluating ${testConcepts.length} concepts...`);
    const result = await evaluateDesigns(testConcepts, testBrief);
    
    // Verify result is an array
    assert.ok(Array.isArray(result), 'Result should be an array');
    console.log('✓ Result is an array');
    
    // Check we have evaluations for all concepts
    assert.strictEqual(result.length, testConcepts.length, `Expected ${testConcepts.length} evaluations, got ${result.length}`);
    console.log(`✓ Generated evaluations for all ${testConcepts.length} concepts`);
    
    // Verify the structure of each evaluation result
    result.forEach((r, i) => {
      assert.ok(typeof r.concept === 'string', `Concept ${i} should be a string`);
      assert.ok(typeof r.score === 'number', `Score for concept ${i} should be a number`);
      assert.ok(r.score !== 0, `Score for concept ${i} should not be 0`);
      if (r.reason !== undefined) {
        assert.ok(typeof r.reason === 'string', `Reason for concept ${i} should be a string`);
      }
    });
    console.log('✓ All evaluation results have correct structure');
    
    // Sort the results by score to see the ranking
    const sortedResults = [...result].sort((a, b) => b.score - a.score);
    
    // Display the evaluations
    console.log('\nDesign concept evaluations:');
    sortedResults.forEach((evaluation, index) => {
      console.log(`[${index + 1}] Score: ${evaluation.score.toFixed(1)} - ${evaluation.concept.substring(0, 60)}...`);
      console.log(`    Reason: ${evaluation.reason}`);
    });
    
    console.log('\n✅ Design evaluation test PASSED');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
})();

console.log('Design evaluation test executing...');
