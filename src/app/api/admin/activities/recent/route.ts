import { NextRequest, NextResponse } from 'next/server';
import { ActivityLogger } from '@/lib/activityLogger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const activities = await ActivityLogger.getRecentActivities(limit);

    return NextResponse.json({
      activities,
      total: activities.length
    });
  } catch (error) {
    console.error('Recent activities fetch error:', error);
    return NextResponse.json(
      { error: '최근 활동을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}










