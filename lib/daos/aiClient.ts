import { AzureOpenAI } from 'openai';
import { DefaultAzureCredential } from '@azure/identity';

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
  } = {}
) {
  const client = getAIClient();
  const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o-mini-deployment';
  
  console.log('🔗 generateChatCompletion - Making AI request:', {
    endpoint: process.env.AZURE_OPENAI_ENDPOINT || 'https://story-generation-v1.openai.azure.com/',
    deployment: deploymentName,
    messageCount: messages.length,
    systemPromptLength: messages.find(m => m.role === 'system')?.content?.length || 0,
    userPromptLength: messages.find(m => m.role === 'user')?.content?.length || 0,
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
      choicesCount: response.choices?.length || 0,
      usagePromptTokens: response.usage?.prompt_tokens,
      usageCompletionTokens: response.usage?.completion_tokens,
      usageTotalTokens: response.usage?.total_tokens,
      finishReason: response.choices?.[0]?.finish_reason
    });
    
    return response;
  } catch (error) {
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
