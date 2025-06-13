import { generateChatCompletion } from './aiClient';

export async function generateDesignConcepts(brief: string): Promise<string[]> {
  const systemPrompt =
    'You are a UI design assistant. Return three to five short design concepts as a JSON array of strings. Each concept should be a concise, one sentence idea.';
  const response = await generateChatCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: brief }
  ]);

  const content = response.choices[0]?.message?.content || '';
  try {
    const data = JSON.parse(content);
    return Array.isArray(data) ? data : [content];
  } catch {
    return [content];
  }
}
