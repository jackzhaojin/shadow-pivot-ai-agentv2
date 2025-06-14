const assert = require('assert');
const { createArtifactZipPlaceholder } = require('./download');

(function() {
  const zip = createArtifactZipPlaceholder({ a: '1', b: '2' });
  const parsed = JSON.parse(zip);
  assert.strictEqual(parsed.a, '1');
  assert.strictEqual(parsed.b, '2');
})();

console.log('Download placeholder tests passed');
