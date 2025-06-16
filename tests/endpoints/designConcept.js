"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDesignConcepts = generateDesignConcepts;
const aiClient_1 = require("../daos/aiClient");
const promptUtils_1 = require("../utils/promptUtils");
const path_1 = __importDefault(require("path"));
/**
 * Generates multiple design concepts based on the provided brief
 * Using a structured prompt template system for consistency and reliability
 */
async function generateDesignConcepts(brief) {
    var _a, _b;
    // Load the design concept template
    const templatePath = path_1.default.join('prompts', 'design-concepts', 'v1.json');
    const template = (0, promptUtils_1.loadPromptTemplate)(templatePath);
    // Apply variables to template
    const { systemPrompt, userPrompt, temperature } = (0, promptUtils_1.applyTemplate)(template, { brief });
    // Call the LLM with our structured prompt
    const response = await (0, aiClient_1.generateChatCompletion)([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
    ], { temperature: temperature });
    const content = ((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '';
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
        const validation = (0, promptUtils_1.validateResponse)(data, template);
        if (!validation.isValid) {
            console.error('Invalid response format:', validation.errors);
            // Return the best effort parsing if available, or fall back to single item array
            return Array.isArray(data) ? data : [content];
        }
        return validation.parsedResponse;
    }
    catch (error) {
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
                const concepts = lines.map(line => line.replace(/^[0-9-.\s]*|["']/g, '').trim()).filter(line => line.length > 5);
                if (concepts.length >= 3) {
                    return concepts;
                }
            }
        }
        catch (secondError) {
            console.error('Alternative parsing failed:', secondError);
        }
        // Fall back to returning the content as a single item
        return [content];
    }
}
