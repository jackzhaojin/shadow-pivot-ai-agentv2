import { NextRequest, NextResponse } from 'next/server';
import { selectBestFigmaSpec } from '@/lib/services/figmaSpecSelection';

export async function POST(request: NextRequest) {
  console.log('🎯 /api/agent/select-figma-spec - Request received');
  
  try {
    const body = await request.json();
    console.log('📝 /api/agent/select-figma-spec - Request body parsed:', {
      hasFigmaSpecs: !!body.figmaSpecs,
      hasFigmaEvaluationResults: !!body.figmaEvaluationResults,
      figmaSpecsCount: body.figmaSpecs?.length || 0,
      evaluationsCount: body.figmaEvaluationResults?.length || 0,
      userGuid: request.headers.get('x-user-guid')
    });

    const { figmaSpecs, figmaEvaluationResults } = body;

    if (!figmaSpecs || !Array.isArray(figmaSpecs) || figmaSpecs.length === 0) {
      console.error('❌ /api/agent/select-figma-spec - Invalid or missing figmaSpecs');
      return NextResponse.json({
        success: false,
        error: 'figmaSpecs must be a non-empty array'
      }, { status: 400 });
    }

    if (!figmaEvaluationResults || !Array.isArray(figmaEvaluationResults)) {
      console.error('❌ /api/agent/select-figma-spec - Invalid or missing figmaEvaluationResults');
      return NextResponse.json({
        success: false,
        error: 'figmaEvaluationResults must be an array'
      }, { status: 400 });
    }

    console.log('🚀 /api/agent/select-figma-spec - Starting selection using simple logic (no AI)');

    // Use simple selection logic (no AI needed) - similar to selectBestDesignConcept
    const { selectedSpec, selectionReason, ranking } = selectBestFigmaSpec(
      figmaSpecs, 
      figmaEvaluationResults
    );
    
    console.log('✅ /api/agent/select-figma-spec - Selection completed:', {
      selectedSpecName: selectedSpec?.name || 'None',
      selectionMethod: 'Simple composite scoring (effort vs clarity tradeoffs)',
      reason: selectionReason.substring(0, 100) + '...',
      rankingCount: ranking.length
    });

    return NextResponse.json({
      success: true,
      selectedSpec,
      reasoning: selectionReason,
      ranking
    });

  } catch (error) {
    console.error('💥 /api/agent/select-figma-spec - Selection failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to select Figma spec'
    }, { status: 500 });
  }
}
