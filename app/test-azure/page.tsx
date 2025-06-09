'use client';

import { useState } from 'react';

interface TestResult {
  success: boolean;
  message?: string;
  error?: string;
  details?: Record<string, unknown>;
}

export default function AzureTestPage() {
  const [storageResult, setStorageResult] = useState<TestResult | null>(null);
  const [aiResult, setAiResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState<{ storage: boolean; ai: boolean }>({
    storage: false,
    ai: false
  });

  const testStorageConnection = async () => {
    setLoading(prev => ({ ...prev, storage: true }));
    try {
      const response = await fetch('/api/test-storage');
      const result = await response.json();
      setStorageResult(result);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      setStorageResult({
        success: false,
        error: err.message || 'Failed to test storage connection'
      });
    } finally {
      setLoading(prev => ({ ...prev, storage: false }));
    }
  };

  const testAiConnection = async () => {
    setLoading(prev => ({ ...prev, ai: true }));
    try {
      const response = await fetch('/api/test-ai');
      const result = await response.json();
      setAiResult(result);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      setAiResult({
        success: false,
        error: err.message || 'Failed to test AI connection'
      });
    } finally {
      setLoading(prev => ({ ...prev, ai: false }));
    }
  };

  const testAllConnections = async () => {
    await Promise.all([
      testStorageConnection(),
      testAiConnection()
    ]);
  };

  const ResultCard = ({ title, result, isLoading }: { 
    title: string; 
    result: TestResult | null; 
    isLoading: boolean 
  }) => (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      
      {isLoading && (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Testing connection...</span>
        </div>
      )}
      
      {!isLoading && result && (
        <div className={`p-4 rounded-md ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
            {result.success ? '✅ Success' : '❌ Failed'}
          </div>
          
          {result.message && (
            <p className={`mt-1 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
              {result.message}
            </p>
          )}
          
          {result.error && (
            <p className="mt-1 text-red-700 font-mono text-sm">
              Error: {result.error}
            </p>
          )}
          
          {result.details && (
            <details className="mt-3">
              <summary className={`cursor-pointer ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                View Details
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(result.details, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
      
      {!isLoading && !result && (
        <p className="text-gray-500">No test results yet. Click test button to begin.</p>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Azure Connection Tests
        </h1>
        <p className="text-gray-600">
          Test Azure Storage and AI Foundry connections using DefaultAzureCredential.
          Make sure you&apos;re logged in with <code className="bg-gray-100 px-1 rounded">az login</code>.
        </p>
      </div>

      {/* Control Buttons */}
      <div className="mb-8 flex space-x-4">
        <button
          onClick={testStorageConnection}
          disabled={loading.storage}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Test Storage
        </button>
        
        <button
          onClick={testAiConnection}
          disabled={loading.ai}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Test AI Foundry
        </button>
        
        <button
          onClick={testAllConnections}
          disabled={loading.storage || loading.ai}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Test All
        </button>
      </div>

      {/* Results */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <ResultCard 
          title="Azure Storage Account" 
          result={storageResult} 
          isLoading={loading.storage}
        />
        
        <ResultCard 
          title="Azure AI Foundry (OpenAI)" 
          result={aiResult} 
          isLoading={loading.ai}
        />
      </div>

      {/* Environment Variables Check */}
      <div className="mt-8 border rounded-lg p-6 bg-gray-50">
        <h3 className="text-lg font-semibold mb-4">Environment Configuration</h3>
        <div className="grid gap-2 text-sm font-mono">
          <div>Storage Account: shadowpivotaiagentstrg</div>
          <div>AI Endpoint: https://story-generation-v1.openai.azure.com/</div>
          <div>AI Deployment: gpt-4o-mini-deployment</div>
          <div>Auth Method: DefaultAzureCredential (az login)</div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 border rounded-lg p-6 bg-blue-50">
        <h3 className="text-lg font-semibold mb-4 text-blue-900">Testing Instructions</h3>
        <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Ensure you&apos;re logged in to Azure CLI: <code className="bg-blue-100 px-1 rounded">az login</code></li>
          <li>Verify you have access to the correct subscription: <code className="bg-blue-100 px-1 rounded">az account show</code></li>
            <li>Click &quot;Test All&quot; to validate both Azure Storage and AI Foundry connections</li>
          <li>Check for any permission errors and resolve them in Azure Portal if needed</li>
        </ol>
      </div>
    </div>
  );
}
