'use client';
import { useState } from 'react';
import { useAgentFlow } from '@/providers/AgentFlowProvider';

export default function AgentFlow() {
  const { steps, currentStep, completed, completeStep, abort, aborted } = useAgentFlow();
  const [brief, setBrief] = useState('');

  const startFlow = () => {
    if (currentStep === 0) {
      completeStep(0);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      completeStep(currentStep);
    }
  };

  const handleAbort = () => abort();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">AI Agent Flow</h1>

      {currentStep === 0 && !aborted && (
        <div className="space-y-3">
          <label className="block font-medium">Creative Brief</label>
          <textarea
            className="w-full p-2 border rounded"
            rows={4}
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
          />
          <button onClick={startFlow} className="px-4 py-2 bg-blue-600 text-white rounded">
            Start
          </button>
        </div>
      )}

      <ol className="space-y-2">
        {steps.map((step, index) => (
          <li
            key={step}
            className={`p-2 rounded border ${currentStep === index && !aborted ? 'bg-blue-100' : completed.has(index) ? 'bg-green-100' : 'bg-gray-50'}`}
          >
            {step}
          </li>
        ))}
      </ol>

      {!aborted && currentStep > 0 && currentStep < steps.length && (
        <div className="flex gap-4">
          <button onClick={nextStep} className="px-4 py-2 bg-blue-600 text-white rounded">
            Next Step
          </button>
          <button onClick={handleAbort} className="px-4 py-2 bg-red-600 text-white rounded">
            Abort
          </button>
        </div>
      )}

      {aborted && <p className="text-red-600 font-medium">Flow aborted</p>}
      {!aborted && currentStep >= steps.length && (
        <p className="text-green-700 font-medium">Agent flow complete</p>
      )}
    </div>
  );
}
