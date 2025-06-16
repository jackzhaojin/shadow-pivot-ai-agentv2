const assert = require('assert');
const {
  createFigmaGenStateArray,
  updateFigmaGenProgress
} = require('../..//lib/utils/figmaGeneration');

function testInitialState() {
  const states = createFigmaGenStateArray();
  assert.strictEqual(states.length, 3, 'Should create 3 figma states');
  states.forEach(s => {
    assert.strictEqual(s.status, 'waiting');
    assert.strictEqual(s.progress, 0);
  });
  console.log('✅ Initial figma states test passed');
}

function testProgressUpdate() {
  let states = createFigmaGenStateArray();
  states = updateFigmaGenProgress(states, 0, 50);
  assert.strictEqual(states[0].status, 'processing');
  assert.strictEqual(states[0].progress, 50);
  states = updateFigmaGenProgress(states, 0, 120);
  assert.strictEqual(states[0].status, 'completed');
  assert.strictEqual(states[0].progress, 100);
  console.log('✅ Figma progress update test passed');
}

function runAll() {
  testInitialState();
  testProgressUpdate();
  console.log('✅ Figma generation infrastructure tests passed');
}

if (require.main === module) {
  runAll();
}

module.exports = { runAll };
