const assert = require('assert');
const { getOrCreateUserGuid } = require('./userGuid');

function createMemoryStorage() {
  const store = {};
  return {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = v; }
  };
}

(function() {
  const mem = createMemoryStorage();
  const guid = getOrCreateUserGuid(mem);
  assert.match(guid, /^[0-9a-f-]{36}$/);
  assert.strictEqual(mem.getItem('userGuid'), guid);
})();

(function() {
  const mem = createMemoryStorage();
  mem.setItem('userGuid', 'existing');
  const guid = getOrCreateUserGuid(mem);
  assert.strictEqual(guid, 'existing');
})();

console.log('All tests passed');
