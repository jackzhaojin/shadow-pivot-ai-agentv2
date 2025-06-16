'use client';
import React, { useState } from 'react';
import type { DesignEvaluationResult } from '../../../../lib/services/designEvaluation';
import type { FigmaSpec } from '../../../../lib/services/figmaSpec';
import { useAgentFlow as originalUseAgentFlow } from '../../../../providers/AgentFlowProvider';
import ValidationPanel from './ValidationPanel';

// Special handling for test environment
let useAgentFlow = originalUseAgentFlow;

// This will be used in the server-side test environment
if (typeof window === 'undefined' && process.env.NODE_ENV === 'test') {
  // In the test environment, we'll use a mock
  const { useAgentFlow: mockUseAgentFlow } = require('../../../../tests/mocks/AgentFlowProviderMock');
  // Override the useAgentFlow import with the mock
  useAgentFlow = mockUseAgentFlow;
}

interface StepResultPanelProps {
  stepIndex: number;
  brief: string;
  designConcepts: string[];
  evaluationResults: DesignEvaluationResult[];
  selectedConcept: string | null;
  figmaSpecs?: FigmaSpec[];
  onClose?: () => void;
}

export default function StepResultPanel({
  stepIndex,
  brief,
  designConcepts,
  evaluationResults,
  selectedConcept,
  figmaSpecs = [],
  onClose
}: StepResultPanelProps) {
  const { validatedSteps, invalidatedSteps, markStepValidated, markStepInvalidated } = useAgentFlow();
  const [showDetails, setShowDetails] = useState(true); // Initially show details for a better user experience
  
  const isValidated = validatedSteps.has(stepIndex);
  const isInvalidated = invalidatedSteps.has(stepIndex);
  
  const handleValidationComplete = (isValid: boolean, feedback = '') => {
    if (isValid) {
      markStepValidated(stepIndex);
    } else {
      markStepInvalidated(stepIndex, feedback);
    }
  };

  // Toggle function for showing/hiding details
  const toggleDetails = () => {
    setShowDetails(prev => !prev);
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
  } else if (stepIndex === 3) {
    content = (
      <div>
        <h4 className="font-semibold mb-2">Figma Specifications</h4>
        {figmaSpecs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {figmaSpecs.map((spec, i) => (
              <div key={i} className="border rounded-lg p-3 bg-gray-50">
                <h5 className="font-medium text-sm mb-1">{spec.name}</h5>
                <p className="text-xs text-gray-600 mb-2">{spec.description}</p>
                <div className="text-xs">
                  <span className="font-medium">Components:</span>
                  <ul className="mt-1 space-y-1">
                    {spec.components?.map((comp: string, j: number) => (
                      <li key={j} className="text-gray-700">• {comp}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500">No Figma specs generated yet</div>
        )}
      </div>
    );
  }

  if (!content) return null;

  return (
    <div className={isValidated ? 'border-green-300' : isInvalidated ? 'border-red-300' : ''}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-lg text-gray-800">
          Step {stepIndex + 1} Results
        </h3>
        <div className="flex items-center space-x-2">
          {/* Toggle details button */}
          <button 
            onClick={toggleDetails}
            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
            aria-label={showDetails ? "Hide details" : "Show details"}
            title={showDetails ? "Hide details" : "Show details"}
          >
            {showDetails ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
          
          {/* Close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close details"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* Content - shown only when showDetails is true */}
      {showDetails && (
        <div className="mt-4 animate-fadeIn">
          {content}
        </div>
      )}
      
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
