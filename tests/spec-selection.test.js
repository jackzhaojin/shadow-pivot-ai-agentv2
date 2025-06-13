const assert = require('assert');
const { selectBestDesignConcept } = require('./specSelection');

(function() {
  const choice = selectBestDesignConcept([
    { concept: 'A', score: 0.5 },
    { concept: 'B', score: 0.9 },
    { concept: 'C', score: 0.7 }
  ]);
  assert.strictEqual(choice, 'B');
})();

console.log('Spec selection logic executed');
