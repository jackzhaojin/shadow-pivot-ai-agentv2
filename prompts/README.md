# Prompt Engineering System

This directory contains structured, versioned prompt templates for the AI agent pipeline. The system is designed to be maintainable, testable, and allow for prompt optimization without touching business logic.

## Structure

```
prompts/
├── design-concepts/        # Templates for design concept generation
│   ├── v1.json            # Version 1 of the design concepts prompts
│   └── v2.json            # Future iterative improvements
├── design-evaluation/      # Templates for design evaluation
│   └── v1.json            # Current design evaluation prompt
├── spec-selection/         # Templates for specification selection
├── figma-generation/       # Templates for generating Figma specs
└── code-generation/        # Templates for code generation
```

## Template Format

Each template is a JSON file with the following structure:

```json
{
  "version": "1.0",
  "name": "template-name",
  "systemPrompt": "System prompt that sets the context for the AI",
  "responseFormat": {
    // Schema definition for expected response format
  },
  "examples": [
    {
      "input": "Example input",
      "output": "Example expected output"
    }
  ],
  "temperature": 0.7,
  "userPromptTemplate": "Template with {{variables}} for substitution"
}
```

## Usage

Templates are loaded and used via the `promptUtils.ts` utility functions:

```typescript
import { loadPromptTemplate, applyTemplate, validateResponse } from '../lib/promptUtils';

// Load template
const template = loadPromptTemplate('prompts/design-concepts/v1.json');

// Apply variables
const { systemPrompt, userPrompt, temperature } = applyTemplate(template, { 
  brief: "User input prompt" 
});

// Call the LLM
const response = await generateChatCompletion([
  { role: 'system', content: systemPrompt },
  { role: 'user', content: userPrompt }
], { temperature });

// Validate response against schema
const validation = validateResponse(parsedResponse, template);
if (validation.isValid) {
  return validation.parsedResponse;
}
```

## Testing

Each template has associated tests to verify correct loading, variable substitution, and response validation. Run tests with:

```
npm run test:design-concepts
npm run test:design-evaluation
```

## Best Practices

- Use versioning (v1, v2) to track prompt iterations
- Include examples for few-shot learning where appropriate
- Define response formats with clear schema validation
- Set appropriate temperature based on the task (lower for structured tasks)
- Use variable substitution with handlebars syntax {{variable}}
