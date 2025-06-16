'use client';
import React, { useEffect, useCallback } from 'react';
import { useAgentFlow } from '@/providers/AgentFlowProvider';
import { selectBestDesignConcept } from '@/lib/services/specSelection';
import { useUserGuid } from '@/providers/UserGuidProvider';
import FigmaGenerationGrid from './FigmaGenerationGrid';

interface StepExecutorProps {
  brief: string;
  setBrief: (v: string) => void;
}

export default function StepExecutor({ brief, setBrief }: StepExecutorProps) {
  const {
    steps,
    currentStep,
    completeStep,
    abort,
    aborted,
    startExecution,
    designConcepts,
    setDesignConcepts,
    evaluationResults,
    setEvaluationResults,
    selectedConcept,
    setSelectedConcept,
    addError,
    failedStep,
    figmaSpecStates,
    setFigmaSpecStates,
    figmaSpecs,
    setFigmaSpecs
  } = useAgentFlow();

  const userGuid = useUserGuid();

  const startFlow = async () => {
    if (currentStep <= 0) {
      startExecution();
      try {
        const res = await fetch('/api/agent/generate-design-concepts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-guid': userGuid },
          body: JSON.stringify({ brief })
        });
        const data = await res.json();
        if (Array.isArray(data.concepts)) {
          console.log('Step 0 API success - setting design concepts:', data.concepts);
          setDesignConcepts(data.concepts);
          console.log('Step 0 - calling completeStep(0)');
          completeStep(0);
          console.log('Step 0 - completeStep(0) called');
          
          // Immediately trigger step 1 with the fresh data
          console.log('Immediately calling nextStep for step 1 with fresh data');
          setTimeout(() => {
            console.log('Timeout triggered - checking state for step 1');
            // Use the fresh data directly instead of relying on state
            triggerStep1WithConcepts(data.concepts);
          }, 100);
        } else {
          addError('Failed to generate design concepts', 0);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        addError(message, 0);
      }
    }
  };

  const triggerStep1WithConcepts = useCallback(async (concepts: string[]) => {
    console.log('triggerStep1WithConcepts called with concepts:', concepts);
    try {
      const res = await fetch('/api/agent/evaluate-designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-guid': userGuid },
        body: JSON.stringify({ concepts })
      });
      const data = await res.json();
      console.log('Step 1 API response data:', data);
      if (Array.isArray(data.evaluations)) {
        setEvaluationResults(data.evaluations);
        setSelectedConcept(selectBestDesignConcept(data.evaluations));
        completeStep(1);
      } else {
        console.error('Step 1 API response is not an array:', data);
        addError('Failed to evaluate designs', 1);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Step 1 API call error:', err);
      addError(message, 1);
    }
  }, [userGuid, setEvaluationResults, setSelectedConcept, completeStep, addError]);

  const nextStep = useCallback(async () => {
    console.log('nextStep called:', {
      currentStep,
      stepsLength: steps.length,
      designConceptsLength: designConcepts.length,
      condition1: currentStep < steps.length,
      condition2: currentStep === 1,
      condition3: designConcepts.length > 0
    });
    
    if (currentStep < steps.length) {
      if (currentStep === 1 && designConcepts.length > 0) {
        console.log('Making API call to evaluate-designs with concepts:', designConcepts);
        try {
          const res = await fetch('/api/agent/evaluate-designs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-guid': userGuid },
            body: JSON.stringify({ concepts: designConcepts })
          });
          const data = await res.json();
          console.log('API response data:', data);
          if (Array.isArray(data.evaluations)) {
            setEvaluationResults(data.evaluations);
            setSelectedConcept(selectBestDesignConcept(data.evaluations));
            completeStep(currentStep);
          } else {
            console.error('API response is not an array:', data);
            addError('Failed to evaluate designs', currentStep);
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          console.error('API call error:', err);
          addError(message, currentStep);
        }
        return;
      } else {
        console.log('Skipping API call - conditions not met:', {
          currentStep,
          designConceptsLength: designConcepts.length
        });
      }
      console.log('Completing step without API call:', currentStep);
      completeStep(currentStep);
    } else {
      console.log('Not calling nextStep - currentStep >= steps.length');
    }
  }, [currentStep, steps.length, designConcepts, userGuid, setEvaluationResults, setSelectedConcept, completeStep, addError]);

  // Add individual useEffects to track each dependency separately
  useEffect(() => {
    console.log('currentStep changed:', currentStep);
  }, [currentStep]);
  
  useEffect(() => {
    console.log('designConcepts changed:', designConcepts.length, designConcepts);
  }, [designConcepts]);

  // Auto-progress from spec selection to Figma generation once a concept is selected
  useEffect(() => {
    if (currentStep === 2 && selectedConcept && !aborted) {
      completeStep(2);
    }
  }, [currentStep, selectedConcept, aborted]);

  // Real parallel Figma spec generation with proper API integration
  useEffect(() => {
    if (currentStep === 3 && selectedConcept && !aborted) {
      const generateFigmaSpecsParallel = async () => {
        try {
          // Initialize all processes as starting
          setFigmaSpecStates(states =>
            states.map(s => ({ ...s, status: 'processing' as const, progress: 10 }))
          );

          // Create 3 parallel API calls with different progress tracking
          const promises = Array.from({ length: 3 }, async (_, index) => {
            try {
              // Simulate progress updates during generation
              const progressInterval = setInterval(() => {
                setFigmaSpecStates(prev => {
                  const next = [...prev];
                  if (next[index].status === 'processing' && next[index].progress < 90) {
                    next[index] = {
                      ...next[index],
                      progress: Math.min(90, next[index].progress + Math.random() * 15 + 10)
                    };
                  }
                  return next;
                });
              }, 200 + index * 100); // Stagger updates

              const res = await fetch('/api/agent/generate-figma-specs', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json', 
                  'x-user-guid': userGuid 
                },
                body: JSON.stringify({ 
                  concept: selectedConcept, 
                  brief: brief 
                })
              });

              clearInterval(progressInterval);

              if (!res.ok) {
                throw new Error(`HTTP ${res.status}: Failed to generate Figma spec`);
              }

              const data = await res.json();
              
              // Mark this process as completed
              setFigmaSpecStates(prev => {
                const next = [...prev];
                next[index] = { status: 'completed' as const, progress: 100 };
                return next;
              });

              return data.specs?.[0] || {
                name: `${selectedConcept} - Spec ${index + 1}`,
                description: 'Generated Figma specification',
                components: ['Component 1', 'Component 2']
              };
            } catch (error) {
              console.error(`Error generating Figma spec ${index + 1}:`, error);
              
              // Mark this process as error
              setFigmaSpecStates(prev => {
                const next = [...prev];
                next[index] = { status: 'error' as const, progress: 0 };
                return next;
              });

              return {
                name: `${selectedConcept} - Spec ${index + 1} (Error)`,
                description: `Failed to generate: ${error instanceof Error ? error.message : 'Unknown error'}`,
                components: ['Error placeholder']
              };
            }
          });

          // Wait for all parallel generations to complete
          const results = await Promise.allSettled(promises);
          const specs = results.map(result => 
            result.status === 'fulfilled' ? result.value : {
              name: 'Failed Generation',
              description: 'Error occurred during generation',
              components: ['Error']
            }
          );

          // Store the generated specs
          setFigmaSpecs(specs);
          
          // Check if we should complete the step (only if no errors)
          const hasErrors = results.some(result => result.status === 'rejected');
          if (!hasErrors) {
            completeStep(3);
          } else {
            addError('Some Figma specs failed to generate', 3);
          }

        } catch (error) {
          console.error('Error in parallel Figma spec generation:', error);
          addError(error instanceof Error ? error.message : 'Unknown error in Figma generation', 3);
          
          // Mark all as error
          setFigmaSpecStates(states =>
            states.map(s => ({ ...s, status: 'error' as const, progress: 0 }))
          );
        }
      };

      generateFigmaSpecsParallel();
    }
  }, [currentStep, selectedConcept, aborted, userGuid, brief, setFigmaSpecStates, setFigmaSpecs, completeStep, addError]);
  
  useEffect(() => {
    console.log('Main useEffect triggered:', {
      currentStep,
      aborted,
      failedStep,
      designConceptsLength: designConcepts.length
    });
    
    if (currentStep === 1 && !aborted && failedStep === null && designConcepts.length > 0) {
      console.log('Calling nextStep() for step 1 - currentStep:', currentStep);
      nextStep();
    }
  }, [currentStep, aborted, failedStep, designConcepts]);

  return (
    <>
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
        </div>
      )}
      {currentStep > 0 && !aborted && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Creative Brief</h2>
          <p className="whitespace-pre-line text-gray-700">{brief}</p>
        </div>
      )}
      {currentStep === 3 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Generating Figma Specs</h2>
          <FigmaGenerationGrid states={figmaSpecStates} />
        </div>
      )}
      {!aborted && currentStep >= 0 && currentStep < steps.length && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => abort()}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 px-8 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Abort Flow
            </button>
          </div>
        </div>
      )}
    </>
  );
}
