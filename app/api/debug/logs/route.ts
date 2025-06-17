import { NextRequest, NextResponse } from 'next/server';
import { debugLogger, exportRecentLogs, exportRequestLogs, exportCategoryLogs } from '@/lib/utils/debugLogger';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  try {
    const requestId = searchParams.get('requestId');
    const category = searchParams.get('category');
    const count = searchParams.get('count');
    const format = searchParams.get('format') || 'json'; // 'json' or 'text'
    
    let logs: string;
    
    if (requestId) {
      logs = exportRequestLogs(requestId);
    } else if (category) {
      logs = exportCategoryLogs(category);
    } else {
      const logCount = count ? parseInt(count, 10) : 50;
      logs = exportRecentLogs(logCount);
    }
    
    if (format === 'text') {
      return new NextResponse(logs, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="debug-logs-${new Date().toISOString().slice(0, 19)}.txt"`
        }
      });
    } else {
      return NextResponse.json({
        success: true,
        logs,
        metadata: {
          timestamp: new Date().toISOString(),
          requestId,
          category,
          count: count || 50,
          totalEntries: logs.split('\n').length
        }
      });
    }
    
  } catch (error) {
    console.error('Error fetching debug logs:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    debugLogger.clear();
    return NextResponse.json({
      success: true,
      message: 'Debug logs cleared'
    });
  } catch (error) {
    console.error('Error clearing debug logs:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
