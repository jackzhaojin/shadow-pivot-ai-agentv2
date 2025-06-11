const assert = require('assert');
const { createExecutionTrace, logEvent } = require('./execution');

(function() {
  const fixedDate = new Date('2024-01-01T00:00:00Z');
  const trace = createExecutionTrace(fixedDate);
  assert.strictEqual(trace.executionId, '2024-01-01T00:00:00.000Z');
  assert.deepStrictEqual(trace.timeline, []);

  logEvent(trace, 'Step started', fixedDate);
  assert.strictEqual(trace.timeline.length, 1);
  assert.strictEqual(trace.timeline[0].message, 'Step started');
})();

console.log('Execution tracker tests passed');
