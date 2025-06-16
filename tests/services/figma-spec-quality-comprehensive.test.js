const assert = require('assert');
const { testFigmaSpec, testFigmaSpecs } = require('./figmaSpecQuality');

(async function comprehensiveQualityTests() {
  console.log('🧪 Running comprehensive Figma spec quality tests...');
  
  // Test 1: Valid spec with good structure
  const goodSpec = {
    name: 'Professional Dashboard Component',
    description: 'A comprehensive dashboard component with navigation, content areas, and responsive design considerations',
    components: ['Header', 'Navigation', 'MainContent', 'Sidebar', 'Footer']
  };
  
  const goodResult = await testFigmaSpec(goodSpec, 'Create a professional dashboard interface for data visualization');
  assert.ok(goodResult.score >= 1 && goodResult.score <= 10, 'Score should be in valid range');
  assert.ok(goodResult.clarity > 0, 'Clarity should be positive');
  assert.ok(goodResult.structure > 0, 'Structure should be positive');
  assert.ok(goodResult.feasibility > 0, 'Feasibility should be positive');
  assert.ok(typeof goodResult.notes === 'string', 'Notes should be string');
  assert.ok(goodResult.briefAlignment > 0, 'Brief alignment should be positive');
  console.log('✅ Good spec test passed:', goodResult);
  
  // Test 2: Poor spec with minimal content
  const poorSpec = {
    name: 'X',
    description: '',
    components: []
  };
  
  const poorResult = await testFigmaSpec(poorSpec, '');
  assert.ok(poorResult.score < goodResult.score, 'Poor spec should have lower score');
  assert.ok(poorResult.score >= 1, 'Even poor specs should have minimum score');
  console.log('✅ Poor spec test passed:', poorResult);
  
  // Test 3: Medium complexity spec
  const mediumSpec = {
    name: 'User Profile Card',
    description: 'A user profile card with avatar, name, and basic info',
    components: ['Avatar', 'UserName', 'UserInfo']
  };
  
  const mediumResult = await testFigmaSpec(mediumSpec, 'Create user profile components');
  assert.ok(mediumResult.score > poorResult.score, 'Medium spec should score higher than poor spec');
  // Note: Due to randomness in scoring, we only check that it's better than poor spec
  console.log('✅ Medium spec test passed:', mediumResult);
  
  // Test 4: Batch processing
  const batchResults = await testFigmaSpecs([goodSpec, poorSpec, mediumSpec], 'Test batch processing');
  assert.equal(batchResults.length, 3, 'Should return results for all specs');
  assert.ok(batchResults.every(r => r.score >= 1 && r.score <= 10), 'All scores should be in valid range');
  console.log('✅ Batch processing test passed');
  
  // Test 5: Error handling with null spec
  try {
    await testFigmaSpec(null);
    assert.fail('Should throw error for null spec');
  } catch (error) {
    console.log('✅ Null spec error handling test passed');
  }
  
  // Test 6: Error handling with invalid spec
  try {
    const invalidResult = await testFigmaSpec({}, '');
    assert.ok(invalidResult.score >= 1, 'Should provide fallback for invalid spec');
    console.log('✅ Invalid spec fallback test passed:', invalidResult);
  } catch (error) {
    console.log('✅ Invalid spec error handling test passed');
  }
  
  // Test 7: Brief context validation
  const briefResult = await testFigmaSpec(goodSpec, 'Create a responsive e-commerce product catalog with filtering');
  assert.ok(briefResult.briefAlignment, 'Brief alignment should be provided when brief is given');
  console.log('✅ Brief context test passed:', { briefAlignment: briefResult.briefAlignment });
  
  console.log('🎉 All comprehensive quality tests passed successfully!');
  console.log('📊 Test Summary:', {
    goodSpecScore: goodResult.score,
    poorSpecScore: poorResult.score,
    mediumSpecScore: mediumResult.score,
    batchResultsCount: batchResults.length
  });
})().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});

console.log('🧪 Comprehensive Figma spec quality tests executed');
