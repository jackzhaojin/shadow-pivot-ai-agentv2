'use client';
import React from 'react';
import { createArtifactZipPlaceholder } from '@/utils/download';
import type { ExecutionTrace } from '@/utils/execution';

interface ProgressIndicatorProps {
  aborted: boolean;
  currentStep: number;
  stepsLength: number;
  executionTrace: ExecutionTrace | null;
}

export default function ProgressIndicator({ aborted, currentStep, stepsLength, executionTrace }: ProgressIndicatorProps) {
  const handleDownload = () => {
    if (!executionTrace) return;
    const content = createArtifactZipPlaceholder({ trace: JSON.stringify(executionTrace, null, 2) });
    const blob = new Blob([content], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `execution-${executionTrace.executionId}.zip`;
    a.click();
    URL.revokeObjectURL(url);
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
        <p className="text-red-700">The AI agent flow has been stopped. You can start a new flow anytime.</p>
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
