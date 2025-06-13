const assert = require('assert');
const { generateDesignConcepts } = require('./designConcept');

(async function() {
  const result = await generateDesignConcepts('simple button');
  assert.ok(Array.isArray(result));
})();

console.log('Design concept generation executed');
