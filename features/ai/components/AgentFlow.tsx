'use client';
import { useState } from 'react';
import { useAgentFlow } from '@/providers/AgentFlowProvider';
import { selectBestDesignConcept } from '@/lib/specSelection';
import { createArtifactZipPlaceholder } from '@/utils/download';
import { formatDate } from '@/utils/format';
import { useUserGuid } from '@/providers/UserGuidProvider';

export default function AgentFlow() {
  const { steps, currentStep, completed, completeStep, abort, aborted, startExecution, executionTrace, designConcepts, setDesignConcepts, evaluationResults, setEvaluationResults, selectedConcept, setSelectedConcept } = useAgentFlow();
  const userGuid = useUserGuid();
  const [brief, setBrief] = useState('');
  const [showTimeline, setShowTimeline] = useState(false);

  const startFlow = async () => {
    if (currentStep <= 0) {
      // Reset execution and begin first step
      startExecution();
      try {
        const res = await fetch('/api/agent/generate-design-concepts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-guid': userGuid
          },
          body: JSON.stringify({ brief })
        });
        const data = await res.json();
        if (Array.isArray(data.concepts)) {
          setDesignConcepts(data.concepts);
        }
      } catch (err) {
        console.error(err);
      }
      completeStep(0);
      // Automatically proceed to the next step
      setTimeout(() => {
        nextStep();
      }, 10);
    }
  };

  const nextStep = async () => {
    if (currentStep < steps.length) {
      if (currentStep === 1 && designConcepts.length > 0) {
        try {
          const res = await fetch('/api/agent/evaluate-designs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-guid': userGuid
            },
            body: JSON.stringify({ concepts: designConcepts })
          });
          const data = await res.json();
          if (Array.isArray(data.evaluations)) {
            setEvaluationResults(data.evaluations);
            setSelectedConcept(selectBestDesignConcept(data.evaluations));
          }
        } catch (err) {
          console.error(err);
        }
      }
      const finished = currentStep;
      completeStep(currentStep);
      // Auto-progress through early steps without manual clicks
      if (finished + 1 < 3) {
        setTimeout(() => {
          nextStep();
        }, 10);
      }
    }
  };

  const handleDownload = () => {
    if (!executionTrace) return;
    const content = createArtifactZipPlaceholder({
      trace: JSON.stringify(executionTrace, null, 2)
    });
    const blob = new Blob([content], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `execution-${executionTrace.executionId}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAbort = () => abort();

  const getStepIcon = (index: number) => {
    if (completed.has(index)) {
      return (
        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
          ✓
        </div>
      );
    }
    if (currentStep === index && !aborted) {
      return (
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold animate-pulse">
          {index + 1}
        </div>
      );
    }
    return (
      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm font-semibold">
        {index + 1}
      </div>
    );
  };

  const getConnectorLine = (index: number) => {
    if (index === steps.length - 1) return null;
    
    const isCompleted = completed.has(index);
    const isActive = currentStep > index;
    
    return (
      <div className={`w-0.5 h-12 ml-4 ${isCompleted || isActive ? 'bg-emerald-500' : 'bg-gray-300'} transition-colors duration-300`} />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
            AI Agent Flow
          </h1>
          <p className="text-gray-600 text-lg">Transform your ideas into beautiful, functional UI components</p>
          <div className="mt-2 text-sm text-gray-500">User ID: {userGuid}</div>
        </div>

        {/* Creative Brief Section */}
        {currentStep <= 0 && !aborted && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Start Your Journey</h2>
              <p className="text-gray-600 mb-6">Describe your vision and let AI bring it to life</p>
              
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 mb-2 block">Creative Brief</span>
                  <textarea
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none bg-gray-50 focus:bg-white"
                    rows={5}
                    value={brief}
                    onChange={(e) => setBrief(e.target.value)}
                    placeholder="Describe the UI component you want to create. Be specific about functionality, style, and data visualization needs..."
                  />
                </label>
                
                <button 
                  onClick={startFlow} 
                  disabled={!brief.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
                >
                  {brief.trim() ? '🚀 Start AI Agent Flow' : 'Enter your creative brief to begin'}
                </button>
        </div>
      </div>

      {designConcepts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Design Concepts</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            {designConcepts.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {evaluationResults.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Design Evaluation</h2>
          <ul className="space-y-2 text-gray-700">
            {evaluationResults.map((r, i) => (
              <li
                key={i}
                className={`p-2 rounded-md ${selectedConcept === r.concept ? 'bg-emerald-50' : ''}`}
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
          <button
            onClick={() => setShowTimeline(!showTimeline)}
            className="text-sm text-blue-600 underline mb-2"
          >
            {showTimeline ? 'Hide Timeline' : 'Show Timeline'}
          </button>
          {showTimeline && (
            <ul className="space-y-1">
              {executionTrace.timeline.map((e, idx) => (
                <li key={idx} className="text-sm text-gray-700">
                  <span className="font-mono text-gray-500 mr-2">
                    {formatDate(new Date(e.timestamp))}
                  </span>
                  {e.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
          </div>
        )}

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Progress Timeline</h2>
          
          <div className="space-y-0">
            {steps.map((step, index) => (
              <div key={step} className="flex items-start">
                <div className="flex flex-col items-center">
                  {getStepIcon(index)}
                  {getConnectorLine(index)}
                </div>
                
                <div className="ml-4 pb-12 flex-1">
                  <div className={`p-4 rounded-xl border transition-all duration-300 ${
                    currentStep === index && !aborted 
                      ? 'bg-blue-50 border-blue-200 shadow-md' 
                      : completed.has(index) 
                        ? 'bg-emerald-50 border-emerald-200' 
                        : 'bg-gray-50 border-gray-200'
                  }`}>
                    <h3 className={`font-semibold mb-1 ${
                      currentStep === index && !aborted 
                        ? 'text-blue-900' 
                        : completed.has(index) 
                          ? 'text-emerald-900' 
                          : 'text-gray-700'
                    }`}>
                      {step}
                    </h3>
                    <p className={`text-sm ${
                      currentStep === index && !aborted 
                        ? 'text-blue-700' 
                        : completed.has(index) 
                          ? 'text-emerald-700' 
                          : 'text-gray-500'
                    }`}>
                      {currentStep === index && !aborted && 'Currently processing...'}
                      {completed.has(index) && 'Completed successfully'}
                      {currentStep < index && 'Waiting...'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        {!aborted && currentStep >= 0 && currentStep < steps.length && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleAbort}
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 px-8 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Abort Flow
              </button>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {aborted && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-red-900 mb-2">Flow Aborted</h3>
            <p className="text-red-700">The AI agent flow has been stopped. You can start a new flow anytime.</p>
          </div>
        )}

        {!aborted && currentStep >= steps.length && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-emerald-900 mb-2">Flow Complete!</h3>
            <p className="text-emerald-700 mb-4">Your AI agent flow has completed successfully. Your artifacts are ready for download.</p>
            <button
              onClick={handleDownload}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-8 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Download Artifacts
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
