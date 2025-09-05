import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 실제 구현에서는 실제 API 요청 통계를 계산
    const mockStats = {
      totalRequests: Math.floor(Math.random() * 1000) + 500,
      successRate: Math.floor(Math.random() * 20) + 80, // 80-100%
      averageResponseTime: Math.floor(Math.random() * 500) + 100, // 100-600ms
      errorCount: Math.floor(Math.random() * 50),
      last24Hours: Math.floor(Math.random() * 200) + 100
    };

    return NextResponse.json({
      success: true,
      ...mockStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      totalRequests: 0,
      successRate: 0,
      averageResponseTime: 0,
      errorCount: 0,
      last24Hours: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
