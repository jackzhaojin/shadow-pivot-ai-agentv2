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

    // Filter out invalid specs and continue with valid ones
    const validSpecs = [];
    const invalidSpecs = [];
    
    for (let i = 0; i < figmaSpecs.length; i++) {
      const spec = figmaSpecs[i];
      if (!spec || typeof spec !== 'object') {
        console.warn(`⚠️ /api/agent/evaluate-figma-specs - Skipping invalid spec at index ${i}: must be an object`);
        invalidSpecs.push({ index: i, reason: 'must be an object' });
        continue;
      }
      if (!spec.name || typeof spec.name !== 'string') {
        console.warn(`⚠️ /api/agent/evaluate-figma-specs - Skipping invalid spec at index ${i}: missing or invalid name field`);
        invalidSpecs.push({ index: i, reason: 'missing or invalid name field' });
        continue;
      }
      validSpecs.push(spec);
    }

    if (validSpecs.length === 0) {
      console.error('❌ /api/agent/evaluate-figma-specs - No valid specs found');
      return NextResponse.json({
        success: false,
        error: 'No valid specs found',
        invalidSpecs
      }, { status: 400 });
    }

    if (invalidSpecs.length > 0) {
      console.log(`🔧 /api/agent/evaluate-figma-specs - Proceeding with ${validSpecs.length} valid specs, ${invalidSpecs.length} invalid specs filtered out:`, {
        validCount: validSpecs.length,
        invalidCount: invalidSpecs.length,
        invalidReasons: invalidSpecs
      });
    }

    console.log('🚀 /api/agent/evaluate-figma-specs - Starting Figma spec evaluation:', {
      specsCount: validSpecs.length,
      totalSpecsReceived: figmaSpecs.length,
      invalidSpecsFiltered: invalidSpecs.length,
      specNames: validSpecs.map((s: { name: string }) => s.name).slice(0, 3)
    });

    const evaluationResults = await evaluateFigmaSpecs(validSpecs);

    console.log('✅ /api/agent/evaluate-figma-specs - Evaluation completed successfully:', {
      resultsCount: evaluationResults.length,
      averageScore: evaluationResults.reduce((sum, r) => sum + r.overallScore, 0) / evaluationResults.length,
      totalIssues: evaluationResults.reduce((sum, r) => sum + r.issues.length, 0)
    });

    return NextResponse.json({
      success: true,
      evaluationResults,
      message: 'Figma specs evaluated successfully',
      ...(invalidSpecs.length > 0 && {
        warning: `${invalidSpecs.length} invalid specs were filtered out`,
        invalidSpecs
      })
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
