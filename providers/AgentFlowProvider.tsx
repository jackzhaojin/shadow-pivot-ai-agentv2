'use client';
import { createContext, useContext, useState } from 'react';
import type { DesignEvaluationResult } from '@/lib/designEvaluation';
import {
  type ExecutionTrace,
  createExecutionTrace,
  logEvent
} from '@/utils/execution';

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
  executionTrace: ExecutionTrace | null;
  designConcepts: string[];
  setDesignConcepts: (c: string[]) => void;
  evaluationResults: DesignEvaluationResult[];
  setEvaluationResults: (r: DesignEvaluationResult[]) => void;
  setCurrentStep: (i: number) => void;
  completeStep: (i: number) => void;
  startExecution: () => void;
  abort: () => void;
  aborted: boolean;
}

const AgentFlowContext = createContext<AgentFlowContextValue | undefined>(undefined);

export function AgentFlowProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [aborted, setAborted] = useState(false);
  const [executionTrace, setExecutionTrace] = useState<ExecutionTrace | null>(
    null
  );
  const [designConcepts, setDesignConcepts] = useState<string[]>([]);
  const [evaluationResults, setEvaluationResults] = useState<DesignEvaluationResult[]>([]);

  const startExecution = () => {
    const trace = createExecutionTrace();
    setExecutionTrace(trace);
    setAborted(false);
    setCurrentStep(0);
    setCompleted(new Set());
    setDesignConcepts([]);
    setEvaluationResults([]);
    logEvent(trace, 'Execution started');
  };

  const completeStep = (i: number) => {
    setCompleted(prev => new Set(prev).add(i));
    setCurrentStep(i + 1);
    if (executionTrace) {
      logEvent(executionTrace, `${agentSteps[i]} completed`);
    }
  };

  const abort = () => {
    setAborted(true);
    if (executionTrace) {
      logEvent(executionTrace, 'Execution aborted');
    }
  };

  return (
    <AgentFlowContext.Provider
      value={{
        steps: agentSteps,
        currentStep,
        completed,
        executionTrace,
        designConcepts,
        setDesignConcepts,
        evaluationResults,
        setEvaluationResults,
        setCurrentStep,
        completeStep,
        startExecution,
        abort,
        aborted
      }}
    >
      {children}
    </AgentFlowContext.Provider>
  );
}

export function useAgentFlow() {
  const ctx = useContext(AgentFlowContext);
  if (!ctx) throw new Error('AgentFlowProvider missing');
  return ctx;
}
