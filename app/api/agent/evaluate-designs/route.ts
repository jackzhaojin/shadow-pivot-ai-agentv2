import { NextResponse } from 'next/server';
import { evaluateDesigns } from '@/lib/services/designEvaluation';

export async function POST(req: Request) {
  try {
    const { concepts } = await req.json();
    const userGuid = req.headers.get('x-user-guid') || 'anonymous';
    const evaluations = await evaluateDesigns(Array.isArray(concepts) ? concepts : []);
    return NextResponse.json({ userGuid, evaluations });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
