console.log('🚀 Testing simple Figma spec generation...');

async function testSimpleFigmaAPI() {
  try {
    const response = await fetch('http://localhost:3000/api/agent/generate-figma-specs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userGuid: 'test-user-simple',
        designConcept: 'Simple button component',
        brief: 'Create a basic button with hover states',
        count: 1
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ API Response received successfully');
    
    if (data.specs && data.specs.length > 0) {
      const spec = data.specs[0];
      console.log('📊 Spec structure analysis:');
      console.log('- Name:', spec.name || 'MISSING');
      console.log('- Description:', spec.description || 'MISSING');
      console.log('- Design System keys:', spec.designSystem ? Object.keys(spec.designSystem) : 'MISSING');
      console.log('- Layout keys:', spec.layout ? Object.keys(spec.layout) : 'MISSING');
      console.log('- Interactions keys:', spec.interactions ? Object.keys(spec.interactions) : 'MISSING');
      console.log('- Accessibility keys:', spec.accessibility ? Object.keys(spec.accessibility) : 'MISSING');
      console.log('- Implementation keys:', spec.implementation ? Object.keys(spec.implementation) : 'MISSING');
      
      // Check if we have components in the new structure
      if (spec.designSystem && spec.designSystem.components) {
        const componentCount = Object.keys(spec.designSystem.components).length;
        console.log('- Component count (new structure):', componentCount);
      } else if (spec.designSystem && spec.designSystem.componentArchitecture) {
        console.log('⚠️ Still using old componentArchitecture structure');
      }
      
      console.log('\n📄 Raw spec preview:');
      console.log(JSON.stringify(spec, null, 2).substring(0, 1000) + '...');
    } else {
      console.log('❌ No specs returned');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSimpleFigmaAPI();
