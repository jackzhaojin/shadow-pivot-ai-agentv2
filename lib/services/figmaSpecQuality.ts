import path from 'path';
import { generateChatCompletion } from '../daos/aiClient';
import { loadPromptTemplate, applyTemplate, validateResponse } from '../utils/promptUtils';
import type { FigmaSpec } from './figmaSpec';

export interface FigmaSpecQuality {
  clarity: number;
  structure: number;
  feasibility: number;
  score: number;
  notes?: string;
}

export async function testFigmaSpec(spec: FigmaSpec, brief = ''): Promise<FigmaSpecQuality> {
  const templatePath = path.join('prompts', 'figma-spec-testing', 'v1.json');
  let template;
  try {
    template = loadPromptTemplate(templatePath);
  } catch (err) {
    console.error('Failed to load template for figma spec testing:', err);
  }

  if (template) {
    try {
      const { systemPrompt, userPrompt, temperature } = applyTemplate(template, {
        spec: JSON.stringify(spec, null, 2),
        brief
      });
      const response = await generateChatCompletion(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        { temperature }
      );
      const content = response.choices[0]?.message?.content || '';
      let jsonContent = content;
      const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch && codeBlockMatch[1]) {
        jsonContent = codeBlockMatch[1].trim();
      } else {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonContent = jsonMatch[0].trim();
        }
      }
      const data = JSON.parse(jsonContent);
      const validation = validateResponse(data, template);
      if (validation.isValid) {
        return validation.parsedResponse as FigmaSpecQuality;
      }
      console.warn('Validation failed for figma spec quality:', validation.errors);
    } catch (err) {
      console.error('Error testing figma spec with AI:', err);
    }
  }

  const base = Math.min(10, Math.max(3, spec.components?.length || 0));
  return {
    clarity: base,
    structure: base,
    feasibility: base,
    score: base,
    notes: 'Fallback score'
  };
}

export async function testFigmaSpecs(specs: FigmaSpec[], brief = ''): Promise<FigmaSpecQuality[]> {
  const results = await Promise.all(specs.map(s => testFigmaSpec(s, brief)));
  return results;
}
