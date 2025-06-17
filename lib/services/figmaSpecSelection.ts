import type { SpecEvaluationResult } from './figmaSpecEvaluation';
import type { FigmaSpec } from './figmaSpec';

export interface FigmaSpecWithEvaluation {
  spec: FigmaSpec;
  evaluation: SpecEvaluationResult;
}

/**
 * Simple selection logic for Figma specs based on evaluation results
 * Similar to selectBestDesignConcept but for Figma specs
 * Uses effort vs. clarity tradeoffs as specified in the requirements
 */
export function selectBestFigmaSpec(
  specs: FigmaSpec[], 
  evaluations: SpecEvaluationResult[]
): { selectedSpec: FigmaSpec | null; selectionReason: string; ranking: FigmaSpecWithEvaluation[] } {
  
  if (specs.length === 0 || evaluations.length === 0) {
    return {
      selectedSpec: null,
      selectionReason: 'No specs or evaluations available for selection',
      ranking: []
    };
  }

  // Match specs with their evaluations by index or name
  const specsWithEvaluations: FigmaSpecWithEvaluation[] = specs.map((spec, index) => {
    // Try to find matching evaluation by name first, then fall back to index
    const evaluation = evaluations.find(evalResult => evalResult.specId === spec.name) || evaluations[index];
    
    return {
      spec,
      evaluation: evaluation || {
        specId: spec.name || `spec-${index}`,
        overallScore: 5,
        clarityScore: 5,
        structureScore: 5,
        feasibilityScore: 5,
        accessibilityScore: 5,
        issues: [],
        strengths: [],
        recommendations: []
      }
    };
  });

  // Calculate composite score based on effort vs. clarity tradeoffs
  // Priority: clarity + feasibility + (low critical issues)
  const rankedSpecs = specsWithEvaluations.map(item => {
    const { evaluation } = item;
    
    // Count critical and high severity issues (penalty)
    const criticalIssues = evaluation.issues?.filter(issue => issue.severity === 'critical').length || 0;
    const highIssues = evaluation.issues?.filter(issue => issue.severity === 'high').length || 0;
    
    // Calculate composite score (0-10 scale)
    // Weights: clarity (30%), feasibility (30%), structure (20%), accessibility (20%)
    // Penalties: -1 per critical issue, -0.5 per high issue
    const baseScore = (
      evaluation.clarityScore * 0.3 +
      evaluation.feasibilityScore * 0.3 +
      evaluation.structureScore * 0.2 +
      evaluation.accessibilityScore * 0.2
    );
    
    const penaltyScore = (criticalIssues * 1.0) + (highIssues * 0.5);
    const finalScore = Math.max(0, baseScore - penaltyScore);
    
    return {
      ...item,
      compositeScore: finalScore,
      penalty: penaltyScore,
      criticalIssues,
      highIssues
    };
  });

  // Sort by composite score (highest first)
  rankedSpecs.sort((a, b) => b.compositeScore - a.compositeScore);

  const bestSpec = rankedSpecs[0];
  const selectedSpec = bestSpec.spec;
  
  // Generate selection reasoning
  const reasoning = generateSelectionReason(bestSpec, rankedSpecs);

  return {
    selectedSpec,
    selectionReason: reasoning,
    ranking: rankedSpecs.map(({ spec, evaluation }) => ({ spec, evaluation }))
  };
}

function generateSelectionReason(
  selectedItem: {
    spec: FigmaSpec;
    evaluation: SpecEvaluationResult;
    compositeScore: number;
    criticalIssues: number;
    highIssues: number;
  },
  allItems: {
    spec: FigmaSpec;
    evaluation: SpecEvaluationResult;
    compositeScore: number;
    criticalIssues: number;
    highIssues: number;
  }[]
): string {
  const { spec, evaluation, compositeScore, criticalIssues } = selectedItem;
  
  const reasons: string[] = [];
  
  // Primary selection criteria
  reasons.push(`Selected "${spec.name}" with composite score of ${compositeScore.toFixed(1)}/10`);
  
  // Highlight best aspects
  if (evaluation.clarityScore >= 8) {
    reasons.push(`Excellent design clarity score (${evaluation.clarityScore}/10)`);
  }
  if (evaluation.feasibilityScore >= 8) {
    reasons.push(`High technical feasibility (${evaluation.feasibilityScore}/10)`);
  }
  if (criticalIssues === 0) {
    reasons.push('No critical issues identified');
  }
  if (evaluation.strengths?.length > 0) {
    reasons.push(`${evaluation.strengths.length} identified strengths`);
  }
  
  // Comparison context
  if (allItems.length > 1) {
    const secondBest = allItems[1];
    const scoreDiff = compositeScore - secondBest.compositeScore;
    if (scoreDiff > 1) {
      reasons.push(`Significantly outperformed other specs by ${scoreDiff.toFixed(1)} points`);
    } else {
      reasons.push('Best balance of clarity, feasibility, and low issue count');
    }
  }

  return reasons.join('. ') + '.';
}
