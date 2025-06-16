import { NextResponse } from 'next/server';
import { generateFigmaSpecs } from '@/lib/services/figmaSpec';

export async function POST(req: Request) {
  try {
    const { concept, brief } = await req.json();
    const userGuid = req.headers.get('x-user-guid') || 'anonymous';
    // Generate only 1 spec per call since client handles parallelization
    const specs = await generateFigmaSpecs(concept, 1, brief);
    return NextResponse.json({ userGuid, specs });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
