'use client';
import React from 'react';
import type { DesignEvaluationResult } from '@/lib/designEvaluation';
import type { ExecutionTrace } from '@/utils/execution';
import { formatDate } from '@/utils/format';

interface ResultsDisplayProps {
  brief: string;
  designConcepts: string[];
  evaluationResults: DesignEvaluationResult[];
  selectedConcept: string | null;
  executionTrace: ExecutionTrace | null;
  showTimeline: boolean;
  setShowTimeline: (b: boolean) => void;
}

export default function ResultsDisplay({ brief, designConcepts, evaluationResults, selectedConcept, executionTrace, showTimeline, setShowTimeline }: ResultsDisplayProps) {
  return (
    <>
      {designConcepts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Design Concepts</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-gray-700">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 whitespace-pre-line">
              <h3 className="font-semibold text-gray-900 mb-2">Creative Brief</h3>
              {brief}
            </div>
            <div className="space-y-4">
              {designConcepts.map((c, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-200">{c}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {evaluationResults.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Design Evaluation</h2>
          <ul className="space-y-2 text-gray-700">
            {evaluationResults.map((r, i) => (
              <li
                key={i}
                className={`p-3 rounded-lg border ${selectedConcept === r.concept ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200'}`}
              >
                <span className="font-semibold">{r.concept}</span> - Score: {r.score}
                {r.reason && <div className="text-sm text-gray-500">{r.reason}</div>}
              </li>
            ))}
          </ul>
          {selectedConcept && (
            <div className="mt-4 p-2 bg-emerald-100 rounded-md text-emerald-800 text-sm">
              Selected Concept: {selectedConcept}
            </div>
          )}
        </div>
      )}

      {executionTrace && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 mb-8">
          <button onClick={() => setShowTimeline(!showTimeline)} className="text-sm text-blue-600 underline mb-2">
            {showTimeline ? 'Hide Timeline' : 'Show Timeline'}
          </button>
          {showTimeline && (
            <ul className="space-y-1">
              {executionTrace.timeline.map((e, idx) => (
                <li key={idx} className="text-sm text-gray-700">
                  <span className="font-mono text-gray-500 mr-2">{formatDate(new Date(e.timestamp))}</span>
                  {e.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
}
