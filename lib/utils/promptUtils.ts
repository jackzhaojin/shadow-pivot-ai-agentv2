import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import Handlebars from 'handlebars';

// Define the structure for prompt templates
const promptTemplateSchema = z.object({
  version: z.string(),
  name: z.string(),
  systemPrompt: z.string(),
  responseFormat: z.object({
    type: z.string(),
    items: z.object({
      type: z.string(),
      description: z.string()
    }).optional(),
    properties: z.record(z.any()).optional(),
    minItems: z.number().optional(),
    maxItems: z.number().optional()
  }).optional(),
  examples: z.array(
    z.object({
      input: z.any(),
      output: z.any()
    })
  ).optional(),
  temperature: z.number().optional(),
  userPromptTemplate: z.string()
});

export type PromptTemplate = z.infer<typeof promptTemplateSchema>;

// Cache for loaded templates
const templateCache = new Map<string, PromptTemplate>();

/**
 * Load a prompt template from a JSON file
 */
export function loadPromptTemplate(templatePath: string): PromptTemplate {
  // Check if template is in cache
  if (templateCache.has(templatePath)) {
    return templateCache.get(templatePath)!;
  }

  // Load template file
  const absolutePath = path.resolve(process.cwd(), templatePath);
  const fileContent = fs.readFileSync(absolutePath, 'utf-8');
  const template = JSON.parse(fileContent);
  
  // Validate template structure
  const validatedTemplate = promptTemplateSchema.parse(template);
  
  // Cache the template
  templateCache.set(templatePath, validatedTemplate);
  
  return validatedTemplate;
}

/**
 * Apply variables to the template
 */
export function applyTemplate(template: PromptTemplate, variables: Record<string, unknown>): {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
} {
  const compiledTemplate = Handlebars.compile(template.userPromptTemplate);
  const userPrompt = compiledTemplate(variables);
  
  return {
    systemPrompt: template.systemPrompt,
    userPrompt,
    temperature: template.temperature
  };
}

/**
 * Validate response against expected schema
 */
export function validateResponse(response: unknown, template: PromptTemplate): {
  isValid: boolean;
  errors?: string[];
  parsedResponse?: unknown;
} {
  if (!template.responseFormat) {
    return { isValid: true, parsedResponse: response };
  }

  try {
    const { type, minItems, maxItems } = template.responseFormat;
    
    if (type === 'array') {
      if (!Array.isArray(response)) {
        return { 
          isValid: false, 
          errors: ['Response is not an array'] 
        };
      }
      
      if (minItems !== undefined && response.length < minItems) {
        return { 
          isValid: false, 
          errors: [`Response array must contain at least ${minItems} items, but got ${response.length}`] 
        };
      }
      
      if (maxItems !== undefined && response.length > maxItems) {
        return { 
          isValid: false, 
          errors: [`Response array must contain at most ${maxItems} items, but got ${response.length}`] 
        };
      }
    }
    
    return { isValid: true, parsedResponse: response };
  } catch (error) {
    return { 
      isValid: false, 
      errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`] 
    };
  }
}

/**
 * Format and extract error messages from validation errors
 */
export function formatValidationErrors(errors: string[]): string {
  return errors.join('\n');
}
