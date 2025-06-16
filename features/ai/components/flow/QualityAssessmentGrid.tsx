'use client';
import React from 'react';
import type { FigmaSpecQuality } from '@/lib/services/figmaSpecQuality';
import type { FigmaSpec } from '@/lib/services/figmaSpec';

interface QualityAssessmentGridProps {
  qualities: FigmaSpecQuality[];
  figmaSpecs: FigmaSpec[];
}

export default function QualityAssessmentGrid({ qualities, figmaSpecs }: QualityAssessmentGridProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 8) return '🟢';
    if (score >= 6) return '🟡';
    return '🔴';
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (qualities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">🧪</div>
        <p>Quality assessment in progress...</p>
      </div>
    );
  }

  // Calculate average scores
  const avgClarity = qualities.reduce((sum, q) => sum + q.clarity, 0) / qualities.length;
  const avgStructure = qualities.reduce((sum, q) => sum + q.structure, 0) / qualities.length;
  const avgFeasibility = qualities.reduce((sum, q) => sum + q.feasibility, 0) / qualities.length;
  const avgScore = qualities.reduce((sum, q) => sum + q.score, 0) / qualities.length;
  const avgBriefAlignment = qualities.reduce((sum, q) => sum + (q.briefAlignment || 0), 0) / qualities.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Quality Assessment Results</h3>
        <div className={`px-3 py-1 rounded-lg text-sm font-medium border ${getScoreColor(avgScore)}`}>
          {getScoreIcon(avgScore)} Average: {avgScore.toFixed(1)}/10
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-gray-700">{avgClarity.toFixed(1)}</div>
          <div className="text-xs text-gray-600">Clarity</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-gray-700">{avgStructure.toFixed(1)}</div>
          <div className="text-xs text-gray-600">Structure</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-gray-700">{avgFeasibility.toFixed(1)}</div>
          <div className="text-xs text-gray-600">Feasibility</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-gray-700">{avgBriefAlignment.toFixed(1)}</div>
          <div className="text-xs text-gray-600">Brief Alignment</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-gray-700">{qualities.length}</div>
          <div className="text-xs text-gray-600">Specs Tested</div>
        </div>
      </div>
      
      {/* Individual Spec Results */}
      <div className="grid gap-4 md:grid-cols-3">
        {qualities.map((quality, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 truncate">
                {figmaSpecs[index]?.name || `Spec ${index + 1}`}
              </h4>
              <div className={`px-2 py-1 rounded text-sm font-medium border ${getScoreColor(quality.score)}`}>
                {getScoreIcon(quality.score)} {quality.score.toFixed(1)}
              </div>
            </div>
            
            {/* Progress Bars */}
            <div className="space-y-2 mb-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600">Clarity</span>
                <span className="font-medium">{quality.clarity}/10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full ${getProgressBarColor(quality.clarity)}`}
                  style={{ width: `${(quality.clarity / 10) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600">Structure</span>
                <span className="font-medium">{quality.structure}/10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full ${getProgressBarColor(quality.structure)}`}
                  style={{ width: `${(quality.structure / 10) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600">Feasibility</span>
                <span className="font-medium">{quality.feasibility}/10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full ${getProgressBarColor(quality.feasibility)}`}
                  style={{ width: `${(quality.feasibility / 10) * 100}%` }}
                ></div>
              </div>
              
              {quality.briefAlignment && (
                <>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600">Brief Alignment</span>
                    <span className="font-medium">{quality.briefAlignment}/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full ${getProgressBarColor(quality.briefAlignment)}`}
                      style={{ width: `${(quality.briefAlignment / 10) * 100}%` }}
                    ></div>
                  </div>
                </>
              )}
            </div>
            
            {quality.notes && (
              <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-700 border-l-2 border-gray-300">
                <span className="font-medium text-gray-600">Notes: </span>
                {quality.notes}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
