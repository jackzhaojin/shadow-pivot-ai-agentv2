'use client';
import React from 'react';
import type { DesignEvaluationResult } from '@/lib/services/designEvaluation';
import { useAgentFlow } from '@/providers/AgentFlowProvider';
import ValidationPanel from './ValidationPanel';

interface StepResultPanelProps {
  stepIndex: number;
  brief: string;
  designConcepts: string[];
  evaluationResults: DesignEvaluationResult[];
  selectedConcept: string | null;
}

export default function StepResultPanel({
  stepIndex,
  brief,
  designConcepts,
  evaluationResults,
  selectedConcept
}: StepResultPanelProps) {
  const { validatedSteps, invalidatedSteps, markStepValidated, markStepInvalidated } = useAgentFlow();
  
  const isValidated = validatedSteps.has(stepIndex);
  const isInvalidated = invalidatedSteps.has(stepIndex);
  
  const handleValidationComplete = (isValid: boolean, feedback = '') => {
    if (isValid) {
      markStepValidated(stepIndex);
    } else {
      markStepInvalidated(stepIndex, feedback);
    }
  };

  let content: React.ReactNode = null;

  if (stepIndex === 0) {
    content = (
      <div>
        <h4 className="font-semibold mb-2">Design Concepts</h4>
        <div className="text-sm text-gray-700 whitespace-pre-line mb-2">{brief}</div>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          {designConcepts.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </div>
    );
  } else if (stepIndex === 1) {
    content = (
      <div>
        <h4 className="font-semibold mb-2">Design Evaluation</h4>
        <ul className="space-y-1 text-sm">
          {evaluationResults.map((r, i) => (
            <li key={i}>
              <span className="font-medium">{r.concept}</span> - {r.score}
              {r.reason && <span className="text-gray-500"> – {r.reason}</span>}
            </li>
          ))}
        </ul>
      </div>
    );
  } else if (stepIndex === 2) {
    content = (
      <div>
        <h4 className="font-semibold mb-2">Spec Selection</h4>
        <div className="text-sm text-gray-700">Selected: {selectedConcept}</div>
      </div>
    );
  }

  if (!content) return null;

  return (
    <div className={`p-4 mb-4 bg-white border rounded-xl shadow transition-all duration-300 ${
      isValidated ? 'border-green-300' : 
      isInvalidated ? 'border-red-300' : 
      'border-gray-200'
    }`}>
      {content}
      
      {/* Status indicator */}
      {(isValidated || isInvalidated) && (
        <div className={`mt-3 flex items-center text-sm rounded-lg px-3 py-2 ${
          isValidated ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {isValidated ? (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              This step has been validated
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              This step has been marked as invalid
            </>
          )}
        </div>
      )}
      
      {/* Validation panel */}
      {!isValidated && !isInvalidated && (
        <ValidationPanel 
          stepIndex={stepIndex}
          onValidationComplete={handleValidationComplete}
        />
      )}
    </div>
  );
}
