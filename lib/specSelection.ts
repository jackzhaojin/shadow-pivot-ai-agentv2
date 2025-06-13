export interface Evaluation {
  concept: string;
  score: number;
  reason?: string;
}

export function selectBestDesignConcept(evaluations: Evaluation[]): string {
  if (evaluations.length === 0) return '';
  return evaluations.reduce((best, curr) =>
    curr.score > best.score ? curr : best
  ).concept;
}
