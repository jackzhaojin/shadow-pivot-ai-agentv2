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
    required: z.array(z.string()).optional(),
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
    const { type, minItems, maxItems, properties, required } = template.responseFormat;
    const errors: string[] = [];
    
    if (type === 'array') {
      if (!Array.isArray(response)) {
        return { 
          isValid: false, 
          errors: ['Response is not an array'] 
        };
      }
      
      if (minItems !== undefined && response.length < minItems) {
        errors.push(`Response array must contain at least ${minItems} items, but got ${response.length}`);
      }
      
      if (maxItems !== undefined && response.length > maxItems) {
        errors.push(`Response array must contain at most ${maxItems} items, but got ${response.length}`);
      }
    } else if (type === 'object') {
      if (!response || typeof response !== 'object' || Array.isArray(response)) {
        return {
          isValid: false,
          errors: ['Response is not an object']
        };
      }
      
      // Check required fields
      if (required && Array.isArray(required)) {
        const responseObj = response as Record<string, unknown>;
        for (const field of required) {
          if (!(field in responseObj) || responseObj[field] === null || responseObj[field] === undefined) {
            errors.push(`Required field '${field}' is missing`);
          } else if (typeof responseObj[field] === 'string' && (responseObj[field] as string).trim() === '') {
            errors.push(`Required field '${field}' is empty`);
          }
        }
      }
      
      // Validate property types if specified
      if (properties) {
        const responseObj = response as Record<string, unknown>;
        for (const [fieldName, fieldSpec] of Object.entries(properties)) {
          if (fieldName in responseObj) {
            const fieldValue = responseObj[fieldName];
            if (typeof fieldSpec === 'object' && fieldSpec && 'type' in fieldSpec) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const expectedType = (fieldSpec as any).type;
              if (expectedType === 'array' && !Array.isArray(fieldValue)) {
                errors.push(`Field '${fieldName}' should be an array`);
              } else if (expectedType === 'string' && typeof fieldValue !== 'string') {
                errors.push(`Field '${fieldName}' should be a string`);
              } else if (expectedType === 'array' && Array.isArray(fieldValue)) {
                // Check minItems for array fields
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const arraySpec = fieldSpec as any;
                if (arraySpec.minItems !== undefined && fieldValue.length < arraySpec.minItems) {
                  errors.push(`Field '${fieldName}' must contain at least ${arraySpec.minItems} items`);
                }
              }
            }
          }
        }
      }
    }
    
    if (errors.length > 0) {
      return { isValid: false, errors };
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
