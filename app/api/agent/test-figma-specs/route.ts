import { NextResponse } from 'next/server';
import { testFigmaSpec } from '@/lib/services/figmaSpecQuality';

export async function POST(req: Request) {
  try {
    const { spec, brief = '' } = await req.json();
    const userGuid = req.headers.get('x-user-guid') || 'anonymous';
    
    if (!spec) {
      return NextResponse.json({ error: 'Spec is required' }, { status: 400 });
    }
    
    console.log('🧪 API - Testing Figma spec:', { 
      specName: spec.name, 
      userGuid,
      hasBrief: Boolean(brief)
    });
    
    const result = await testFigmaSpec(spec, brief);
    
    console.log('📊 API - Quality test result:', {
      score: result.score,
      clarity: result.clarity,
      structure: result.structure,
      feasibility: result.feasibility
    });
    
    return NextResponse.json({ userGuid, result });
  } catch (error) {
    console.error('❌ API - Error testing Figma spec:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
