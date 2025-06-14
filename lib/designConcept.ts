import { generateChatCompletion } from './aiClient';
import { loadPromptTemplate, applyTemplate, validateResponse } from './promptUtils';
import path from 'path';

/**
 * Generates multiple design concepts based on the provided brief
 * Using a structured prompt template system for consistency and reliability
 */
export async function generateDesignConcepts(brief: string): Promise<string[]> {
  // Load the design concept template
  const templatePath = path.join('prompts', 'design-concepts', 'v1.json');
  const template = loadPromptTemplate(templatePath);
  
  // Apply variables to template
  const { systemPrompt, userPrompt, temperature } = applyTemplate(template, { brief });
  
  // Call the LLM with our structured prompt
  const response = await generateChatCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ], { temperature: temperature });

  const content = response.choices[0]?.message?.content || '';
  
  // Parse the response and validate against expected schema
  try {
    // Extract JSON from the response if it's wrapped in code blocks
    let jsonContent = content;
    
    // Clean up markdown code blocks if present
    const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
      jsonContent = codeBlockMatch[1].trim();
    }
    
    // Parse the JSON content
    const data = JSON.parse(jsonContent);
    
    // Validate the response against our expected format
    const validation = validateResponse(data, template);
    
    if (!validation.isValid) {
      console.error('Invalid response format:', validation.errors);
      // Return the best effort parsing if available, or fall back to single item array
      return Array.isArray(data) ? data : [content];
    }
    
    return validation.parsedResponse;
  } catch (error) {
    console.error('Failed to parse response:', error);
    console.log('Attempting alternative parsing methods...');
    
    try {
      // Check for array-like content without proper JSON syntax
      const arrayMatch = content.match(/\[\s*"([^"]+)"\s*(?:,\s*"([^"]+)"\s*)*\]/);
      if (arrayMatch) {
        // Try to fix and parse the array
        const fixedContent = content.replace(/'/g, '"').replace(/(\w+):/g, '"$1":');
        const data = JSON.parse(fixedContent);
        if (Array.isArray(data) && data.length >= 1) {
          return data;
        }
      }
      
      // Split by new lines as a last resort
      const lines = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.startsWith('```') && !line.includes('```'));
      
      if (lines.length >= 3) {
        // Clean up any bullet points or numbering
        const concepts = lines.map(line => 
          line.replace(/^[0-9-.\s]*|["']/g, '').trim()
        ).filter(line => line.length > 5);
        
        if (concepts.length >= 3) {
          return concepts;
        }
      }
    } catch (secondError) {
      console.error('Alternative parsing failed:', secondError);
    }
    
    // Fall back to returning the content as a single item
    return [content];
  }
}
