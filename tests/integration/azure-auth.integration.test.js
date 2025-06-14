/**
 * Azure Authentication Integration Tests
 * 
 * Tests the authentication to Azure services using DefaultAzureCredential.
 * These tests require valid Azure credentials configured.
 */

const assert = require('assert');
const { DefaultAzureCredential } = require('@azure/identity');
const fixtures = require('../fixtures/testFixtures');

console.log('\n🧪 Running Azure Authentication integration tests...');

/**
 * Test case: Should authenticate to Azure using DefaultAzureCredential
 */
async function testAzureAuthentication() {
  console.log('  ⏳ Testing Azure authentication with DefaultAzureCredential...');
  
  try {
    // Create DefaultAzureCredential
    const credential = new DefaultAzureCredential();
    
    // Try to get a token for Azure Management scope
    const token = await credential.getToken("https://management.azure.com/.default");
    
    // If we get here without error, authentication was successful
    assert.ok(token, 'Expected to receive a valid token');
    assert.ok(token.token, 'Expected token to have a token property');
    assert.ok(token.expiresOnTimestamp > Date.now(), 'Expected token to have a future expiry');
    
    console.log('  ✅ Azure authentication successful');
  } catch (error) {
    console.error(`  ❌ Azure authentication failed: ${error.message}`);
    throw error;
  }
}

// Run the tests
(async function() {
  try {
    await testAzureAuthentication();
    console.log('✅ All Azure Authentication tests completed successfully');
    
    // Don't exit here since this file will be required by the test runner
  } catch (error) {
    console.error(`❌ Azure Authentication tests failed: ${error.message}`);
    throw error;
  }
})();
