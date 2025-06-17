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
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const client = getAIClient();
    const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o-mini-deployment';
    console.log('🔗 generateChatCompletion - Making AI request:', {
        endpoint: process.env.AZURE_OPENAI_ENDPOINT || 'https://story-generation-v1.openai.azure.com/',
        deployment: deploymentName,
        messageCount: messages.length,
        systemPromptLength: ((_b = (_a = messages.find(m => m.role === 'system')) === null || _a === void 0 ? void 0 : _a.content) === null || _b === void 0 ? void 0 : _b.length) || 0,
        userPromptLength: ((_d = (_c = messages.find(m => m.role === 'user')) === null || _c === void 0 ? void 0 : _c.content) === null || _d === void 0 ? void 0 : _d.length) || 0,
        maxTokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7
    });
    try {
        const response = await client.chat.completions.create({
            model: deploymentName,
            messages,
            max_tokens: options.maxTokens || 1000,
            temperature: options.temperature || 0.7,
            top_p: options.topP || 1.0
        });
        console.log('✅ generateChatCompletion - AI response received:', {
            hasResponse: !!response,
            id: response.id,
            object: response.object,
            created: response.created,
            model: response.model,
            choicesCount: ((_e = response.choices) === null || _e === void 0 ? void 0 : _e.length) || 0,
            usagePromptTokens: (_f = response.usage) === null || _f === void 0 ? void 0 : _f.prompt_tokens,
            usageCompletionTokens: (_g = response.usage) === null || _g === void 0 ? void 0 : _g.completion_tokens,
            usageTotalTokens: (_h = response.usage) === null || _h === void 0 ? void 0 : _h.total_tokens,
            finishReason: (_k = (_j = response.choices) === null || _j === void 0 ? void 0 : _j[0]) === null || _k === void 0 ? void 0 : _k.finish_reason
        });
        return response;
    }
    catch (error) {
        console.error('💥 generateChatCompletion - AI request failed:', {
            error,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            errorStack: error instanceof Error ? error.stack : undefined,
            deployment: deploymentName,
            endpoint: process.env.AZURE_OPENAI_ENDPOINT
        });
        throw error;
    }
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
