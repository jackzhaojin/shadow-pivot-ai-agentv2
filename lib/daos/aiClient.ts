import { AzureOpenAI } from 'openai';
import { DefaultAzureCredential } from '@azure/identity';
import { logError } from '../utils/debugLogger';

export function getAIClient() {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT || 'https://story-generation-v1.openai.azure.com/';
  const credential = new DefaultAzureCredential();

  return new AzureOpenAI({
    endpoint: endpoint,
    apiVersion: '2024-02-01',
    azureADTokenProvider: async () => {
      const token = await credential.getToken('https://cognitiveservices.azure.com/.default');
      return token?.token || '';
    }
  });
}

// Utility functions for common AI operations
export async function generateChatCompletion(
  messages: Array<{ role: 'user' | 'assistant' | 'system', content: string }>,
  options: {
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    retryAttempts?: number;
    retryDelay?: number;
  } = {}
) {
  const client = getAIClient();
  const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o-mini-deployment';
  const retryAttempts = options.retryAttempts || 3;
  const baseRetryDelay = options.retryDelay || 1000;
  
  console.log('🔗 generateChatCompletion - Making AI request:', {
    endpoint: process.env.AZURE_OPENAI_ENDPOINT || 'https://story-generation-v1.openai.azure.com/',
    deployment: deploymentName,
    messageCount: messages.length,
    systemPromptLength: messages.find(m => m.role === 'system')?.content?.length || 0,
    userPromptLength: messages.find(m => m.role === 'user')?.content?.length || 0,
    maxTokens: options.maxTokens || 1000,
    temperature: options.temperature || 0.7,
    retryAttempts
  });
  
  for (let attempt = 1; attempt <= retryAttempts; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model: deploymentName,
        messages,
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7,
        top_p: options.topP || 1.0
      });
      
      console.log('✅ generateChatCompletion - AI response received:', {
        attempt,
        hasResponse: !!response,
        id: response.id,
        object: response.object,
        created: response.created,
        model: response.model,
        choicesCount: response.choices?.length || 0,
        usagePromptTokens: response.usage?.prompt_tokens,
        usageCompletionTokens: response.usage?.completion_tokens,
        usageTotalTokens: response.usage?.total_tokens,
        finishReason: response.choices?.[0]?.finish_reason
      });
      
      return response;
    } catch (error) {      // Check for rate limiting (429) and handle retries
      if (error && typeof error === 'object') {
        const errObj = error as {
          status?: number;
          code?: number | string;
          message?: string;
          headers?: Record<string, string>;
          response?: {
            status?: number;
            statusText?: string;
            headers?: Record<string, string>;
            data?: unknown;
          };
        };
        
        // Rate limiting (429) - retry with exponential backoff
        if (errObj.status === 429 || errObj.code === 429 || (error instanceof Error && error.message?.includes('429'))) {
          const retryAfter = errObj.headers?.['retry-after'] || errObj.response?.headers?.['retry-after'];
          const retryDelay = retryAfter ? parseInt(retryAfter) * 1000 : baseRetryDelay * Math.pow(2, attempt - 1);
          
          logError('AI_CLIENT_RATE_LIMIT', `Rate limit exceeded (429) - Attempt ${attempt}/${retryAttempts}`, {
            attempt,
            maxAttempts: retryAttempts,
            retryDelay,
            retryAfter,
            status: errObj.status,
            code: errObj.code,
            remainingRequests: errObj.headers?.['x-ratelimit-remaining-requests'],
            remainingTokens: errObj.headers?.['x-ratelimit-remaining-tokens']
          });
          
          console.error(`🚫 generateChatCompletion - Rate limit exceeded (429) - Attempt ${attempt}/${retryAttempts}:`, {
            retryDelay,
            retryAfter,
            willRetry: attempt < retryAttempts
          });
          
          if (attempt < retryAttempts) {
            console.log(`⏳ Waiting ${retryDelay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            continue; // Retry the request
          }
        }
      }

      // Enhanced error logging for debugging
      const errorInfo = {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        errorType: error?.constructor?.name,
        deployment: deploymentName,
        endpoint: process.env.AZURE_OPENAI_ENDPOINT,
        attempt
      };

      // Check for specific error types
      if (error && typeof error === 'object') {
        const errObj = error as {
          status?: number;
          code?: number | string;
          message?: string;
          headers?: Record<string, string>;
          response?: {
            status?: number;
            statusText?: string;
            headers?: Record<string, string>;
            data?: unknown;
          };
          body?: unknown;
          statusText?: string;
          config?: { url?: string };
          url?: string;
          errno?: number;
          hostname?: string;
          port?: number;
          address?: string;
          type?: string;
          name?: string;
          cause?: unknown;
        };
      
      // Rate limiting (429)
      if (errObj.status === 429 || errObj.code === 429 || (error instanceof Error && error.message?.includes('429'))) {
        const rateLimitInfo = {
          ...errorInfo,
          rateLimitDetails: {
            status: errObj.status,
            code: errObj.code,
            retryAfter: errObj.headers?.['retry-after'],
            retryAfterMs: errObj.headers?.['retry-after-ms'],
            remainingRequests: errObj.headers?.['x-ratelimit-remaining-requests'],
            remainingTokens: errObj.headers?.['x-ratelimit-remaining-tokens'],
            errorBody: errObj.response?.data || errObj.body,
            fullErrorMessage: error instanceof Error ? error.message : 'Unknown error message'
          }
        };
        
        logError('AI_CLIENT_RATE_LIMIT', 'Rate limit exceeded (429)', rateLimitInfo);
        console.error('🚫 generateChatCompletion - Rate limit exceeded (429):', rateLimitInfo);
        
        // If this was the last attempt or not a retryable error, throw the error
        if (attempt === retryAttempts) {
          // Log final error before throwing
          if (errObj.status === 429 || errObj.code === 429) {
            console.error('💥 generateChatCompletion - All retry attempts exhausted for rate limit');
          }
          throw error;
        }
      }
      // Other HTTP errors
      else if (errObj.status || errObj.response?.status) {
        console.error('🌐 generateChatCompletion - HTTP error:', {
          ...errorInfo,
          httpDetails: {
            status: errObj.status || errObj.response?.status,
            statusText: errObj.statusText || errObj.response?.statusText,
            headers: errObj.headers || errObj.response?.headers,
            responseData: errObj.response?.data || errObj.body,
            url: errObj.config?.url || errObj.url
          }
        });
        throw error;
      }
      // Network/connection errors
      else if (errObj.code === 'ENOTFOUND' || errObj.code === 'ECONNREFUSED' || errObj.code === 'ETIMEDOUT') {
        console.error('🔌 generateChatCompletion - Network error:', {
          ...errorInfo,
          networkDetails: {
            code: errObj.code,
            errno: errObj.errno,
            hostname: errObj.hostname,
            port: errObj.port,
            address: errObj.address
          }
        });
        throw error;
      }
      // Generic structured error
      else {
        console.error('⚠️ generateChatCompletion - Structured error:', {
          ...errorInfo,
          additionalProps: {
            status: errObj.status,
            code: errObj.code,
            type: errObj.type,
            name: errObj.name,
            message: errObj.message,
            cause: errObj.cause
          }
        });
        throw error;
      }
    } else {
      // Simple error logging
      console.error('💥 generateChatCompletion - AI request failed:', errorInfo);
      throw error;
    }
    }
  }
  
  // If we reach here, all retries failed
  throw new Error(`AI request failed after ${retryAttempts} attempts`);
}

export async function generateText(
  prompt: string,
  options: {
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
  } = {}
) {
  const messages = [];
  
  if (options.systemPrompt) {
    messages.push({ role: 'system' as const, content: options.systemPrompt });
  }
  
  messages.push({ role: 'user' as const, content: prompt });
  
  const response = await generateChatCompletion(messages, {
    maxTokens: options.maxTokens,
    temperature: options.temperature
  });
  
  return response.choices[0]?.message?.content || '';
}

// Test function for AI connectivity
export async function testAIConnection(): Promise<{ success: boolean; response?: string; error?: string }> {
  try {
    const response = await generateText('Say "Hello" in one word', { maxTokens: 5 });
    return { success: true, response };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
