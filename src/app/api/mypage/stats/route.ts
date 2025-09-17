import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    // 사용자 인증 확인
    const authToken = request.headers.get('cookie')?.match(/authToken=([^;]+)/)?.[1];
    if (!authToken) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: authToken },
      select: { 
        id: true, 
        name: true, 
        phone: true,
        totalPaidPoints: true,
        remainingPoints: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    console.log('🔍 회원홈 통계 API - 사용자 정보:', {
      userId: user.id,
      userName: user.name,
      totalPaidPoints: user.totalPaidPoints
    });
    
    // 현재 월의 시작일과 종료일 계산
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // 1. 이번달 총 예상수익 (모든 계약의 최종결정포인트 합계)
    const monthlyExpectedIncome = await prisma.contract.aggregate({
      where: {
        contractDate: {
          gte: currentMonthStart,
          lte: currentMonthEnd
        }
      },
      _sum: {
        finalPoints: true
      }
    });

    // 2. 캐시백 (완료된 계약의 수수료 합계)
    const cashback = await prisma.contract.aggregate({
      where: {
        status: 'COMPLETED',
        contractDate: {
          gte: currentMonthStart,
          lte: currentMonthEnd
        }
      },
      _sum: {
        commissionAmount: true
      }
    });

    // 3. 포인트리수익 (포인트 전환 수익) - finalPoints 사용
    const pointIncome = await prisma.contract.aggregate({
      where: {
        contractDate: {
          gte: currentMonthStart,
          lte: currentMonthEnd
        }
      },
      _sum: {
        finalPoints: true
      }
    });

    // 4. 추천매칭수익 (추천인 매칭 보너스) - 임시로 commissionAmount 사용
    const referralMatchingIncome = await prisma.contract.aggregate({
      where: {
        contractDate: {
          gte: currentMonthStart,
          lte: currentMonthEnd
        }
      },
      _sum: {
        commissionAmount: true
      }
    });

    // 5. 추천수익 (직접 추천 보너스) - 임시로 commissionAmount 사용
    const directReferralIncome = await prisma.contract.aggregate({
      where: {
        contractDate: {
          gte: currentMonthStart,
          lte: currentMonthEnd
        }
      },
      _sum: {
        commissionAmount: true
      }
    });

    // 이전 월 데이터 (변화율 계산용)
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const previousMonthlyIncome = await prisma.contract.aggregate({
      where: {
        contractDate: {
          gte: previousMonthStart,
          lte: previousMonthEnd
        }
      },
      _sum: {
        finalPoints: true
      }
    });

    // 변화율 계산
    const currentIncome = monthlyExpectedIncome._sum.finalPoints || 0;
    const previousIncome = previousMonthlyIncome._sum.finalPoints || 0;
    const changeRate = previousIncome > 0 ? ((currentIncome - previousIncome) / previousIncome) * 100 : 0;

    const stats = {
      monthlyExpectedIncome: {
        value: currentIncome,
        change: changeRate >= 0 ? `+${changeRate.toFixed(1)}%` : `${changeRate.toFixed(1)}%`,
        changeType: changeRate >= 0 ? 'positive' : 'negative'
      },
      cashback: {
        value: cashback._sum.commissionAmount || 0,
        change: '+8.2%', // 임시값, 실제로는 계산 필요
        changeType: 'positive'
      },
      pointIncome: {
        value: pointIncome._sum.finalPoints || 0,
        change: '+12.5%', // 임시값
        changeType: 'positive'
      },
      referralMatchingIncome: {
        value: referralMatchingIncome._sum.commissionAmount || 0,
        change: '+3.2%', // 임시값
        changeType: 'positive'
      },
      directReferralIncome: {
        value: directReferralIncome._sum.commissionAmount || 0,
        change: '+5.8%', // 임시값
        changeType: 'positive'
      },
      // 정산 페이지의 총지급포인트 누적과 동일한 값
      totalPaidPoints: user.totalPaidPoints || 0
    };

    console.log('✅ 회원홈 통계 API 응답:', {
      totalPaidPoints: stats.totalPaidPoints,
      userTotalPaidPoints: user.totalPaidPoints
    });

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error('통계 데이터 조회 오류:', error);
    return NextResponse.json({ error: '통계 데이터를 불러오는데 실패했습니다.' }, { status: 500 });
  }
}
