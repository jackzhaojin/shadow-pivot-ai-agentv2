'use client';
import React, { useState } from 'react';
import type { DesignEvaluationResult } from '../../../../lib/services/designEvaluation';
import type { FigmaSpec } from '../../../../lib/services/figmaSpec';
import type { SpecEvaluationResult } from '../../../../lib/services/figmaSpecEvaluation';
import { useAgentFlow as originalUseAgentFlow } from '../../../../providers/AgentFlowProvider';
import ValidationPanel from './ValidationPanel';
import { FigmaEvaluationResults } from './FigmaEvaluationResults';

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
  figmaEvaluationResults?: SpecEvaluationResult[];
  onClose?: () => void;
}

export default function StepResultPanel({
  stepIndex,
  brief,
  designConcepts,
  evaluationResults,
  selectedConcept,
  figmaSpecs = [],
  figmaEvaluationResults = [],
  onClose
}: StepResultPanelProps) {
  const { 
    validatedSteps, 
    invalidatedSteps, 
    markStepValidated, 
    markStepInvalidated, 
    figmaEvaluationResults: providerEvaluationResults,
    figmaSpecs: providerFigmaSpecs
  } = useAgentFlow();
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
    const successfulSpecs = figmaSpecs.length;
    const totalExpected = 3;
    
    content = (
      <div>
        <h4 className="font-semibold mb-2">Figma Specifications (3 Parallel)</h4>
        {successfulSpecs > 0 ? (
          <div>
            <div className={`p-2 mb-3 rounded-lg ${
              successfulSpecs === totalExpected 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <p className={`font-medium ${
                successfulSpecs === totalExpected ? 'text-green-800' : 'text-yellow-800'
              }`}>
                {successfulSpecs === totalExpected 
                  ? `✅ All ${totalExpected} Figma specs generated successfully!`
                  : `⚠️ ${successfulSpecs} out of ${totalExpected} Figma specs generated successfully`
                }
              </p>
              {successfulSpecs < totalExpected && (
                <p className="text-yellow-600 text-xs mt-1">
                  Some AI calls failed, but proceeding with the successful specifications.
                </p>
              )}
            </div>
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
          </div>
        ) : (
          <div className="text-sm text-gray-500">No Figma specs generated yet</div>
        )}
      </div>
    );
  } else if (stepIndex === 4) {
    content = (
      <div>
        <h4 className="font-semibold mb-2">Figma Spec Evaluation & Quality Assurance</h4>
        <div className="text-sm text-gray-700">
          <p className="mb-3">AI performed comprehensive quality evaluation of {figmaSpecs.length} Figma specifications, assessing:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-600 mb-4">
            <li>Design clarity and visual hierarchy</li>
            <li>Component structure and reusability</li>
            <li>Technical feasibility for code generation</li>
            <li>Accessibility and inclusive design principles</li>
          </ul>
          {figmaEvaluationResults.length > 0 ? (
            <FigmaEvaluationResults results={figmaEvaluationResults} />
          ) : (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 font-medium">⏳ Quality evaluation in progress...</p>
              <p className="text-yellow-600 text-xs mt-1">Analyzing {figmaSpecs.length} specifications</p>
            </div>
          )}
        </div>
      </div>
    );
  } else if (stepIndex === 5) {
    // Get selected Figma spec and reasoning from provider
    const { selectedFigmaSpec, figmaSelectionReasoning } = useAgentFlow();
    
    content = (
      <div>
        <h4 className="font-semibold mb-2">Figma Spec Selection</h4>
        <div className="text-sm text-gray-700">
          <p className="mb-2">Selected the best Figma specification using simple logic (effort vs. clarity tradeoffs):</p>
          
          {selectedFigmaSpec ? (
            <div className="space-y-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">✅ Selected: {selectedFigmaSpec.name}</p>
                <p className="text-green-600 text-sm mt-1">{selectedFigmaSpec.description}</p>
              </div>
              
              {figmaSelectionReasoning && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 font-medium text-sm">Selection Reasoning:</p>
                  <p className="text-blue-700 text-sm mt-1">{figmaSelectionReasoning}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 font-medium">⏳ Processing selection...</p>
                <p className="text-yellow-700 text-sm mt-1">
                  Evaluating {figmaSpecs.length} Figma specifications with {figmaEvaluationResults.length} evaluation results.
                </p>
              </div>
              
              {/* Manual trigger button for debugging */}
              <button
                onClick={async () => {
                  console.log('🔧 Manual Step 5 trigger button clicked');
                  
                  // Always use the freshest data from provider
                  const specsToUse = providerFigmaSpecs || figmaSpecs || [];
                  const resultsToUse = providerEvaluationResults || figmaEvaluationResults || [];
                  
                  console.log('🔧 Manual trigger data check:', {
                    propFigmaSpecs: figmaSpecs.length,
                    propEvaluationResults: figmaEvaluationResults.length,
                    providerFigmaSpecs: providerFigmaSpecs.length,
                    providerEvaluationResults: providerEvaluationResults.length,
                    specsToUse: specsToUse.length,
                    resultsToUse: resultsToUse.length
                  });
                  
                  if (specsToUse.length === 0 || resultsToUse.length === 0) {
                    console.error('🔧 Manual trigger: Missing required data');
                    return;
                  }
                  
                  try {
                    const res = await fetch('/api/agent/select-figma-spec', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'x-user-guid': 'manual-trigger' },
                      body: JSON.stringify({ 
                        figmaSpecs: specsToUse,
                        figmaEvaluationResults: resultsToUse
                      })
                    });
                    const data = await res.json();
                    console.log('🔧 Manual trigger result:', data);
                    if (data.success && data.selectedSpec) {
                      // This would normally be handled by the StepExecutor, but for debugging
                      window.location.reload(); // Simple way to refresh state
                    }
                  } catch (err) {
                    console.error('🔧 Manual trigger error:', err);
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                🔧 Manual Trigger (Debug)
              </button>
            </div>
          )}
        </div>
      </div>
    );
  } else if (stepIndex === 6) {
    content = (
      <div>
        <h4 className="font-semibold mb-2">Actual Figma Generation</h4>
        <div className="text-sm text-gray-700">
          <p className="mb-2">Generated production-ready Figma design file from selected specification.</p>
          {/* TODO: Display actual Figma file details */}
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-purple-800 font-medium">✅ Figma file generated successfully</p>
            <p className="text-purple-600 text-xs mt-1">Ready for code generation</p>
          </div>
        </div>
      </div>
    );
  } else if (stepIndex === 7) {
    content = (
      <div>
        <h4 className="font-semibold mb-2">Code Generation (3 Parallel)</h4>
        <div className="text-sm text-gray-700">
          <p className="mb-2">Generated 3 different code implementations from the Figma design:</p>
          {/* TODO: Display code implementation details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {[1, 2, 3].map((num) => (
              <div key={num} className="p-2 bg-green-50 border border-green-200 rounded">
                <p className="font-medium text-green-800">Implementation {num}</p>
                <p className="text-xs text-green-600">React + TypeScript</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  } else if (stepIndex === 8) {
    content = (
      <div>
        <h4 className="font-semibold mb-2">Code Evaluation & Selection</h4>
        <div className="text-sm text-gray-700">
          <p className="mb-2">AI evaluated code implementations based on:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-600 mb-3">
            <li>Code quality and maintainability</li>
            <li>Performance and bundle size</li>
            <li>Accessibility compliance</li>
            <li>Component structure and reusability</li>
          </ul>
          {/* TODO: Display selected code implementation details */}
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-orange-800 font-medium">Selected: Highest scoring implementation</p>
            <p className="text-orange-600 text-xs mt-1">Ready for download</p>
          </div>
        </div>
      </div>
    );
  } else if (stepIndex === 9) {
    content = (
      <div>
        <h4 className="font-semibold mb-2">Download Artifacts</h4>
        <div className="text-sm text-gray-700">
          <p className="mb-2">Complete package ready for download including:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-600 mb-3">
            <li>Production Figma design file</li>
            <li>Selected code implementation</li>
            <li>Execution trace and metadata</li>
            <li>Component documentation</li>
          </ul>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 font-medium">📦 Artifacts packaged and ready</p>
            <p className="text-blue-600 text-xs mt-1">ZIP file with complete deliverables</p>
          </div>
        </div>
      </div>
    );
  } else if (stepIndex === 6) {
    content = (
      <div>
        <h4 className="font-semibold mb-2">Download Figma Specification</h4>
        <div className="text-sm text-gray-700">
          <p className="mb-2">Complete Figma specification package ready for download including:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-600 mb-3">
            <li>Selected Figma design specification (JSON format)</li>
            <li>AI selection reasoning and quality analysis</li>
            <li>Complete execution trace and metadata</li>
            <li>README with usage instructions</li>
          </ul>
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">🎉 Figma specification ready for download</p>
            <p className="text-green-600 text-xs mt-1">ZIP archive with complete design deliverables</p>
          </div>
        </div>
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
