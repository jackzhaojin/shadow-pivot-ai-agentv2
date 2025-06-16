import { generateChatCompletion } from '../daos/aiClient';
import { loadPromptTemplate, applyTemplate, validateResponse } from '../utils/promptUtils';
import path from 'path';

export interface FigmaSpec {
  name: string;
  description: string;
  components: string[];
}

export async function generateFigmaSpec(concept: string, brief = 'Design a UI component'): Promise<FigmaSpec> {
  const templatePath = path.join('prompts', 'figma-spec-generation', 'v1.json');
  const template = loadPromptTemplate(templatePath);
  const { systemPrompt, userPrompt, temperature } = applyTemplate(template, { concept, brief });

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
      return validation.parsedResponse as FigmaSpec;
    }
    console.error('Invalid figma spec format:', validation.errors);
    return data as FigmaSpec;
  } catch (err) {
    console.error('Failed to generate figma spec:', err);
    return {
      name: concept,
      description: 'Fallback spec',
      components: []
    };
  }
}

export async function generateFigmaSpecs(concept: string, count = 3, brief?: string): Promise<FigmaSpec[]> {
  const specs: FigmaSpec[] = [];
  for (let i = 0; i < count; i++) {
    specs.push(await generateFigmaSpec(concept, brief));
  }
  return specs;
}
