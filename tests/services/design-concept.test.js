const assert = require('assert');
const { generateDesignConcepts } = require('./designConcept');

(async function() {
  console.log('Testing design concept generation with prompt system...');
  
  const testBrief = 'Create a dashboard UI for monitoring system performance metrics';
  console.log(`Using test brief: "${testBrief}"`);
  
  try {
    const result = await generateDesignConcepts(testBrief);
    
    // Verify result is an array
    assert.ok(Array.isArray(result), 'Result should be an array');
    console.log('✓ Result is an array');
    
    // Verify we have multiple concepts (at least 3)
    assert.ok(result.length >= 3, `Expected at least 3 design concepts, got ${result.length}`);
    console.log(`✓ Generated ${result.length} design concepts (expected >= 3)`);
    
    // Display the concepts
    console.log('\nGenerated design concepts:');
    result.forEach((concept, index) => {
      console.log(`[${index + 1}] ${concept}`);
    });
    
    console.log('\n✅ Design concept generation test PASSED');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
})();

console.log('Design concept generation test executing...');
