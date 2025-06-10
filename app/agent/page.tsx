import AgentFlow from '@/features/ai/components/AgentFlow';
import { AgentFlowProvider } from '@/providers/AgentFlowProvider';

export default function AgentPage() {
  return (
    <AgentFlowProvider>
      <AgentFlow />
    </AgentFlowProvider>
  );
}
