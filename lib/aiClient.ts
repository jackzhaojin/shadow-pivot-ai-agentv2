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
  
  return await client.chat.completions.create({
    model: deploymentName,
    messages,
    max_tokens: options.maxTokens || 1000,
    temperature: options.temperature || 0.7,
    top_p: options.topP || 1.0
  });
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
