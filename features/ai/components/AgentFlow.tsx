'use client';
import { useState } from 'react';
import { useAgentFlow } from '@/providers/AgentFlowProvider';
import { useUserGuid } from '@/providers/UserGuidProvider';
import StepExecutor from './flow/StepExecutor';
import AgentFlowTimeline from './flow/AgentFlowTimeline';
import ResultsDisplay from './flow/ResultsDisplay';
import ErrorHandler from './flow/ErrorHandler';
import ProgressIndicator from './flow/ProgressIndicator';
import StepResultPanel from './flow/StepResultPanel';

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
    invalidatedSteps
  } = useAgentFlow();

  const userGuid = useUserGuid();
  const [brief, setBrief] = useState('');
  const [showTimeline, setShowTimeline] = useState(false);
  const [openSteps, setOpenSteps] = useState<Set<number>>(new Set());

  const toggleStep = (i: number) => {
    setOpenSteps(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">AI Agent Flow</h1>
          <p className="text-gray-600 text-lg">Transform your ideas into beautiful, functional UI components</p>
          <div className="mt-2 text-sm text-gray-500">User ID: {userGuid}</div>
        </div>

        <StepExecutor brief={brief} setBrief={setBrief} />
        <ResultsDisplay
          brief={brief}
          designConcepts={designConcepts}
          evaluationResults={evaluationResults}
          selectedConcept={selectedConcept}
          executionTrace={executionTrace}
          showTimeline={showTimeline}
          setShowTimeline={setShowTimeline}
        />
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
          />
          {Array.from(openSteps).sort().map(i => (
            <div key={i} className="mt-4 animate-fadeIn">
              <StepResultPanel
                stepIndex={i}
                brief={brief}
                designConcepts={designConcepts}
                evaluationResults={evaluationResults}
                selectedConcept={selectedConcept}
                onClose={() => toggleStep(i)}
              />
            </div>
          ))}
        </div>
        <ErrorHandler errors={errors} />
        <ProgressIndicator aborted={aborted} currentStep={currentStep} stepsLength={steps.length} executionTrace={executionTrace} />
      </div>
    </div>
  );
}
