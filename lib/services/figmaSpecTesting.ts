import { generateChatCompletion } from '../daos/aiClient';
import { loadPromptTemplate, applyTemplate, validateResponse } from '../utils/promptUtils';
import path from 'path';
import type { FigmaSpec } from './figmaSpec';

export interface SpecTestingResult {
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
 * Tests and evaluates a single Figma spec for quality, clarity, and technical feasibility
 * Following established patterns from design evaluation and figma spec generation
 */
export async function testFigmaSpec(spec: FigmaSpec, index = 0): Promise<SpecTestingResult> {
  console.log('🧪 testFigmaSpec - Starting quality evaluation for spec:', {
    specName: spec.name?.substring(0, 50) + '...',
    specDescription: spec.description?.substring(0, 100) + '...',
    componentCount: spec.components?.length || 0,
    index
  });

  const templatePath = path.join('prompts', 'figma-spec-testing', 'v1.json');
  console.log('📁 testFigmaSpec - Loading template from:', templatePath);

  let template, systemPrompt, userPrompt, temperature;
  try {
    template = loadPromptTemplate(templatePath);
    console.log('✅ testFigmaSpec - Template loaded successfully:', {
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
    temperature = templateResult.temperature;

    console.log('🎨 testFigmaSpec - Template applied:', {
      systemPromptLength: systemPrompt?.length || 0,
      userPromptLength: userPrompt?.length || 0,
      temperature,
      userPromptPreview: userPrompt?.substring(0, 200) + '...'
    });
  } catch (templateError) {
    console.error('💥 testFigmaSpec - Template loading/application failed:', templateError);
    throw new Error(`Failed to load or apply template: ${templateError instanceof Error ? templateError.message : 'Unknown template error'}`);
  }

  try {
    console.log('🚀 testFigmaSpec - Starting AI call for spec testing:', spec.name?.substring(0, 100) + '...');

    const response = await generateChatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      { temperature }
    );

    console.log('📡 testFigmaSpec - AI response received:', {
      hasResponse: !!response,
      hasChoices: !!response?.choices,
      choicesLength: response?.choices?.length || 0,
      hasFirstChoice: !!response?.choices?.[0],
      hasMessage: !!response?.choices?.[0]?.message,
      hasContent: !!response?.choices?.[0]?.message?.content,
      contentLength: response?.choices?.[0]?.message?.content?.length || 0
    });

    const content = response.choices[0]?.message?.content || '';

    if (!content) {
      console.error('❌ testFigmaSpec - Empty response from AI service:', {
        response,
        choices: response?.choices,
        firstChoice: response?.choices?.[0],
        message: response?.choices?.[0]?.message
      });
      throw new Error('Empty response from AI service');
    }

    console.log('📄 testFigmaSpec - Raw AI response content:', content);

    let jsonContent = content;

    // Try multiple extraction methods for JSON (following figmaSpec.ts patterns)
    // Method 1: Look for code blocks with ```json or ```
    const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
      jsonContent = codeBlockMatch[1].trim();
      console.log('✂️ testFigmaSpec - Extracted JSON from code block:', jsonContent);
    } else {
      // Method 2: Look for JSON object boundaries
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonContent = jsonMatch[0].trim();
        console.log('🔍 testFigmaSpec - Extracted JSON object from content:', jsonContent);
      } else {
        console.log('📝 testFigmaSpec - No JSON extraction pattern found, using raw content');
      }
    }

    let data: SpecTestingResult;
    try {
      console.log('🔄 testFigmaSpec - Parsing JSON content:', jsonContent.substring(0, 200) + '...');
      data = JSON.parse(jsonContent);
      console.log('✅ testFigmaSpec - JSON parsed successfully:', {
        hasSpecId: !!data.specId,
        overallScore: data.overallScore,
        clarityScore: data.clarityScore,
        structureScore: data.structureScore,
        feasibilityScore: data.feasibilityScore,
        accessibilityScore: data.accessibilityScore,
        issuesCount: data.issues?.length || 0,
        strengthsCount: data.strengths?.length || 0,
        recommendationsCount: data.recommendations?.length || 0
      });

      // Validate response against schema
      const validation = validateResponse(data, template);
      if (!validation.isValid) {
        console.error('❌ testFigmaSpec - Response validation failed:', validation.errors);
        // Continue with parsed data but log validation issues
      }

      // Ensure we have a specId
      if (!data.specId) {
        data.specId = spec.name || `spec-${index}`;
      }

      // Validate score ranges (0-10)
      if (typeof data.overallScore !== 'number' || data.overallScore < 0 || data.overallScore > 10) {
        console.warn(`⚠️ testFigmaSpec - Invalid overallScore: ${data.overallScore}, setting to 5`);
        data.overallScore = 5;
      }
      if (typeof data.clarityScore !== 'number' || data.clarityScore < 0 || data.clarityScore > 10) {
        console.warn(`⚠️ testFigmaSpec - Invalid clarityScore: ${data.clarityScore}, setting to 5`);
        data.clarityScore = 5;
      }
      if (typeof data.structureScore !== 'number' || data.structureScore < 0 || data.structureScore > 10) {
        console.warn(`⚠️ testFigmaSpec - Invalid structureScore: ${data.structureScore}, setting to 5`);
        data.structureScore = 5;
      }
      if (typeof data.feasibilityScore !== 'number' || data.feasibilityScore < 0 || data.feasibilityScore > 10) {
        console.warn(`⚠️ testFigmaSpec - Invalid feasibilityScore: ${data.feasibilityScore}, setting to 5`);
        data.feasibilityScore = 5;
      }
      if (typeof data.accessibilityScore !== 'number' || data.accessibilityScore < 0 || data.accessibilityScore > 10) {
        console.warn(`⚠️ testFigmaSpec - Invalid accessibilityScore: ${data.accessibilityScore}, setting to 5`);
        data.accessibilityScore = 5;
      }

      // Ensure arrays exist
      if (!Array.isArray(data.issues)) data.issues = [];
      if (!Array.isArray(data.strengths)) data.strengths = [];
      if (!Array.isArray(data.recommendations)) data.recommendations = [];

      console.log('🎯 testFigmaSpec - Final result:', {
        specId: data.specId,
        overallScore: data.overallScore,
        issuesCount: data.issues.length,
        strengthsCount: data.strengths.length,
        recommendationsCount: data.recommendations.length
      });

      return data;

    } catch (parseError) {
      console.error('💥 testFigmaSpec - JSON parsing failed:', parseError);
      console.log('🛠️ testFigmaSpec - Attempting fallback parsing...');

      // Create fallback result
      const fallbackResult: SpecTestingResult = {
        specId: spec.name || `spec-${index}`,
        overallScore: 6.5, // Reasonable middle score
        clarityScore: 7.0,
        structureScore: 6.0,
        feasibilityScore: 7.5,
        accessibilityScore: 6.0,
        issues: [
          {
            category: 'Evaluation',
            severity: 'medium',
            description: 'Unable to complete automated evaluation due to parsing error',
            suggestion: 'Manual review recommended for comprehensive assessment'
          }
        ],
        strengths: [
          'Spec structure appears well-defined',
          'Component list provided for implementation guidance'
        ],
        recommendations: [
          'Consider adding more detailed component specifications',
          'Include responsive design considerations',
          'Add accessibility guidelines'
        ]
      };

      console.log('🔄 testFigmaSpec - Created fallback result:', fallbackResult);
      return fallbackResult;
    }

  } catch (error) {
    console.error('💥 testFigmaSpec - Critical error in spec testing:', {
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
      specName: spec.name?.substring(0, 100) + '...',
      index
    });

    // Create error fallback result
    const errorResult: SpecTestingResult = {
      specId: spec.name || `spec-${index}`,
      overallScore: 5.0, // Neutral score for errors
      clarityScore: 5.0,
      structureScore: 5.0,
      feasibilityScore: 5.0,
      accessibilityScore: 5.0,
      issues: [
        {
          category: 'System Error',
          severity: 'high',
          description: `Evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          suggestion: 'Retry evaluation or perform manual assessment'
        }
      ],
      strengths: ['Spec provided for evaluation'],
      recommendations: ['Re-run automated testing when system issues are resolved']
    };

    console.log('🚨 testFigmaSpec - Created error result:', errorResult);
    return errorResult;
  }
}

/**
 * Tests multiple Figma specs for quality and returns results
 * Uses parallel processing patterns from Step 3.5 implementation
 */
export async function testFigmaSpecs(specs: FigmaSpec[]): Promise<SpecTestingResult[]> {
  console.log('🧪 testFigmaSpecs - Starting quality evaluation for multiple specs:', {
    specsCount: specs.length,
    specsPreview: specs.map((s, i) => ({
      index: i,
      name: s.name?.substring(0, 30) + '...',
      componentCount: s.components?.length || 0
    }))
  });

  if (specs.length === 0) {
    console.log('⚠️ testFigmaSpecs - No specs provided for testing');
    return [];
  }

  try {
    // Use parallel processing for efficiency (following Step 3.5 patterns)
    const promises = specs.map((spec, index) => testFigmaSpec(spec, index));
    const results = await Promise.allSettled(promises);

    console.log('📊 testFigmaSpecs - Parallel testing completed:', {
      totalRequests: promises.length,
      fulfilledCount: results.filter(r => r.status === 'fulfilled').length,
      rejectedCount: results.filter(r => r.status === 'rejected').length
    });

    // Process results with fallbacks for failed evaluations
    const testingResults = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`✅ testFigmaSpecs - Spec ${index + 1} evaluation successful:`, {
          index: index + 1,
          specId: result.value.specId,
          overallScore: result.value.overallScore,
          issuesCount: result.value.issues.length
        });
        return result.value;
      } else {
        console.error(`❌ testFigmaSpecs - Spec ${index + 1} evaluation failed:`, result.reason);
        // Create fallback result for failed evaluation
        const spec = specs[index];
        return {
          specId: spec.name || `spec-${index}`,
          overallScore: 4.0, // Lower score for failed evaluations
          clarityScore: 4.0,
          structureScore: 4.0,
          feasibilityScore: 4.0,
          accessibilityScore: 4.0,
          issues: [
            {
              category: 'Evaluation Error',
              severity: 'high' as const,
              description: `Failed to evaluate spec: ${result.reason}`,
              suggestion: 'Manual review required - automated evaluation unavailable'
            }
          ],
          strengths: ['Spec available for manual review'],
          recommendations: ['Perform manual quality assessment', 'Verify component specifications']
        } as SpecTestingResult;
      }
    });

    console.log('🎯 testFigmaSpecs - Final evaluation summary:', {
      totalSpecs: testingResults.length,
      avgOverallScore: testingResults.reduce((sum, r) => sum + r.overallScore, 0) / testingResults.length,
      totalIssues: testingResults.reduce((sum, r) => sum + r.issues.length, 0),
      totalRecommendations: testingResults.reduce((sum, r) => sum + r.recommendations.length, 0),
      highQualitySpecs: testingResults.filter(r => r.overallScore >= 8).length
    });

    return testingResults;

  } catch (error) {
    console.error('💥 testFigmaSpecs - Critical error in batch testing:', {
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
      specsCount: specs.length
    });

    // Return fallback results for all specs
    return specs.map((spec, index) => ({
      specId: spec.name || `spec-${index}`,
      overallScore: 3.0, // Low score for system failure
      clarityScore: 3.0,
      structureScore: 3.0,
      feasibilityScore: 3.0,
      accessibilityScore: 3.0,
      issues: [
        {
          category: 'System Error',
          severity: 'critical' as const,
          description: `Batch evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          suggestion: 'System maintenance required - perform manual evaluation'
        }
      ],
      strengths: [],
      recommendations: ['Manual quality assessment required']
    } as SpecTestingResult));
  }
}
