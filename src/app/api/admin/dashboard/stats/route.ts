import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // 현재 월의 시작일과 종료일 계산
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // 회원관리 통계
    const totalUsers = await prisma.user.count({
      where: { role: 'GENERAL' }
    });

    const totalPartners = await prisma.user.count({
      where: { role: 'MEMBER' }
    });

    const newPartnersThisMonth = await prisma.user.count({
      where: {
        role: 'MEMBER',
        createdAt: {
          gte: currentMonthStart,
          lte: currentMonthEnd
        }
      }
    });

    // 전환율 계산 수정: 파트너 신청에서 승인된 비율로 계산
    const totalPartnerApplications = await prisma.partnerApplication.count();
    const approvedPartnerApplications = await prisma.partnerApplication.count({
      where: { status: 'APPROVED' }
    });
    
    const conversionRate = totalPartnerApplications > 0 
      ? Math.round((approvedPartnerApplications / totalPartnerApplications) * 100) 
      : 0;

    // 상담관리 통계
    const consultationRequestsThisMonth = await prisma.partnerApplication.count({
      where: {
        createdAt: {
          gte: currentMonthStart,
          lte: currentMonthEnd
        }
      }
    });

    const consultationsInProgress = await prisma.partnerApplication.count({
      where: {
        status: 'PENDING'
      }
    });

    const approvedConsultationsThisMonth = await prisma.partnerApplication.count({
      where: {
        status: 'APPROVED',
        createdAt: {
          gte: currentMonthStart,
          lte: currentMonthEnd
        }
      }
    });

    const approvalConversionRate = consultationRequestsThisMonth > 0 
      ? Math.round((approvedConsultationsThisMonth / consultationRequestsThisMonth) * 100) 
      : 0;

    // 포인트관리 통계 (실제 포인트 데이터가 있을 때까지 0으로 표시)
    const totalPointsDecided = 0;
    const newPointsDecidedThisMonth = 0;
    const totalWithdrawalRequestsThisMonth = 0;
    const totalPaidThisMonth = 0;

    const stats = {
      회원관리: {
        totalUsers,
        totalPartners,
        newPartnersThisMonth,
        conversionRate
      },
      상담관리: {
        consultationRequestsThisMonth,
        consultationsInProgress,
        approvedConsultationsThisMonth,
        approvalConversionRate
      },
      포인트관리: {
        totalPointsDecided,
        newPointsDecidedThisMonth,
        totalWithdrawalRequestsThisMonth,
        totalPaidThisMonth
      }
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: '통계 데이터를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
