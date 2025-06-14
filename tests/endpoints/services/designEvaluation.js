"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateDesigns = evaluateDesigns;
const aiClient_1 = require("../daos/aiClient");
async function evaluateDesigns(concepts, brief) {
    var _a, _b;
    // If there's only one or no concepts, return basic result
    if (concepts.length <= 1) {
        return concepts.map(c => ({ concept: c, score: 10, reason: "Single concept evaluation" }));
    }
    // More flexible format to handle different AI responses
    const systemPrompt = `You are a UI design evaluator. Evaluate the provided design concepts based on usability, aesthetics, innovation, and feasibility.
For each concept, assign scores from 1-10 for each criterion, calculate a total score, and provide reasoning.
Return a JSON object with an "evaluations" array containing objects with:
- "conceptIndex" (0-based index of the concept)
- "totalScore" (weighted sum of scores)
- "reasoning" (brief explanation)`;
    // Build a user prompt that's more explicit and easier to parse
    const userPrompt = `Design brief: ${brief || 'Design a user interface'}\n\nConcepts to evaluate:\n` +
        concepts.map((c, i) => `[${i}] ${c}`).join('\n') +
        `\n\nEvaluate each concept with scores from 1-10 and provide brief reasoning. Return your evaluation as a JSON object.`;
    // Call the LLM with our prompt
    const response = await (0, aiClient_1.generateChatCompletion)([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
    ], { temperature: 0.5 });
    const content = ((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '';
    try {
        // Extract JSON from the response if it's wrapped in code blocks
        let jsonContent = content;
        // Clean up markdown code blocks if present
        const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch && codeBlockMatch[1]) {
            jsonContent = codeBlockMatch[1].trim();
        }
        // Parse the evaluation data
        const evaluationData = JSON.parse(jsonContent);
        // Handle different response formats
        let evaluations = [];
        if (Array.isArray(evaluationData)) {
            // Handle array format (old format or direct array of evaluations)
            evaluations = evaluationData.map((item, index) => {
                // Extract concept and scores
                const conceptIndex = 'conceptIndex' in item ? item.conceptIndex : index;
                const totalScore = 'score' in item ? item.score : ('totalScore' in item ? item.totalScore : 5);
                const reasoning = 'reason' in item ? item.reason : ('reasoning' in item ? item.reasoning : 'No reasoning provided');
                return {
                    conceptIndex,
                    totalScore,
                    reasoning
                };
            });
        }
        else if (evaluationData.evaluations && Array.isArray(evaluationData.evaluations)) {
            // Handle object with evaluations array (new format)
            evaluations = evaluationData.evaluations;
        }
        else {
            // Fall back to creating basic evaluations
            evaluations = concepts.map((_, index) => ({
                conceptIndex: index,
                totalScore: 5 + Math.random() * 3, // Random score between 5-8
                reasoning: 'Auto-generated evaluation'
            }));
        }
        // Convert to our result format
        return evaluations.map((evaluation) => {
            const conceptIndex = typeof evaluation.conceptIndex === 'number' ? evaluation.conceptIndex : 0;
            const concept = concepts[conceptIndex] || concepts[0] || '';
            return {
                concept,
                score: Number(evaluation.totalScore) || 5,
                reason: evaluation.reasoning || 'No reasoning provided'
            };
        }).sort((a, b) => b.score - a.score); // Sort by score descending
    }
    catch (error) {
        console.error('Failed to parse evaluation response:', error);
        // Try a simpler parsing approach as fallback
        try {
            // Look for any score-like patterns in the text
            const scoreMatches = content.match(/score[^\d]*(\d+)[^\d]*/gi);
            if (scoreMatches && scoreMatches.length >= concepts.length) {
                return concepts.map((concept, i) => {
                    const scoreMatch = scoreMatches[i].match(/(\d+)/);
                    const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 5;
                    return { concept, score, reason: 'Extracted from text response' };
                });
            }
        }
        catch (_c) {
            // Ignore secondary parsing errors
        }
        // Ultimate fallback with non-zero scores
        return concepts.map((c, i) => ({
            concept: c,
            score: 5 + (concepts.length - i) * 0.5, // Descending scores starting from 5
            reason: 'Fallback evaluation'
        }));
    }
}
