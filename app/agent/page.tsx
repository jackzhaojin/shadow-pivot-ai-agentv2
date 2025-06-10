import AgentFlow from '@/features/ai/components/AgentFlow';
import { AgentFlowProvider } from '@/providers/AgentFlowProvider';

export default function AgentPage() {
  return (
    <AgentFlowProvider>
      <div className="container mx-auto p-6">
        <AgentFlow />
      </div>
    </AgentFlowProvider>
  );
}
