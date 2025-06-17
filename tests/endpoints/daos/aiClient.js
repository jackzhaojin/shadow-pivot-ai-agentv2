"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAIClient = getAIClient;
exports.generateChatCompletion = generateChatCompletion;
exports.generateText = generateText;
exports.testAIConnection = testAIConnection;
const openai_1 = require("openai");
const identity_1 = require("@azure/identity");
const debugLogger_1 = require("../utils/debugLogger");
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
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;
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
        // Enhanced error logging for debugging
        const errorInfo = {
            error,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            errorStack: error instanceof Error ? error.stack : undefined,
            errorType: (_l = error === null || error === void 0 ? void 0 : error.constructor) === null || _l === void 0 ? void 0 : _l.name,
            deployment: deploymentName,
            endpoint: process.env.AZURE_OPENAI_ENDPOINT
        };
        // Check for specific error types
        if (error && typeof error === 'object') {
            const errObj = error;
            // Rate limiting (429)
            if (errObj.status === 429 || errObj.code === 429 || (error instanceof Error && ((_m = error.message) === null || _m === void 0 ? void 0 : _m.includes('429')))) {
                const rateLimitInfo = Object.assign(Object.assign({}, errorInfo), { rateLimitDetails: {
                        status: errObj.status,
                        code: errObj.code,
                        retryAfter: (_o = errObj.headers) === null || _o === void 0 ? void 0 : _o['retry-after'],
                        retryAfterMs: (_p = errObj.headers) === null || _p === void 0 ? void 0 : _p['retry-after-ms'],
                        remainingRequests: (_q = errObj.headers) === null || _q === void 0 ? void 0 : _q['x-ratelimit-remaining-requests'],
                        remainingTokens: (_r = errObj.headers) === null || _r === void 0 ? void 0 : _r['x-ratelimit-remaining-tokens'],
                        errorBody: ((_s = errObj.response) === null || _s === void 0 ? void 0 : _s.data) || errObj.body,
                        fullErrorMessage: error instanceof Error ? error.message : 'Unknown error message'
                    } });
                (0, debugLogger_1.logError)('AI_CLIENT_RATE_LIMIT', 'Rate limit exceeded (429)', rateLimitInfo);
                console.error('🚫 generateChatCompletion - Rate limit exceeded (429):', rateLimitInfo);
            }
            // Other HTTP errors
            else if (errObj.status || ((_t = errObj.response) === null || _t === void 0 ? void 0 : _t.status)) {
                console.error('🌐 generateChatCompletion - HTTP error:', Object.assign(Object.assign({}, errorInfo), { httpDetails: {
                        status: errObj.status || ((_u = errObj.response) === null || _u === void 0 ? void 0 : _u.status),
                        statusText: errObj.statusText || ((_v = errObj.response) === null || _v === void 0 ? void 0 : _v.statusText),
                        headers: errObj.headers || ((_w = errObj.response) === null || _w === void 0 ? void 0 : _w.headers),
                        responseData: ((_x = errObj.response) === null || _x === void 0 ? void 0 : _x.data) || errObj.body,
                        url: ((_y = errObj.config) === null || _y === void 0 ? void 0 : _y.url) || errObj.url
                    } }));
            }
            // Network/connection errors
            else if (errObj.code === 'ENOTFOUND' || errObj.code === 'ECONNREFUSED' || errObj.code === 'ETIMEDOUT') {
                console.error('🔌 generateChatCompletion - Network error:', Object.assign(Object.assign({}, errorInfo), { networkDetails: {
                        code: errObj.code,
                        errno: errObj.errno,
                        hostname: errObj.hostname,
                        port: errObj.port,
                        address: errObj.address
                    } }));
            }
            // Generic structured error
            else {
                console.error('⚠️ generateChatCompletion - Structured error:', Object.assign(Object.assign({}, errorInfo), { additionalProps: {
                        status: errObj.status,
                        code: errObj.code,
                        type: errObj.type,
                        name: errObj.name,
                        message: errObj.message,
                        cause: errObj.cause
                    } }));
            }
        }
        else {
            // Simple error logging
            console.error('💥 generateChatCompletion - AI request failed:', errorInfo);
        }
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
