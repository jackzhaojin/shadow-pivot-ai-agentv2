import { NextResponse } from 'next/server';
import { AzureOpenAI } from 'openai';
import { DefaultAzureCredential } from '@azure/identity';

export async function GET() {
  try {
    // Test Azure AI Foundry (OpenAI) connection using DefaultAzureCredential
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT || 'https://story-generation-v1.openai.azure.com/';
    const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o-mini-deployment';
    const credential = new DefaultAzureCredential();

    // Get access token for Azure OpenAI
    const tokenResponse = await credential.getToken('https://cognitiveservices.azure.com/.default');
    
    if (!tokenResponse) {
      throw new Error('Failed to get Azure access token');
    }

    // Create Azure OpenAI client
    const client = new AzureOpenAI({
      endpoint: endpoint,
      apiVersion: '2024-02-01',
      azureADTokenProvider: async () => {
        const token = await credential.getToken('https://cognitiveservices.azure.com/.default');
        return token?.token || '';
      }
    });

    // Test basic chat completion
    const testResponse = await client.chat.completions.create({
      model: deploymentName,
      messages: [
        {
          role: 'user',
          content: 'Hello! Please respond with "Azure AI connection test successful" to confirm the connection is working.'
        }
      ],
      max_tokens: 50,
      temperature: 0.1
    });

    const responseContent = testResponse.choices[0]?.message?.content || '';
    const isSuccessful = responseContent.toLowerCase().includes('successful') || responseContent.toLowerCase().includes('working');

    return NextResponse.json({
      success: true,
      message: 'Azure AI Foundry connection successful',
      details: {
        endpoint: endpoint,
        deployment: deploymentName,
        apiVersion: '2024-02-01',
        authMethod: 'DefaultAzureCredential',
        testResponse: responseContent,
        responseValidated: isSuccessful,
        usage: testResponse.usage
      }
    });

  } catch (error: any) {
    console.error('Azure AI Foundry test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      errorType: error.name,
      details: {
        endpoint: process.env.AZURE_OPENAI_ENDPOINT || 'https://story-generation-v1.openai.azure.com/',
        deployment: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o-mini-deployment',
        authMethod: 'DefaultAzureCredential'
      }
    }, { status: 500 });
  }
}
