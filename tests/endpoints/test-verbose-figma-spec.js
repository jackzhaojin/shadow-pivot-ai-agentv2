const testFigmaSpecGeneration = async () => {
  try {
    console.log('🧪 Testing new verbose Figma spec generation...');
    
    const response = await fetch('http://localhost:3000/api/agent/generate-figma-specs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-guid': 'test-user'
      },
      body: JSON.stringify({
        concept: 'Minimalist login modal with glassmorphism effects',
        brief: 'Create a modern login interface with floating elements and blur effects'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ API Response received');
    
    if (data.specs && data.specs[0]) {
      const spec = data.specs[0];
      console.log('📋 Generated Spec:');
      console.log('Name:', spec.name);
      console.log('Description length:', spec.description?.length || 0);
      console.log('Has designSystem:', !!spec.designSystem);
      console.log('Has layout:', !!spec.layout);
      console.log('Has interactions:', !!spec.interactions);
      console.log('Has accessibility:', !!spec.accessibility);
      console.log('Has implementation:', !!spec.implementation);
      
      // Check if it's the old simple format vs new verbose format
      if (spec.designSystem && typeof spec.designSystem === 'object') {
        console.log('🎉 SUCCESS: Generated verbose specification!');
        console.log('Design System tokens:', !!spec.designSystem.tokens);
        console.log('Design System components:', !!spec.designSystem.components);
        if (spec.designSystem.components) {
          console.log('Component count:', Object.keys(spec.designSystem.components).length);
        }
      } else {
        console.log('❌ Still generating simple format');
      }
      
      // Log the raw JSON to see the full structure
      console.log('\n📄 Full JSON (first 2000 chars):');
      console.log(JSON.stringify(spec, null, 2).substring(0, 2000));
    } else {
      console.log('❌ No specs returned');
      console.log('Response:', data);
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
};

// Run the test
testFigmaSpecGeneration();
