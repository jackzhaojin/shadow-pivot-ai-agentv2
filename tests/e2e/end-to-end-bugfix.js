const { generateDesignConcepts } = require('../endpoints/services/designConcept');
const { evaluateDesigns } = require('../endpoints/services/designEvaluation');

async function runEndToEndTest() {
  console.log('🧪 Running end-to-end test for the multi-concept generation fix');
  console.log('-------------------------------------------------------------');
  
  // Step 1: Generate multiple design concepts
  console.log('\n📝 Step 1: Generating design concepts...');
  const brief = "Design a social media feed that focuses on content from close friends";
  console.log(`Brief: "${brief}"`);
  
  try {
    const concepts = await generateDesignConcepts(brief);
    console.log(`✅ Successfully generated ${concepts.length} concepts:`);
    
    concepts.forEach((concept, index) => {
      console.log(`  [${index + 1}] ${concept}`);
    });
    
    if (concepts.length >= 3) {
      console.log('✅ CRITICAL BUG FIX CONFIRMED: Multiple concepts generated successfully!');
    } else {
      console.log('❌ Bug still exists: Less than 3 concepts generated');
      process.exit(1);
    }
    
    // Step 2: Evaluate the generated concepts
    console.log('\n📊 Step 2: Evaluating design concepts...');
    const evaluationResults = await evaluateDesigns(concepts, brief);
    
    console.log('✅ Successfully evaluated concepts:');
    evaluationResults.forEach((result, index) => {
      console.log(`  [${index + 1}] Score: ${result.score.toFixed(1)} - ${result.concept.substring(0, 60)}...`);
      console.log(`      Reason: ${result.reason}`);
    });
    
    if (evaluationResults.every(result => result.score > 0)) {
      console.log('✅ CRITICAL BUG FIX CONFIRMED: All concepts received non-zero scores!');
    } else {
      console.log('❌ Bug still exists: Some concepts received zero scores');
      process.exit(1);
    }
    
    console.log('\n🎉 END-TO-END TEST PASSED: Both multi-concept generation and evaluation scoring are fixed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

runEndToEndTest();
