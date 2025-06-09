/**
 * Azure Client Library - Server-Side Only
 * 
 * This module consolidates Azure Storage and AI Foundry operations
 * for server-side use only. Do NOT import this in client components.
 */

// Re-export storage operations
export {
  getBlobServiceClient,
  getExecutionsContainer,
  uploadTextBlob,
  downloadTextBlob,
  deleteBlob,
  listBlobs
} from './storageClient';

// Re-export AI operations
export {
  getAIClient,
  generateChatCompletion,
  generateText,
  testAIConnection
} from './aiClient';

// Consolidated health check function
export async function checkAzureHealth() {
  const { testAIConnection } = await import('./aiClient');
  const { getExecutionsContainer } = await import('./storageClient');
  
  const results = {
    storage: { status: 'unknown' as 'ok' | 'error' | 'unknown', message: '', timestamp: new Date().toISOString() },
    ai: { status: 'unknown' as 'ok' | 'error' | 'unknown', message: '', timestamp: new Date().toISOString() }
  };

  // Test Storage
  try {
    const container = getExecutionsContainer();
    await container.getProperties();
    results.storage.status = 'ok';
    results.storage.message = 'Container accessible';
  } catch (error) {
    results.storage.status = 'error';
    results.storage.message = error instanceof Error ? error.message : 'Unknown storage error';
  }

  // Test AI
  try {
    const aiTest = await testAIConnection();
    if (aiTest.success) {
      results.ai.status = 'ok';
      results.ai.message = `Response: ${aiTest.response}`;
    } else {
      results.ai.status = 'error';
      results.ai.message = aiTest.error || 'Unknown AI error';
    }
  } catch (error) {
    results.ai.status = 'error';
    results.ai.message = error instanceof Error ? error.message : 'Unknown AI error';
  }

  return results;
}

// Environment validation
export function validateAzureEnvironment() {
  const requiredEnvVars = [
    'AZURE_STORAGE_ACCOUNT_NAME',
    'AZURE_OPENAI_ENDPOINT'
  ];

  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  return {
    isValid: missing.length === 0,
    missing,
    config: {
      storageAccount: process.env.AZURE_STORAGE_ACCOUNT_NAME,
      aiEndpoint: process.env.AZURE_OPENAI_ENDPOINT
    }
  };
}
