const assert = require('assert');
const { evaluateDesigns } = require('./designEvaluation');

(async function() {
  const result = await evaluateDesigns(['button ui', 'table layout']);
  assert.ok(Array.isArray(result));
  result.forEach(r => {
    assert.ok(typeof r.concept === 'string');
    assert.ok(typeof r.score === 'number');
    if (r.reason !== undefined) {
      assert.ok(typeof r.reason === 'string');
    }
  });
})();

console.log('Design evaluation executed');
