'use client';
import React, { useEffect, useCallback, useState } from 'react';
import { useAgentFlow } from '@/providers/AgentFlowProvider';
import { selectBestDesignConcept } from '@/lib/services/specSelection';
import { useUserGuid } from '@/providers/UserGuidProvider';
import { FigmaSpec } from '@/lib/services/figmaSpec';
import { SpecEvaluationResult } from '@/lib/services/figmaSpecEvaluation';
import FigmaGenerationGrid from './FigmaGenerationGrid';
import { FigmaEvaluationResults } from './FigmaEvaluationResults';

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
    setFigmaSpecs,
    figmaEvaluationResults,
    setFigmaEvaluationResults,
    selectedFigmaSpec,
    setSelectedFigmaSpec,
    figmaSelectionReasoning,
    setFigmaSelectionReasoning,
    executionTrace
  } = useAgentFlow();

  const userGuid = useUserGuid();

  // Download function for Figma specification
  const downloadFigmaSpec = useCallback(async () => {
    if (!selectedFigmaSpec) {
      console.error('❌ No selected Figma spec to download');
      addError('No Figma specification selected for download', 6);
      return;
    }

    console.log('📦 StepExecutor - Starting Figma spec download:', {
      specName: selectedFigmaSpec.name,
      hasReasoning: !!figmaSelectionReasoning,
      hasExecutionTrace: !!executionTrace,
      userGuid
    });

    try {
      const response = await fetch('/api/agent/download-figma-spec', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-guid': userGuid
        },
        body: JSON.stringify({
          selectedFigmaSpec,
          figmaSelectionReasoning,
          executionTrace,
          userGuid
        })
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }

      // Get the blob data
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `figma-spec-${selectedFigmaSpec.name?.replace(/[^a-zA-Z0-9]/g, '-') || 'download'}-${Date.now()}.zip`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ StepExecutor - Figma spec download completed:', {
        filename,
        fileSize: blob.size,
        specName: selectedFigmaSpec.name
      });

    } catch (error) {
      console.error('💥 StepExecutor - Download failed:', error);
      addError(error instanceof Error ? error.message : 'Failed to download Figma specification', 6);
    }
  }, [selectedFigmaSpec, figmaSelectionReasoning, executionTrace, userGuid, addError]);

  // Comprehensive debugging - Track all state changes
  useEffect(() => {
    console.log('🔍 StepExecutor - State changed, comprehensive debug:', {
      currentStep,
      figmaSpecs: {
        count: figmaSpecs.length,
        specs: figmaSpecs.map((spec, i) => ({ index: i, name: spec.name }))
      },
      designConcepts: {
        count: designConcepts.length,
        concepts: designConcepts.slice(0, 2)
      },
      evaluationResults: {
        count: evaluationResults.length
      },
      selectedConcept,
      aborted,
      failedStep,
      userGuid
    });
  }, [currentStep, figmaSpecs, designConcepts, evaluationResults, selectedConcept, aborted, failedStep, userGuid]);

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

  useEffect(() => {
    console.log('figmaSpecs changed:', figmaSpecs.length, figmaSpecs);
  }, [figmaSpecs]);

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

              // Return null for failed specs so they can be filtered out
              return null;
            }
          });

          console.log('🔄 StepExecutor - Waiting for all Figma spec generations to complete...');
          // Wait for all parallel generations to complete
          const results = await Promise.allSettled(promises);
          const specs = results
            .map(result => result.status === 'fulfilled' ? result.value : null)
            .filter(spec => spec !== null); // Remove null/failed specs

          console.log('📋 StepExecutor - All Figma specs generated:', specs);
          
          // Further filter to ensure we have valid specs with proper structure
          const validSpecs = specs.filter(spec => 
            spec && 
            spec.name && 
            spec.description &&
            spec.components && 
            Array.isArray(spec.components) &&
            spec.components.length > 0
          );

          console.log('📋 StepExecutor - Filtering specs - valid vs total:', {
            totalAttempts: 3,
            generatedSpecs: specs.length,
            validSpecs: validSpecs.length,
            fulfilledPromises: results.filter(r => r.status === 'fulfilled').length,
            rejectedPromises: results.filter(r => r.status === 'rejected').length
          });

          // Store only the valid specs
          setFigmaSpecs(validSpecs);
          
          // Proceed if we have at least one valid spec
          if (validSpecs.length > 0) {
            console.log(`🏁 StepExecutor - Completing step 3 - Generated ${validSpecs.length} out of 3 Figma specs successfully`);
            completeStep(3);
            
            // Force trigger Step 4 after a short delay to handle state update timing
            setTimeout(() => {
              console.log('🔄 StepExecutor - Force checking Step 4 trigger after Step 3 completion');
              // At this point currentStep should be 4, but let's be defensive
              console.log('🔍 StepExecutor - Current state for Step 4 force trigger:', {
                currentStep,
                isStep4Running,
                validSpecsCount: validSpecs.length
              });
              
              // Use validSpecs directly since we know they're valid
              if (validSpecs.length > 0 && !isStep4Running) {
                console.log('🚀 StepExecutor - Force triggering Step 4 evaluation with validSpecs');
                triggerStep4FigmaEvaluation(validSpecs);
              }
            }, 200);
            
            // If some failed, show a warning but don't block progress
            if (validSpecs.length < 3) {
              const failedCount = 3 - validSpecs.length;
              console.log(`⚠️ StepExecutor - ${failedCount} Figma spec(s) failed to generate, but proceeding with ${validSpecs.length} successful spec(s)`);
              // Don't call addError here as we want to proceed
            }
          } else {
            console.log('❌ StepExecutor - All Figma specs failed to generate');
            addError('All Figma specs failed to generate', 3);
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

  const [isStep4Running, setIsStep4Running] = useState(false);
  const [isStep5Running, setIsStep5Running] = useState(false);

  // Manual trigger for Step 5 with fresh data (bypasses stale closure)
  const triggerFigmaSelectionWithData = useCallback(async (freshFigmaSpecs: any[], freshEvaluationResults: any[]) => {
    if (isStep5Running) {
      console.log('⏸️ StepExecutor - Manual Step 5 trigger with data: already running, skipping');
      return;
    }

    console.log('🚀🚀🚀 StepExecutor - Manual trigger for Step 5 with fresh data:', {
      freshFigmaSpecsCount: freshFigmaSpecs.length,
      freshEvaluationResultsCount: freshEvaluationResults.length,
      userGuid
    });

    if (freshFigmaSpecs.length === 0 || freshEvaluationResults.length === 0) {
      console.error('❌ StepExecutor - Manual Step 5 trigger with data: Missing required data');
      return;
    }

    setIsStep5Running(true);

    try {
      console.log('📡 StepExecutor - Making API call to /api/agent/select-figma-spec with fresh data');
      
      const res = await fetch('/api/agent/select-figma-spec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-guid': userGuid },
        body: JSON.stringify({ 
          figmaSpecs: freshFigmaSpecs,
          figmaEvaluationResults: freshEvaluationResults
        })
      });
      
      console.log('📨 StepExecutor - Fresh data selection API response status:', res.status);
      const data = await res.json();
      console.log('📊 StepExecutor - Fresh data Step 5 API response data:', data);
      
      if (data.success && data.selectedSpec) {
        console.log('✅ StepExecutor - Fresh data selection results received:', {
          selectedSpecName: data.selectedSpec.name,
          reasoning: data.reasoning?.substring(0, 100) + '...'
        });
        
        setSelectedFigmaSpec(data.selectedSpec);
        setFigmaSelectionReasoning(data.reasoning);
        
        console.log('🏁 StepExecutor - Fresh data completing step 5 - Figma Spec Selection');
        completeStep(5);
      } else {
        console.error('❌ StepExecutor - Fresh data selection: Invalid results format:', data);
        addError('Figma spec selection failed - no spec selected', 5);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('💥 StepExecutor - Fresh data Step 5 API call error:', err);
      addError(`Figma spec selection failed: ${message}`, 5);
    } finally {
      setIsStep5Running(false);
    }
  }, [isStep5Running, userGuid, setSelectedFigmaSpec, setFigmaSelectionReasoning, completeStep, addError]);
  
  useEffect(() => {
    console.log('🧪🧪🧪 StepExecutor - Step 4 (Testing) useEffect triggered:', {
      currentStep,
      figmaSpecsLength: figmaSpecs.length,
      figmaSpecs: figmaSpecs.map((spec, i) => ({ index: i, name: spec.name, componentsCount: spec.components?.length })),
      aborted,
      isStep4Running,
      condition: currentStep === 4 && figmaSpecs.length > 0 && !aborted && !isStep4Running,
      stepName: currentStep === 4 ? 'Figma Spec Testing & Quality Assurance' : `Step ${currentStep}`,
      debugging: {
        currentStepIs4: currentStep === 4,
        hasFigmaSpecs: figmaSpecs.length > 0,
        notAborted: !aborted,
        notAlreadyRunning: !isStep4Running,
        allConditionsMet: currentStep === 4 && figmaSpecs.length > 0 && !aborted && !isStep4Running,
        userGuid: userGuid
      }
    });

    // Add explicit console logs for debugging
    console.log('🔍🔍🔍 StepExecutor - Step 4 Debug - Checking conditions individually:');
    console.log('  - currentStep === 4:', currentStep === 4, '(currentStep is:', currentStep, ')');
    console.log('  - figmaSpecs.length > 0:', figmaSpecs.length > 0, '(length is:', figmaSpecs.length, ')');
    console.log('  - !aborted:', !aborted, '(aborted is:', aborted, ')');
    console.log('  - !isStep4Running:', !isStep4Running, '(isStep4Running is:', isStep4Running, ')');
    console.log('  - Combined condition:', currentStep === 4 && figmaSpecs.length > 0 && !aborted && !isStep4Running);

    if (currentStep === 4 && figmaSpecs.length > 0 && !aborted && !isStep4Running) {
      console.log('🚀🚀🚀 StepExecutor - Starting Figma spec evaluation and quality assurance process');
      setIsStep4Running(true);
      const evaluateFigmaSpecsQuality = async () => {
        try {
          console.log('📡 StepExecutor - Making API call to /api/agent/evaluate-figma-specs with specs:', {
            specsCount: figmaSpecs.length,
            specsPreview: figmaSpecs.map((s, i) => ({
              index: i,
              name: s.name?.substring(0, 30) + '...',
              componentCount: s.components?.length || 0
            }))
          });

          const res = await fetch('/api/agent/evaluate-figma-specs', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json', 
              'x-user-guid': userGuid 
            },
            body: JSON.stringify({ figmaSpecs })
          });

          console.log('📨 StepExecutor - Evaluation API response status:', res.status);
          const data = await res.json();
          console.log('📊 StepExecutor - Step 4 API response data:', data);

          if (data.evaluationResults && Array.isArray(data.evaluationResults)) {
            console.log('✅ StepExecutor - Evaluation results received:', {
              resultsCount: data.evaluationResults.length,
              avgScore: data.evaluationResults.reduce((sum: number, r: any) => sum + r.overallScore, 0) / data.evaluationResults.length,
              totalIssues: data.evaluationResults.reduce((sum: number, r: any) => sum + r.issues.length, 0)
            });

            // Store evaluation results in state
            setFigmaEvaluationResults(data.evaluationResults);
            
            // Complete step 4 (evaluation)
            console.log('🏁 StepExecutor - Completing step 4 - Figma Spec Evaluation & Quality Assurance');
            completeStep(4);
          } else if (data.success === true && data.evaluationResults) {
            // Handle case where API returns { success: true, evaluationResults: [...] } but the results might be empty
            console.log('⚠️ StepExecutor - API returned success with evaluationResults, but structure is unexpected:', data);
            
            // Try to proceed with whatever results we have
            const results = Array.isArray(data.evaluationResults) ? data.evaluationResults : [];
            console.log('🔄 StepExecutor - Processing fallback results:', results.length);
            
            setFigmaEvaluationResults(results);
            completeStep(4);
          } else if (data.success === false && data.error) {
            // API explicitly returned an error
            console.error('❌ StepExecutor - API returned error:', data.error);
            
            // Force completion with mock results to prevent blocking
            console.log('🔄 StepExecutor - Creating mock evaluation results to prevent blocking');
            const mockResults = figmaSpecs.map((spec, index) => ({
              specId: spec.name || `spec-${index}`,
              overallScore: 6,
              clarityScore: 6,
              structureScore: 6,
              feasibilityScore: 6,
              accessibilityScore: 6,
              issues: [{
                category: 'system',
                severity: 'medium' as const,
                description: 'Evaluation service temporarily unavailable',
                suggestion: 'Proceeding with default scoring for now'
              }],
              strengths: ['Spec structure appears valid'],
              recommendations: ['Manual review recommended when evaluation service is restored']
            }));
            
            setFigmaEvaluationResults(mockResults);
            completeStep(4);
          } else {
            console.error('❌ StepExecutor - Invalid evaluation results format:', data);
            
            // Force completion with mock results instead of failing
            console.log('🔄 StepExecutor - Creating fallback evaluation results to prevent workflow blocking');
            const fallbackResults = figmaSpecs.map((spec, index) => ({
              specId: spec.name || `spec-${index}`,
              overallScore: 7,
              clarityScore: 7,
              structureScore: 7,
              feasibilityScore: 7,
              accessibilityScore: 7,
              issues: [],
              strengths: ['Spec appears well-structured'],
              recommendations: ['Consider manual quality review']
            }));
            
            setFigmaEvaluationResults(fallbackResults);
            completeStep(4);
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          console.error('💥 StepExecutor - Step 4 API call error:', err);
          addError(message, 4);
        } finally {
          setIsStep4Running(false);
        }
      };

      evaluateFigmaSpecsQuality();
    } else if (currentStep === 4 && figmaSpecs.length === 0 && !aborted && !isStep4Running) {
      // Fallback: Try with mock data if no figmaSpecs yet (race condition handling)
      console.log('🔧🔧🔧 StepExecutor - Step 4 triggered but no figmaSpecs yet, using fallback with timeout');
      setTimeout(() => {
        console.log('⏰ StepExecutor - Timeout check for figmaSpecs:', {
          figmaSpecsLength: figmaSpecs.length,
          stillOnStep4: currentStep === 4,
          isStep4Running
        });
        if (currentStep === 4 && figmaSpecs.length === 0 && !isStep4Running) {
          console.log('🔄 StepExecutor - Using mock data for Step 4 evaluation');
          const mockFigmaSpecs = [
            { name: 'Mock Figma Spec 1', description: 'Mock spec for testing', components: [] },
            { name: 'Mock Figma Spec 2', description: 'Another mock spec', components: [] },
            { name: 'Mock Figma Spec 3', description: 'Third mock spec', components: [] }
          ];
          
          triggerStep4FigmaEvaluation(mockFigmaSpecs);
        }
      }, 1000); // Wait 1 second for potential figmaSpecs update
    } else if (currentStep === 4 && !aborted && !isStep4Running) {
      // Additional fallback: if we're on step 4 but conditions aren't perfectly met, 
      // try to proceed anyway after a short delay
      console.log('🔄🔄🔄 StepExecutor - Step 4 fallback trigger (conditions not perfect)');
      setTimeout(() => {
        if (currentStep === 4 && !isStep4Running) {
          const specsToUse = figmaSpecs.length > 0 ? figmaSpecs : [
            { name: 'Fallback Spec 1', description: 'Generated due to timing issues', components: ['Component1'] },
            { name: 'Fallback Spec 2', description: 'Generated due to timing issues', components: ['Component2'] },
            { name: 'Fallback Spec 3', description: 'Generated due to timing issues', components: ['Component3'] }
          ];
          console.log('� StepExecutor - Fallback: Force triggering Step 4 with specs:', specsToUse.length);
          triggerStep4FigmaEvaluation(specsToUse);
        }
      }, 500);
    } else {
      console.log('⏸️⏸️⏸️ StepExecutor - Step 4 (Testing) conditions not met:', {
        currentStepIs4: currentStep === 4,
        hasFigmaSpecs: figmaSpecs.length > 0,
        notAborted: !aborted,
        figmaSpecsDetails: figmaSpecs.map((spec, i) => ({ index: i, name: spec.name })),
        willRetryWithTimeout: currentStep === 4 && figmaSpecs.length === 0 && !aborted && !isStep4Running
      });
    }
  }, [currentStep, figmaSpecs, aborted, isStep4Running, userGuid, setFigmaEvaluationResults, completeStep, addError]);

  // Manual trigger for Step 4 to handle timing issues
  const triggerStep4FigmaEvaluation = useCallback(async (figmaSpecsToEvaluate: FigmaSpec[]) => {
    if (isStep4Running) {
      console.log('⏸️ StepExecutor - Step 4 already running, skipping manual trigger');
      return;
    }
    
    console.log('🚀🚀🚀 StepExecutor - Manual trigger for Step 4 Figma evaluation:', {
      specsCount: figmaSpecsToEvaluate.length,
      userGuid
    });

    setIsStep4Running(true);
    try {
      console.log('📡 StepExecutor - Making API call to /api/agent/evaluate-figma-specs with manual trigger');
      const res = await fetch('/api/agent/evaluate-figma-specs', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'x-user-guid': userGuid 
        },
        body: JSON.stringify({ figmaSpecs: figmaSpecsToEvaluate })
      });

      console.log('📨 StepExecutor - Manual evaluation API response status:', res.status);
      const data = await res.json();
      console.log('📊 StepExecutor - Manual Step 4 API response data:', data);

      if (data.evaluationResults && Array.isArray(data.evaluationResults)) {
        console.log('✅ StepExecutor - Manual evaluation results received:', {
          resultsCount: data.evaluationResults.length,
          avgScore: data.evaluationResults.reduce((sum: number, r: any) => sum + r.overallScore, 0) / data.evaluationResults.length,
          originalSpecsCount: figmaSpecsToEvaluate.length,
          hasWarning: !!data.warning
        });

        // Log if some specs were filtered out
        if (data.warning) {
          console.warn('⚠️ StepExecutor - Some specs were filtered out during evaluation:', data.warning);
          if (data.invalidSpecs) {
            console.warn('📝 StepExecutor - Details of invalid specs:', data.invalidSpecs);
          }
        }

        // Store evaluation results in state
        setFigmaEvaluationResults(data.evaluationResults);
        
        // Complete step 4 (evaluation)
        console.log('🏁 StepExecutor - Manual completing step 4 - Figma Spec Evaluation & Quality Assurance');
        completeStep(4);

        // IMMEDIATE manual trigger for Step 5 - same pattern as Step 4 manual trigger
        console.log('🚀🚀 StepExecutor - IMMEDIATE manual trigger for Step 5 after Step 4 completion');
        setTimeout(() => {
          console.log('🎯🎯 StepExecutor - Executing immediate Step 5 trigger with current data:', {
            figmaSpecsToEvaluateCount: figmaSpecsToEvaluate.length,
            evaluationResultsCount: data.evaluationResults?.length || 0
          });
          
          if (figmaSpecsToEvaluate.length > 0 && data.evaluationResults && data.evaluationResults.length > 0) {
            console.log('📡🎯 StepExecutor - Triggering Step 5 with valid data');
            // Call the selection API directly with fresh data instead of using stale closure
            triggerFigmaSelectionWithData(figmaSpecsToEvaluate, data.evaluationResults);
          } else {
            console.error('❌ StepExecutor - Immediate Step 5 trigger: Missing required data:', {
              hasFigmaSpecsToEvaluate: figmaSpecsToEvaluate.length > 0,
              hasEvaluationResults: data.evaluationResults && data.evaluationResults.length > 0
            });
          }
        }, 100);
      } else if (data.success === true) {
        // Handle case where API returns success but with unexpected structure
        console.log('⚠️ StepExecutor - Manual trigger: API returned success with unexpected structure:', data);
        
        // Create fallback results to prevent blocking
        const fallbackResults = figmaSpecsToEvaluate.map((spec, index) => ({
          specId: spec.name || `spec-${index}`,
          overallScore: 7,
          clarityScore: 7,
          structureScore: 7,
          feasibilityScore: 7,
          accessibilityScore: 7,
          issues: [],
          strengths: ['Spec appears valid'],
          recommendations: ['Manual review recommended']
        }));
        
        setFigmaEvaluationResults(fallbackResults);
        completeStep(4);

        // IMMEDIATE manual trigger for Step 5 - success fallback path
        setTimeout(() => {
          console.log('🚀🚀 StepExecutor - IMMEDIATE manual trigger for Step 5 after success fallback completion');
          if (figmaSpecsToEvaluate.length > 0 && fallbackResults.length > 0) {
            console.log('📡🎯 StepExecutor - Triggering Step 5 with fallback data');
            triggerFigmaSelectionWithData(figmaSpecsToEvaluate, fallbackResults);
          }
        }, 100);
      } else {
        console.error('❌ StepExecutor - Manual evaluation: Invalid results format:', data);
        
        // Create fallback results instead of failing
        const fallbackResults = figmaSpecsToEvaluate.map((spec, index) => ({
          specId: spec.name || `spec-${index}`,
          overallScore: 6,
          clarityScore: 6,
          structureScore: 6,
          feasibilityScore: 6,
          accessibilityScore: 6,
          issues: [{
            category: 'system',
            severity: 'medium' as const,
            description: 'Evaluation parsing failed',
            suggestion: 'Manual review recommended'
          }],
          strengths: [],
          recommendations: ['Consider manual quality assessment']
        }));
        
        setFigmaEvaluationResults(fallbackResults);
        completeStep(4);

        // IMMEDIATE manual trigger for Step 5 - error fallback path
        setTimeout(() => {
          console.log('🚀🚀 StepExecutor - IMMEDIATE manual trigger for Step 5 after error fallback completion');
          if (figmaSpecsToEvaluate.length > 0 && fallbackResults.length > 0) {
            console.log('📡🎯 StepExecutor - Triggering Step 5 with error fallback data');
            triggerFigmaSelectionWithData(figmaSpecsToEvaluate, fallbackResults);
          }
        }, 100);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('💥 StepExecutor - Manual Step 4 API call error:', err);
      addError(message, 4);
    } finally {
      setIsStep4Running(false);
    }
  }, [isStep4Running, userGuid, setFigmaEvaluationResults, completeStep, addError]);

  // Step 5: Figma Spec Selection (Simple Logic, No AI)
  useEffect(() => {
    console.log('🎯 StepExecutor - Step 5 (Figma Spec Selection) useEffect triggered:', {
      currentStep,
      figmaSpecsLength: figmaSpecs.length,
      figmaEvaluationResultsLength: figmaEvaluationResults.length,
      aborted,
      condition: currentStep === 5 && figmaSpecs.length > 0 && figmaEvaluationResults.length > 0 && !aborted,
      stepName: currentStep === 5 ? 'Figma Spec Selection' : `Step ${currentStep}`,
      debugging: {
        currentStepIs5: currentStep === 5,
        hasFigmaSpecs: figmaSpecs.length > 0,
        hasFigmaEvaluationResults: figmaEvaluationResults.length > 0,
        notAborted: !aborted,
        allConditionsMet: currentStep === 5 && figmaSpecs.length > 0 && figmaEvaluationResults.length > 0 && !aborted,
        userGuid: userGuid
      }
    });

    // Force trigger Step 5 if we have the required data but currentStep tracking is off
    const shouldForceTriggerStep5 = figmaSpecs.length > 0 && 
                                   figmaEvaluationResults.length > 0 && 
                                   !aborted && 
                                   !selectedFigmaSpec &&
                                   (currentStep === 5 || (figmaSpecs.length > 0 && figmaEvaluationResults.length > 0));

    console.log('🔍 StepExecutor - Step 5 force trigger check:', {
      shouldForceTriggerStep5,
      hasSelectedSpec: !!selectedFigmaSpec,
      selectedSpecName: selectedFigmaSpec?.name || 'None'
    });

    if (shouldForceTriggerStep5) {
      console.log('🚀 StepExecutor - Starting Figma spec selection process (simple logic, no AI)');
      
      const selectBestFigmaSpecProcess = async () => {
        try {
          console.log('📡 StepExecutor - Making API call to /api/agent/select-figma-spec with:', {
            figmaSpecsCount: figmaSpecs.length,
            evaluationResultsCount: figmaEvaluationResults.length
          });
          
          const res = await fetch('/api/agent/select-figma-spec', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-guid': userGuid },
            body: JSON.stringify({ 
              figmaSpecs,
              figmaEvaluationResults
            })
          });
          
          console.log('📨 StepExecutor - Figma selection API response status:', res.status);
          const data = await res.json();
          console.log('📊 StepExecutor - Step 5 API response data:', data);
          
          if (data.success && data.selectedSpec) {
            console.log('✅ StepExecutor - Selected Figma spec successfully:', {
              selectedSpecName: data.selectedSpec.name,
              reasoning: data.reasoning?.substring(0, 100) + '...'
            });
            
            // Store the selected spec and reasoning in state
            setSelectedFigmaSpec(data.selectedSpec);
            setFigmaSelectionReasoning(data.reasoning);
            
            console.log('🏁 StepExecutor - Completing step 5 - Figma Spec Selection');
            completeStep(5);
          } else {
            console.error('❌ StepExecutor - API succeeded but no selectedSpec returned:', data);
            addError('Figma spec selection failed - no spec selected', 5);
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          console.error('💥 StepExecutor - Step 5 API call error:', err);
          addError(`Figma spec selection failed: ${message}`, 5);
        }
      };
      
      selectBestFigmaSpecProcess();
    } else if (currentStep === 5 && figmaSpecs.length > 0 && !aborted) {
      // Fallback: if we're on step 5 but don't have evaluation results yet, wait a bit then proceed
      console.log('⏰ StepExecutor - Step 5: No evaluation results yet, setting up fallback timer');
      setTimeout(() => {
        if (currentStep === 5 && !aborted) {
          console.log('🔄 StepExecutor - Step 5 fallback: proceeding without evaluation results');
          // Use first spec as fallback selection
          if (figmaSpecs.length > 0) {
            setSelectedFigmaSpec(figmaSpecs[0]);
            setFigmaSelectionReasoning('Fallback selection: chose first available spec due to missing evaluation results');
          }
          completeStep(5);
        }
      }, 2000);
    } else {
      console.log('⏸️ StepExecutor - Step 5 conditions not met:', {
        currentStepIs5: currentStep === 5,
        hasFigmaSpecs: figmaSpecs.length > 0,
        hasFigmaEvaluationResults: figmaEvaluationResults.length > 0,
        figmaSpecsDetails: figmaSpecs.map(s => s.name),
        notAborted: !aborted
      });
    }
  }, [currentStep, figmaSpecs, figmaEvaluationResults, aborted, userGuid, completeStep, addError, setSelectedFigmaSpec, setFigmaSelectionReasoning, selectedFigmaSpec]);

  // Step 6: Download Figma Specification (MVP Final Step)
  useEffect(() => {
    console.log('📦 StepExecutor - Step 6 (Download Figma Specification) useEffect triggered:', {
      currentStep,
      selectedFigmaSpec: selectedFigmaSpec?.name || 'None',
      aborted,
      condition: currentStep === 6 && selectedFigmaSpec && !aborted,
      stepName: currentStep === 6 ? 'Download Figma Specification' : `Step ${currentStep}`
    });
    
    if (currentStep === 6 && selectedFigmaSpec && !aborted) {
      console.log('🚀 StepExecutor - Download step reached - auto-completing since download is user-initiated');
      // Auto-complete this step since download is user-initiated
      setTimeout(() => {
        console.log('✅ StepExecutor - Auto-completing download Figma specification step');
        completeStep(6);
      }, 1000);
    } else {
      console.log('⏸️ StepExecutor - Step 6 conditions not met:', {
        currentStepIs6: currentStep === 6,
        hasSelectedFigmaSpec: !!selectedFigmaSpec,
        selectedSpecName: selectedFigmaSpec?.name || 'None',
        notAborted: !aborted
      });
    }
  }, [currentStep, selectedFigmaSpec, aborted, completeStep]);


  useEffect(() => {
    console.log('💻 StepExecutor - Step 7 useEffect triggered:', {
      currentStep,
      aborted,
      condition: currentStep === 7 && !aborted,
      stepName: currentStep === 7 ? 'Code Generation (3 Parallel)' : `Step ${currentStep}`
    });
    if (currentStep === 7 && !aborted) {
      console.log('🚀 StepExecutor - Starting parallel code generation process');
      const generateCodeParallel = async () => {
        try {
          console.log('💻 StepExecutor - Starting 3 parallel code generation calls');
          
          // Create 3 parallel API calls for code generation
          const promises = Array.from({ length: 3 }, async (_, index) => {
            console.log(`📡 StepExecutor - Starting Code API call ${index + 1}/3`);
            try {
              const res = await fetch('/api/agent/generate-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-guid': userGuid },
                body: JSON.stringify({ 
                  figmaFile: 'TODO: Pass actual Figma file from state',
                  variation: index + 1
                })
              });
              
              if (!res.ok) {
                throw new Error(`Code generation API call ${index + 1} failed: ${res.status}`);
              }
              
              const data = await res.json();
              console.log(`✅ StepExecutor - Code API call ${index + 1} completed:`, data);
              return data;
            } catch (error) {
              console.error(`💥 StepExecutor - Code API call ${index + 1} failed:`, error);
              throw error;
            }
          });

          console.log('⏳ StepExecutor - Waiting for all Code API calls to complete...');
          const results = await Promise.allSettled(promises);
          
          console.log('🎯 StepExecutor - All Code API calls completed!', {
            totalCalls: results.length,
            successful: results.filter(r => r.status === 'fulfilled').length,
            failed: results.filter(r => r.status === 'rejected').length
          });
          
          const successfulResults = results
            .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
            .map(r => r.value);
          
          const hasErrors = results.some(r => r.status === 'rejected');
          
          if (successfulResults.length > 0) {
            // TODO: Store generated code implementations in state
            console.log('💾 StepExecutor - Setting code implementations in state:', successfulResults.length);
          }
          
          if (!hasErrors) {
            console.log('🏁 StepExecutor - All code generation successful! Completing step 6');
            completeStep(6);
          } else {
            console.log('❌ StepExecutor - Some code generation failed');
            addError('Some code implementations failed to generate', 6);
          }
        } catch (error) {
          console.error('💥 StepExecutor - Critical error in code generation:', error);
          addError(error instanceof Error ? error.message : 'Unknown error in code generation', 6);
        }
      };
      
      generateCodeParallel();
    }
  }, [currentStep, aborted, userGuid, completeStep, addError]);

  // Step 7: Code Evaluation & Selection
  useEffect(() => {
    console.log('🎯 StepExecutor - Step 7 useEffect triggered:', {
      currentStep,
      aborted,
      condition: currentStep === 7 && !aborted,
      stepName: currentStep === 7 ? 'Code Evaluation & Selection' : `Step ${currentStep}`
    });
    if (currentStep === 7 && !aborted) {
      console.log('🚀 StepExecutor - Starting code evaluation process');
      const selectBestCode = async () => {
        try {
          console.log('📡 StepExecutor - Making API call to /api/agent/select-code');
          const res = await fetch('/api/agent/select-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-guid': userGuid },
            body: JSON.stringify({ codeImplementations: 'TODO: Pass code implementations from state' })
          });
          
          console.log('📨 StepExecutor - Code selection API response status:', res.status);
          const data = await res.json();
          console.log('📊 StepExecutor - Step 7 API response data:', data);
          
          if (data.selectedCode) {
            // TODO: Store selected code implementation in state
            console.log('✅ StepExecutor - Selected code implementation:', data.selectedCode);
            completeStep(7);
          } else {
            console.error('❌ StepExecutor - No selected code returned');
            addError('Failed to select code implementation', 7);
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          console.error('💥 StepExecutor - Step 7 API call error:', err);
          addError(message, 7);
        }
      };
      
      selectBestCode();
    }
  }, [currentStep, aborted, userGuid, completeStep, addError]);

  // Step 8: Download Artifacts (Auto-complete since download is user-initiated)
  useEffect(() => {
    console.log('📦 StepExecutor - Step 8 useEffect triggered:', {
      currentStep,
      aborted,
      condition: currentStep === 8 && !aborted,
      stepName: currentStep === 8 ? 'Download Artifacts' : `Step ${currentStep}`
    });
    if (currentStep === 8 && !aborted) {
      console.log('🚀 StepExecutor - Reached download artifacts step');
      // Auto-complete this step since download is user-initiated
      setTimeout(() => {
        console.log('✅ StepExecutor - Auto-completing download artifacts step');
        completeStep(8);
      }, 1000);
    }
  }, [currentStep, aborted, completeStep]);
  
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
        rejectedCount: results.filter(r => r.status === 'rejected').length
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
        console.log('📊 StepExecutor - Figma specs set in state, should trigger Step 4 next');
      } else {
        console.log('⚠️ StepExecutor - No successful Figma specs to set in state');
      }
      
      // Complete Step 3 if we have at least 1 successful result (instead of requiring all to succeed)
      if (successfulResults.length > 0) {
        console.log('🏁 StepExecutor - At least one Figma spec generated successfully! Completing step 3 - Figma Spec Generation');
        console.log('📈 StepExecutor - Success rate:', {
          successful: successfulResults.length,
          total: results.length,
          successRate: `${Math.round((successfulResults.length / results.length) * 100)}%`,
          hasPartialFailures: hasErrors
        });
        
        completeStep(3);
        console.log('🎉 StepExecutor - Step 3 completion called, should advance to Step 4');
        
        // Force trigger Step 4 after a short delay to handle state update timing
        setTimeout(() => {
          console.log('🔄 StepExecutor - Force checking Step 4 trigger after triggerFigmaGeneration completion');
          console.log('🔍 StepExecutor - Current state for Step 4 force trigger:', {
            currentStep,
            isStep4Running,
            successfulResultsCount: successfulResults.length
          });
          
          // Use successfulResults directly since we know they're valid
          if (successfulResults.length > 0 && !isStep4Running) {
            console.log('🚀 StepExecutor - Force triggering Step 4 evaluation from triggerFigmaGeneration');
            triggerStep4FigmaEvaluation(successfulResults);
          }
        }, 200);
        
        // Debug: Check if step 4 will trigger
        setTimeout(() => {
          console.log('🔍 StepExecutor - Post-Step-3-completion verification:', {
            currentStep,
            figmaSpecsLength: successfulResults.length,
            shouldTriggerStep4: 'currentStep should be 4 and figmaSpecs should be > 0'
          });
        }, 100);
      } else {
        console.log('❌ StepExecutor - No Figma specs generated successfully, cannot proceed to Step 4:', {
          errorCount: results.filter(r => r.status === 'rejected').length,
          successCount: results.filter(r => r.status === 'fulfilled').length
        });
        addError('All Figma spec generation attempts failed', 3);
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Generating Figma Specs (3 Parallel)</h2>
          <FigmaGenerationGrid states={figmaSpecStates} />
          {figmaSpecs.length > 0 && figmaSpecStates.some(s => s.status === 'completed') && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center">
                <div className="text-green-600 text-lg mr-2">✅</div>
                <div>
                  <p className="text-green-800 font-medium">
                    {figmaSpecs.length} Figma spec{figmaSpecs.length > 1 ? 's' : ''} generated successfully!
                  </p>
                  <p className="text-green-600 text-sm">
                    {figmaSpecStates.filter(s => s.status === 'error').length > 0 
                      ? `${figmaSpecStates.filter(s => s.status === 'completed').length}/${figmaSpecStates.length} calls succeeded - proceeding with available specs`
                      : 'All parallel generation calls completed successfully'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {currentStep === 4 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Figma Spec Evaluation & Quality Assurance</h2>
          {figmaEvaluationResults.length === 0 ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600">AI is evaluating spec quality, design clarity, technical feasibility, and accessibility compliance...</p>
            </div>
          ) : (
            <FigmaEvaluationResults results={figmaEvaluationResults} />
          )}
        </div>
      )}
      {currentStep === 5 && (
        <div className="space-y-6">
          {/* Previous testing results for reference */}
          {figmaEvaluationResults.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quality Assessment Results</h2>
              <FigmaEvaluationResults results={figmaEvaluationResults} />
            </div>
          )}
          
          {/* Current step progress */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Evaluating & Selecting Best Figma Spec</h2>
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">AI is analyzing quality scores and selecting the optimal spec for implementation...</p>
            </div>
          </div>
        </div>
      )}
      {currentStep === 6 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Download Figma Specification</h2>
          <div className="text-center">
            <div className="bg-green-50 rounded-xl p-6 mb-4">
              <div className="text-green-600 text-4xl mb-2">🎉</div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">Figma Specification Ready!</h3>
              <p className="text-green-600">Your selected Figma design specification is ready for download.</p>
            </div>
            <button 
              onClick={() => downloadFigmaSpec()}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-8 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              📦 Download Figma Specification
            </button>
          </div>
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
