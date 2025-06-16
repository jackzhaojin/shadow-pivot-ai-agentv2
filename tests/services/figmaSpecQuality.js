"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testFigmaSpec = testFigmaSpec;
exports.testFigmaSpecs = testFigmaSpecs;

function testFigmaSpec(spec, brief = '') {
  if (!spec || typeof spec !== 'object') {
    throw new Error('Invalid spec provided');
  }
  
  const componentCount = (spec.components || []).length;
  const hasDescription = Boolean(spec.description && spec.description.length > 10);
  const hasDetailedComponents = componentCount > 0 && componentCount <= 15;
  
  // Calculate differentiated scores based on content analysis
  const clarityScore = Math.min(10, Math.max(2, 
    (hasDescription ? 3 : 1) + 
    (spec.name && spec.name.length > 5 ? 2 : 0) +
    (componentCount > 2 ? 2 : 0) +
    Math.random() * 3
  ));
  
  const structureScore = Math.min(10, Math.max(1,
    (hasDetailedComponents ? 4 : 2) +
    (componentCount >= 3 && componentCount <= 8 ? 3 : 1) +
    Math.random() * 3
  ));
  
  const feasibilityScore = Math.min(10, Math.max(2,
    (componentCount <= 10 ? 4 : 2) +
    (hasDescription ? 2 : 0) +
    Math.random() * 4
  ));
  
  const briefAlignmentScore = Math.min(10, Math.max(3,
    (brief && brief.length > 10 ? 2 : 0) +
    (hasDescription ? 2 : 0) +
    2 + Math.random() * 4
  ));
  
  const overallScore = (clarityScore + structureScore + feasibilityScore + briefAlignmentScore) / 4;
  
  return Promise.resolve({
    clarity: Math.round(clarityScore * 10) / 10,
    structure: Math.round(structureScore * 10) / 10,
    feasibility: Math.round(feasibilityScore * 10) / 10,
    score: Math.round(overallScore * 10) / 10,
    briefAlignment: Math.round(briefAlignmentScore * 10) / 10,
    notes: `Mock quality analysis: ${componentCount} components identified with ${hasDescription ? 'comprehensive' : 'minimal'} documentation.`
  });
}

function testFigmaSpecs(specs, brief = '') {
  return Promise.all(specs.map(spec => testFigmaSpec(spec, brief)));
}
