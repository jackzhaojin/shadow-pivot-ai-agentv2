'use client';
import React from 'react';

interface AgentFlowTimelineProps {
  steps: string[];
  currentStep: number;
  completed: Set<number>;
  failedStep: number | null;
  aborted: boolean;
}

function StepIcon({ index, currentStep, completed, failedStep, aborted }: { index: number; currentStep: number; completed: Set<number>; failedStep: number | null; aborted: boolean }) {
  if (failedStep === index) {
    return (
      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">!
      </div>
    );
  }
  if (completed.has(index)) {
    return (
      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">✓
      </div>
    );
  }
  if (currentStep === index && !aborted) {
    return (
      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold animate-pulse">{index + 1}
      </div>
    );
  }
  return (
    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm font-semibold">{index + 1}
    </div>
  );
}

function ConnectorLine({ index, stepsLength, completed, currentStep, failedStep }: { index: number; stepsLength: number; completed: Set<number>; currentStep: number; failedStep: number | null }) {
  if (index === stepsLength - 1) return null;
  const isCompleted = completed.has(index);
  const isActive = currentStep > index;
  const isError = failedStep !== null && failedStep <= index;
  return (
    <div className={`w-0.5 h-12 ml-4 ${isError ? 'bg-red-500' : isCompleted || isActive ? 'bg-emerald-500' : 'bg-gray-300'} transition-colors duration-300`} />
  );
}

export default function AgentFlowTimeline({ steps, currentStep, completed, failedStep, aborted }: AgentFlowTimelineProps) {
  return (
    <div className="space-y-0">
      {steps.map((step, index) => (
        <div key={step} className="flex items-start">
          <div className="flex flex-col items-center">
            <StepIcon index={index} currentStep={currentStep} completed={completed} failedStep={failedStep} aborted={aborted} />
            <ConnectorLine index={index} stepsLength={steps.length} completed={completed} currentStep={currentStep} failedStep={failedStep} />
          </div>
          <div className="ml-4 pb-12 flex-1">
            <div
              className={`p-4 rounded-xl border transition-all duration-300 ${failedStep === index ? 'bg-red-50 border-red-200' : currentStep === index && !aborted ? 'bg-blue-50 border-blue-200 shadow-md' : completed.has(index) ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}
            >
              <h3
                className={`font-semibold mb-1 ${failedStep === index ? 'text-red-900' : currentStep === index && !aborted ? 'text-blue-900' : completed.has(index) ? 'text-emerald-900' : 'text-gray-700'}`}
              >
                {step}
              </h3>
              <p
                className={`text-sm ${failedStep === index ? 'text-red-700' : currentStep === index && !aborted ? 'text-blue-700' : completed.has(index) ? 'text-emerald-700' : 'text-gray-500'}`}
              >
                {failedStep === index && 'Error encountered'}
                {currentStep === index && !aborted && failedStep === null && 'Currently processing...'}
                {completed.has(index) && 'Completed successfully'}
                {currentStep < index && failedStep === null && 'Waiting...'}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
