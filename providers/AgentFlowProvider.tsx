'use client';
import { createContext, useContext, useState } from 'react';
import type { DesignEvaluationResult } from '@/lib/services/designEvaluation';
import {
  type ExecutionTrace,
  createExecutionTrace,
  logEvent
} from '@/utils/execution';

export const agentSteps = [
  'Design Concept Generation',
  'Design Evaluation',
  'Spec Selection / Confirmation',
  'Figma Spec Generation',
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
  selectedConcept: string | null;
  setSelectedConcept: (c: string | null) => void;
  setCurrentStep: (i: number) => void;
  completeStep: (i: number, advance?: boolean) => void;
  startExecution: () => void;
  abort: () => void;
  aborted: boolean;
  errors: string[];
  addError: (msg: string, step: number) => void;
  failedStep: number | null;
}

const AgentFlowContext = createContext<AgentFlowContextValue | undefined>(undefined);

export function AgentFlowProvider({ children }: { children: React.ReactNode }) {
  // Start at -1 so UI shows waiting state until flow begins
  const [currentStep, setCurrentStep] = useState(-1);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [aborted, setAborted] = useState(false);
  const [executionTrace, setExecutionTrace] = useState<ExecutionTrace | null>(
    null
  );
  const [designConcepts, setDesignConcepts] = useState<string[]>([]);
  const [evaluationResults, setEvaluationResults] = useState<DesignEvaluationResult[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [failedStep, setFailedStep] = useState<number | null>(null);

  const startExecution = () => {
    const trace = createExecutionTrace();
    setExecutionTrace(trace);
    setAborted(false);
    setErrors([]);
    setFailedStep(null);
    setCurrentStep(0);
    setCompleted(new Set());
    setDesignConcepts([]);
    setEvaluationResults([]);
    setSelectedConcept(null);
    logEvent(trace, 'Execution started');
  };

  const completeStep = (i: number, advance: boolean = true) => {
    setCompleted(prev => new Set(prev).add(i));
    if (advance) {
      setCurrentStep(i + 1);
    }
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

  const addError = (msg: string, step: number) => {
    setErrors(prev => [...prev, msg]);
    setFailedStep(step);
    if (executionTrace) {
      logEvent(executionTrace, `Error at step ${step}: ${msg}`);
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
        selectedConcept,
        setSelectedConcept,
        setCurrentStep,
        completeStep,
        startExecution,
        abort,
        aborted,
        errors,
        addError,
        failedStep
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
