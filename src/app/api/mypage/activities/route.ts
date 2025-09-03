import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

// 세션 토큰 디코딩 함수
function decodeSessionToken(token: string) {
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // session 쿠키에서 토큰 가져오기
    const sessionToken = request.cookies.get('session')?.value;
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 토큰 디코딩
    const tokenData = decodeSessionToken(sessionToken);
    if (!tokenData || !tokenData.userId) {
      return NextResponse.json(
        { error: '유효하지 않은 세션입니다.' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: tokenData.userId },
      select: { id: true, name: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 최근 활동 데이터 조회 (최근 10개)
    const activities = await prisma.activityLog.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10,
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        createdAt: true,
        metadata: true
      }
    });

    // 활동 데이터를 프론트엔드 형식으로 변환
    const formattedActivities = activities.map(activity => {
      let icon = 'ArrowUpRight'; // 기본 아이콘
      let amount = '0P';
      let isPositive = true;
      let subtitle = '';

      // 활동 타입에 따른 아이콘과 금액 설정
      switch (activity.type) {
        case 'CONTRACT_CREATED':
          icon = 'ArrowUpRight';
          // metadata에서 포인트 정보 추출
          try {
            const metadata = JSON.parse(activity.metadata || '{}');
            amount = `+${metadata.points || 0}P`;
            isPositive = true;
            subtitle = '계약 완료';
          } catch {
            amount = '+0P';
            subtitle = '계약 완료';
          }
          break;
        case 'PARTNER_APPLICATION':
          icon = 'ArrowUpRight';
          amount = '신청';
          isPositive = true;
          subtitle = '파트너 신청';
          break;
        case 'PARTNER_APPROVAL':
          icon = 'ArrowUpRight';
          amount = '승인';
          isPositive = true;
          subtitle = '파트너 승인';
          break;
        case 'QUESTION_SUBMITTED':
          icon = 'MessageCircle';
          amount = '문의';
          isPositive = false;
          subtitle = '문의 제출';
          break;
        default:
          icon = 'ArrowUpRight';
          amount = '활동';
          isPositive = true;
          subtitle = '시스템 활동';
      }

      return {
        id: activity.id,
        icon,
        title: activity.title,
        subtitle,
        amount,
        isPositive,
        date: activity.createdAt
      };
    });

    return NextResponse.json({
      activities: formattedActivities
    });

  } catch (error) {
    console.error('활동 데이터 조회 실패:', error);
    return NextResponse.json(
      { error: '활동 데이터를 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}

