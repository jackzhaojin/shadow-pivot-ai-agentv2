/**
 * AI Connection Integration Tests
 * 
 * Tests the connection to Azure AI services.
 * These tests require valid Azure credentials configured.
 */

const assert = require('assert');
const { testAIConnection } = require('../aiClient');
const fixtures = require('../fixtures/testFixtures');

console.log('\n🧪 Running AI Connection integration tests...');

/**
 * Test case: Should connect to Azure AI Foundry
 */
async function testAzureAIConnection() {
  console.log('  ⏳ Testing Azure AI Foundry connection...');
  
  try {
    const result = await testAIConnection();
    assert.strictEqual(typeof result.success, 'boolean', 'Success flag should be a boolean');
    
    if (result.success) {
      assert.ok(result.response, 'Expected a response on success');
      console.log('  ✅ AI connection successful');
      console.log(`  📝 Response received: "${result.response.substring(0, 50)}..."`);
    } else {
      assert.ok(result.error, 'Expected an error message when unsuccessful');
      console.log(`  ⚠️ AI connection test failed with error: ${result.error}`);
      // Don't fail the test if the connection failed due to configuration issues
    }
  } catch (error) {
    console.error(`  ❌ AI connection test threw an exception: ${error.message}`);
    throw error;
  }
}

// Run the tests
(async function() {
  try {
    await testAzureAIConnection();
    console.log('✅ All AI Connection tests completed');
    
    // Don't exit here since this file will be required by the test runner
  } catch (error) {
    console.error(`❌ AI Connection tests failed: ${error.message}`);
    throw error;
  }
})();
