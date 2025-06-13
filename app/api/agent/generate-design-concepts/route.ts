import { NextResponse } from 'next/server';
import { generateDesignConcepts } from '@/lib/designConcept';

export async function POST(req: Request) {
  try {
    const { brief } = await req.json();
    const userGuid = req.headers.get('x-user-guid') || 'anonymous';
    const concepts = await generateDesignConcepts(brief);
    return NextResponse.json({ userGuid, concepts });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
