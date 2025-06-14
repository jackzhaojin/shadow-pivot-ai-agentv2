'use client';
import React from 'react';
import type { DesignEvaluationResult } from '@/lib/services/designEvaluation';

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
    <div className="p-4 mb-4 bg-white border border-gray-200 rounded-xl shadow transition-all duration-300">
      {content}
    </div>
  );
}
