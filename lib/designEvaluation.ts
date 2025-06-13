import { generateChatCompletion } from './aiClient';

export interface DesignEvaluationResult {
  concept: string;
  score: number;
  reason?: string;
}

export async function evaluateDesigns(concepts: string[]): Promise<DesignEvaluationResult[]> {
  const systemPrompt = 'You are a UI design evaluator. Return a JSON array of {"concept":"...","score":number,"reason":"short explanation"} objects sorted by score descending.';
  const userPrompt = concepts.map((c, i) => `${i + 1}. ${c}`).join('\n');
  const response = await generateChatCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Evaluate the following design concepts:\n${userPrompt}` }
  ]);

  const content = response.choices[0]?.message?.content || '';
  try {
    const data = JSON.parse(content);
    if (Array.isArray(data)) {
      return data.map((d: unknown) => {
        const obj = d as { concept?: unknown; score?: unknown; reason?: unknown };
        return {
          concept: String(obj.concept),
          score: Number(obj.score),
          reason: obj.reason ? String(obj.reason) : undefined
        };
      });
    }
  } catch {
    // ignore parse errors
  }
  return concepts.map(c => ({ concept: c, score: 0 }));
}
