import { NextRequest, NextResponse } from 'next/server';
import { testFigmaSpecs } from '../../../../lib/services/figmaSpecTesting';
import type { FigmaSpec } from '../../../../lib/services/figmaSpec';

export async function POST(request: NextRequest) {
  console.log('🧪 /api/agent/test-figma-specs - Request received');
  
  try {
    const body = await request.json();
    console.log('📋 /api/agent/test-figma-specs - Request body:', {
      hasBody: !!body,
      bodyKeys: Object.keys(body || {}),
      figmaSpecsCount: Array.isArray(body.figmaSpecs) ? body.figmaSpecs.length : 0
    });

    const { figmaSpecs } = body;

    // Validate input
    if (!Array.isArray(figmaSpecs)) {
      console.error('❌ /api/agent/test-figma-specs - Invalid input: figmaSpecs is not an array');
      return NextResponse.json(
        { 
          error: 'Invalid input: figmaSpecs must be an array',
          received: typeof figmaSpecs,
          figmaSpecs: []
        },
        { status: 400 }
      );
    }

    if (figmaSpecs.length === 0) {
      console.log('⚠️ /api/agent/test-figma-specs - Empty figmaSpecs array provided');
      return NextResponse.json({
        testingResults: [],
        summary: {
          totalSpecs: 0,
          avgOverallScore: 0,
          totalIssues: 0,
          highQualitySpecs: 0
        },
        userGuid: request.headers.get('x-user-guid') || 'unknown'
      });
    }

    console.log('🎯 /api/agent/test-figma-specs - Starting quality testing for specs:', {
      count: figmaSpecs.length,
      specsPreview: figmaSpecs.map((spec: FigmaSpec, i: number) => ({
        index: i,
        name: spec.name?.substring(0, 30) + '...',
        hasDescription: !!spec.description,
        componentCount: spec.components?.length || 0
      }))
    });

    // Test the figma specs for quality
    const testingResults = await testFigmaSpecs(figmaSpecs);

    console.log('✅ /api/agent/test-figma-specs - Testing completed successfully:', {
      resultsCount: testingResults.length,
      avgScore: testingResults.reduce((sum, r) => sum + r.overallScore, 0) / testingResults.length,
      totalIssues: testingResults.reduce((sum, r) => sum + r.issues.length, 0),
      highQualityCount: testingResults.filter(r => r.overallScore >= 8).length
    });

    // Create summary statistics
    const summary = {
      totalSpecs: testingResults.length,
      avgOverallScore: testingResults.length > 0 
        ? Number((testingResults.reduce((sum, r) => sum + r.overallScore, 0) / testingResults.length).toFixed(2))
        : 0,
      avgClarityScore: testingResults.length > 0
        ? Number((testingResults.reduce((sum, r) => sum + r.clarityScore, 0) / testingResults.length).toFixed(2))
        : 0,
      avgStructureScore: testingResults.length > 0
        ? Number((testingResults.reduce((sum, r) => sum + r.structureScore, 0) / testingResults.length).toFixed(2))
        : 0,
      avgFeasibilityScore: testingResults.length > 0
        ? Number((testingResults.reduce((sum, r) => sum + r.feasibilityScore, 0) / testingResults.length).toFixed(2))
        : 0,
      avgAccessibilityScore: testingResults.length > 0
        ? Number((testingResults.reduce((sum, r) => sum + r.accessibilityScore, 0) / testingResults.length).toFixed(2))
        : 0,
      totalIssues: testingResults.reduce((sum, r) => sum + r.issues.length, 0),
      totalStrengths: testingResults.reduce((sum, r) => sum + r.strengths.length, 0),
      totalRecommendations: testingResults.reduce((sum, r) => sum + r.recommendations.length, 0),
      highQualitySpecs: testingResults.filter(r => r.overallScore >= 8).length,
      mediumQualitySpecs: testingResults.filter(r => r.overallScore >= 6 && r.overallScore < 8).length,
      lowQualitySpecs: testingResults.filter(r => r.overallScore < 6).length,
      criticalIssues: testingResults.reduce((sum, r) => sum + r.issues.filter(i => i.severity === 'critical').length, 0),
      highSeverityIssues: testingResults.reduce((sum, r) => sum + r.issues.filter(i => i.severity === 'high').length, 0)
    };

    console.log('📊 /api/agent/test-figma-specs - Quality summary:', summary);

    const response = {
      testingResults,
      summary,
      userGuid: request.headers.get('x-user-guid') || 'unknown',
      timestamp: new Date().toISOString()
    };

    console.log('📤 /api/agent/test-figma-specs - Sending response:', {
      resultsCount: response.testingResults.length,
      hasResults: response.testingResults.length > 0,
      avgScore: response.summary.avgOverallScore,
      userGuid: response.userGuid
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('💥 /api/agent/test-figma-specs - Error:', {
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
      errorType: typeof error
    });

    return NextResponse.json(
      { 
        error: 'Failed to test Figma specs',
        details: error instanceof Error ? error.message : 'Unknown error',
        testingResults: [],
        summary: {
          totalSpecs: 0,
          avgOverallScore: 0,
          totalIssues: 0,
          highQualitySpecs: 0
        },
        userGuid: request.headers.get('x-user-guid') || 'unknown'
      },
      { status: 500 }
    );
  }
}
