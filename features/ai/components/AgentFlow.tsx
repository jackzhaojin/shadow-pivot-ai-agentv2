'use client';
import { useState, useEffect } from 'react';
import { useAgentFlow } from '@/providers/AgentFlowProvider';
import { useUserGuid } from '@/providers/UserGuidProvider';
import StepExecutor from './flow/StepExecutor';
import AgentFlowTimeline from './flow/AgentFlowTimeline';
import ErrorHandler from './flow/ErrorHandler';
import ProgressIndicator from './flow/ProgressIndicator';

export default function AgentFlow() {
  const {
    steps,
    currentStep,
    completed,
    executionTrace,
    designConcepts,
    evaluationResults,
    selectedConcept,
    errors,
    aborted,
    failedStep,
    validatedSteps,
    invalidatedSteps,
    figmaSpecs,
    figmaEvaluationResults,
    completeStep
  } = useAgentFlow();

  const userGuid = useUserGuid();
  const [brief, setBrief] = useState('');
  const [openSteps, setOpenSteps] = useState<Set<number>>(new Set());

  // Add comprehensive logging for all state changes
  useEffect(() => {
    console.log('🔍 AgentFlow - currentStep changed:', {
      currentStep,
      stepName: steps[currentStep],
      completed: Array.from(completed),
      aborted,
      failedStep
    });
  }, [currentStep, steps, completed, aborted, failedStep]);

  useEffect(() => {
    console.log('🎯 AgentFlow - designConcepts changed:', {
      count: designConcepts.length,
      concepts: designConcepts,
      currentStep
    });
  }, [designConcepts, currentStep]);

  useEffect(() => {
    console.log('📊 AgentFlow - evaluationResults changed:', {
      count: evaluationResults.length,
      results: evaluationResults,
      currentStep
    });
  }, [evaluationResults, currentStep]);

  useEffect(() => {
    console.log('✅ AgentFlow - selectedConcept changed:', {
      selectedConcept,
      currentStep,
      hasEvaluationResults: evaluationResults.length > 0
    });
  }, [selectedConcept, currentStep, evaluationResults.length]);

  useEffect(() => {
    console.log('🎨 AgentFlow - figmaSpecs changed:', {
      count: figmaSpecs.length,
      specs: figmaSpecs,
      currentStep
    });
  }, [figmaSpecs, currentStep]);

  useEffect(() => {
    console.log('❌ AgentFlow - errors changed:', {
      errorCount: errors.length,
      errors,
      failedStep,
      currentStep
    });
  }, [errors, failedStep, currentStep]);

  const toggleStep = (i: number) => {
    setOpenSteps(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  // Manual trigger for Step 4 if it doesn't auto-trigger
  const manualTriggerStep4 = () => {
    console.log('🔧 AgentFlow - Manual trigger for Step 4 clicked:', {
      currentStep,
      figmaSpecsLength: figmaSpecs.length,
      canTrigger: currentStep === 3 && figmaSpecs.length > 0
    });
    if (currentStep === 3 && figmaSpecs.length > 0) {
      completeStep(3); // This should trigger Step 4
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-700 bg-clip-text text-transparent mb-2">
            100% AI-Coded UI Agent Flow
          </h1>
          <p className="text-gray-700 text-lg">
            Public Demo: Instantly transform your ideas into beautiful, functional UI components — <span className="font-semibold text-blue-700">every line of code is 100% AI generated</span>
          </p>
          <div className="mt-2 text-sm text-gray-500">User ID: {userGuid}</div>
        </div>

        {/* Debug information and manual trigger */}
        {currentStep === 3 && figmaSpecs.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-800 font-medium">
                  Step 3 Complete: {figmaSpecs.length} Figma specs generated
                </p>
                <p className="text-blue-600 text-sm">
                  Step 4 should auto-trigger. If not, use the manual trigger below.
                </p>
              </div>
              <button
                onClick={manualTriggerStep4}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                🔧 Trigger Step 4
              </button>
            </div>
          </div>
        )}

        {currentStep <= 0 && (
          <StepExecutor brief={brief} setBrief={setBrief} />
        )}
      
      {currentStep > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Progress Timeline</h2>
          <AgentFlowTimeline
            steps={steps}
            currentStep={currentStep}
            completed={completed}
            failedStep={failedStep}
            aborted={aborted}
            onStepClick={toggleStep}
            openSteps={openSteps}
            validatedSteps={validatedSteps}
            invalidatedSteps={invalidatedSteps}
            brief={brief}
            designConcepts={designConcepts}
            evaluationResults={evaluationResults}
            selectedConcept={selectedConcept}
            figmaSpecs={figmaSpecs}
            figmaEvaluationResults={figmaEvaluationResults}
          />
        </div>
      )}
      
      <ErrorHandler errors={errors} />
      <ProgressIndicator aborted={aborted} currentStep={currentStep} stepsLength={steps.length} executionTrace={executionTrace} />
    </div>
  </div>
);
}
