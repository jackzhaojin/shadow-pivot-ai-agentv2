import { NextResponse } from 'next/server';
import { testFigmaSpec } from '@/lib/services/figmaSpecQuality';

export async function POST(req: Request) {
  try {
    const { spec } = await req.json();
    const userGuid = req.headers.get('x-user-guid') || 'anonymous';
    const result = await testFigmaSpec(spec);
    return NextResponse.json({ userGuid, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
