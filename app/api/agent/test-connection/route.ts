import { NextResponse } from 'next/server';
import { testAIConnection } from '@/lib/aiClient';

export async function GET() {
  const result = await testAIConnection();
  if (result.success) {
    return NextResponse.json(result);
  }
  return NextResponse.json(result, { status: 500 });
}
