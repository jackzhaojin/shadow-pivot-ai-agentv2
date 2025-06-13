"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDesignConcepts = generateDesignConcepts;
const aiClient_1 = require("./aiClient");
async function generateDesignConcepts(brief) {
    var _a, _b;
    const systemPrompt = 'You are a UI design assistant. Return an array of short design concepts as JSON.';
    const response = await (0, aiClient_1.generateChatCompletion)([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: brief }
    ]);
    const content = ((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '';
    try {
        const data = JSON.parse(content);
        return Array.isArray(data) ? data : [content];
    }
    catch (_c) {
        return [content];
    }
}
