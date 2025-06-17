'use client';

import { SpecTestingResult } from '@/lib/services/figmaSpecTesting';

interface FigmaTestingResultsProps {
  results: SpecTestingResult[];
}

export function FigmaTestingResults({ results }: FigmaTestingResultsProps) {
  if (!results || results.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No testing results available</p>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50';
    if (score >= 4) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return '💡';
      default: return '📝';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Quality Assessment Results</h3>
        <div className="text-sm text-gray-500">
          {results.length} spec{results.length !== 1 ? 's' : ''} evaluated
        </div>
      </div>

      <div className="grid gap-6">
        {results.map((result, index) => (
          <div key={result.specId || index} className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
            {/* Header with overall score */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-gray-900">
                Spec {index + 1} Quality Report
              </h4>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(result.overallScore)}`}>
                Overall: {result.overallScore}/10
              </div>
            </div>

            {/* Score breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(result.clarityScore).split(' ')[0]}`}>
                  {result.clarityScore}
                </div>
                <div className="text-xs text-gray-600">Clarity</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(result.structureScore).split(' ')[0]}`}>
                  {result.structureScore}
                </div>
                <div className="text-xs text-gray-600">Structure</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(result.feasibilityScore).split(' ')[0]}`}>
                  {result.feasibilityScore}
                </div>
                <div className="text-xs text-gray-600">Feasibility</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(result.accessibilityScore).split(' ')[0]}`}>
                  {result.accessibilityScore}
                </div>
                <div className="text-xs text-gray-600">Accessibility</div>
              </div>
            </div>

            {/* Issues */}
            {result.issues && result.issues.length > 0 && (
              <div className="mb-6">
                <h5 className="text-sm font-medium text-gray-900 mb-3">Issues Found</h5>
                <div className="space-y-2">
                  {result.issues.map((issue, issueIndex) => (
                    <div
                      key={issueIndex}
                      className={`border rounded-lg p-3 ${getSeverityColor(issue.severity)}`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-sm">{getSeverityIcon(issue.severity)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium uppercase tracking-wide">
                              {issue.category}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-white bg-opacity-50">
                              {issue.severity}
                            </span>
                          </div>
                          <p className="text-sm mb-2">{issue.description}</p>
                          <p className="text-xs italic">💡 {issue.suggestion}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths */}
            {result.strengths && result.strengths.length > 0 && (
              <div className="mb-6">
                <h5 className="text-sm font-medium text-gray-900 mb-3">Strengths</h5>
                <div className="grid gap-2">
                  {result.strengths.map((strength, strengthIndex) => (
                    <div key={strengthIndex} className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg p-2">
                      <span>✅</span>
                      <span>{strength}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations && result.recommendations.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-3">Recommendations</h5>
                <div className="grid gap-2">
                  {result.recommendations.map((recommendation, recIndex) => (
                    <div key={recIndex} className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 rounded-lg p-2">
                      <span>🚀</span>
                      <span>{recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary stats */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h5 className="text-sm font-medium text-gray-900 mb-3">Summary</h5>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-gray-900">
              {(results.reduce((sum, r) => sum + r.overallScore, 0) / results.length).toFixed(1)}
            </div>
            <div className="text-xs text-gray-600">Avg Overall Score</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-600">
              {results.reduce((sum, r) => sum + (r.issues?.filter(i => i.severity === 'critical').length || 0), 0)}
            </div>
            <div className="text-xs text-gray-600">Critical Issues</div>
          </div>
          <div>
            <div className="text-lg font-bold text-orange-600">
              {results.reduce((sum, r) => sum + (r.issues?.filter(i => i.severity === 'high').length || 0), 0)}
            </div>
            <div className="text-xs text-gray-600">High Issues</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">
              {results.reduce((sum, r) => sum + (r.strengths?.length || 0), 0)}
            </div>
            <div className="text-xs text-gray-600">Total Strengths</div>
          </div>
        </div>
      </div>
    </div>
  );
}
