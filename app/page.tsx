import { checkAzureHealth, validateAzureEnvironment } from "@/lib/daos/azureClient";
import AgentFlow from '@/features/ai/components/AgentFlow';
import { AgentFlowProvider } from '@/providers/AgentFlowProvider';
import Link from 'next/link';

// Server-side function to test Azure connections
async function getAzureStatus() {
  try {
    // Validate environment first
    const envValidation = validateAzureEnvironment();
    if (!envValidation.isValid) {
      return {
        storage: 'Configuration Error',
        ai: 'Configuration Error',
        error: `Missing environment variables: ${envValidation.missing.join(', ')}`,
        timestamp: new Date().toISOString()
      };
    }

    // Check Azure service health
    const health = await checkAzureHealth();
    
    return {
      storage: health.storage.status === 'ok' ? 'Connected' : `Error: ${health.storage.message}`,
      ai: health.ai.status === 'ok' ? `Connected - ${health.ai.message}` : `Error: ${health.ai.message}`,
      timestamp: new Date().toISOString(),
      environment: envValidation.config
    };
  } catch (error) {
    return {
      storage: 'Error',
      ai: 'Error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function Home() {
  // Server-side Azure integration test
  await getAzureStatus();
  return (
    <AgentFlowProvider>
      <div className="relative">
        {/* Dev/Test Hub Access (visible only in dev or for debugging) */}
        <div className="absolute top-4 right-4 z-10">
          <Link href="/test-hub" className="text-xs px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 border border-gray-300 shadow-sm">
            🧪 Test Hub
          </Link>
        </div>
        <AgentFlow />
      </div>
    </AgentFlowProvider>
  );
}
