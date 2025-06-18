'use client';
import React from 'react';
import { useAgentFlow } from '@/providers/AgentFlowProvider';
import { useUserGuid } from '@/providers/UserGuidProvider';
import type { ExecutionTrace } from '@/utils/execution';

interface ProgressIndicatorProps {
  aborted: boolean;
  currentStep: number;
  stepsLength: number;
  executionTrace: ExecutionTrace | null;
}

export default function ProgressIndicator({ aborted, currentStep, stepsLength, executionTrace }: ProgressIndicatorProps) {
  const { selectedFigmaSpec, figmaSelectionReasoning } = useAgentFlow();
  const userGuid = useUserGuid();

  const handleDownload = async () => {
    console.log('🚀 DOWNLOAD ARTIFACTS CLICKED!');
    
    try {
      // Get current state
      const currentSelectedFigmaSpec = selectedFigmaSpec;
      const currentFigmaSelectionReasoning = figmaSelectionReasoning;
      const currentExecutionTrace = executionTrace;
      
      console.log('📊 Sending download request with data:', {
        hasSelectedFigmaSpec: !!currentSelectedFigmaSpec,
        specName: currentSelectedFigmaSpec?.name,
        userGuid
      });

      const response = await fetch('/api/agent/download-figma-spec', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedFigmaSpec: currentSelectedFigmaSpec,
          figmaSelectionReasoning: currentFigmaSelectionReasoning,
          executionTrace: currentExecutionTrace,
          userGuid
        })
      });

      console.log('📨 Download response received:', {
        status: response.status,
        ok: response.ok
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      const blob = await response.blob();
      console.log('💾 Blob received:', {
        size: blob.size,
        type: blob.type
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `figma-spec-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      console.log('✅ Download completed successfully');
    } catch (error) {
      console.error('💥 Download failed:', error);
      alert(`Download error: ${error}`);
    }
  };

  if (aborted) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-red-900 mb-2">Flow Aborted</h3>
        <p className="text-red-700 mb-4">The AI agent flow has been stopped.</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
        >
          Restart Flow
        </button>
      </div>
    );
  }

  if (currentStep >= stepsLength) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-emerald-900 mb-2">Flow Complete!</h3>
        <p className="text-emerald-700 mb-4">Your AI agent flow has completed successfully. Your artifacts are ready for download.</p>
        <button onClick={handleDownload} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-8 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
          Download Artifacts
        </button>
      </div>
    );
  }

  return null;
}
