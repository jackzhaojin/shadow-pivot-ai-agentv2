import { generateChatCompletion } from '../daos/aiClient';
import { loadPromptTemplate, applyTemplate } from '../utils/promptUtils';
import { logInfo, logError, logDebug } from '../utils/debugLogger';
import path from 'path';
import type { FigmaSpec } from './figmaSpec';

export interface SpecEvaluationResult {
  specId: string;
  overallScore: number;
  clarityScore: number;
  structureScore: number;
  feasibilityScore: number;
  accessibilityScore: number;
  issues: {
    category: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    suggestion: string;
  }[];
  strengths: string[];
  recommendations: string[];
}

/**
 * Attempts to extract evaluation scores from markdown text when JSON parsing fails
 */
function tryExtractScoresFromMarkdown(markdownText: string, spec: FigmaSpec, index: number): SpecEvaluationResult | null {
  try {
    console.log('🔍 tryExtractScoresFromMarkdown - Attempting to parse markdown evaluation');
    
    // Try to extract scores from patterns like "Score: 8/10" or "8/10"
    const scorePatterns = [
      /Design Clarity.*?(?:Score:?\s*)?(\d+)\/10/i,
      /Component Structure.*?(?:Score:?\s*)?(\d+)\/10/i,
      /Technical Feasibility.*?(?:Score:?\s*)?(\d+)\/10/i,
      /Accessibility.*?(?:Score:?\s*)?(\d+)\/10/i
    ];
    
    const scores: number[] = [];
    for (const pattern of scorePatterns) {
      const match = markdownText.match(pattern);
      if (match && match[1]) {
        const score = parseInt(match[1]);
        if (!isNaN(score) && score >= 0 && score <= 10) {
          scores.push(score);
        }
      }
    }
    
    // If we found at least 2 scores, create a result
    if (scores.length >= 2) {
      const clarityScore = scores[0] || 7;
      const structureScore = scores[1] || 7;
      const feasibilityScore = scores[2] || 6;
      const accessibilityScore = scores[3] || 6;
      const overallScore = Math.round((clarityScore + structureScore + feasibilityScore + accessibilityScore) / 4);
      
      // Extract strengths and recommendations from markdown
      const strengths: string[] = [];
      const recommendations: string[] = [];
      const issues: SpecEvaluationResult['issues'] = [];
      
      // Look for strengths patterns
      const strengthsMatch = markdownText.match(/\*\*Strengths:\*\*([\s\S]*?)(?:\*\*|###|$)/i);
      if (strengthsMatch) {
        const strengthsText = strengthsMatch[1];
        const strengthLines = strengthsText.split('\n').filter(line => 
          line.trim().startsWith('-') || line.trim().startsWith('*')
        );
        strengthLines.forEach(line => {
          const cleaned = line.trim().replace(/^[-*]\s*/, '').trim();
          if (cleaned.length > 10) {
            strengths.push(cleaned);
          }
        });
      }
      
      // Look for recommendations/improvements
      const recMatch = markdownText.match(/(?:Recommendations|Areas for Improvement|Improvement)[\s\S]*?:([\s\S]*?)(?:\*\*|###|$)/i);
      if (recMatch) {
        const recText = recMatch[1];
        const recLines = recText.split('\n').filter(line => 
          line.trim().startsWith('-') || line.trim().startsWith('*') || line.trim().match(/^\d+\./)
        );
        recLines.forEach(line => {
          const cleaned = line.trim().replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '').trim();
          if (cleaned.length > 10) {
            recommendations.push(cleaned);
          }
        });
      }
      
      console.log('✅ tryExtractScoresFromMarkdown - Successfully extracted scores:', {
        clarityScore,
        structureScore,
        feasibilityScore,
        accessibilityScore,
        overallScore,
        strengthsCount: strengths.length,
        recommendationsCount: recommendations.length
      });
      
      return {
        specId: spec.name || `spec-${index}`,
        overallScore,
        clarityScore,
        structureScore,
        feasibilityScore,
        accessibilityScore,
        issues,
        strengths,
        recommendations
      };
    }
    
    console.log('⚠️ tryExtractScoresFromMarkdown - Could not extract enough scores, found:', scores.length);
    return null;
    
  } catch (error) {
    console.error('❌ tryExtractScoresFromMarkdown - Error during markdown parsing:', error);
    return null;
  }
}

/**
 * Evaluates a single Figma spec for quality, clarity, and technical feasibility
 * Following established patterns from design evaluation and figma spec generation
 */
export async function evaluateFigmaSpec(spec: FigmaSpec, index = 0): Promise<SpecEvaluationResult> {
  const requestId = `figma-eval-${Date.now()}-${index}`;
  
  logInfo('FIGMA_EVAL', `Starting quality evaluation for spec ${index}`, {
    specName: spec.name?.substring(0, 50) + '...',
    specDescription: spec.description?.substring(0, 100) + '...',
    componentCount: spec.components?.length || 0,
    index
  }, requestId);

  console.log('🧪 evaluateFigmaSpec - Starting quality evaluation for spec:', {
    specName: spec.name?.substring(0, 50) + '...',
    specDescription: spec.description?.substring(0, 100) + '...',
    componentCount: spec.components?.length || 0,
    index
  });

  const templatePath = path.join('prompts', 'figma-spec-evaluation', 'v1.json');
  console.log('📁 evaluateFigmaSpec - Loading template from:', templatePath);

  let template, systemPrompt, userPrompt, temperature;
  try {
    template = loadPromptTemplate(templatePath);
    console.log('✅ evaluateFigmaSpec - Template loaded successfully:', {
      hasTemplate: !!template,
      templateKeys: template ? Object.keys(template) : [],
      systemPromptLength: template?.systemPrompt?.length || 0
    });

    const templateResult = applyTemplate(template, { 
      specName: spec.name || 'Unnamed Spec',
      specDescription: spec.description || 'No description provided',
      components: Array.isArray(spec.components) ? spec.components.join(', ') : 'No components specified'
    });
    
    systemPrompt = templateResult.systemPrompt;
    userPrompt = templateResult.userPrompt;
    temperature = templateResult.temperature || 0.3;

    console.log('🎯 evaluateFigmaSpec - Template applied successfully:', {
      systemPromptLength: systemPrompt?.length || 0,
      userPromptLength: userPrompt?.length || 0,
      temperature,
      templateHasSchema: !!template.responseFormat
    });
  } catch (templateError) {
    console.error('❌ evaluateFigmaSpec - Template error:', {
      error: templateError instanceof Error ? templateError.message : 'Unknown template error',
      templatePath,
      fallbackPath: 'Using fallback template'
    });
    
    // Fallback template
    systemPrompt = `You are a Figma spec quality evaluator. Evaluate the provided spec for design clarity, component structure, technical feasibility, and accessibility. Return a structured evaluation with scores and feedback.`;
    userPrompt = `Evaluate this Figma spec: ${spec.name || 'Unnamed Spec'}. Description: ${spec.description || 'No description'}. Components: ${Array.isArray(spec.components) ? spec.components.join(', ') : 'None specified'}.`;
    temperature = 0.3;
  }

  let rawResponse: string;
  try {
    console.log('🚀 evaluateFigmaSpec - Making AI call for spec evaluation:', {
      specName: spec.name,
      systemPromptPreview: systemPrompt?.substring(0, 100) + '...',
      userPromptPreview: userPrompt?.substring(0, 100) + '...',
      temperature
    });

    const response = await generateChatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      { temperature }
    );
    
    const content = response.choices[0]?.message?.content || '';
    console.log('📨 evaluateFigmaSpec - Raw AI response received:', {
      responseLength: content?.length || 0,
      responsePreview: content?.substring(0, 200) + '...',
      specName: spec.name
    });
    
    rawResponse = content;
  } catch (aiError) {
    const errorMessage = aiError instanceof Error ? aiError.message : 'Unknown AI error';
    
    logError('FIGMA_EVAL_AI', `AI service error for spec ${index}`, {
      error: errorMessage,
      specName: spec.name,
      specIndex: index,
      errorType: 'AI_SERVICE_ERROR',
      isRateLimit: errorMessage.includes('429') || errorMessage.includes('Rate limit'),
      errorStack: aiError instanceof Error ? aiError.stack : undefined
    }, requestId);
    
    console.error('💥 evaluateFigmaSpec - AI service error:', {
      error: aiError instanceof Error ? aiError.message : 'Unknown AI error',
      specName: spec.name,
      specIndex: index,
      errorType: 'AI_SERVICE_ERROR'
    });
    
    return createFallbackEvaluationResult(spec, index, errorMessage);
  }

  let data: SpecEvaluationResult;
  try {
    console.log('🔍 evaluateFigmaSpec - Parsing and validating AI response...');
    console.log('📄 evaluateFigmaSpec - Raw response analysis:', {
      responseLength: rawResponse?.length || 0,
      startsWithJSON: rawResponse?.trim().startsWith('{'),
      startsWithMarkdown: rawResponse?.trim().startsWith('```'),
      firstChars: rawResponse?.substring(0, 50),
      lastChars: rawResponse?.substring(-50),
      specName: spec.name
    });
    
    // Try to extract JSON from markdown code blocks if present
    let jsonContent = rawResponse;
    if (rawResponse.includes('```json')) {
      const jsonMatch = rawResponse.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1].trim();
        console.log('📝 evaluateFigmaSpec - Extracted JSON from markdown:', {
          extractedLength: jsonContent.length,
          extractedPreview: jsonContent.substring(0, 100) + '...'
        });
      }
    } else if (rawResponse.includes('```')) {
      const codeMatch = rawResponse.match(/```\s*([\s\S]*?)\s*```/);
      if (codeMatch) {
        jsonContent = codeMatch[1].trim();
        console.log('📝 evaluateFigmaSpec - Extracted content from code block:', {
          extractedLength: jsonContent.length,
          extractedPreview: jsonContent.substring(0, 100) + '...'
        });
      }
    }
    
    // Parse JSON response
    const parsedResponse = JSON.parse(jsonContent);
    console.log('✅ evaluateFigmaSpec - JSON parsed successfully:', {
      resultType: typeof parsedResponse,
      hasOverallScore: 'overallScore' in parsedResponse,
      topLevelKeys: Object.keys(parsedResponse)
    });
    
    // Use parsed response directly (validation can be added later)
    data = parsedResponse;

    console.log('🎯 evaluateFigmaSpec - Response processing successful:', {
      hasOverallScore: typeof data.overallScore === 'number',
      hasIssues: Array.isArray(data.issues),
      issuesCount: data.issues?.length || 0,
      hasStrengths: Array.isArray(data.strengths),
      strengthsCount: data.strengths?.length || 0
    });

  } catch (parseError) {
    const parseErrorInfo = {
      error: parseError instanceof Error ? parseError.message : 'Unknown parsing error',
      errorStack: parseError instanceof Error ? parseError.stack : undefined,
      rawResponseLength: rawResponse?.length || 0,
      rawResponsePreview: rawResponse?.substring(0, 500),
      rawResponseSuffix: rawResponse?.substring(-200),
      specName: spec.name,
      specIndex: index,
      errorType: 'RESPONSE_PARSING_ERROR',
      parseAttempts: {
        containsJSON: rawResponse?.includes('{'),
        containsMarkdown: rawResponse?.includes('```'),
        startsWithHash: rawResponse?.trim().startsWith('#'),
        containsRateLimit: rawResponse?.includes('429') || rawResponse?.includes('Rate limit'),
        containsErrorMsg: rawResponse?.includes('error') || rawResponse?.includes('Error')
      }
    };
    
    logError('FIGMA_EVAL_PARSE', `Response parsing failed for spec ${index}`, parseErrorInfo, requestId);
    
    console.error('❌ evaluateFigmaSpec - Response parsing/validation error:', parseErrorInfo);
    
    // Try to extract scores from markdown as a fallback
    console.log('🔄 evaluateFigmaSpec - Attempting markdown score extraction...');
    const markdownResult = tryExtractScoresFromMarkdown(rawResponse, spec, index);
    if (markdownResult) {
      console.log('✅ evaluateFigmaSpec - Successfully extracted scores from markdown');
      return markdownResult;
    }
    
    // Log the full raw response for debugging (truncated for readability)
    console.log('🔍 FULL_RAW_RESPONSE_DEBUG:', {
      specName: spec.name,
      fullResponse: rawResponse?.length > 2000 ? rawResponse.substring(0, 2000) + '... [TRUNCATED]' : rawResponse
    });
    
    // Also log to structured logger for easy export
    logDebug('FIGMA_EVAL_RAW_RESPONSE', `Full AI response for failed parsing`, {
      specName: spec.name,
      specIndex: index,
      fullResponse: rawResponse,
      responseAnalysis: {
        length: rawResponse?.length || 0,
        firstLine: rawResponse?.split('\n')[0] || '',
        lastLine: rawResponse?.split('\n').slice(-1)[0] || '',
        containsCodeBlocks: (rawResponse?.match(/```/g) || []).length,
        looksLikeMarkdown: rawResponse?.includes('#') && rawResponse?.includes('\n'),
        looksLikeJSON: rawResponse?.trim().startsWith('{') && rawResponse?.trim().endsWith('}')
      }
    }, requestId);
    
    return createFallbackEvaluationResult(spec, index, `Response parsing error: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
  }

  try {
    console.log('🔧 evaluateFigmaSpec - Post-processing and validation...');
    
    // Ensure specId is set
    if (!data.specId) {
      data.specId = spec.name || `spec-${index}`;
    }

    // Validate score ranges (0-10)
    if (typeof data.overallScore !== 'number' || data.overallScore < 0 || data.overallScore > 10) {
      console.warn(`⚠️ evaluateFigmaSpec - Invalid overallScore: ${data.overallScore}, setting to 5`);
      data.overallScore = 5;
    }
    if (typeof data.clarityScore !== 'number' || data.clarityScore < 0 || data.clarityScore > 10) {
      console.warn(`⚠️ evaluateFigmaSpec - Invalid clarityScore: ${data.clarityScore}, setting to 5`);
      data.clarityScore = 5;
    }
    if (typeof data.structureScore !== 'number' || data.structureScore < 0 || data.structureScore > 10) {
      console.warn(`⚠️ evaluateFigmaSpec - Invalid structureScore: ${data.structureScore}, setting to 5`);
      data.structureScore = 5;
    }
    if (typeof data.feasibilityScore !== 'number' || data.feasibilityScore < 0 || data.feasibilityScore > 10) {
      console.warn(`⚠️ evaluateFigmaSpec - Invalid feasibilityScore: ${data.feasibilityScore}, setting to 5`);
      data.feasibilityScore = 5;
    }
    if (typeof data.accessibilityScore !== 'number' || data.accessibilityScore < 0 || data.accessibilityScore > 10) {
      console.warn(`⚠️ evaluateFigmaSpec - Invalid accessibilityScore: ${data.accessibilityScore}, setting to 5`);
      data.accessibilityScore = 5;
    }

    // Ensure arrays exist
    if (!Array.isArray(data.issues)) data.issues = [];
    if (!Array.isArray(data.strengths)) data.strengths = [];
    if (!Array.isArray(data.recommendations)) data.recommendations = [];

    console.log('🎯 evaluateFigmaSpec - Final result:', {
      specId: data.specId,
      overallScore: data.overallScore,
      issuesCount: data.issues.length,
      strengthsCount: data.strengths.length,
      recommendationsCount: data.recommendations.length
    });

    return data;

  } catch (postProcessError) {
    console.error('💥 evaluateFigmaSpec - Post-processing error:', {
      error: postProcessError instanceof Error ? postProcessError.message : 'Unknown post-processing error',
      specName: spec.name,
      dataSnapshot: JSON.stringify(data).substring(0, 200) + '...'
    });
    
    return createFallbackEvaluationResult(spec, index, `Post-processing error: ${postProcessError instanceof Error ? postProcessError.message : 'Unknown error'}`);
  }
}

/**
 * Creates a fallback evaluation result when AI evaluation fails
 */
function createFallbackEvaluationResult(spec: FigmaSpec, index: number, errorMessage: string): SpecEvaluationResult {
  console.log('🔄 evaluateFigmaSpec - Creating fallback result:', {
    specName: spec.name,
    index,
    errorMessage: errorMessage.substring(0, 100) + '...'
  });

  const fallbackResult: SpecEvaluationResult = {
    specId: spec.name || `spec-${index}`,
    overallScore: 5,
    clarityScore: 5,
    structureScore: 5,
    feasibilityScore: 5,
    accessibilityScore: 5,
    issues: [
      {
        category: 'system',
        severity: 'high',
        description: `Evaluation failed: ${errorMessage}`,
        suggestion: 'Please try again or review the spec manually for quality assurance'
      }
    ],
    strengths: [],
    recommendations: [
      'Manual review recommended due to automated evaluation failure',
      'Ensure spec has clear requirements and component definitions'
    ]
  };

  return fallbackResult;
}

/**
 * Creates an error result when critical failures occur
 */
function createErrorEvaluationResult(spec: FigmaSpec, index: number, errorMessage: string): SpecEvaluationResult {
  console.log('💥 evaluateFigmaSpec - Creating error result:', {
    specName: spec.name,
    index,
    errorMessage: errorMessage.substring(0, 100) + '...'
  });

  const errorResult: SpecEvaluationResult = {
    specId: spec.name || `spec-${index}`,
    overallScore: 3,
    clarityScore: 3,
    structureScore: 3,
    feasibilityScore: 3,
    accessibilityScore: 3,
    issues: [
      {
        category: 'system',
        severity: 'critical',
        description: `Critical evaluation error: ${errorMessage}`,
        suggestion: 'Manual evaluation required - automated system encountered an error'
      }
    ],
    strengths: [],
    recommendations: [
      'Manual quality review required',
      'Check spec format and completeness'
    ]
  };

  return errorResult;
}

/**
 * Evaluates multiple Figma specs in parallel for quality assessment
 * Expects exactly 3 specs - processes them all in parallel with rate limit protection
 */
export async function evaluateFigmaSpecs(specs: FigmaSpec[]): Promise<SpecEvaluationResult[]> {
  console.log('🚀 evaluateFigmaSpecs - Starting evaluation:', {
    specsCount: specs.length,
    specsNames: specs.map(s => s.name),
    expectedCount: 3
  });

  if (!specs || specs.length === 0) {
    console.log('⚠️ evaluateFigmaSpecs - No specs provided, returning empty array');
    return [];
  }

  if (specs.length !== 3) {
    console.warn('⚠️ evaluateFigmaSpecs - Expected exactly 3 specs, got:', specs.length);
  }

  try {
    // Process all specs in parallel (should be exactly 3)
    const promises = specs.map((spec, index) => evaluateFigmaSpec(spec, index));
    
    console.log('⏳ evaluateFigmaSpecs - Executing parallel evaluation calls:', {
      promiseCount: promises.length,
      timestamp: new Date().toISOString()
    });

    const results = await Promise.allSettled(promises);
    
    console.log('📊 evaluateFigmaSpecs - Parallel evaluation completed:', {
      totalResults: results.length,
      successfulResults: results.filter(r => r.status === 'fulfilled').length,
      failedResults: results.filter(r => r.status === 'rejected').length
    });

    // Process results, handling both successes and failures
    const processedResults: SpecEvaluationResult[] = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`✅ evaluateFigmaSpecs - Spec ${index} evaluation successful:`, {
          specId: result.value.specId,
          overallScore: result.value.overallScore
        });
        return result.value;
      } else {
        console.error(`❌ evaluateFigmaSpecs - Spec ${index} evaluation failed:`, {
          error: result.reason,
          specName: specs[index]?.name || `spec-${index}`
        });
        
        // Create error result for failed evaluations
        return {
          specId: specs[index]?.name || `spec-${index}`,
          overallScore: 4,
          clarityScore: 4,
          structureScore: 4,
          feasibilityScore: 4,
          accessibilityScore: 4,
          issues: [
            {
              category: 'system',
              severity: 'high',
              description: `Evaluation failed: ${result.reason}`,
              suggestion: 'Manual review recommended due to evaluation system error'
            }
          ],
          strengths: [],
          recommendations: ['Manual quality assessment needed']
        } as SpecEvaluationResult;
      }
    });

    console.log('🎯 evaluateFigmaSpecs - Batch evaluation completed successfully:', {
      totalProcessed: processedResults.length,
      averageScore: processedResults.reduce((sum, r) => sum + r.overallScore, 0) / processedResults.length,
      totalIssues: processedResults.reduce((sum, r) => sum + r.issues.length, 0),
      totalStrengths: processedResults.reduce((sum, r) => sum + r.strengths.length, 0)
    });

    return processedResults;

  } catch (criticalError) {
    console.error('💥 evaluateFigmaSpecs - Critical batch evaluation error:', {
      error: criticalError instanceof Error ? criticalError.message : 'Unknown critical error',
      specsCount: specs.length,
      errorType: 'BATCH_EVALUATION_CRITICAL_ERROR'
    });

    // Return error results for all specs if batch processing fails
    return specs.map((spec, index) => createErrorEvaluationResult(spec, index, criticalError instanceof Error ? criticalError.message : 'Critical batch error'));
  }
}
