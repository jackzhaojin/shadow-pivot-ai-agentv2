'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { DesignEvaluationResult } from '@/lib/services/designEvaluation';
import type { FigmaSpec } from '@/lib/services/figmaSpec';
import type { SpecEvaluationResult } from '@/lib/services/figmaSpecEvaluation';
import {
  type ExecutionTrace,
  createExecutionTrace,
  logEvent
} from '@/utils/execution';
import { createFigmaGenStateArray, type FigmaGenState } from '@/lib/utils/figmaGeneration';

export const agentSteps = [
  'Design Concept Generation',
  'Design Evaluation',
  'Spec Selection / Confirmation',
  'Figma Spec Generation (3 Parallel)',
  'Figma Spec Evaluation & Quality Assurance',
  'Figma Spec Selection & Evaluation',
  'Actual Figma Generation',
  'Code Generation (3 Parallel)',
  'Code Evaluation & Selection',
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
  validatedSteps: Set<number>;
  invalidatedSteps: Set<number>;
  markStepValidated: (i: number) => void;
  markStepInvalidated: (i: number, feedback: string) => void;
  figmaSpecStates: FigmaGenState[];
  setFigmaSpecStates: React.Dispatch<React.SetStateAction<FigmaGenState[]>>;
  figmaSpecs: FigmaSpec[];
  setFigmaSpecs: (specs: FigmaSpec[]) => void;
  figmaEvaluationResults: SpecEvaluationResult[];
  setFigmaEvaluationResults: (results: SpecEvaluationResult[]) => void;
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
  
  // Add logging for designConcepts changes
  useEffect(() => {
    console.log('AgentFlowProvider: designConcepts changed:', designConcepts.length, designConcepts);
  }, [designConcepts]);
  
  useEffect(() => {
    console.log('AgentFlowProvider: currentStep changed:', currentStep);
  }, [currentStep]);
  const [evaluationResults, setEvaluationResults] = useState<DesignEvaluationResult[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [failedStep, setFailedStep] = useState<number | null>(null);
  const [validatedSteps, setValidatedSteps] = useState<Set<number>>(new Set());
  const [invalidatedSteps, setInvalidatedSteps] = useState<Set<number>>(new Set());
  const initialFigmaStates = () => createFigmaGenStateArray(3);
  const [figmaSpecStates, setFigmaSpecStates] = useState(initialFigmaStates());
  const [figmaSpecs, setFigmaSpecs] = useState<FigmaSpec[]>([]);
  const [figmaEvaluationResults, setFigmaEvaluationResults] = useState<SpecEvaluationResult[]>([]);

  // Add logging for key state setters
  const setDesignConceptsWithLogging = (concepts: string[]) => {
    console.log('🎨 AgentFlowProvider - setDesignConcepts called:', {
      conceptCount: concepts.length,
      concepts,
      currentStep
    });
    setDesignConcepts(concepts);
  };

  const setEvaluationResultsWithLogging = (results: DesignEvaluationResult[]) => {
    console.log('📊 AgentFlowProvider - setEvaluationResults called:', {
      resultCount: results.length,
      results,
      currentStep
    });
    setEvaluationResults(results);
  };

  const setSelectedConceptWithLogging = (concept: string | null) => {
    console.log('✅ AgentFlowProvider - setSelectedConcept called:', {
      previousConcept: selectedConcept,
      newConcept: concept,
      currentStep
    });
    setSelectedConcept(concept);
  };

  const setFigmaSpecsWithLogging = (specs: FigmaSpec[]) => {
    console.log('🎨 AgentFlowProvider - setFigmaSpecs called:', {
      specCount: specs.length,
      specs,
      currentStep
    });
    setFigmaSpecs(specs);
  };

  const setFigmaEvaluationResultsWithLogging = (results: SpecEvaluationResult[]) => {
    console.log('🧪 AgentFlowProvider - setFigmaEvaluationResults called:', {
      resultCount: results.length,
      avgScore: results.length > 0 ? results.reduce((sum, r) => sum + r.overallScore, 0) / results.length : 0,
      results,
      currentStep
    });
    setFigmaEvaluationResults(results);
  };

  const startExecution = () => {
    console.log('🚀 AgentFlowProvider - startExecution called');
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
    setValidatedSteps(new Set());
    setInvalidatedSteps(new Set());
    setFigmaSpecStates(initialFigmaStates());
    setFigmaSpecs([]);
    logEvent(trace, 'Execution started');
  };

  const completeStep = (i: number, advance: boolean = true) => {
    console.log('🏁 AgentFlowProvider.completeStep called:', { 
      stepIndex: i, 
      stepName: agentSteps[i],
      advance, 
      currentStepBefore: currentStep,
      willAdvanceTo: advance ? i + 1 : currentStep,
      completedBefore: Array.from(completed)
    });
    setCompleted(prev => {
      const newCompleted = new Set(prev).add(i);
      console.log('📝 AgentFlowProvider - Setting completed steps:', Array.from(newCompleted));
      return newCompleted;
    });
    if (advance) {
      const newStep = i + 1;
      console.log('⏭️ AgentFlowProvider - Advancing currentStep from', currentStep, 'to', newStep, `(${agentSteps[newStep] || 'COMPLETE'})`);
      setCurrentStep(newStep);
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

  const markStepValidated = (i: number) => {
    setValidatedSteps(prev => new Set(prev).add(i));
    // Remove from invalidated set if it was previously invalidated
    setInvalidatedSteps(prev => {
      const newSet = new Set(prev);
      newSet.delete(i);
      return newSet;
    });
    if (executionTrace) {
      logEvent(executionTrace, `Step ${i} (${agentSteps[i]}) validated by user`);
    }
  };

  const markStepInvalidated = (i: number, feedback: string) => {
    setInvalidatedSteps(prev => new Set(prev).add(i));
    // Remove from validated set if it was previously validated
    setValidatedSteps(prev => {
      const newSet = new Set(prev);
      newSet.delete(i);
      return newSet;
    });
    if (executionTrace) {
      logEvent(executionTrace, `Step ${i} (${agentSteps[i]}) invalidated by user: ${feedback}`);
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
        setDesignConcepts: setDesignConceptsWithLogging,
        evaluationResults,
        setEvaluationResults: setEvaluationResultsWithLogging,
        selectedConcept,
        setSelectedConcept: setSelectedConceptWithLogging,
        setCurrentStep,
        completeStep,
        startExecution,
        abort,
        aborted,
        errors,
        addError,
        failedStep,
        validatedSteps,
        invalidatedSteps,
        markStepValidated,
        markStepInvalidated,
        figmaSpecStates,
        setFigmaSpecStates,
        figmaSpecs,
        setFigmaSpecs: setFigmaSpecsWithLogging,
        figmaEvaluationResults,
        setFigmaEvaluationResults: setFigmaEvaluationResultsWithLogging
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
