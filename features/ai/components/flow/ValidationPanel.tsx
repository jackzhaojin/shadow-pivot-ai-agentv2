'use client';
import React, { useState } from 'react';
// Use relative path import for better CommonJS compatibility
import { useAgentFlow as originalUseAgentFlow } from '../../../../providers/AgentFlowProvider';

// Special handling for test environment
let useAgentFlow = originalUseAgentFlow;

// This will be used in the server-side test environment
if (typeof window === 'undefined' && process.env.NODE_ENV === 'test') {
  try {
    // In the test environment, we'll use a mock
    const { useAgentFlow: mockUseAgentFlow } = require('../../../../tests/mocks/AgentFlowProviderMock');
    // Override the useAgentFlow import with the mock
    useAgentFlow = mockUseAgentFlow;
  } catch (e) {
    console.warn('Could not load AgentFlowProviderMock for testing');
  }
}

interface ValidationPanelProps {
  stepIndex: number;
  onValidationComplete: (isValid: boolean) => void;
}

export default function ValidationPanel({ stepIndex, onValidationComplete }: ValidationPanelProps) {
  const [validationStatus, setValidationStatus] = useState<'pending' | 'validating' | 'valid' | 'invalid'>('pending');
  const [feedback, setFeedback] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { executionTrace } = useAgentFlow();

  const handleValidate = async (isValid: boolean) => {
    setValidationStatus('validating');
    
    try {
      // Log validation event to execution trace
      if (executionTrace) {
        const outcome = isValid ? 'valid' : 'invalid';
        const message = isValid 
          ? `Step ${stepIndex + 1} validated successfully` 
          : `Step ${stepIndex + 1} validation failed: ${feedback}`;
        
        // In a real implementation, this would be an API call to store validation status
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
        
        // Update local state
        setValidationStatus(isValid ? 'valid' : 'invalid');
        
        // Close the modal after validation
        setIsModalOpen(false);
        
        // Notify parent component
        onValidationComplete(isValid);
      }
    } catch (error) {
      console.error('Validation error:', error);
      setValidationStatus('invalid');
    }
  };

  const openValidationModal = () => {
    setIsModalOpen(true);
  };

  const closeValidationModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="mt-4">
      <button
        onClick={openValidationModal}
        className="flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium text-sm"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Validate this step
      </button>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-gray-800 text-lg">Step Validation</h4>
              <button 
                onClick={closeValidationModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mt-2">
              <div className="text-sm text-gray-600 mb-3">
                Is this step result valid and acceptable?
              </div>
              
              {validationStatus === 'valid' ? (
                <div className="bg-green-50 border border-green-200 rounded p-3 text-green-800 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Validated successfully
                </div>
              ) : validationStatus === 'invalid' ? (
                <div className="bg-red-50 border border-red-200 rounded p-3 text-red-800 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Validation failed: {feedback}
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <textarea
                      className="w-full border border-gray-300 rounded p-2 text-sm"
                      placeholder="Optional feedback or notes about this step result..."
                      rows={3}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      disabled={validationStatus === 'validating'}
                    />
                  </div>
                  <div className="flex space-x-3 justify-end">
                    <button
                      onClick={closeValidationModal}
                      className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded text-sm transition duration-150"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleValidate(true)}
                      disabled={validationStatus === 'validating'}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm transition duration-150 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {validationStatus === 'validating' ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Valid
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleValidate(false)}
                      disabled={validationStatus === 'validating' || !feedback.trim()}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition duration-150 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Invalid
                    </button>
                  </div>
                  {!feedback.trim() && validationStatus === 'pending' && (
                    <p className="text-xs text-red-600 mt-1">Feedback required for marking as invalid</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
