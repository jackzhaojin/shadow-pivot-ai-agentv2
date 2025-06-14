"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadPromptTemplate = loadPromptTemplate;
exports.applyTemplate = applyTemplate;
exports.validateResponse = validateResponse;
exports.formatValidationErrors = formatValidationErrors;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const zod_1 = require("zod");
const handlebars_1 = __importDefault(require("handlebars"));
// Define the structure for prompt templates
const promptTemplateSchema = zod_1.z.object({
    version: zod_1.z.string(),
    name: zod_1.z.string(),
    systemPrompt: zod_1.z.string(),
    responseFormat: zod_1.z.object({
        type: zod_1.z.string(),
        items: zod_1.z.object({
            type: zod_1.z.string(),
            description: zod_1.z.string()
        }).optional(),
        properties: zod_1.z.record(zod_1.z.any()).optional(),
        minItems: zod_1.z.number().optional(),
        maxItems: zod_1.z.number().optional()
    }).optional(),
    examples: zod_1.z.array(zod_1.z.object({
        input: zod_1.z.any(),
        output: zod_1.z.any()
    })).optional(),
    temperature: zod_1.z.number().optional(),
    userPromptTemplate: zod_1.z.string()
});
// Cache for loaded templates
const templateCache = new Map();
/**
 * Load a prompt template from a JSON file
 */
function loadPromptTemplate(templatePath) {
    // Check if template is in cache
    if (templateCache.has(templatePath)) {
        return templateCache.get(templatePath);
    }
    // Load template file
    const absolutePath = path_1.default.resolve(process.cwd(), templatePath);
    const fileContent = fs_1.default.readFileSync(absolutePath, 'utf-8');
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
function applyTemplate(template, variables) {
    const compiledTemplate = handlebars_1.default.compile(template.userPromptTemplate);
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
function validateResponse(response, template) {
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
    }
    catch (error) {
        return {
            isValid: false,
            errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`]
        };
    }
}
/**
 * Format and extract error messages from validation errors
 */
function formatValidationErrors(errors) {
    return errors.join('\n');
}
