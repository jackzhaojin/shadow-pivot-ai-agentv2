'use client';

import { useState } from 'react';

// This component demonstrates proper client/server separation
// It should NOT import any Azure SDK modules directly
export function ClientSideDemo() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const testServerSideAzure = async () => {
    setLoading(true);
    try {
      // Call our API route (server-side) instead of using Azure SDK directly
      const response = await fetch('/api/test-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Hello from client!' })
      });
      
      const data = await response.json();
      setMessage(data.success ? `AI Response: ${data.response}` : `Error: ${data.error}`);
    } catch (error) {
      setMessage(`Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg p-6 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
      <h3 className="text-lg font-semibold mb-4">Client-Side Azure Integration Test</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        This component tests server-side Azure calls via API routes (proper pattern).
        No Azure SDK is imported in this client component.
      </p>
      <button 
        onClick={testServerSideAzure}
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Server-Side Azure AI'}
      </button>
      {message && (
        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm">
          {message}
        </div>
      )}
    </div>
  );
}
