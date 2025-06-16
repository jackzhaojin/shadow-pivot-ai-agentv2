"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testFigmaSpec = testFigmaSpec;
function testFigmaSpec(spec) {
  const base = Math.min(10, Math.max(3, (spec.components || []).length));
  return Promise.resolve({
    clarity: base,
    structure: base,
    feasibility: base,
    score: base,
    notes: 'Fallback score'
  });
}
