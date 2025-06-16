'use client';
import React, { useEffect, useCallback } from 'react';
import { useAgentFlow } from '@/providers/AgentFlowProvider';
import { selectBestDesignConcept } from '@/lib/services/specSelection';
import { useUserGuid } from '@/providers/UserGuidProvider';
import { FigmaSpec } from '@/lib/services/figmaSpec';
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
    console.log('🚀 StepExecutor - startFlow called:', {
      currentStep,
      briefLength: brief.length,
      userGuid
    });
    
    if (currentStep <= 0) {
      console.log('🎬 StepExecutor - Starting execution for step 0');
      startExecution();
      
      try {
        console.log('📡 StepExecutor - Making API call to /api/agent/generate-design-concepts');
        const res = await fetch('/api/agent/generate-design-concepts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-guid': userGuid },
          body: JSON.stringify({ brief })
        });
        
        console.log('📨 StepExecutor - API response status:', res.status, res.statusText);
        
        const data = await res.json();
        console.log('📊 StepExecutor - Step 0 API response data:', data);
        
        if (Array.isArray(data.concepts)) {
          console.log('✅ StepExecutor - Step 0 API success - setting design concepts:', data.concepts);
          setDesignConcepts(data.concepts);
          console.log('🏁 StepExecutor - Step 0 - calling completeStep(0)');
          completeStep(0);
          console.log('✨ StepExecutor - Step 0 - completeStep(0) called');
          
          // Immediately trigger step 1 with the fresh data
          console.log('⏭️ StepExecutor - Immediately calling nextStep for step 1 with fresh data');
          setTimeout(() => {
            console.log('⏰ StepExecutor - Timeout triggered - triggering step 1');
            // Use the fresh data directly instead of relying on state
            triggerStep1WithConcepts(data.concepts);
          }, 100);
        } else {
          console.error('❌ StepExecutor - Step 0 API failed to return concepts array:', data);
          addError('Failed to generate design concepts', 0);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('💥 StepExecutor - Step 0 API call error:', err);
        addError(message, 0);
      }
    } else {
      console.log('⏭️ StepExecutor - startFlow called but currentStep > 0, skipping');
    }
  };

  const triggerStep1WithConcepts = useCallback(async (concepts: string[]) => {
    console.log('🎯 StepExecutor - triggerStep1WithConcepts called with concepts:', {
      conceptCount: concepts.length,
      concepts,
      currentStep,
      userGuid
    });
    try {
      console.log('📡 StepExecutor - Making API call to /api/agent/evaluate-designs');
      const res = await fetch('/api/agent/evaluate-designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-guid': userGuid },
        body: JSON.stringify({ concepts })
      });
      
      console.log('📨 StepExecutor - API response status:', res.status, res.statusText);
      
      const data = await res.json();
      console.log('📊 StepExecutor - Step 1 API response data:', data);
      
      if (Array.isArray(data.evaluations)) {
        console.log('✅ StepExecutor - Valid evaluations received, setting results');
        setEvaluationResults(data.evaluations);
        
        const bestConcept = selectBestDesignConcept(data.evaluations);
        console.log('🏆 StepExecutor - Selected best concept:', bestConcept);
        setSelectedConcept(bestConcept);
        
        console.log('🏁 StepExecutor - Calling completeStep(1)');
        completeStep(1);
        
        // Automatically advance through Step 2 since we have the selected concept
        setTimeout(() => {
          console.log('🚀 StepExecutor - Auto-advancing through Step 2 to Figma generation');
          console.log('📊 StepExecutor - Pre-Step-2-completion state:', {
            currentStep,
            selectedConcept: !!selectedConcept,
            selectedConceptValue: selectedConcept,
            aborted
          });
          completeStep(2);
          console.log('✅ StepExecutor - Step 2 completion called, should advance to Step 3');
          
          // Force trigger Step 3 directly since state synchronization is problematic
          setTimeout(() => {
            console.log('🔍 StepExecutor - Post-Step-2-completion verification:', {
              currentStep,
              selectedConcept: !!selectedConcept,
              aborted,
              shouldTriggerStep3: currentStep === 3 && selectedConcept && !aborted
            });
            
            // Force trigger Figma generation with the bestConcept we know is valid
            if (bestConcept) {
              console.log('🚀 StepExecutor - Force triggering Figma generation with bestConcept:', bestConcept);
              triggerFigmaGeneration(bestConcept);
            }
          }, 200);
        }, 100);
      } else {
        console.error('❌ StepExecutor - Step 1 API response is not an array:', data);
        addError('Failed to evaluate designs', 1);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('💥 StepExecutor - Step 1 API call error:', err);
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
            
            // Automatically advance through Step 2 since we have the selected concept
            setTimeout(() => {
              console.log('🚀 Auto-advancing through Step 2 to Figma generation');
              completeStep(2);
            }, 100);
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

  useEffect(() => {
    console.log('selectedConcept changed:', selectedConcept);
    console.log('Current state when selectedConcept changed:', {
      currentStep,
      selectedConcept,
      aborted,
      evaluationResultsLength: evaluationResults.length
    });
  }, [selectedConcept, currentStep, aborted, evaluationResults]);

  useEffect(() => {
    console.log('evaluationResults changed:', evaluationResults.length, evaluationResults);
  }, [evaluationResults]);

  // Auto-progress from spec selection to Figma generation once a concept is selected
  useEffect(() => {
    console.log('🎯 StepExecutor - Step 2 useEffect triggered:', {
      currentStep,
      selectedConcept,
      aborted,
      condition: currentStep === 2 && selectedConcept && !aborted,
      stepName: currentStep === 2 ? 'Spec Selection / Confirmation' : `Step ${currentStep}`
    });
    if (currentStep === 2 && selectedConcept && !aborted) {
      console.log('✅ StepExecutor - Auto-completing step 2 to progress to Figma generation');
      completeStep(2);
      console.log('🏁 StepExecutor - Step 2 completed, should now advance to step 3');
    } else {
      console.log('⏸️ StepExecutor - Step 2 conditions not met for auto-completion');
    }
  }, [currentStep, selectedConcept, aborted, completeStep]);

  // Real parallel Figma spec generation with proper API integration
  useEffect(() => {
    console.log('🎨 StepExecutor - Step 3 useEffect triggered:', {
      currentStep,
      selectedConcept,
      aborted,
      condition: currentStep === 3 && selectedConcept && !aborted,
      stepName: currentStep === 3 ? 'Figma Spec Generation' : `Step ${currentStep}`,
      debugging: {
        currentStepIs3: currentStep === 3,
        hasSelectedConcept: !!selectedConcept,
        selectedConceptLength: selectedConcept?.length || 0,
        notAborted: !aborted,
        userGuid: userGuid
      }
    });
    if (currentStep === 3 && selectedConcept && !aborted) {
      console.log('🚀 StepExecutor - Starting Figma spec generation process');
      console.log('🎯 StepExecutor - Figma generation conditions met, starting generation...');
      const generateFigmaSpecsParallel = async () => {
        try {
          console.log('🎨 StepExecutor - Starting Figma spec generation for concept:', selectedConcept);
          // Initialize all processes as starting
          setFigmaSpecStates(states =>
            states.map(s => ({ ...s, status: 'processing' as const, progress: 10 }))
          );

          // Create 3 parallel API calls with different progress tracking
          const promises = Array.from({ length: 3 }, async (_, index) => {
            console.log(`📡 StepExecutor - Starting Figma API call ${index + 1}/3`);
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
              
              console.log(`📨 StepExecutor - Figma API call ${index + 1} response:`, res.status, res.statusText);

              if (!res.ok) {
                throw new Error(`HTTP ${res.status}: Failed to generate Figma spec`);
              }

              const data = await res.json();
              console.log(`📊 StepExecutor - Figma API call ${index + 1} data:`, data);
              
              // Mark this process as completed
              setFigmaSpecStates(prev => {
                const next = [...prev];
                next[index] = { status: 'completed' as const, progress: 100 };
                return next;
              });

              // Extract the single spec from the response array
              const specResult = (data.specs && data.specs.length > 0) ? data.specs[0] : {
                name: `${selectedConcept} - Spec ${index + 1}`,
                description: 'Generated Figma specification',
                components: ['Component 1', 'Component 2']
              };
              
              console.log(`✅ StepExecutor - Figma spec ${index + 1} generated:`, specResult);
              return specResult;
            } catch (error) {
              console.error(`💥 StepExecutor - Error generating Figma spec ${index + 1}:`, error);
              
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

          console.log('🔄 StepExecutor - Waiting for all Figma spec generations to complete...');
          // Wait for all parallel generations to complete
          const results = await Promise.allSettled(promises);
          const specs = results.map(result => 
            result.status === 'fulfilled' ? result.value : {
              name: 'Failed Generation',
              description: 'Error occurred during generation',
              components: ['Error']
            }
          );

          console.log('📋 StepExecutor - All Figma specs generated:', specs);
          // Store the generated specs
          setFigmaSpecs(specs);
          
          // Check if we should complete the step (only if no errors)
          const hasErrors = results.some(result => result.status === 'rejected');
          console.log('🎯 StepExecutor - Figma spec generation completed:', {
            hasErrors,
            resultsCount: results.length,
            specs: specs.length,
            completedResults: results.filter(r => r.status === 'fulfilled').length,
            rejectedResults: results.filter(r => r.status === 'rejected').length
          });
          
          if (!hasErrors) {
            console.log('🏁 StepExecutor - Completing step 3 - Figma Spec Generation');
            completeStep(3);
          } else {
            console.log('❌ StepExecutor - Not completing step 3 due to errors');
            addError('Some Figma specs failed to generate', 3);
          }

        } catch (error) {
          console.error('💥 StepExecutor - Error in parallel Figma spec generation:', error);
          addError(error instanceof Error ? error.message : 'Unknown error in Figma generation', 3);
          
          // Mark all as error
          setFigmaSpecStates(states =>
            states.map(s => ({ ...s, status: 'error' as const, progress: 0 }))
          );
        }
      };

      console.log('🎬 StepExecutor - Calling generateFigmaSpecsParallel function');
      generateFigmaSpecsParallel();
    } else {
      console.log('⏸️ StepExecutor - Step 3 conditions not met:', {
        currentStepIs3: currentStep === 3,
        hasSelectedConcept: !!selectedConcept,
        notAborted: !aborted
      });
    }
  }, [currentStep, selectedConcept, aborted, userGuid, setFigmaSpecStates, setFigmaSpecs, completeStep, addError]);
  
  // Function to trigger Figma generation directly with a given concept
  const triggerFigmaGeneration = useCallback(async (concept: string) => {
    console.log('🚀 StepExecutor - triggerFigmaGeneration called with concept:', concept);
    console.log('🎯 StepExecutor - Force starting Figma generation...');
    
    try {
      console.log('🎨 StepExecutor - Starting Figma spec generation for concept:', concept);
      // Initialize all processes as starting
      setFigmaSpecStates(states =>
        states.map(s => ({ ...s, status: 'processing' as const, progress: 10 }))
      );

      // Create 3 parallel API calls with different progress tracking
      const promises = Array.from({ length: 3 }, async (_, index) => {
        console.log(`📡 StepExecutor - Starting Figma API call ${index + 1}/3`);
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
              concept: concept, 
              brief: brief 
            })
          });

          clearInterval(progressInterval);
          
          if (!res.ok) {
            throw new Error(`API call failed: ${res.status}`);
          }

          const data = await res.json();
          console.log(`✅ StepExecutor - Figma API call ${index + 1}/3 completed successfully:`, {
            callIndex: index + 1,
            responseStatus: res.status,
            hasSpecs: !!data.specs,
            specsCount: Array.isArray(data.specs) ? data.specs.length : 0,
            userGuid: data.userGuid,
            dataKeys: Object.keys(data)
          });
          console.log(`📄 StepExecutor - Figma API call ${index + 1} response data:`, data);

          // Mark this specific generation as complete
          setFigmaSpecStates(prev => {
            const next = [...prev];
            next[index] = {
              ...next[index],
              status: 'completed' as const,
              progress: 100
            };
            console.log(`📈 StepExecutor - Updated progress for call ${index + 1}: 100% completed`);
            return next;
          });

          // Extract the single spec from the response array and return it
          return (data.specs && data.specs.length > 0) ? data.specs[0] : {
            name: `${concept} - Spec ${index + 1}`,
            description: 'Generated Figma specification',
            components: ['Component 1', 'Component 2']
          };
        } catch (error) {
          console.error(`❌ StepExecutor - Figma API call ${index + 1}/3 failed with error:`, {
            callIndex: index + 1,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            errorType: typeof error,
            error: error
          });
          
          // Mark this specific generation as error
          setFigmaSpecStates(prev => {
            const next = [...prev];
            next[index] = {
              ...next[index],
              status: 'error' as const,
              progress: 0
            };
            console.log(`📉 StepExecutor - Updated progress for call ${index + 1}: 0% (error state)`);
            return next;
          });

          throw error;
        }
      });

      console.log('⏳ StepExecutor - Waiting for all Figma API calls to complete...');
      const results = await Promise.allSettled(promises);
      
      console.log('🎯 StepExecutor - All Figma API calls completed! Results summary:', {
        totalCalls: results.length,
        fulfilledCount: results.filter(r => r.status === 'fulfilled').length,
        rejectedCount: results.filter(r => r.status === 'rejected').length,
        resultStatuses: results.map((r, i) => ({ callIndex: i + 1, status: r.status }))
      });
      
      // Log detailed results for each call
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          console.log(`✅ StepExecutor - Call ${index + 1} result:`, {
            callIndex: index + 1,
            status: 'fulfilled',
            specsReceived: result.value?.length || 0,
            specs: result.value
          });
        } else {
          console.log(`❌ StepExecutor - Call ${index + 1} result:`, {
            callIndex: index + 1,
            status: 'rejected',
            reason: result.reason
          });
        }
      });
      
      // Collect successful results - each promise now returns a single FigmaSpec
      const successfulResults = results
        .filter((r): r is PromiseFulfilledResult<FigmaSpec> => r.status === 'fulfilled')
        .map(r => r.value);
      
      const hasErrors = results.some(r => r.status === 'rejected');
      
      console.log('📊 StepExecutor - Figma generation final summary:', {
        totalResults: results.length,
        successfulSpecs: successfulResults.length,
        completedResults: results.filter(r => r.status === 'fulfilled').length,
        rejectedResults: results.filter(r => r.status === 'rejected').length,
        hasErrors: hasErrors,
        willCompleteStep3: !hasErrors,
        allSpecsReceived: successfulResults
      });
      
      if (successfulResults.length > 0) {
        console.log('💾 StepExecutor - Setting Figma specs in state:', {
          specsToSet: successfulResults.length,
          firstSpecPreview: successfulResults[0] ? { 
            name: successfulResults[0].name, 
            description: successfulResults[0].description?.substring(0, 100) + '...',
            componentCount: successfulResults[0].components?.length || 0
          } : null
        });
        setFigmaSpecs(successfulResults);
      } else {
        console.log('⚠️ StepExecutor - No successful Figma specs to set in state');
      }
      
      if (!hasErrors) {
        console.log('🏁 StepExecutor - All Figma calls successful! Completing step 3 - Figma Spec Generation');
        completeStep(3);
        console.log('🎉 StepExecutor - Step 3 completion called, should advance to Step 4');
      } else {
        console.log('❌ StepExecutor - Some Figma calls failed, not completing step 3:', {
          errorCount: results.filter(r => r.status === 'rejected').length,
          successCount: results.filter(r => r.status === 'fulfilled').length
        });
        addError('Some Figma specs failed to generate', 3);
      }
    } catch (error) {
      console.error('💥 StepExecutor - Critical error in triggerFigmaGeneration:', {
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        concept: concept?.substring(0, 100) + '...',
        userGuid: userGuid
      });
      addError(error instanceof Error ? error.message : 'Unknown error in Figma generation', 3);
      
      // Mark all as error
      setFigmaSpecStates(states =>
        states.map(s => ({ ...s, status: 'error' as const, progress: 0 }))
      );
    }
  }, [userGuid, brief, setFigmaSpecStates, setFigmaSpecs, completeStep, addError]);

  useEffect(() => {
    console.log('Main useEffect triggered:', {
      currentStep,
      aborted,
      failedStep,
      designConceptsLength: designConcepts.length,
      shouldTriggerStep1: currentStep === 1 && !aborted && failedStep === null && designConcepts.length > 0
    });
    
    if (currentStep === 1 && !aborted && failedStep === null && designConcepts.length > 0) {
      console.log('Calling nextStep() for step 1 - currentStep:', currentStep);
      nextStep();
    }
  }, [currentStep, aborted, failedStep, designConcepts, nextStep]);

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
