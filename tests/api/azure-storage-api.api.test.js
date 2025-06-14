/**
 * Azure Storage API Tests
 * 
 * Tests the Azure Storage API endpoints.
 * These tests require the Next.js server to be running.
 */

const assert = require('assert');
const http = require('http');
const fixtures = require('../fixtures/testFixtures');

console.log('\n🧪 Running Azure Storage API tests...');

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
 * Test case: Should fetch storage connection status
 */
async function testStorageConnectionStatus() {
  console.log('  ⏳ Testing storage connection status API...');
  
  try {
    const response = await makeRequest('/api/test-storage');
    
    assert.strictEqual(response.statusCode, 200, 'Expected status code 200');
    assert.ok(response.body.success !== undefined, 'Expected success flag in response');
    
    if (response.body.success) {
      console.log('  ✓ Storage connection is working');
    } else {
      console.log(`  ⚠️ Storage connection test returned error: ${response.body.error}`);
      console.log('  ⚠️ This may be expected if Azure credentials are not configured');
    }
    
    return response.body;
  } catch (error) {
    console.error(`  ❌ Storage connection status test failed: ${error.message}`);
    console.error('  ⚠️ Is the Next.js server running on port 3000?');
    throw error;
  }
}

/**
 * Test case: Should upload blob to storage (if connection is working)
 */
async function testBlobUpload(connectionStatus) {
  console.log('  ⏳ Testing blob upload API...');
  
  if (!connectionStatus.success) {
    console.log('  ⚠️ Skipping blob upload test as storage connection is not working');
    return;
  }
  
  try {
    const testData = {
      id: `test-${Date.now()}`,
      content: 'Test blob content',
      timestamp: new Date().toISOString()
    };
    
    const response = await makeRequest('/api/agent/save-execution', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: { execution: testData }
    });
    
    assert.strictEqual(response.statusCode, 200, 'Expected status code 200');
    assert.ok(response.body.success, 'Expected success flag in response');
    assert.ok(response.body.blobUrl, 'Expected blob URL in response');
    
    console.log('  ✓ Blob upload successful');
    return response.body;
  } catch (error) {
    console.error(`  ❌ Blob upload test failed: ${error.message}`);
    throw error;
  }
}

// Run the tests (conditionally if server is available)
try {
  const SKIP_API_TESTS = process.env.SKIP_API_TESTS === 'true';
  
  if (SKIP_API_TESTS) {
    console.log('  ⚠️ Skipping API tests as SKIP_API_TESTS=true (server not required)');
    console.log('✅ All Azure Storage API tests skipped');
  } else {
    (async () => {
      try {
        const connectionStatus = await testStorageConnectionStatus();
        if (connectionStatus.success) {
          await testBlobUpload(connectionStatus);
        }
        console.log('✅ All Azure Storage API tests completed');
      } catch (error) {
        console.error(`❌ Azure Storage API tests failed: ${error.message}`);
        throw error;
      }
    })();
  }
} catch (error) {
  console.error(`❌ Azure Storage API test setup failed: ${error.message}`);
  throw error;
}
