// Use built-in fetch (Node.js 18+) or fall back to node-fetch
const fetch = globalThis.fetch || (async (...args) => {
  const { default: fetch } = await import('node-fetch');
  return fetch(...args);
});

const BASE_URL = 'http://localhost:3000';

async function testEndpoint(name, method, url, body = null) {
  console.log(`\n🧪 Testing ${name}...`);
  
  try {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${url}`, options);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${name} - SUCCESS`);
      console.log(`   Status: ${response.status}`);
      if (data.success !== undefined) {
        console.log(`   Success: ${data.success}`);
      }
      if (data.concepts && Array.isArray(data.concepts)) {
        console.log(`   Generated concepts: ${data.concepts.length}`);
      }
      if (data.evaluations && Array.isArray(data.evaluations)) {
        console.log(`   Evaluations: ${data.evaluations.length}`);
      }
      if (data.figmaSpecs && Array.isArray(data.figmaSpecs)) {
        console.log(`   Figma specs: ${data.figmaSpecs.length}`);
      }
      return true;
    } else {
      console.log(`❌ ${name} - FAILED`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${data.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${name} - ERROR`);
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function runEndpointTests() {
  console.log('🚀 Starting endpoint tests...');
  console.log(`📡 Testing endpoints at: ${BASE_URL}`);
  
  if (process.env.CODEX_ENV_NODE_VERSION) {
    console.log('⚠️  Skipping endpoint tests in Codex environment');
    return;
  }

  const results = [];

  // Test AI connection first
  results.push(await testEndpoint(
    'AI Connection Test',
    'GET',
    '/api/test-ai'
  ));

  // Test design concept generation
  results.push(await testEndpoint(
    'Design Concepts Generation',
    'POST',
    '/api/agent/generate-design-concepts',
    { brief: 'Create a dashboard UI for monitoring system performance metrics' }
  ));

  // Test figma spec generation
  results.push(await testEndpoint(
    'Figma Spec Generation',
    'POST',
    '/api/agent/generate-figma-specs',
    { 
      concepts: ['A clean dashboard with metric cards', 'Dark theme dashboard with gauges'],
      brief: 'Performance monitoring dashboard'
    }
  ));

  // Test figma spec evaluation
  results.push(await testEndpoint(
    'Figma Spec Evaluation',
    'POST',
    '/api/agent/evaluate-figma-specs',
    { 
      figmaSpecs: [
        {
          name: 'Dashboard UI',
          description: 'Performance monitoring dashboard',
          components: ['NavBar', 'MetricCard', 'Chart', 'StatusIndicator']
        }
      ]
    }
  ));

  // Test design evaluation
  results.push(await testEndpoint(
    'Design Evaluation',
    'POST',
    '/api/agent/evaluate-designs',
    { 
      concepts: ['A clean dashboard with metric cards'],
      brief: 'Performance monitoring dashboard'
    }
  ));

  // Summary
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log('\n📊 Test Summary:');
  console.log(`   Passed: ${passed}/${total}`);
  console.log(`   Success rate: ${Math.round((passed/total) * 100)}%`);
  
  if (passed === total) {
    console.log('🎉 All endpoint tests passed!');
  } else {
    console.log('⚠️  Some endpoint tests failed. Check logs above for details.');
  }
}

if (require.main === module) {
  runEndpointTests().catch(console.error);
}

module.exports = { runEndpointTests };

