/**
 * Spec Selection Unit Tests
 * 
 * Tests the logic for selecting the best design concept based on evaluations.
 * This is a pure logic test with no external dependencies.
 */

const assert = require('assert');
const { selectBestDesignConcept } = require('../specSelection');
const fixtures = require('../fixtures/testFixtures');

console.log('\n🧪 Running Spec Selection unit tests...');

/**
 * Test case: Should select the design with the highest score
 */
function testSelectHighestScore() {
  console.log('  ⏳ Testing selection of highest-scored design concept...');
  
  const testEvaluations = [
    { concept: 'Concept A', score: 0.5, strengths: ['S1'], weaknesses: ['W1'] },
    { concept: 'Concept B', score: 0.9, strengths: ['S1'], weaknesses: ['W1'] },
    { concept: 'Concept C', score: 0.7, strengths: ['S1'], weaknesses: ['W1'] }
  ];
  
  const choice = selectBestDesignConcept(testEvaluations);
  assert.strictEqual(choice, 'Concept B', 'Expected to select concept with highest score (B)');
  console.log('  ✓ Selected concept with highest score (B)');
}

/**
 * Test case: Should handle tied scores (first one wins)
 */
function testTiedScores() {
  console.log('  ⏳ Testing tie-breaking logic for equal scores...');
  
  const testEvaluations = [
    { concept: 'Concept A', score: 0.8, strengths: ['S1'], weaknesses: ['W1'] },
    { concept: 'Concept B', score: 0.8, strengths: ['S1'], weaknesses: ['W1'] },
    { concept: 'Concept C', score: 0.7, strengths: ['S1'], weaknesses: ['W1'] }
  ];
  
  const choice = selectBestDesignConcept(testEvaluations);
  assert.strictEqual(choice, 'Concept A', 'Expected to select the first concept with tied score (A)');
  console.log('  ✓ Selected first concept with tied score (A)');
}

/**
 * Test case: Should handle empty evaluations
 */
function testEmptyEvaluations() {
  console.log('  ⏳ Testing handling of empty evaluations array...');
  
  const choice = selectBestDesignConcept([]);
  assert.strictEqual(choice, '', 'Expected empty string for empty evaluations');
  console.log('  ✓ Returned empty string for empty evaluations');
}

/**
 * Test case: Should handle negative scores
 */
function testNegativeScores() {
  console.log('  ⏳ Testing handling of negative scores...');
  
  const testEvaluations = [
    { concept: 'Concept A', score: -0.5, strengths: ['S1'], weaknesses: ['W1'] },
    { concept: 'Concept B', score: -0.9, strengths: ['S1'], weaknesses: ['W1'] },
    { concept: 'Concept C', score: -0.7, strengths: ['S1'], weaknesses: ['W1'] }
  ];
  
  const choice = selectBestDesignConcept(testEvaluations);
  assert.strictEqual(choice, 'Concept A', 'Expected to select concept with highest score (A)');
  console.log('  ✓ Selected concept with highest negative score (A)');
}

// Run the tests
try {
  testSelectHighestScore();
  testTiedScores();
  testEmptyEvaluations();
  testNegativeScores();
  console.log('✅ All Spec Selection tests completed successfully');
  
  // Don't exit here since this file will be required by the test runner
} catch (error) {
  console.error(`❌ Spec Selection tests failed: ${error.message}`);
  throw error;
}
