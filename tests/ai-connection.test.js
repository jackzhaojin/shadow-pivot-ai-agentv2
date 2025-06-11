const assert = require('assert');
const { testAIConnection } = require('./aiClient');

(async function() {
  const result = await testAIConnection();
  assert.strictEqual(typeof result.success, 'boolean');
  if (result.success) {
    assert.ok(result.response, 'Expected a response on success');
  } else {
    assert.ok(result.error, 'Expected an error message when unsuccessful');
  }
})();

console.log('AI connection test executed');
