'use client';
import React from 'react';

interface AgentFlowTimelineProps {
  steps: string[];
  currentStep: number;
  completed: Set<number>;
  failedStep: number | null;
  aborted: boolean;
  onStepClick?: (i: number) => void;
  openSteps?: Set<number>;
  validatedSteps?: Set<number>;
  invalidatedSteps?: Set<number>;
}

function StepIcon({ 
  index, 
  currentStep, 
  completed, 
  failedStep, 
  aborted, 
  validatedSteps,
  invalidatedSteps
}: { 
  index: number; 
  currentStep: number; 
  completed: Set<number>; 
  failedStep: number | null; 
  aborted: boolean;
  validatedSteps?: Set<number>;
  invalidatedSteps?: Set<number>;
}) {
  // Check validation status
  const isValidated = validatedSteps?.has(index);
  const isInvalidated = invalidatedSteps?.has(index);
  
  if (failedStep === index) {
    return (
      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">!
      </div>
    );
  }
  
  if (completed.has(index)) {
    // For completed steps, show validation status
    if (isInvalidated) {
      return (
        <div className="w-8 h-8 bg-red-400 rounded-full flex items-center justify-center text-white text-sm font-semibold">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      );
    }
    
    if (isValidated) {
      return (
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    }
    
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

export default function AgentFlowTimeline({ 
  steps, 
  currentStep, 
  completed, 
  failedStep, 
  aborted, 
  onStepClick, 
  openSteps, 
  validatedSteps, 
  invalidatedSteps 
}: AgentFlowTimelineProps) {
  return (
    <div className="space-y-0">
      {steps.map((step, index) => (
        <div key={step} className="flex items-start">
          <div className="flex flex-col items-center">
            <StepIcon 
              index={index} 
              currentStep={currentStep} 
              completed={completed} 
              failedStep={failedStep} 
              aborted={aborted} 
              validatedSteps={validatedSteps}
              invalidatedSteps={invalidatedSteps}
            />
            <ConnectorLine index={index} stepsLength={steps.length} completed={completed} currentStep={currentStep} failedStep={failedStep} />
          </div>
          <div className="ml-4 pb-12 flex-1">
            <div
              onClick={() => completed.has(index) && onStepClick?.(index)}
              className={`p-4 rounded-xl border transition-all duration-300 ${
                failedStep === index 
                  ? 'bg-red-50 border-red-200' 
                  : currentStep === index && !aborted 
                    ? 'bg-blue-50 border-blue-200 shadow-md' 
                    : completed.has(index) 
                      ? 'bg-emerald-50 border-emerald-200 hover:shadow-md' 
                      : 'bg-gray-50 border-gray-200'
              } ${completed.has(index) ? 'cursor-pointer' : ''} ${
                openSteps?.has(index) ? 'ring-2 ring-blue-300' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <h3
                  className={`font-semibold mb-1 ${
                    failedStep === index 
                      ? 'text-red-900' 
                      : currentStep === index && !aborted 
                        ? 'text-blue-900' 
                        : completed.has(index) 
                          ? 'text-emerald-900' 
                          : 'text-gray-700'
                  }`}
                >
                  {step}
                </h3>
                {completed.has(index) && (
                  <span className="flex items-center text-sm text-blue-600">
                    {openSteps?.has(index) ? (
                      <>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        Hide details
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View details
                      </>
                    )}
                  </span>
                )}
              </div>
              <p
                className={`text-sm ${
                  failedStep === index 
                    ? 'text-red-700' 
                    : currentStep === index && !aborted 
                      ? 'text-blue-700' 
                      : completed.has(index) 
                        ? 'text-emerald-700' 
                        : 'text-gray-500'
                }`}
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
