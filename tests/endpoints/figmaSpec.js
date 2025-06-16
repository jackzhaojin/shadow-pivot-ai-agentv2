"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFigmaSpec = generateFigmaSpec;
exports.generateFigmaSpecs = generateFigmaSpecs;
const aiClient_1 = require("../daos/aiClient");
const promptUtils_1 = require("../utils/promptUtils");
const path_1 = __importDefault(require("path"));
async function generateFigmaSpec(concept, brief = 'Design a UI component') {
    var _a, _b;
    const templatePath = path_1.default.join('prompts', 'figma-spec-generation', 'v1.json');
    const template = (0, promptUtils_1.loadPromptTemplate)(templatePath);
    const { systemPrompt, userPrompt, temperature } = (0, promptUtils_1.applyTemplate)(template, { concept, brief });
    try {
        const response = await (0, aiClient_1.generateChatCompletion)([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ], { temperature });
        const content = ((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '';
        let jsonContent = content;
        const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (match && match[1]) {
            jsonContent = match[1].trim();
        }
        const data = JSON.parse(jsonContent);
        const validation = (0, promptUtils_1.validateResponse)(data, template);
        if (validation.isValid) {
            return validation.parsedResponse;
        }
        console.error('Invalid figma spec format:', validation.errors);
        return data;
    }
    catch (err) {
        console.error('Failed to generate figma spec:', err);
        return {
            name: concept,
            description: 'Fallback spec',
            components: []
        };
    }
}
async function generateFigmaSpecs(concept, count = 3, brief) {
    const specs = [];
    for (let i = 0; i < count; i++) {
        specs.push(await generateFigmaSpec(concept, brief));
    }
    return specs;
}
