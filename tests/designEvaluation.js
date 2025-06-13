"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateDesigns = evaluateDesigns;
const aiClient_1 = require("./aiClient");
async function evaluateDesigns(concepts) {
    var _a, _b;
    const systemPrompt = 'You are a UI design evaluator. Return a JSON array of {"concept":"...","score":number,"reason":"short explanation"} objects sorted by score descending.';
    const userPrompt = concepts.map((c, i) => `${i + 1}. ${c}`).join('\n');
    const response = await (0, aiClient_1.generateChatCompletion)([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Evaluate the following design concepts:\n${userPrompt}` }
    ]);
    const content = ((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '';
    try {
        const data = JSON.parse(content);
        if (Array.isArray(data)) {
            return data.map((d) => {
                const obj = d;
                return {
                    concept: String(obj.concept),
                    score: Number(obj.score),
                    reason: obj.reason ? String(obj.reason) : undefined
                };
            });
        }
    }
    catch (_c) {
        // ignore parse errors
    }
    return concepts.map(c => ({ concept: c, score: 0 }));
}
