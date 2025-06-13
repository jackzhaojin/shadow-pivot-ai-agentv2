import { generateChatCompletion } from './aiClient';

export async function generateDesignConcepts(brief: string): Promise<string[]> {
  const systemPrompt = 'You are a UI design assistant. Return an array of short design concepts as JSON.';
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
