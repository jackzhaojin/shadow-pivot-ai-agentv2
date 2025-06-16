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
    
    if (!content) {
      throw new Error('Empty response from AI service');
    }
    
    let jsonContent = content;
    const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match && match[1]) {
      jsonContent = match[1].trim();
    }
    
    let data: FigmaSpec;
    try {
      data = JSON.parse(jsonContent) as FigmaSpec;
    } catch {
      console.error('Failed to parse JSON response:', jsonContent);
      throw new Error('Invalid JSON response from AI service');
    }
    
    const validation = validateResponse(data, template);
    if (validation.isValid) {
      return validation.parsedResponse as FigmaSpec;
    }
    
    console.warn('Invalid figma spec format, using fallback:', validation.errors);
    // Ensure we return a valid spec even if validation fails
    return {
      name: data.name || concept,
      description: data.description || 'Generated Figma specification',
      components: Array.isArray(data.components) ? data.components : ['Component 1', 'Component 2']
    };
  } catch (err) {
    console.error('Failed to generate figma spec:', err);
    // Return a structured fallback instead of minimal data
    return {
      name: concept,
      description: `Fallback spec for ${concept} - AI generation failed`,
      components: ['Main container', 'Content area', 'Action buttons']
    };
  }
}

export async function generateFigmaSpecs(concept: string, count = 3, brief?: string): Promise<FigmaSpec[]> {
  // Execute all spec generations in parallel for better performance
  const promises = Array.from({ length: count }, () => generateFigmaSpec(concept, brief));
  try {
    return await Promise.all(promises);
  } catch (error) {
    console.error('Error in parallel figma spec generation:', error);
    // Return partial results with fallbacks for failed generations
    const results = await Promise.allSettled(promises);
    return results.map((result, index) => 
      result.status === 'fulfilled' 
        ? result.value 
        : {
            name: `${concept} - Spec ${index + 1}`,
            description: 'Failed to generate - fallback spec',
            components: ['Error placeholder']
          }
    );
  }
}
