"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAIClient = getAIClient;
exports.generateChatCompletion = generateChatCompletion;
exports.generateText = generateText;
exports.testAIConnection = testAIConnection;
const openai_1 = require("openai");
const identity_1 = require("@azure/identity");
function getAIClient() {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT || 'https://story-generation-v1.openai.azure.com/';
    const credential = new identity_1.DefaultAzureCredential();
    return new openai_1.AzureOpenAI({
        endpoint: endpoint,
        apiVersion: '2024-02-01',
        azureADTokenProvider: async () => {
            const token = await credential.getToken('https://cognitiveservices.azure.com/.default');
            return (token === null || token === void 0 ? void 0 : token.token) || '';
        }
    });
}
// Utility functions for common AI operations
async function generateChatCompletion(messages, options = {}) {
    const client = getAIClient();
    const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o-mini-deployment';
    return await client.chat.completions.create({
        model: deploymentName,
        messages,
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7,
        top_p: options.topP || 1.0
    });
}
async function generateText(prompt, options = {}) {
    var _a, _b;
    const messages = [];
    if (options.systemPrompt) {
        messages.push({ role: 'system', content: options.systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });
    const response = await generateChatCompletion(messages, {
        maxTokens: options.maxTokens,
        temperature: options.temperature
    });
    return ((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '';
}
// Test function for AI connectivity
async function testAIConnection() {
    try {
        const response = await generateText('Say "Hello" in one word', { maxTokens: 5 });
        return { success: true, response };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}
