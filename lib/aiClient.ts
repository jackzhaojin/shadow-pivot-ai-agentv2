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
