const assert = require('assert');
const { generateFigmaSpecs } = require('./figmaSpec');

(async function() {
  const concept = 'Simple login form';
  const result = await generateFigmaSpecs(concept, 3);
  assert.ok(Array.isArray(result), 'Result should be an array');
  assert.strictEqual(result.length, 3, 'Should generate 3 specs');
  console.log('✅ Figma spec generation test passed');
})();

console.log('Figma spec generation test executing...');
