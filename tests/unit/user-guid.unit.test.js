/**
 * User GUID Generation Unit Tests
 * 
 * Tests the user GUID generation and storage functionality.
 * Uses simple mock storage for testing.
 */

const assert = require('assert');
const { getOrCreateUserGuid } = require('../../dist-test/userGuid');
const fixtures = require('../fixtures/testFixtures');

console.log('\n🧪 Running User GUID tests...');

/**
 * Creates a memory-based storage for testing
 */
function createMemoryStorage() {
  const store = {};
  return {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = v; }
  };
}

/**
 * Test case: Should generate a new GUID when none exists
 */
function testNewGuidGeneration() {
  console.log('  ⏳ Testing new GUID generation...');
  const mem = createMemoryStorage();
  const guid = getOrCreateUserGuid(mem);
  
  assert.match(guid, /^[0-9a-f-]{36}$/, 'GUID should match UUID format');
  assert.strictEqual(mem.getItem('userGuid'), guid, 'GUID should be stored in storage');
  
  console.log('  ✅ New GUID generation passed');
}

/**
 * Test case: Should return existing GUID when one exists
 */
function testExistingGuidRetrieval() {
  console.log('  ⏳ Testing existing GUID retrieval...');
  const mem = createMemoryStorage();
  const existingGuid = fixtures.user.userGuid;
  mem.setItem('userGuid', existingGuid);
  
  const guid = getOrCreateUserGuid(mem);
  
  assert.strictEqual(guid, existingGuid, 'Should return the existing GUID');
  
  console.log('  ✅ Existing GUID retrieval passed');
}

// Run the tests
try {
  testNewGuidGeneration();
  testExistingGuidRetrieval();
  console.log('✅ All User GUID tests passed');
  
  // Don't exit here since this file will be required by the test runner
} catch (error) {
  console.error(`❌ User GUID tests failed: ${error.message}`);
  throw error;
}
