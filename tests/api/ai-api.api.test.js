/**
 * AI API Tests
 * 
 * Tests the AI API endpoints.
 * These tests require the Next.js server to be running.
 */

const assert = require('assert');
const http = require('http');
const fixtures = require('../fixtures/testFixtures');

console.log('\n🧪 Running AI API tests...');

const TEST_PORT = 3000;
const BASE_URL = `http://localhost:${TEST_PORT}`;

/**
 * Helper function to make HTTP requests
 */
function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(`${BASE_URL}${path}`, {
      method: 'GET',
      ...options
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = { 
            statusCode: res.statusCode, 
            headers: res.headers,
            body: res.headers['content-type']?.includes('application/json') ? JSON.parse(data) : data
          };
          resolve(result);
        } catch (e) {
          resolve({ statusCode: res.statusCode, headers: res.headers, body: data });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    
    req.end();
  });
}

/**
 * Test case: Should fetch AI connection status
 */
async function testAIConnectionStatus() {
  console.log('  ⏳ Testing AI connection status API...');
  
  try {
    const response = await makeRequest('/api/test-ai');
    
    assert.strictEqual(response.statusCode, 200, 'Expected status code 200');
    assert.ok(response.body.success !== undefined, 'Expected success flag in response');
    
    if (response.body.success) {
      assert.ok(response.body.response, 'Expected response text when successful');
      console.log('  ✓ AI connection is working');
      console.log(`  📝 AI response: "${response.body.response.substring(0, 50)}..."`);
    } else {
      console.log(`  ⚠️ AI connection test returned error: ${response.body.error}`);
      console.log('  ⚠️ This may be expected if Azure AI credentials are not configured');
    }
    
    return response.body;
  } catch (error) {
    console.error(`  ❌ AI connection status test failed: ${error.message}`);
    console.error('  ⚠️ Is the Next.js server running on port 3000?');
    throw error;
  }
}

/**
 * Test case: Should generate design concepts (if connection is working)
 */
async function testDesignConceptGeneration(connectionStatus) {
  console.log('  ⏳ Testing design concept generation API...');
  
  if (!connectionStatus.success) {
    console.log('  ⚠️ Skipping design concept generation test as AI connection is not working');
    return;
  }
  
  try {
    const testBrief = 'Create a simple dashboard UI for monitoring system metrics';
    
    const response = await makeRequest('/api/agent/design-concepts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: { brief: testBrief }
    });
    
    assert.strictEqual(response.statusCode, 200, 'Expected status code 200');
    assert.ok(Array.isArray(response.body), 'Expected array response');
    assert.ok(response.body.length >= 3, 'Expected at least 3 design concepts');
    
    console.log(`  ✓ Generated ${response.body.length} design concepts`);
    return response.body;
  } catch (error) {
    console.error(`  ❌ Design concept generation test failed: ${error.message}`);
    throw error;
  }
}

// Run the tests (conditionally if server is available)
try {
  const SKIP_API_TESTS = process.env.SKIP_API_TESTS === 'true';
  
  if (SKIP_API_TESTS) {
    console.log('  ⚠️ Skipping API tests as SKIP_API_TESTS=true (server not required)');
    console.log('✅ All AI API tests skipped');
  } else {
    (async () => {
      try {
        const connectionStatus = await testAIConnectionStatus();
        if (connectionStatus.success) {
          await testDesignConceptGeneration(connectionStatus);
        }
        console.log('✅ All AI API tests completed');
      } catch (error) {
        console.error(`❌ AI API tests failed: ${error.message}`);
        throw error;
      }
    })();
  }
} catch (error) {
  console.error(`❌ AI API test setup failed: ${error.message}`);
  throw error;
}
