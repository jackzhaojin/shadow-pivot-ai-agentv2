const assert = require('assert');
const { testFigmaSpec } = require('./figmaSpecQuality');

(async function() {
  const spec = {
    name: 'Test Component',
    description: 'A simple component',
    components: ['Header', 'Body', 'Footer']
  };
  const result = await testFigmaSpec(spec);
  assert.ok(typeof result.score === 'number', 'Result should have a score');
  assert.ok(result.clarity > 0, 'Clarity score should be > 0');
})();

console.log('Figma spec quality test executed');
