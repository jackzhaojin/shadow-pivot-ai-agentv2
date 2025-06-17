import { NextRequest, NextResponse } from 'next/server';
import { evaluateFigmaSpecs } from '@/lib/services/figmaSpecEvaluation';

export async function POST(request: NextRequest) {
  console.log('🎯 /api/agent/evaluate-figma-specs - Request received');
  
  try {
    const body = await request.json();
    console.log('📝 /api/agent/evaluate-figma-specs - Request body parsed:', {
      hasFigmaSpecs: !!body.figmaSpecs,
      figmaSpecsCount: body.figmaSpecs?.length || 0
    });

    const { figmaSpecs } = body;

    if (!figmaSpecs) {
      console.error('❌ /api/agent/evaluate-figma-specs - Missing figmaSpecs in request body');
      return NextResponse.json({
        success: false,
        error: 'Missing figmaSpecs in request body'
      }, { status: 400 });
    }

    if (!Array.isArray(figmaSpecs)) {
      console.error('❌ /api/agent/evaluate-figma-specs - figmaSpecs is not an array:', typeof figmaSpecs);
      return NextResponse.json({
        success: false,
        error: 'figmaSpecs must be an array'
      }, { status: 400 });
    }

    // Basic validation of spec structure
    for (let i = 0; i < figmaSpecs.length; i++) {
      const spec = figmaSpecs[i];
      if (!spec || typeof spec !== 'object') {
        return NextResponse.json({
          success: false,
          error: `Invalid spec at index ${i}: must be an object`
        }, { status: 400 });
      }
      if (!spec.name || typeof spec.name !== 'string') {
        return NextResponse.json({
          success: false,
          error: `Invalid spec at index ${i}: missing or invalid name field`
        }, { status: 400 });
      }
    }

    console.log('🚀 /api/agent/evaluate-figma-specs - Starting Figma spec evaluation:', {
      specsCount: figmaSpecs.length,
      specNames: figmaSpecs.map((s: { name: string }) => s.name).slice(0, 3)
    });

    const evaluationResults = await evaluateFigmaSpecs(figmaSpecs);

    console.log('✅ /api/agent/evaluate-figma-specs - Evaluation completed successfully:', {
      resultsCount: evaluationResults.length,
      averageScore: evaluationResults.reduce((sum, r) => sum + r.overallScore, 0) / evaluationResults.length,
      totalIssues: evaluationResults.reduce((sum, r) => sum + r.issues.length, 0)
    });

    return NextResponse.json({
      success: true,
      evaluationResults,
      message: 'Figma specs evaluated successfully'
    });

  } catch (error) {
    console.error('💥 /api/agent/evaluate-figma-specs - Unexpected error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json({
      success: false,
      error: `Failed to evaluate figma specs: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 });
  }
}
