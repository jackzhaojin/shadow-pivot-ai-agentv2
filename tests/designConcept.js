"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDesignConcepts = void 0;
const aiClient_1 = require("./aiClient");
async function generateDesignConcepts(brief) {
    const systemPrompt = 'You are a UI design assistant. Return an array of short design concepts as JSON.';
    const response = await (0, aiClient_1.generateChatCompletion)([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: brief }
    ]);
    const content = response.choices[0]?.message?.content || '';
    try {
        const data = JSON.parse(content);
        return Array.isArray(data) ? data : [content];
    }
    catch (_a) {
        return [content];
    }
}
exports.generateDesignConcepts = generateDesignConcepts;
