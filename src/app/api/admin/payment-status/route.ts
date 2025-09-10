import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// 수금상태 관리 시스템 API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const month = searchParams.get('month') || '';

    // 수금상태별 통계 조회
    const whereClause: any = {};

    if (status !== 'all') {
      whereClause.status = status;
    }

    if (month) {
      whereClause.createdAt = {
        gte: new Date(`${month}-01`),
        lt: new Date(`${month}-01`).setMonth(new Date(`${month}-01`).getMonth() + 1),
      };
    }

    // 각 상태별 개수 조회
    const [totalCount, pendingCount, paidCount, cancelledCount] = await Promise.all([
      prisma.payment.count(),
      prisma.payment.count({ where: { status: 'PENDING' } }),
      prisma.payment.count({ where: { status: 'PAID' } }),
      prisma.payment.count({ where: { status: 'CANCELLED' } }),
    ]);

    // 수금상태별 금액 통계
    const [totalAmount, pendingAmount, paidAmount, cancelledAmount] = await Promise.all([
      prisma.payment.aggregate({
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { status: 'PENDING' },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { status: 'CANCELLED' },
        _sum: { amount: true },
      }),
    ]);

    // 월별 수금 통계
    const monthlyStats = await prisma.payment.groupBy({
      by: ['status'],
      _count: { id: true },
      _sum: { amount: true },
      where: month ? {
        createdAt: {
          gte: new Date(`${month}-01`),
          lt: new Date(`${month}-01`).setMonth(new Date(`${month}-01`).getMonth() + 1),
        },
      } : undefined,
    });

    return NextResponse.json({
      statistics: {
        counts: {
          total: totalCount,
          pending: pendingCount,
          paid: paidCount,
          cancelled: cancelledCount,
        },
        amounts: {
          total: totalAmount._sum.amount || 0,
          pending: pendingAmount._sum.amount || 0,
          paid: paidAmount._sum.amount || 0,
          cancelled: cancelledAmount._sum.amount || 0,
        },
      },
      monthlyStats: monthlyStats.map(stat => ({
        status: stat.status,
        count: stat._count.id,
        amount: stat._sum.amount || 0,
      })),
    });

  } catch (error) {
    console.error('수금상태 관리 시스템 조회 오류:', error);
    return NextResponse.json({ 
      error: '수금상태 관리 시스템 조회 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}

// 수금상태 일괄 업데이트 API
export async function POST(request: NextRequest) {
  try {
    const { paymentIds, newStatus, reason } = await request.json();

    if (!paymentIds || !Array.isArray(paymentIds) || paymentIds.length === 0) {
      return NextResponse.json({ error: 'Payment ID가 제공되지 않았습니다.' }, { status: 400 });
    }

    if (!newStatus || !['PENDING', 'PAID', 'CANCELLED'].includes(newStatus)) {
      return NextResponse.json({ error: '유효하지 않은 상태입니다.' }, { status: 400 });
    }

    // 일괄 업데이트
    const updateData: any = {
      status: newStatus,
      updatedAt: new Date(),
    };

    if (newStatus === 'PAID') {
      updateData.paidDate = new Date();
    }

    if (reason) {
      updateData.memo = (await prisma.payment.findFirst({ where: { id: paymentIds[0] } }))?.memo + ` - ${reason}`;
    }

    const result = await prisma.payment.updateMany({
      where: {
        id: {
          in: paymentIds,
        },
      },
      data: updateData,
    });

    return NextResponse.json({
      message: `${result.count}개의 수금상태가 ${newStatus}로 업데이트되었습니다.`,
      updatedCount: result.count,
    });

  } catch (error) {
    console.error('수금상태 일괄 업데이트 오류:', error);
    return NextResponse.json({ 
      error: '수금상태 업데이트 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}


