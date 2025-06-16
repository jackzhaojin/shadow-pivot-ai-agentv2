import path from 'path';
import { generateChatCompletion } from '../daos/aiClient';
import { loadPromptTemplate, applyTemplate, validateResponse } from '../utils/promptUtils';

export interface DesignEvaluationResult {
  concept: string;
  score: number;
  reason?: string;
}

export interface EvaluationResponse {
  evaluations: Array<{
    conceptIndex: number;
    scores: {
      usability: number;
      aesthetics: number;
      innovation: number;
      feasibility: number;
    };
    totalScore: number;
    reasoning: string;
  }>;
  weights: {
    usability: number;
    aesthetics: number;
    innovation: number;
    feasibility: number;
  };
}

export async function evaluateDesigns(concepts: string[], brief = 'Design a user interface'): Promise<DesignEvaluationResult[]> {
  if (concepts.length <= 1) {
    return concepts.map(c => ({ concept: c, score: 10, reason: 'Single concept evaluation' }));
  }

  const templatePath = path.join('prompts', 'design-evaluation', 'v1.json');
  const template = loadPromptTemplate(templatePath);
  const { systemPrompt, userPrompt, temperature } = applyTemplate(template, { concepts, brief });

  try {
    const response = await generateChatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      { temperature }
    );
    const content = response.choices[0]?.message?.content || '';
    let jsonContent = content;
    const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match && match[1]) {
      jsonContent = match[1].trim();
    }
    const data = JSON.parse(jsonContent);
    const validation = validateResponse(data, template);
    if (validation.isValid) {
      const parsed = validation.parsedResponse as Partial<EvaluationResponse>;
      if (parsed && Array.isArray(parsed.evaluations)) {
        return parsed.evaluations
          .map(ev => ({
            concept: concepts[ev.conceptIndex] ?? concepts[0],
            score: ev.totalScore,
            reason: ev.reasoning
          }))
          .sort((a, b) => b.score - a.score);
      }
      console.error('Parsed evaluation missing evaluations array:', parsed);
    } else {
      console.error('Invalid evaluation format:', validation.errors);
    }
  } catch (err) {
    console.error('Failed to generate design evaluations:', err);
  }

  return concepts.map((c, i) => ({
    concept: c,
    score: 5 + (concepts.length - i) * 0.5,
    reason: 'Fallback evaluation'
  }));
}
