import { NextResponse } from 'next/server';
import { generateChatCompletion } from '@/lib/daos/aiClient';

export async function POST(req: Request) {
  try {
    console.log('🧪 Debug AI Test - Starting simple AI test');
    
    const response = await generateChatCompletion(
      [
        { 
          role: 'system', 
          content: 'You are a helpful assistant. Always respond with valid JSON in the exact format requested.' 
        },
        { 
          role: 'user', 
          content: 'Return a simple JSON object with these exact keys: {"test": "success", "message": "AI is working"}' 
        }
      ],
      { temperature: 0.1, maxTokens: 100 }
    );
    
    const content = response.choices[0]?.message?.content || '';
    console.log('🧪 Debug AI Test - Raw response:', content);
    
    // Try to parse the response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(content);
      console.log('✅ Debug AI Test - JSON parsing successful:', parsedResponse);
    } catch (parseError) {
      console.log('❌ Debug AI Test - JSON parsing failed:', parseError);
      parsedResponse = { error: 'Failed to parse JSON', rawContent: content };
    }
    
    return NextResponse.json({
      success: true,
      aiResponse: parsedResponse,
      rawContent: content,
      tokenUsage: response.usage
    });
    
  } catch (error) {
    console.error('💥 Debug AI Test - Error:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
