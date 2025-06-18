const testFigmaSpecGenerationDetailed = async () => {
  try {
    console.log('🧪 Testing Figma spec generation with detailed logging...');
    
    const response = await fetch('http://localhost:3000/api/agent/generate-figma-specs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-guid': 'test-user'
      },
      body: JSON.stringify({
        concept: 'Modern dashboard with dark theme and data visualization',
        brief: 'Create a professional analytics dashboard with charts, metrics cards, and navigation'
      })
    });
    
    const data = await response.json();
    console.log('📄 Complete API Response:');
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
};

// Run the test
testFigmaSpecGenerationDetailed();
