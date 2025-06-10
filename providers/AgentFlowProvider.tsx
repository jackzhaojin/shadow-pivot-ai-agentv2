'use client';
import { createContext, useContext, useState } from 'react';

export const agentSteps = [
  'Design Concept Generation',
  'Design Evaluation',
  'Figma Spec Generation',
  'Spec Selection / Confirmation',
  'Code Generation',
  'Code Selection / Confirmation',
  'Download Artifacts'
];

interface AgentFlowContextValue {
  steps: string[];
  currentStep: number;
  completed: Set<number>;
  setCurrentStep: (i: number) => void;
  completeStep: (i: number) => void;
  abort: () => void;
  aborted: boolean;
}

const AgentFlowContext = createContext<AgentFlowContextValue | undefined>(undefined);

export function AgentFlowProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [aborted, setAborted] = useState(false);

  const completeStep = (i: number) => {
    setCompleted(prev => new Set(prev).add(i));
    setCurrentStep(i + 1);
  };

  const abort = () => {
    setAborted(true);
  };

  return (
    <AgentFlowContext.Provider value={{ steps: agentSteps, currentStep, completed, setCurrentStep, completeStep, abort, aborted }}>
      {children}
    </AgentFlowContext.Provider>
  );
}

export function useAgentFlow() {
  const ctx = useContext(AgentFlowContext);
  if (!ctx) throw new Error('AgentFlowProvider missing');
  return ctx;
}
