import { NextResponse } from 'next/server';

// 메모리 기반 요청 로그 저장소 (실제 구현에서는 Redis나 DB 사용)
let requestLogs: any[] = [];

export async function GET() {
  try {
    // 최근 100개 요청만 반환
    const recentLogs = requestLogs.slice(-100).map((log, index) => ({
      id: `req-${index}`,
      method: log.method || 'GET',
      url: log.url || '/api/unknown',
      status: log.status || 200,
      responseTime: log.responseTime || Math.floor(Math.random() * 1000),
      timestamp: log.timestamp || new Date().toISOString(),
      size: log.size || Math.floor(Math.random() * 1024),
      error: log.error
    }));

    return NextResponse.json({
      success: true,
      requests: recentLogs,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      requests: [],
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

export async function POST(request: Request) {
  try {
    const logData = await request.json();
    
    // 요청 로그 추가
    requestLogs.push({
      ...logData,
      timestamp: new Date().toISOString()
    });

    // 메모리 사용량 제한 (최대 1000개 로그)
    if (requestLogs.length > 1000) {
      requestLogs = requestLogs.slice(-1000);
    }

    return NextResponse.json({
      success: true,
      message: 'Request log added',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
